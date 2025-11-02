# AGENTRONIC Architecture Documentation

## System Overview
AGENTRONIC is a sophisticated 4-phase music processing system that enables AI agents to understand, analyze, and generate music at a semantic level with real-time collaboration capabilities.

## 4-Phase Architecture

### Phase 1: Ingestion & Normalization Layer
Transforms multiple music formats into a unified internal representation.

**Supported Formats:**
- MIDI 1.0 & 2.0 (note, velocity, timing, per-note expression)
- MusicXML (complex sheet music, orchestration, dynamics, articulations)
- MEI (Music Encoding Initiative - scholarly-level metadata)
- OSC (OpenSoundControl - real-time event streams)
- Audio transcription (future: MT3 or similar)

**Implementation:**
- Browser-based parsers using Tone.js and custom libraries
- Edge functions for server-side processing
- Unified JSON format for internal representation

### Phase 2: Core Semantic Model (Temporal-Harmonic Knowledge Graph)
Graph database representing musical relationships and structures.

**Node Types:**
- Composition: Root node for complete works
- Part: Instruments/tracks within composition
- Measure: Temporal containers with time signature and tempo
- Note: Fundamental units with pitch, velocity, timing, expression
- Chord: Harmonic groupings with root, type, inversion
- Articulation: Performance nuances (staccato, legato, etc.)
- Dynamic: Volume markings (forte, piano, crescendo, etc.)

**Edge Types:**
- HAS_PART: Composition → Part (structural)
- HAS_MEASURE: Part → Measure (structural)
- HAS_NOTE: Measure → Note (structural)
- NEXT: Temporal sequence relationships
- HARMONICALLY_RELATED: Chord progressions and relationships
- PERFORMED_BY: Performance metadata

**Database:** PostgreSQL (Supabase) with JSONB for graph-like relationships

### Phase 3: Analysis & Generation Engine
Services for musical understanding and creation.

**Analysis Services:**
- `getHarmonicProgression()`: Extract chord progressions and tonal centers
- `getMelodicContour()`: Analyze melodic shapes and motifs
- `getFormalStructure()`: Identify sections (verse, chorus, bridge)
- `getPerformanceNuance()`: Extract expression and articulation patterns

**Generation Services:**
- `compose()`: Create new musical material from prompts
- `harmonize()`: Add harmonic accompaniment to melodies
- `orchestrate()`: Arrange for multiple instruments
- `transform()`: Apply musical transformations (transposition, augmentation, etc.)

**Integration:**
- Tone.js for audio synthesis and playback
- teoria for music theory operations
- Custom algorithms for advanced analysis

### Phase 4: Agent-Facing Interface Layer
APIs and protocols for agent communication.

**API Endpoints:**
- REST API via Supabase Edge Functions
- GraphQL-style query interface
- WebSocket for real-time communication
- OSC bridge for Media Control Protocol

**Authentication:**
- API key management for agent registration
- Session tracking for collaborative work
- Real-time event streaming

## VST/Max for Live Integration

### Components
1. **VST Plugin Interface**: C++ plugin for Ableton Live
2. **Max for Live Device**: JavaScript device using LiveAPI
3. **Backend Synchronization**: WebSocket connection to AGENTRONIC backend
4. **Parameter Mapping**: Bidirectional sync between DAW and backend

### Features
- Real-time MIDI event streaming from Ableton to backend
- Session synchronization (tempo, time signature, transport state)
- Live jam mode for multi-agent collaboration
- Parameter automation from AI agents to DAW

### Implementation Files
- `vst-integration/AgtPlugin.h`: VST plugin header
- `vst-integration/AgtPlugin.cpp`: VST plugin implementation
- `vst-integration/maxforlive-device.js`: Max for Live device code
- Edge function: `supabase/functions/vst-sync`: WebSocket bridge

## Technology Stack

### Backend
- Platform: Supabase (PostgreSQL + Edge Functions + Realtime)
- Language: TypeScript/JavaScript (Deno runtime)
- Music Processing: Tone.js, teoria
- Real-time: Supabase Realtime subscriptions

### Frontend
- Framework: React with TypeScript
- Styling: TailwindCSS with custom dark theme
- Visualization: Custom components with glowing effects
- Audio: Tone.js for playback and synthesis

### External Integrations
- MIDI parsing: Browser MIDI API + custom parsers
- MusicXML: xml-js for parsing
- MEI: Custom parser implementation
- OSC: WebSocket-based OSC implementation

## Data Flow

1. **Music Upload** → Parser → Normalized JSON → Database
2. **Analysis Request** → Query Service → Analysis Engine → Results
3. **Generation Request** → Generation Engine → New Composition → Database
4. **Agent Communication** → WebSocket → Real-time Events → Subscribed Agents
5. **VST Sync** → DAW MIDI Events → WebSocket → Backend → Other Agents

## Deployment Architecture

### Production Environment
- Frontend: Static hosting (Vercel/Netlify)
- Backend: Supabase cloud
- Database: Supabase PostgreSQL
- Real-time: Supabase Realtime infrastructure

### Local Development (Optional)
- Docker Compose for Neo4j + MongoDB
- Node.js server for GraphQL API
- WebSocket server for real-time communication
- VST plugin compiled for local DAW

## Scalability Considerations
- Database indexing on composition_id, agent_id, timestamp
- Edge function caching for analysis results
- Real-time event batching for high-frequency updates
- Agent session pooling for concurrent collaborations

## Security
- API key authentication for agents
- Row-level security (RLS) for multi-tenant data
- Rate limiting on edge functions
- Input validation for all parsers
