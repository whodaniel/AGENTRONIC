# AGENTRONIC API Documentation

## Overview
AGENTRONIC provides multiple API interfaces for AI agents to interact with the music processing system.

## Authentication

All API requests require authentication via API key:

```javascript
const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
}
```

## REST API Endpoints

### Base URL
```
https://your-supabase-project.supabase.co/functions/v1
```

### 1. Upload Music File

**Endpoint:** `POST /music-upload`

**Description:** Upload and parse music file (MIDI, MusicXML, MEI)

**Request:**
```json
{
  "file": "base64_encoded_file_data",
  "filename": "symphony.mid",
  "format": "midi"
}
```

**Response:**
```json
{
  "compositionId": "uuid",
  "title": "Symphony No. 5",
  "parts": 4,
  "measures": 64,
  "duration": 180.5,
  "metadata": {
    "key": "C minor",
    "tempo": 120,
    "timeSignature": "4/4"
  }
}
```

### 2. Analyze Composition

**Endpoint:** `POST /analyze`

**Description:** Perform musical analysis on composition

**Request:**
```json
{
  "compositionId": "uuid",
  "analysisType": "harmonic" | "melodic" | "structural" | "performance"
}
```

**Response:**
```json
{
  "analysisId": "uuid",
  "type": "harmonic",
  "results": {
    "keySignature": "C minor",
    "chordProgression": ["Cm", "Ab", "Eb", "Bb"],
    "harmonicComplexity": 0.72,
    "tonalCenter": "C"
  },
  "timestamp": "2025-11-02T20:18:00Z"
}
```

### 3. Generate Music

**Endpoint:** `POST /generate`

**Description:** Generate new musical content

**Request:**
```json
{
  "type": "melody" | "harmony" | "orchestration",
  "parameters": {
    "key": "C major",
    "length": 16,
    "style": "classical",
    "constraints": {}
  },
  "baseCompositionId": "uuid" // optional
}
```

**Response:**
```json
{
  "compositionId": "uuid",
  "generatedParts": ["melody"],
  "notes": [
    {
      "pitch": 60,
      "velocity": 80,
      "startTime": 0.0,
      "duration": 0.5
    }
  ]
}
```

### 4. Query Graph

**Endpoint:** `POST /graph-query`

**Description:** Query the temporal-harmonic knowledge graph

**Request:**
```json
{
  "query": "FIND notes WHERE pitch > 60 AND measure.tempo > 100",
  "compositionId": "uuid",
  "limit": 100
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "pitch": 64,
      "velocity": 75,
      "measure": {
        "number": 12,
        "tempo": 120
      }
    }
  ],
  "count": 45
}
```

## GraphQL API

### Endpoint
```
https://your-supabase-project.supabase.co/graphql/v1
```

### Example Queries

#### Get Composition with Parts
```graphql
query GetComposition($id: UUID!) {
  compositions(where: { id: { _eq: $id } }) {
    id
    title
    composer
    duration
    parts {
      id
      name
      instrument
      measures {
        measureNumber
        tempo
        timeSignature
        notes {
          pitch
          velocity
          startTime
          duration
        }
      }
    }
  }
}
```

#### Get Harmonic Progression
```graphql
query GetHarmonicProgression($compositionId: UUID!) {
  chords(
    where: { measure: { composition_id: { _eq: $compositionId } } }
    order_by: { start_time: asc }
  ) {
    rootNote
    chordType
    startTime
    duration
    inversion
  }
}
```

#### Create Agent Session
```graphql
mutation CreateSession($agentId: UUID!, $compositionId: UUID!) {
  insert_agent_sessions_one(
    object: {
      agent_id: $agentId
      composition_id: $compositionId
      session_type: "collaboration"
      status: "active"
    }
  ) {
    id
    started_at
  }
}
```

## WebSocket API

### Connection
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Subscribe to real-time events
const channel = supabase.channel('music-events')

channel
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'real_time_events'
  }, (payload) => {
    console.log('Event received:', payload)
  })
  .subscribe()
