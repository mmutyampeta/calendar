'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import EventCard, { EventCardProps } from '@/app/components/EventCard'
import Header from '@/app/components/Header'
import CreateEventModal from '@/app/components/CreateEventModal'
import EditEventModal from '@/app/components/EditEventModal'
import { getTasks, toggleEventComplete, archiveEvent } from '@/lib/supabase/actions'
import type { User } from '@supabase/supabase-js'

// Database event type based on calendar_items table
type DbEvent = {
  id: string
  user_id: string
  event_name: string
  Description: string | null
  start_datetime: string
  end_datetime: string
  importance: string | number // Can be either string or number
  complete: boolean
  archived: boolean
  created_at: string
  updated_at: string
}

// Helper function to convert database event to EventCardProps
function mapDbEventToCard(dbEvent: DbEvent): EventCardProps {
  // Map importance - handle both string and number formats
  let mappedImportance: 'none' | 'low' | 'medium' | 'high' = 'none'
  
  if (typeof dbEvent.importance === 'string') {
    // Handle string format (e.g., "LOW", "MEDIUM", "HIGH", "NONE")
    const importanceStr = dbEvent.importance.toLowerCase() as 'none' | 'low' | 'medium' | 'high'
    if (['none', 'low', 'medium', 'high'].includes(importanceStr)) {
      mappedImportance = importanceStr
    }
  } else if (typeof dbEvent.importance === 'number') {
    // Handle number format (0-3 scale)
    const importanceMap: Record<number, 'none' | 'low' | 'medium' | 'high'> = {
      0: 'none',
      1: 'low',
      2: 'medium',
      3: 'high',
    }
    mappedImportance = importanceMap[dbEvent.importance] || 'none'
  }

  return {
    id: dbEvent.id,
    title: dbEvent.event_name,
    description: dbEvent.Description || undefined,
    startTimestamp: Math.floor(new Date(dbEvent.start_datetime).getTime() / 1000),
    endTimestamp: Math.floor(new Date(dbEvent.end_datetime).getTime() / 1000),
    importance: mappedImportance,
    completed: dbEvent.complete || false,
  }
}

export default function TodoPage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const [events, setEvents] = useState<EventCardProps[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [weekOffset, setWeekOffset] = useState(0) // Track which week we're viewing

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

  const handleEdit = (id: string) => {
    setEditingEventId(id)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    // Confirm before deleting
    if (!confirm('Are you sure you want to delete this task?')) {
      return
    }

    // Optimistically remove from UI
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id))

    // Archive in database
    const result = await archiveEvent(id)
    
    if (result.error) {
      console.error('Error archiving task:', result.error)
      // Refetch to restore on error
      fetchTasks()
    }
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
  const fetchTasks = async (showLoadingSpinner = true) => {
    if (!user) return

    if (showLoadingSpinner) {
      setLoading(true)
    }
    console.log('🔍 DEBUG: Fetching events from Supabase...')
    const result = await getTasks()
      
      console.log('🔍 DEBUG: Raw Supabase result:', result)
      
      if (result.error) {
        console.error('❌ DEBUG: Error fetching events:', result.error)
        setEvents([])
      } else if (result.data) {
        console.log('✅ DEBUG: Raw events data:', result.data)
        console.log('✅ DEBUG: Number of events fetched:', result.data.length)
        
        // Log each event's importance value
        result.data.forEach((event, index) => {
          console.log(`📋 DEBUG: Event ${index + 1}:`, {
            id: event.id,
            name: event.event_name,
            importance: event.importance,
            importance_type: typeof event.importance
          })
        })
        
        const mappedEvents = result.data.map(mapDbEventToCard)
        console.log('✅ DEBUG: Mapped events:', mappedEvents)
        
        // Log mapped importance values
        mappedEvents.forEach((event, index) => {
          console.log(`📋 DEBUG: Mapped Event ${index + 1}:`, {
            id: event.id,
            title: event.title,
            importance: event.importance
          })
        })
        
        setEvents(mappedEvents)
      } else {
        console.warn('⚠️ DEBUG: No data property in result')
        setEvents([])
      }
      
      setLoading(false)
    }

  useEffect(() => {
    fetchTasks()
  }, [user])

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
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
        {/* Week Header with Navigation */}
        <div className="mb-6 flex items-center justify-between border-b-2 border-gray-200 pb-4 dark:border-[#2d2d2d]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="rounded-lg bg-transparent p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-black dark:text-gray-400 dark:hover:bg-[#2a2a2a] dark:hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              {(() => {
                const startDate = new Date()
                startDate.setDate(startDate.getDate() + (weekOffset * 7))
                const endDate = new Date(startDate)
                endDate.setDate(endDate.getDate() + 6)
                
                if (startDate.getMonth() === endDate.getMonth()) {
                  return `${startDate.toLocaleDateString('en-US', { month: 'long' })} ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`
                } else {
                  return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${endDate.getFullYear()}`
                }
              })()}
            </h2>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="rounded-lg bg-transparent p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-black dark:text-gray-400 dark:hover:bg-[#2a2a2a] dark:hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-md bg-black px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 whitespace-nowrap"
          >
            + New Task
          </button>
        </div>

        {/* Days List */}
        <div className="space-y-6">
          {Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() + i + (weekOffset * 7))
            
            const today = new Date()
            const isToday = date.getDate() === today.getDate() && 
                           date.getMonth() === today.getMonth() && 
                           date.getFullYear() === today.getFullYear()
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
                
                {/* Event cards, loading state, or empty state */}
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading events...
                  </div>
                ) : dayEvents.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {dayEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        {...event}
                        layout="vertical"
                        onToggleComplete={handleToggleComplete}
                        onClick={handleEventClick}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
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

      {/* Create Task Modal */}
      <CreateEventModal
        isOpen={isModalOpen}
        onClose={async () => {
          setIsModalOpen(false)
          // Small delay to allow success toast to be visible, then smoothly refetch without spinner
          setTimeout(async () => {
            await fetchTasks(false)
          }, 100)
        }}
        selectedDate={selectedDate}
        isTask={true}
      />

      {/* Edit Task Modal */}
      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingEventId(null)
          // Small delay to allow success toast to be visible, then smoothly refetch without spinner
          setTimeout(() => {
            fetchTasks(false)
          }, 100)
        }}
        eventId={editingEventId}
        isTask={true}
      />
    </div>
  )
}
