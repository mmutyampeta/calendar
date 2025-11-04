'use server'

import { createClient } from './server'
import { revalidatePath } from 'next/cache'
import type { NewEventInput } from './events'

/**
 * Server Action to create a new event
 * Follows Next.js 14+ Server Actions pattern with Supabase
 */
export async function createEvent(input: NewEventInput) {
  const supabase = await createClient()

  // Get the current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'User not authenticated' }
  }

  // Insert the event with user_id automatically set
  const { data, error } = await supabase
    .from('calendar_items')
    .insert({
      user_id: user.id,
      event_name: input.title,
      Description: input.description || null,
      start_datetime: input.start_time,
      end_datetime: input.end_time,
      importance: input.importance ?? 0,
      complete: input.complete ?? false,
      archived: input.archived ?? false,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Revalidate the calendar page to show new event
  revalidatePath('/calendar')

  return { data }
}

/**
 * Server Action to get all events for the current user
 */
export async function getEvents() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'User not authenticated' }
  }

  const { data, error } = await supabase
    .from('calendar_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('archived', false) // Exclude archived events
    .order('start_datetime', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

/**
 * Server Action to get events within a date range
 */
export async function getEventsByDateRange(startDate: string, endDate: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'User not authenticated' }
  }

  const { data, error } = await supabase
    .from('calendar_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('archived', false) // Exclude archived events
    .gte('start_datetime', startDate)
    .lte('start_datetime', endDate)
    .order('start_datetime', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

/**
 * Server Action to update an existing event
 */
export async function updateEvent(eventId: string, updates: Partial<NewEventInput>) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'User not authenticated' }
  }

  // Map fields to database column names
  const dbUpdates: Record<string, unknown> = {}
  if (updates.title !== undefined) dbUpdates.event_name = updates.title
  if (updates.description !== undefined) dbUpdates.Description = updates.description
  if (updates.start_time !== undefined) dbUpdates.start_datetime = updates.start_time
  if (updates.end_time !== undefined) dbUpdates.end_datetime = updates.end_time
  if (updates.importance !== undefined) dbUpdates.importance = updates.importance
  if (updates.complete !== undefined) dbUpdates.complete = updates.complete
  if (updates.archived !== undefined) dbUpdates.archived = updates.archived
  
  dbUpdates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('calendar_items')
    .update(dbUpdates)
    .eq('id', eventId)
    .eq('user_id', user.id) // Ensure user can only update their own events
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Revalidate the calendar page
  revalidatePath('/calendar')

  return { data }
}

/**
 * Server Action to archive an event (soft delete)
 */
export async function archiveEvent(eventId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'User not authenticated' }
  }

  const { data, error } = await supabase
    .from('calendar_items')
    .update({ archived: true, updated_at: new Date().toISOString() })
    .eq('id', eventId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Revalidate the calendar page
  revalidatePath('/calendar')

  return { data }
}

/**
 * Server Action to toggle event completion status
 */
export async function toggleEventComplete(eventId: string, complete: boolean) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'User not authenticated' }
  }

  const { data, error } = await supabase
    .from('calendar_items')
    .update({ complete, updated_at: new Date().toISOString() })
    .eq('id', eventId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Revalidate the calendar page
  revalidatePath('/calendar')

  return { data }
}

/**
 * Server Action to delete an event (hard delete - only if needed)
 */
export async function deleteEvent(eventId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'User not authenticated' }
  }

  const { error } = await supabase
    .from('calendar_items')
    .delete()
    .eq('id', eventId)
    .eq('user_id', user.id) // Ensure user can only delete their own events

  if (error) {
    return { error: error.message }
  }

  // Revalidate the calendar page
  revalidatePath('/calendar')

  return { success: true }
}
