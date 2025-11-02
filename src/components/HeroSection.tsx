import { Music, Sparkles } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Circuit pattern background */}
      <div className="absolute inset-0 circuit-pattern opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-8">
          {/* Logo/Brand */}
          <div className="inline-flex items-center justify-center space-x-4 mb-8">
            <div className="relative">
              <Music className="w-20 h-20 text-cyber-blue animate-glow-pulse" />
              <Sparkles className="w-8 h-8 text-cyber-orange absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          
          {/* Main Title */}
          <h1 className="text-8xl font-bold tracking-wider">
            <span className="glow-text-cyan">AGENTRONIC</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-2xl text-cyber-blue/80 max-w-3xl mx-auto">
            Semantic Music Processing System
          </p>
          
          {/* Description */}
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            A sophisticated 4-phase architecture enabling AI agents to understand, analyze,
            and generate music at a semantic level with real-time collaboration capabilities.
          </p>
          
          {/* Status indicators */}
          <div className="flex items-center justify-center gap-6 pt-8">
            <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-cyber-blue">SYSTEM ONLINE</span>
            </div>
            <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-cyber-blue rounded-full animate-pulse"></div>
              <span className="text-sm text-cyber-blue">AGENTS READY</span>
            </div>
            <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-cyber-orange rounded-full animate-pulse"></div>
              <span className="text-sm text-cyber-blue">PROCESSING ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Glowing orb effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyber-blue/5 rounded-full blur-3xl"></div>
    </section>
  )
}
