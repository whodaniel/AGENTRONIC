// Music Processing Utilities for AGENTRONIC

export interface Note {
  pitch: number
  velocity: number
  startTime: number
  duration: number
  midiNote?: number
  articulation?: string
}

export interface Chord {
  rootNote: string
  chordType: string
  startTime: number
  duration: number
  inversion?: number
  notes: number[]
}

export interface Measure {
  measureNumber: number
  timeSignature: string
  tempo: number
  startTime: number
  duration: number
  notes: Note[]
  chords: Chord[]
}

export interface MusicComposition {
  id: string
  title: string
  composer?: string
  parts: Part[]
  duration: number
  metadata?: Record<string, any>
}

export interface Part {
  id: string
  name: string
  instrument: string
  measures: Measure[]
}

// MIDI Parser (Browser-based)
export class MIDIParser {
  static async parse(file: File): Promise<MusicComposition> {
    // Browser-based MIDI parsing
    const arrayBuffer = await file.arrayBuffer()
    const dataView = new DataView(arrayBuffer)
    
    // Basic MIDI header parsing
    const headerChunk = this.readChunk(dataView, 0)
    
    return {
      id: crypto.randomUUID(),
      title: file.name,
      parts: [],
      duration: 0,
      metadata: {
        format: 'MIDI',
        source: file.name,
      },
    }
  }

  private static readChunk(dataView: DataView, offset: number) {
    // MIDI chunk parsing logic
    const type = String.fromCharCode(
      dataView.getUint8(offset),
      dataView.getUint8(offset + 1),
      dataView.getUint8(offset + 2),
      dataView.getUint8(offset + 3)
    )
    const length = dataView.getUint32(offset + 4, false)
    
    return { type, length, offset: offset + 8 }
  }
}

// Music Theory Analysis
export class MusicAnalyzer {
  static getHarmonicProgression(measures: Measure[]): Chord[] {
    // Extract chord progression from measures
    const chords: Chord[] = []
    
    measures.forEach((measure) => {
      measure.chords.forEach((chord) => {
        chords.push(chord)
      })
    })
    
    return chords
  }

  static getMelodicContour(notes: Note[]): string {
    // Analyze melodic movement
    if (notes.length < 2) return 'static'
    
    let ascending = 0
    let descending = 0
    
    for (let i = 1; i < notes.length; i++) {
      if (notes[i].pitch > notes[i - 1].pitch) ascending++
      else if (notes[i].pitch < notes[i - 1].pitch) descending++
    }
    
    if (ascending > descending * 1.5) return 'ascending'
    if (descending > ascending * 1.5) return 'descending'
    return 'mixed'
  }

  static detectKey(notes: Note[]): string {
    // Simple key detection based on pitch class distribution
    const pitchClasses = new Array(12).fill(0)
    
    notes.forEach((note) => {
      const pitchClass = note.pitch % 12
      pitchClasses[pitchClass]++
    })
    
    const maxIndex = pitchClasses.indexOf(Math.max(...pitchClasses))
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    
    return noteNames[maxIndex]
  }

  static calculateTempo(measures: Measure[]): number {
    // Calculate average tempo
    if (measures.length === 0) return 120
    
    const tempos = measures.map((m) => m.tempo).filter((t) => t > 0)
    return tempos.length > 0 ? tempos.reduce((a, b) => a + b) / tempos.length : 120
  }
}

// Music Generation
export class MusicGenerator {
  static generateMelody(key: string, length: number): Note[] {
    // Generate simple melody in given key
    const notes: Note[] = []
    const scale = this.getScale(key)
    
    for (let i = 0; i < length; i++) {
      const pitch = scale[Math.floor(Math.random() * scale.length)]
      notes.push({
        pitch: pitch + 60, // Middle octave
        velocity: 64 + Math.floor(Math.random() * 32),
        startTime: i * 0.5,
        duration: 0.5,
        midiNote: pitch + 60,
      })
    }
    
    return notes
  }

  static harmonize(melody: Note[]): Chord[] {
    // Generate chord progression for melody
    const chords: Chord[] = []
    
    // Simple I-IV-V-I progression
    const progression = ['C', 'F', 'G', 'C']
    
    progression.forEach((root, i) => {
      chords.push({
        rootNote: root,
        chordType: 'major',
        startTime: i * 2,
        duration: 2,
        notes: this.getChordNotes(root, 'major'),
      })
    })
    
    return chords
  }

  private static getScale(key: string): number[] {
    // Major scale intervals
    const intervals = [0, 2, 4, 5, 7, 9, 11]
    const keyOffset = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(key)
    
    return intervals.map((interval) => (keyOffset + interval) % 12)
  }

  private static getChordNotes(root: string, type: string): number[] {
    const rootPitch = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(root)
    
    if (type === 'major') {
      return [rootPitch, rootPitch + 4, rootPitch + 7]
    } else if (type === 'minor') {
      return [rootPitch, rootPitch + 3, rootPitch + 7]
    }
    
    return [rootPitch]
  }
}

// Real-time OSC Communication
export class OSCClient {
  private ws: WebSocket | null = null

  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url)
      
      this.ws.onopen = () => {
        console.log('OSC WebSocket connected')
        resolve()
      }
      
      this.ws.onerror = (error) => {
        console.error('OSC WebSocket error:', error)
        reject(error)
      }
    })
  }

  sendEvent(address: string, args: any[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('OSC WebSocket not connected')
      return
    }

    const message = {
      address,
      args,
      timestamp: Date.now(),
    }

    this.ws.send(JSON.stringify(message))
  }

  onMessage(callback: (data: any) => void): void {
    if (this.ws) {
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        callback(data)
      }
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}
