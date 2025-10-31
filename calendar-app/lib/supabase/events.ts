/**
 * Event operations for Supabase
 * This file contains all database operations related to calendar events
 */

export type Event = {
  id: string
  user_id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  importance: number // 0-3 scale (0: low, 1: medium, 2: high, 3: critical)
  complete: boolean // Whether the event is completed
  archived: boolean // Whether the event is archived (soft delete)
  created_at: string
  updated_at: string
}

export type NewEventInput = {
  title: string
  description?: string
  start_time: string
  end_time: string
  importance?: number // Default to 0 if not provided
  complete?: boolean // Default to false if not provided
  archived?: boolean // Default to false if not provided
}
