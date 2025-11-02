import { Database, FileMusic, Radio, Sparkles } from 'lucide-react'

interface ArchitecturePhasesProps {
  activePhase: number
  setActivePhase: (phase: number) => void
}

const phases = [
  {
    number: 1,
    title: 'INGESTION',
    subtitle: 'Normalization Layer',
    description: 'Transforms MIDI, MusicXML, MEI, and OSC formats into unified representation',
    icon: FileMusic,
    features: ['MIDI 1.0 & 2.0 Parser', 'MusicXML Support', 'MEI Integration', 'OSC Endpoint'],
    color: 'cyan',
  },
  {
    number: 2,
    title: 'SEMANTIC',
    subtitle: 'Knowledge Graph',
    description: 'Temporal-harmonic graph database with musical relationships',
    icon: Database,
    features: ['Composition Nodes', 'Part Relations', 'Note/Chord Edges', 'Harmonic Analysis'],
    color: 'blue',
  },
  {
    number: 3,
    title: 'ANALYSIS',
    subtitle: 'Generation Engine',
    description: 'Services for musical understanding and creation',
    icon: Sparkles,
    features: ['Harmonic Progression', 'Melodic Contour', 'Composition', 'Orchestration'],
    color: 'purple',
  },
  {
    number: 4,
    title: 'INTERFACE',
    subtitle: 'Agent Layer',
    description: 'APIs and protocols for agent communication and collaboration',
    icon: Radio,
    features: ['GraphQL API', 'WebSocket Real-time', 'OSC Bridge', 'Authentication'],
    color: 'orange',
  },
]

export default function ArchitecturePhases({ activePhase, setActivePhase }: ArchitecturePhasesProps) {
  return (
    <section className="py-16">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold mb-4">
          <span className="glow-text-cyan">4-PHASE ARCHITECTURE</span>
        </h2>
        <p className="text-foreground/60 text-lg">
          Modular design for sophisticated music processing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {phases.map((phase, index) => {
          const Icon = phase.icon
          const isActive = activePhase === index
          
          return (
            <div
              key={index}
              onClick={() => setActivePhase(index)}
              className={`glass-panel p-6 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 ${
                isActive ? 'ring-2 ring-cyber-blue shadow-glow-cyan' : ''
              }`}
            >
              {/* Phase number */}
              <div className="flex items-center justify-between mb-4">
                <div className={`text-4xl font-bold ${
                  phase.color === 'cyan' ? 'text-cyber-blue' :
                  phase.color === 'orange' ? 'text-cyber-orange' :
                  phase.color === 'purple' ? 'text-cyber-purple' :
                  'text-cyber-blue'
                }`}>
                  0{phase.number}
                </div>
                <Icon className={`w-10 h-10 ${
                  isActive ? 'animate-glow-pulse' : ''
                } ${
                  phase.color === 'cyan' ? 'text-cyber-blue' :
                  phase.color === 'orange' ? 'text-cyber-orange' :
                  phase.color === 'purple' ? 'text-cyber-purple' :
                  'text-cyber-blue'
                }`} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold mb-1">{phase.title}</h3>
              <p className="text-sm text-cyber-blue/70 mb-3">{phase.subtitle}</p>

              {/* Description */}
              <p className="text-sm text-foreground/60 mb-4">{phase.description}</p>

              {/* Features */}
              <ul className="space-y-2">
                {phase.features.map((feature, fIndex) => (
                  <li key={fIndex} className="text-xs text-foreground/50 flex items-center gap-2">
                    <div className="w-1 h-1 bg-cyber-blue rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Phase connection visualization */}
      <div className="mt-8 flex items-center justify-center gap-2">
        {phases.map((_, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`w-12 h-1 rounded-full transition-all duration-300 ${
                index <= activePhase ? 'bg-cyber-blue shadow-glow-cyan' : 'bg-cyber-blue/20'
              }`}
            ></div>
            {index < phases.length - 1 && (
              <div className="w-4 h-0.5 bg-cyber-blue/20"></div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