```

### Event Types

#### MIDI Event
```json
{
  "type": "midi",
  "agentId": "uuid",
  "sessionId": "uuid",
  "data": {
    "note": 60,
    "velocity": 100,
    "timestamp": 1234567890
  }
}
```

#### Analysis Complete
```json
{
  "type": "analysisComplete",
  "agentId": "uuid",
  "analysisId": "uuid",
  "results": {
    "harmonicProgression": ["I", "IV", "V", "I"]
  }
}
```

#### Generation Event
```json
{
  "type": "generated",
  "agentId": "uuid",
  "compositionId": "uuid",
  "generatedContent": {
    "notes": [...],
    "duration": 4.0
  }
}
```

## OSC Protocol

### OSC Address Space

```
/agentronic/note/on      [pitch, velocity]
/agentronic/note/off     [pitch]
/agentronic/chord/play   [root, type, inversion]
/agentronic/tempo/set    [bpm]
/agentronic/sync/start   []
/agentronic/sync/stop    []
```

### Example (JavaScript)
```javascript
import { OSCClient } from './lib/musicProcessing'

const osc = new OSCClient()
await osc.connect('ws://localhost:8080/osc')

// Send note on
osc.sendEvent('/agentronic/note/on', [60, 100])

// Listen for events
osc.onMessage((data) => {
  console.log('OSC event:', data)
})
```

## Agent Registration

### Register New Agent

**Endpoint:** `POST /agent-register`

**Request:**
```json
{
  "name": "HARMONIC-AGENT-01",
  "capabilities": ["harmony", "analysis"],
  "version": "1.0.0"
}
```

**Response:**
```json
{
  "agentId": "uuid",
  "apiKey": "agt_xxxxxxxxxxxx",
  "status": "active"
}
```

## Data Models

### Composition
```typescript
interface Composition {
  id: string
  title: string
  composer?: string
  duration: number
  metadata?: Record<string, any>
  created_at: string
}
```

### Part
```typescript
interface Part {
  id: string
  composition_id: string
  name: string
  instrument: string
  part_number: number
  metadata?: Record<string, any>
}
```

### Measure
```typescript
interface Measure {
  id: string
  part_id: string
  composition_id: string
  measure_number: number
  time_signature: string
  tempo: number
  start_time: number
  duration: number
}
```

### Note
```typescript
interface Note {
  id: string
  measure_id: string
  pitch: number
  velocity: number
  start_time: number
  duration: number
  midi_note?: number
  frequency?: number
  articulation?: string
}
```

### Chord
```typescript
interface Chord {
  id: string
  measure_id: string
  root_note: string
  chord_type: string
  start_time: number
  duration: number
  inversion: number
  note_ids?: string[]
}
```

## Rate Limits

- **REST API:** 100 requests/minute per API key
- **GraphQL:** 50 queries/minute per API key
- **WebSocket:** Unlimited (with connection limits)
- **OSC:** 1000 messages/second

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Invalid or missing API key |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## Code Examples

### Python Client
```python
import requests
import json

API_KEY = "your_api_key"
BASE_URL = "https://your-project.supabase.co/functions/v1"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Upload MIDI file
with open("song.mid", "rb") as f:
    file_data = f.read()
    
response = requests.post(
    f"{BASE_URL}/music-upload",
    headers=headers,
    json={
        "file": file_data.hex(),
        "filename": "song.mid",
        "format": "midi"
    }
)

composition = response.json()
print(f"Uploaded: {composition['title']}")
```

### Node.js Client
```javascript
const axios = require('axios')

const API_KEY = 'your_api_key'
const BASE_URL = 'https://your-project.supabase.co/functions/v1'

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
})

// Analyze composition
async function analyzeComposition(compositionId) {
  const response = await client.post('/analyze', {
    compositionId,
    analysisType: 'harmonic'
  })
  
  return response.data
}

analyzeComposition('your-composition-id')
  .then(results => console.log(results))
```

## Support

For API support and questions:
- Documentation: https://agentronic.docs
- GitHub: https://github.com/agentronic/api
- Email: support@agentronic.ai
