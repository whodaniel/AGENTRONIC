import { Activity, Database, Cpu, HardDrive, Wifi } from 'lucide-react'

export default function SystemStatus() {
  const systemMetrics = [
    { label: 'CPU USAGE', value: '32%', icon: Cpu, status: 'normal' },
    { label: 'MEMORY', value: '2.4GB', icon: HardDrive, status: 'normal' },
    { label: 'DATABASE', value: 'ONLINE', icon: Database, status: 'online' },
    { label: 'NETWORK', value: '45ms', icon: Wifi, status: 'normal' },
  ]

  const services = [
    { name: 'Ingestion Layer', status: 'operational', uptime: '99.9%' },
    { name: 'Semantic Graph', status: 'operational', uptime: '99.8%' },
    { name: 'Analysis Engine', status: 'operational', uptime: '99.7%' },
    { name: 'Agent Interface', status: 'operational', uptime: '99.9%' },
    { name: 'WebSocket Server', status: 'operational', uptime: '100%' },
    { name: 'GraphQL API', status: 'operational', uptime: '99.8%' },
  ]

  return (
    <section className="py-16">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold mb-4">
          <span className="glow-text-orange">SYSTEM STATUS</span>
        </h2>
        <p className="text-foreground/60 text-lg">
          Real-time monitoring and performance metrics
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* System Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {systemMetrics.map((metric, idx) => {
            const Icon = metric.icon
            return (
              <div key={idx} className="glass-panel p-6 rounded-lg text-center">
                <Icon className="w-8 h-8 text-cyber-blue mx-auto mb-3 animate-glow-pulse" />
                <p className="text-sm text-foreground/50 mb-2">{metric.label}</p>
                <p className="text-2xl font-bold text-cyber-blue">{metric.value}</p>
              </div>
            )
          })}
        </div>

        {/* Service Status */}
        <div className="glass-panel p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-cyber-blue" />
            <h3 className="text-xl font-bold">Service Health</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="bg-cyber-darkBlue/50 p-4 rounded-lg border border-cyber-blue/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{service.name}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground/50 uppercase">{service.status}</span>
                  <span className="text-green-500">{service.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Graph Placeholder */}
        <div className="glass-panel p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-6">System Activity</h3>
          <div className="h-32 circuit-pattern rounded-lg flex items-end justify-around gap-2 p-4">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-full bg-gradient-to-t from-cyber-blue to-cyber-orange rounded-t"
                style={{
                  height: `${Math.random() * 100}%`,
                  opacity: 0.3 + Math.random() * 0.7,
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
