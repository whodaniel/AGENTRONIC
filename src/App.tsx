import { useState } from 'react'
import { Music, Radio, Network, Sparkles, Activity, Cpu, Database, Zap } from 'lucide-react'
import HeroSection from './components/HeroSection'
import ArchitecturePhases from './components/ArchitecturePhases'
import MusicProcessor from './components/MusicProcessor'
import AgentDashboard from './components/AgentDashboard'
import SystemStatus from './components/SystemStatus'

function App() {
  const [activePhase, setActivePhase] = useState(0)

  return (
    <div className="min-h-screen hexagon-bg relative overflow-hidden">
      {/* Animated scan line effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyber-blue to-transparent opacity-30 animate-scan-line"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <HeroSection />
        
        <div className="container mx-auto px-4 py-16 space-y-24">
          {/* Architecture Visualization */}
          <ArchitecturePhases activePhase={activePhase} setActivePhase={setActivePhase} />
          
          {/* Music Processing Interface */}
          <MusicProcessor />
          
          {/* Agent Communication Dashboard */}
          <AgentDashboard />
          
          {/* System Status */}
          <SystemStatus />
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyber-blue rounded-full animate-float opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default App