'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import CreateEventModal from '@/app/components/CreateEventModal'
import SliderToggle from '@/app/components/SliderToggle'
import Header from '@/app/components/Header'
import {getEvents} from '@/lib/supabase/actions'

type ViewMode = 'month' | 'week'

interface CalendarEvent {
  id: string
  event_name: string
  Description: string | null
  start_datetime: string
  end_datetime: string
  importance: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' 
}

export default function CalendarPage() {
  const [user, setUser] = useState<User | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [events, setEvents] = useState<CalendarEvent[]>([])

  const router = useRouter()
  const supabase = createClient()

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

useEffect(() => {
  if (!user) return // if the user is not valid, skip 

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("calendar_items")
      .select("*")
      .eq("user_id", user.id)
      .order("start_datetime", { ascending: true })

    if (error) {
      // handling error in supabase query 
      console.error("Error fetching events:", error.message)
    } else {
      setEvents(data || [])
    }
  }

  fetchEvents()
}, [user, supabase])

  if (!user) {
    return null // or a loading spinner
  }

  // function to get all events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_datetime)
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      )
    })
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'HIGH': return 'bg-red-500 dark:bg-red-600'
      case 'MEDIUM': return 'bg-yellow-500 dark:bg-yellow-600'
      case 'LOW': return 'bg-blue-500 dark:bg-blue-600'
      default: return 'bg-gray-500 dark:bg-gray-600'
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  const handleNavigateBack = () => {
    if (viewMode === 'month') {
      goToPreviousMonth()
    } else {
      goToPreviousWeek()
    }
  }

  const handleNavigateForward = () => {
    if (viewMode === 'month') {
      goToNextMonth()
    } else {
      goToNextWeek()
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)

    return Array.from({ length: 7 }, (_, i) => {
      const weekDay = new Date(startOfWeek)
      weekDay.setDate(startOfWeek.getDate() + i)
      return weekDay
    })
  }

  const formatWeekRange = (date: Date) => {
    const weekDays = getWeekDays(date)
    const start = weekDays[0]
    const end = weekDays[6]
    
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`
    } else {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#1c1c1c] [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400 dark:[&::-webkit-scrollbar-track]:bg-[#1c1c1c] dark:[&::-webkit-scrollbar-thumb]:bg-[#3a3a3a] dark:[&::-webkit-scrollbar-thumb]:hover:bg-[#4a4a4a]" style={{ scrollbarWidth: 'thin', scrollbarColor: '#3a3a3a #1c1c1c' }}>
        <Header
          title="Calendar" 
          userEmail={user.email || ''} 
          currentPage="calendar"
          onSignOut={handleSignOut}
        />

      {/* Calendar Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Calendar Controls */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={goToToday}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Today
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleNavigateBack}
                className="rounded-lg bg-transparent p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-black dark:text-gray-400 dark:hover:bg-[#2a2a2a] dark:hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="min-w-[200px] text-center text-2xl font-semibold text-black dark:text-white">
                {viewMode === 'month' 
                  ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : formatWeekRange(currentDate)
                }
              </h2>
              <button
                onClick={handleNavigateForward}
                className="rounded-lg bg-transparent p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-black dark:text-gray-400 dark:hover:bg-[#2a2a2a] dark:hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <SliderToggle
              options={[
                { value: 'month', label: 'Month' },
                { value: 'week', label: 'Week' },
              ]}
              value={viewMode}
              onChange={setViewMode}
              className="w-[168px]"
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-md bg-black px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 whitespace-nowrap"
            >
              + New Event
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        {viewMode === 'month' ? (
          // Month View
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-[#2d2d2d] dark:bg-[#1c1c1c]">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-100 dark:border-[#2d2d2d] dark:bg-[#212121]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="px-4 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7">
              {Array.from({ length: 35 }, (_, i) => {
                const today = new Date()
                const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
                const startingDayOfWeek = firstDay.getDay()
                const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
                
                const dayNumber = i - startingDayOfWeek + 1
                const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth
                
                const cellDate = isCurrentMonth 
                  ? new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber)
                  : null
                
                const isToday = isCurrentMonth && 
                  dayNumber === today.getDate() &&
                  currentDate.getMonth() === today.getMonth() &&
                  currentDate.getFullYear() === today.getFullYear()
                
                const isSelected = cellDate &&
                  cellDate.getDate() === selectedDate.getDate() &&
                  cellDate.getMonth() === selectedDate.getMonth() &&
                  cellDate.getFullYear() === selectedDate.getFullYear()

                return (
                  <button
                    key={i}
                    onClick={() => cellDate && setSelectedDate(cellDate)}
                    disabled={!isCurrentMonth}
                    className={`flex min-h-[140px] flex-col items-start border-b border-r border-gray-200 p-3 text-left transition-colors last:border-r-0 dark:border-[#2d2d2d] ${
                      !isCurrentMonth 
                        ? 'cursor-default bg-gray-50 dark:bg-[#1a1a1a]' 
                        : `hover:bg-gray-100 dark:hover:bg-[#2a2a2a] ${
                            isSelected ? 'bg-gray-100 dark:bg-[#2a2a2a]' : 'bg-white dark:bg-[#212121]'
                          }`
                    }`}
                  >
                    {isCurrentMonth && (
                      <>
                        <div
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-black text-white shadow-md dark:bg-white dark:text-black'
                              : isToday
                              ? 'border-2 border-black text-black dark:border-white dark:text-white'
                              : 'text-black dark:text-white'
                          }`}
                        >
                          {dayNumber}
                        </div>
                        {/* Event tiles will go here */}
                        {cellDate && ( // only render events for valid dates
                          <div className="mt-2 w-full space-y-1">
                            {getEventsForDate(cellDate).slice(0, 3).map((event) => (
                              <div
                                key={event.id}
                                className={`group relative rounded px-2 py-1 text-xs font-medium text-white transition-all hover:shadow-md ${getImportanceColor(
                                  event.importance
                                )}`}
                              >
                                <div className="truncate">{event.event_name}</div>
                                {/* Tooltip */}
                                {/* this div shows on hover */}
                                <div className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden w-48 rounded-lg bg-black p-2 text-white shadow-xl group-hover:block dark:bg-white dark:text-black">
                                  <div className="font-semibold">{event.event_name}</div>
                                  {event.Description && (
                                    <div className="mt-1 text-xs opacity-80">{event.Description}</div>
                                  )}
                                  <div className="mt-1 text-xs opacity-60">
                                    {new Date(event.start_datetime).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {getEventsForDate(cellDate).length > 3 && (
                              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                +{getEventsForDate(cellDate).length - 3} more
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          // Week View
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-[#2d2d2d] dark:bg-[#1c1c1c]">
            <div className="grid h-[calc(100vh-240px)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-[#3a3a3a]" style={{ gridTemplateColumns: '80px repeat(7, 1fr)', scrollbarWidth: 'thin', scrollbarColor: '#3a3a3a transparent' }}>
              {/* Time Column + Day Columns */}
              {[-1, ...Array.from({ length: 7 }, (_, i) => i)].map((dayIndex) => {
                // Time column logic
                if (dayIndex === -1) {
                  return (
                    <div key="time-column" className="flex flex-col">
                      {/* Empty spacer for header */}
                      <div className="sticky top-0 z-10 shrink-0 border-b border-r border-gray-200 bg-white dark:border-[#2d2d2d] dark:bg-[#212121] h-20"/>
                      {/* Time labels */}
                      {Array.from({ length: 24 }, (_, hour) => (
                        <div
                          key={hour}
                          className="relative h-16 border-b border-r border-gray-200 bg-white dark:border-[#2d2d2d] dark:bg-[#212121]"
                        >
                          <div className="absolute top-1 right-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                            {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }

                // Day column logic
                const day = getWeekDays(currentDate)[dayIndex]
                const today = new Date()
                const isToday =
                  day.getDate() === today.getDate() &&
                  day.getMonth() === today.getMonth() &&
                  day.getFullYear() === today.getFullYear()
                
                const isSelected =
                  day.getDate() === selectedDate.getDate() &&
                  day.getMonth() === selectedDate.getMonth() &&
                  day.getFullYear() === selectedDate.getFullYear()

                return (
                  <button
                    key={dayIndex}
                    onClick={() => setSelectedDate(day)}
                    className={`group flex flex-col border-l border-gray-200 transition-colors dark:border-[#2d2d2d] ${
                      isSelected 
                        ? 'bg-gray-50 hover:bg-gray-100 dark:bg-[#252525] dark:hover:bg-[#2a2a2a]' 
                        : 'bg-white hover:bg-gray-50 dark:bg-[#212121] dark:hover:bg-[#2a2a2a]'
                    }`}
                  >
                    {/* Day Header */}
                    <div className={`sticky top-0 z-10 shrink-0 border-b border-gray-200 px-4 py-3 text-center transition-colors dark:border-[#2d2d2d] ${
                      isSelected 
                        ? 'bg-gray-50 group-hover:bg-gray-100 dark:bg-[#252525] dark:group-hover:bg-[#2a2a2a]' 
                        : 'bg-white group-hover:bg-gray-50 dark:bg-[#212121] dark:group-hover:bg-[#2a2a2a]'
                    }`} style={{ height: '73px' }}>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div
                        className={`mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                          isSelected
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : isToday
                            ? 'border-2 border-black text-black dark:border-white dark:text-white'
                            : 'text-black dark:text-white'
                        }`}
                      >
                        {day.getDate()}
                      </div>
                    </div>
                    
                    {/* Hour blocks with events */}
                    <div className="relative flex-1">
                      {Array.from({ length: 24 }, (_, hour) => (
                        <div
                          key={hour}
                          className="relative h-16 border-b border-gray-200 dark:border-[#2d2d2d]"
                        />
                      ))}
                      
                      {/* Event tiles positioned absolutely */}
                      {getEventsForDate(day).map((event) => {
                        const startDate = new Date(event.start_datetime)
                        const endDate = new Date(event.end_datetime)
                        
                        // Calculate position and height
                        const startHour = startDate.getHours()
                        const startMinute = startDate.getMinutes()
                        const endHour = endDate.getHours()
                        const endMinute = endDate.getMinutes()
                        
                        const topPosition = (startHour * 64) + (startMinute / 60 * 64) // 64px per hour
                        const duration = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 60
                        const height = duration * 64 // 64px per hour
                        
                        return (
                          <div
                            key={event.id}
                            className={`group/event absolute left-1 right-1 rounded px-2 py-1 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md hover:z-20 ${getImportanceColor(
                              event.importance
                            )}`}
                            style={{
                              top: `${topPosition}px`,
                              height: `${Math.max(height, 20)}px`, // Minimum height of 20px
                            }}
                          >
                            <div className="font-semibold truncate">{event.event_name}</div>
                            {height > 40 && (
                              <div className="text-[10px] opacity-90">
                                {startDate.toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </div>
                            )}
                            
                            {/* Hover tooltip for more details */}
                            <div className="pointer-events-none absolute left-full top-0 z-30 ml-2 hidden w-64 rounded-lg bg-black p-3 text-white shadow-xl group-hover/event:block dark:bg-white dark:text-black">
                              <div className="font-semibold text-sm">{event.event_name}</div>
                              {event.Description && (
                                <div className="mt-1 text-xs opacity-80">{event.Description}</div>
                              )}
                              <div className="mt-2 text-xs opacity-60">
                                {startDate.toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                                {' - '}
                                {endDate.toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </div>
                              <div className="mt-1 text-xs opacity-60">
                                Importance: {event.importance}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No events scheduled. Click &quot;+ New Event&quot; to create one.
          </p>
        </div>
      </main>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          // Refetch events when modal closes
          if (user) {
            getEvents().then(({ data, error }) => {
              if (error) {
                console.error('Error fetching events:', error)
              }
              else if (data) {
                console.log('Fetched events:', data)
                setEvents(data || [])
              }
            })
          }
        }}
        selectedDate={selectedDate}
      />
    </div>
  )
}
