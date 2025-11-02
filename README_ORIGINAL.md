# AGENTRONIC

> Semantic Music Processing System for AI Agents

AGENTRONIC is a sophisticated 4-phase architecture enabling AI agents to understand, analyze, and generate music at a semantic level with real-time collaboration capabilities and VST/Max for Live integration.

## Features

### 4-Phase Architecture

**Phase 1: Ingestion & Normalization Layer**
- MIDI 1.0 & 2.0 parser with per-note expression data
- MusicXML support for complex sheet music and orchestration
- MEI (Music Encoding Initiative) for scholarly-level metadata
- OSC (OpenSoundControl) endpoint for real-time event streams
- Audio transcription for WAV/MP3 files
- Unified internal representation format

**Phase 2: Core Semantic Model**
- Temporal-harmonic knowledge graph in Supabase
- Musical entities: Composition, Part, Measure, Note, Chord
- Relationship mapping: Structural, temporal, and harmonic connections
- High-performance graph queries

**Phase 3: Analysis & Generation Engine**
- Harmonic progression analysis
- Melodic contour detection
- Formal structure identification
- Performance nuance extraction
- AI-driven composition and harmonization
- Orchestration and transformation services

**Phase 4: Agent-Facing Interface Layer**
- GraphQL API for flexible data queries
- WebSocket real-time communication
- OSC bridge for Media Control Protocol
- API key authentication and session management
- Multi-agent collaboration support

### VST/Max for Live Integration
- Real-time MIDI streaming from Ableton Live
- Session synchronization (tempo, time signature, transport)
- Bidirectional parameter automation
- Live jam mode for multi-agent collaboration

### Futuristic UI
- Dark theme with electric blue/cyan accents
- Glowing effects and particle animations
- Hexagonal grid background pattern
- Circuit-like visual patterns
- Responsive, professional design

## Technology Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- Tone.js for audio processing
- Tonal.js for music theory
- Lucide React for icons

**Backend:**
- Supabase (PostgreSQL + Edge Functions + Realtime)
- TypeScript/JavaScript (Deno runtime)
- WebSocket for real-time communication
- GraphQL API layer

**Music Processing:**
- Browser-based MIDI parsing
- MusicXML/MEI parser
- Music theory analysis engine
- Generation algorithms

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm package manager
- Supabase account (for backend)

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/agentronic.git
cd agentronic

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
pnpm dev
```

### Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage

### Upload Music File
1. Navigate to Music Processor section
2. Click "SELECT FILE"
3. Choose MIDI, MusicXML, or audio file
4. View analysis results

### Agent Communication
1. Register agent via API
2. Receive API key
3. Connect via WebSocket
4. Send/receive real-time events

### VST Integration
1. Build VST plugin (see `vst-integration/README.md`)
2. Install in Ableton Live
3. Load AGENTRONIC VST on MIDI track
4. Play notes for real-time processing

## API Documentation

See [API Documentation](docs/api-documentation.md) for complete API reference.

### Quick Example

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
)

// Subscribe to real-time music events
const channel = supabase.channel('music-events')
channel.on('postgres_changes', {
  event: '*',
  schema: 'public',
  table: 'real_time_events'
}, (payload) => {
  console.log('Music event:', payload)
}).subscribe()
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENTRONIC SYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Phase 1: INGESTION                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │  MIDI  │ │  XML   │ │  MEI   │ │  OSC   │              │
│  └────┬───┘ └───┬────┘ └───┬────┘ └───┬────┘              │
│       └─────────┴──────────┴──────────┘                    │
│                     │                                       │
│                     ▼                                       │
│  Phase 2: SEMANTIC GRAPH                                    │
│  ┌───────────────────────────────────────────┐             │
│  │  Compositions → Parts → Measures → Notes  │             │
│  │            Chords & Harmonies              │             │
│  └───────────────────────────────────────────┘             │
│                     │                                       │
│                     ▼                                       │
│  Phase 3: ANALYSIS & GENERATION                             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │  Analyze   │ │  Generate  │ │ Transform  │             │
│  └────────────┘ └────────────┘ └────────────┘             │
│                     │                                       │
│                     ▼                                       │
│  Phase 4: AGENT INTERFACE                                   │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │  GraphQL   │ │ WebSocket  │ │    OSC     │             │
│  └────────────┘ └────────────┘ └────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
agentronic/
├── src/
│   ├── components/          # React components
│   │   ├── HeroSection.tsx
│   │   ├── ArchitecturePhases.tsx
│   │   ├── MusicProcessor.tsx
│   │   ├── AgentDashboard.tsx
│   │   └── SystemStatus.tsx
│   ├── lib/                 # Utilities
│   │   └── musicProcessing.ts
│   ├── App.tsx              # Main app component
│   └── index.css            # Global styles
├── docs/
│   ├── architecture.md      # System architecture
│   └── api-documentation.md # API reference
├── vst-integration/         # VST/Max for Live code
│   └── README.md
└── supabase/
    └── functions/           # Edge functions
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: https://agentronic.docs
- Issues: https://github.com/your-org/agentronic/issues
- Email: support@agentronic.ai

## Acknowledgments

- Steinberg VST3 SDK
- Cycling '74 Max/MSP
- Supabase Platform
- Tone.js Library
- Music theory community

---

Built with music and AI by the AGENTRONIC team
