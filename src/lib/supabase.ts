// Supabase Client Configuration for AGENTRONIC
import { createClient } from '@supabase/supabase-js'

// These values will be provided after Supabase setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Composition {
  id: string
  title: string
  composer?: string
  created_at: string
  metadata?: any
  duration_seconds?: number
}

export interface Part {
  id: string
  composition_id: string
  name: string
  instrument?: string
  part_number?: number
  created_at: string
  metadata?: any
}

export interface Measure {
  id: string
  part_id: string
  composition_id: string
  measure_number: number
  time_signature?: string
  tempo?: number
  start_time?: number
  duration?: number
  created_at: string
}

export interface Note {
  id: string
  measure_id: string
  pitch: number
  velocity: number
  start_time: number
  duration: number
  midi_note?: number
  frequency?: number
  articulation?: string
  created_at: string
}

export interface Agent {
  id: string
  name: string
  api_key: string
  capabilities?: any
  status: string
  created_at: string
  last_active?: string
}

export interface RealTimeEvent {
  id: string
  session_id?: string
  agent_id?: string
  event_type: string
  event_data: any
  timestamp: string
}