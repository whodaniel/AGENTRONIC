import { useState, useEffect } from 'react'
import { Users, Radio, Zap, MessageSquare } from 'lucide-react'
import { supabase, type Agent, type RealTimeEvent } from '../lib/supabase'

interface AgentDisplay {
  id: string
  name: string
  status: 'online' | 'processing' | 'idle'
  capabilities: string[]
  lastActive: string
}

const mockAgents: AgentDisplay[] = [
  {
    id: '1',
    name: 'HARMONIC-AGENT-01',
    status: 'processing',
    capabilities: ['Harmony Analysis', 'Chord Progression'],
    lastActive: '2s ago',
  },
  {
    id: '2',
    name: 'MELODIC-AGENT-02',
    status: 'online',
    capabilities: ['Melody Generation', 'Contour Analysis'],
    lastActive: '5s ago',
  },
  {
    id: '3',
    name: 'RHYTHM-AGENT-03',
    status: 'idle',
    capabilities: ['Rhythm Pattern', 'Tempo Detection'],
    lastActive: '1m ago',
  },
  {
    id: '4',
    name: 'ORCHESTRATE-AGENT-04',
    status: 'online',
    capabilities: ['Orchestration', 'Arrangement'],
    lastActive: '3s ago',
  },
]

export default function AgentDashboard() {
  const [agents, setAgents] = useState<AgentDisplay[]>(mockAgents)
  const [messages, setMessages] = useState<string[]>([])
  const [messageCount, setMessageCount] = useState(1247)
  const [sessionCount, setSessionCount] = useState(34)

  useEffect(() => {
    // Fetch agents from database
    fetchAgents()
    
    // Fetch real-time events
    fetchRealtimeEvents()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('real_time_events')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'real_time_events'
      }, (payload) => {
        handleRealtimeUpdate(payload)
      })
      .subscribe()

    // Fallback: Update messages periodically
    const interval = setInterval(() => {
      const newMessage = `SYSTEM: Real-time event processed at ${new Date().toLocaleTimeString()}`
      setMessages((prev) => [...prev.slice(-2), newMessage])
    }, 5000)

    return () => {
      channel.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('status', 'active')
        .limit(10)

      if (error) throw error

      if (data && data.length > 0) {
        const formattedAgents: AgentDisplay[] = data.map((agent: Agent) => ({
          id: agent.id,
          name: agent.name,
          status: 'online' as const,
          capabilities: Array.isArray(agent.capabilities) 
            ? agent.capabilities 
            : ['Music Processing'],
          lastActive: getRelativeTime(agent.last_active || agent.created_at),
        }))
        setAgents(formattedAgents)
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
      // Keep using mock data if fetch fails
    }
  }

  const fetchRealtimeEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('real_time_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(3)

      if (error) throw error

      if (data && data.length > 0) {
        const formattedMessages = data.map((event: RealTimeEvent) => {
          const agentName = event.agent_id || 'SYSTEM'
          const eventType = event.event_type
          const time = new Date(event.timestamp).toLocaleTimeString()
          return `${agentName}: ${eventType} at ${time}`
        })
        setMessages(formattedMessages)
      }

      // Get total message count
      const { count } = await supabase
        .from('real_time_events')
        .select('*', { count: 'exact', head: true })

      if (count !== null) {
        setMessageCount(count)
      }

      // Get session count
      const { count: sessions } = await supabase
        .from('agent_sessions')
        .select('*', { count: 'exact', head: true })

      if (sessions !== null) {
        setSessionCount(sessions)
      }

    } catch (error) {
      console.error('Error fetching events:', error)
      // Use default messages if fetch fails
      setMessages([
        'HARMONIC-AGENT-01: Analyzing chord progression in C minor...',
        'MELODIC-AGENT-02: Generated melodic motif with 8-bar structure',
        'ORCHESTRATE-AGENT-04: Applied string section arrangement',
      ])
    }
  }

  const handleRealtimeUpdate = (payload: any) => {
    const event = payload.new as RealTimeEvent
    const agentName = event.agent_id || 'SYSTEM'
    const newMessage = `${agentName}: ${event.event_type} at ${new Date().toLocaleTimeString()}`
    setMessages((prev) => [...prev.slice(-2), newMessage])
    setMessageCount((prev) => prev + 1)
  }

  const getRelativeTime = (timestamp: string): string => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffMs = now.getTime() - past.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    
    if (diffSecs < 60) return `${diffSecs}s ago`
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`
    return `${Math.floor(diffSecs / 3600)}h ago`
  }

  const getStatusColor = (status: AgentDisplay['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'processing':
        return 'bg-cyber-orange'
      case 'idle':
        return 'bg-gray-500'
    }
  }

  return (
    <section className="py-16">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold mb-4">
          <span className="glow-text-cyan">AGENT DASHBOARD</span>
        </h2>
        <p className="text-foreground/60 text-lg">
          Real-time collaboration and communication
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Agents */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-cyber-blue" />
            <h3 className="text-xl font-bold">Active Agents</h3>
            <span className="ml-auto text-sm text-foreground/50">{agents.length} Connected</span>
          </div>

          <div className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-cyber-darkBlue/50 p-4 rounded-lg border border-cyber-blue/20 hover:border-cyber-blue/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)} animate-pulse`}></div>
                    <span className="font-semibold text-cyber-blue">{agent.name}</span>
                  </div>
                  <span className="text-xs text-foreground/50">{agent.lastActive}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {agent.capabilities.map((cap, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-cyber-blue/10 border border-cyber-blue/30 rounded text-cyber-blue"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Events */}
        <div className="glass-panel p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <Radio className="w-6 h-6 text-cyber-orange" />
            <h3 className="text-xl font-bold">Live Events</h3>
          </div>

          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className="text-xs p-3 bg-cyber-darkBlue/50 rounded border border-cyber-orange/20 text-foreground/70 font-mono"
              >
                {msg}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-cyber-blue/20">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-cyber-orange animate-pulse" />
              <span className="text-foreground/60">WebSocket Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Communication Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="glass-panel p-4 rounded-lg text-center">
          <MessageSquare className="w-8 h-8 text-cyber-blue mx-auto mb-2" />
          <p className="text-2xl font-bold text-cyber-blue mb-1">{messageCount.toLocaleString()}</p>
          <p className="text-xs text-foreground/50">MESSAGES</p>
        </div>
        <div className="glass-panel p-4 rounded-lg text-center">
          <Radio className="w-8 h-8 text-cyber-orange mx-auto mb-2" />
          <p className="text-2xl font-bold text-cyber-orange mb-1">{sessionCount}</p>
          <p className="text-xs text-foreground/50">SESSIONS</p>
        </div>
        <div className="glass-panel p-4 rounded-lg text-center">
          <Zap className="w-8 h-8 text-cyber-purple mx-auto mb-2" />
          <p className="text-2xl font-bold text-cyber-purple mb-1">99.8%</p>
          <p className="text-xs text-foreground/50">UPTIME</p>
        </div>
        <div className="glass-panel p-4 rounded-lg text-center">
          <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-500 mb-1">{agents.length}</p>
          <p className="text-xs text-foreground/50">AGENTS</p>
        </div>
      </div>
    </section>
  )
}
