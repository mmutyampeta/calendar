'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import EventCard, { EventCardProps } from '@/app/components/EventCard'
import Header from '@/app/components/Header'
import { getEvents, toggleEventComplete } from '@/lib/supabase/actions'
import type { User } from '@supabase/supabase-js'

// Database event type based on calendar_items table
type DbEvent = {
  id: string
  user_id: string
  event_name: string
  Description: string | null
  start_datetime: string
  end_datetime: string
  importance: number
  complete: boolean
  archived: boolean
  created_at: string
  updated_at: string
}

// Helper function to convert database event to EventCardProps
function mapDbEventToCard(dbEvent: DbEvent): EventCardProps {
  // Map importance from 0-3 scale to our importance levels
  const importanceMap: Record<number, 'none' | 'low' | 'medium' | 'high'> = {
    0: 'none',
    1: 'low',
    2: 'medium',
    3: 'high',
  }

  return {
    id: dbEvent.id,
    title: dbEvent.event_name,
    description: dbEvent.Description || undefined,
    startTimestamp: Math.floor(new Date(dbEvent.start_datetime).getTime() / 1000),
    endTimestamp: Math.floor(new Date(dbEvent.end_datetime).getTime() / 1000),
    importance: importanceMap[dbEvent.importance] || 'none',
    completed: dbEvent.complete || false,
  }
}

export default function TodoPage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const [events, setEvents] = useState<EventCardProps[]>([])
  const [loading, setLoading] = useState(true)

  const handleToggleComplete = async (id: string) => {
    // Optimistically update UI
    const event = events.find(e => e.id === id)
    if (!event) return

    const newCompletedState = !event.completed

    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === id ? { ...event, completed: newCompletedState } : event
      )
    )

    // Update in database
    const result = await toggleEventComplete(id, newCompletedState)
    
    if (result.error) {
      console.error('Error toggling event:', result.error)
      // Revert optimistic update on error
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === id ? { ...event, completed: !newCompletedState } : event
        )
      )
    }
  }

  const handleEventClick = (id: string) => {
    console.log('Event clicked:', id)
    // TODO: Open edit modal
  }

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    }

    checkUser()
  }, [router, supabase])

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return

      setLoading(true)
      const result = await getEvents()
      
      if (result.error) {
        console.error('Error fetching events:', result.error)
        setEvents([])
      } else if (result.data) {
        const mappedEvents = result.data.map(mapDbEventToCard)
        setEvents(mappedEvents)
      } else {
        setEvents([])
      }
      
      setLoading(false)
    }

    fetchEvents()
  }, [user])

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1c1c1c] flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading events...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#1c1c1c] [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400 dark:[&::-webkit-scrollbar-track]:bg-[#1c1c1c] dark:[&::-webkit-scrollbar-thumb]:bg-[#3a3a3a] dark:[&::-webkit-scrollbar-thumb]:hover:bg-[#4a4a4a]" style={{ scrollbarWidth: 'thin', scrollbarColor: '#3a3a3a #1c1c1c' }}>
        <Header
          title="To-Do List" 
          userEmail={user.email || ''} 
          currentPage="todo"
          onSignOut={handleSignOut}
        />

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Days List */}
        <div className="space-y-6">
          {Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() + i)
            
            const isToday = i === 0
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
            const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            
            // Get start and end of day in Unix timestamps (using UTC midnight)
            const dayStart = Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 1000)
            const dayEnd = dayStart + (24 * 60 * 60)
            
            // Filter events for this day
            const dayEvents = events.filter(event => {
              return event.startTimestamp >= dayStart && event.startTimestamp < dayEnd
            })
            
            return (
              <div key={i}>
                {/* Day Header */}
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-black dark:text-white">
                    {dayName}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {monthDay}
                  </span>
                  {isToday && (
                    <span className="rounded-full bg-black px-2.5 py-0.5 text-xs font-semibold text-white dark:bg-white dark:text-black">
                      Today
                    </span>
                  )}
                </div>
                
                {/* Event cards or empty state */}
                {dayEvents.length > 0 ? (
                  <div className="space-y-3">
                    {dayEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        {...event}
                        onToggleComplete={handleToggleComplete}
                        onClick={handleEventClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 dark:text-gray-500">
                    No tasks scheduled
                  </div>
                )}
                
                {/* Divider (except for last item) */}
                {i < 6 && (
                  <div className="mt-6 border-b border-gray-200 dark:border-[#2d2d2d]" />
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
