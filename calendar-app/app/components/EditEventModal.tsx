'use client'

import { useState, useEffect } from 'react'
import SliderToggle from './SliderToggle'
import SuccessToast from './SuccessToast'
import { getEventById } from '@/lib/supabase/actions'

interface EditEventModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string | null
  isTask?: boolean // Whether this is a task or event
}

export default function EditEventModal({ isOpen, onClose, eventId, isTask = false }: EditEventModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [importance, setImportance] = useState<'none' | 'low' | 'medium' | 'high'>('none')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')

  // Fetch event data when modal opens and eventId changes
  useEffect(() => {
    const loadEventData = async () => {
      if (!isOpen || !eventId) return

      setLoadingData(true)
      setError('')
      setShowSuccess(false) // Reset success toast when opening modal

      try {
        const result = await getEventById(eventId)

        if (result.error) {
          setError(result.error)
          return
        }

        if (result.data) {
          const event = result.data
          
          // Set form fields from the event data
          setTitle(event.event_name || '')
          setDescription(event.Description || '')
          
          // Parse datetime strings
          const startDateTime = new Date(event.start_datetime)
          const endDateTime = new Date(event.end_datetime)
          
          // Format dates for input fields (YYYY-MM-DD)
          setStartDate(startDateTime.toISOString().split('T')[0])
          setEndDate(endDateTime.toISOString().split('T')[0])
          
          // Format times for input fields (HH:MM)
          setStartTime(startDateTime.toTimeString().slice(0, 5))
          setEndTime(endDateTime.toTimeString().slice(0, 5))
          
          // Map importance from database (uppercase string or number) to lowercase
          const importanceValue = typeof event.importance === 'string' 
            ? event.importance.toLowerCase() as 'none' | 'low' | 'medium' | 'high'
            : event.importance === 0 ? 'none'
            : event.importance === 1 ? 'low'
            : event.importance === 2 ? 'medium'
            : event.importance === 3 ? 'high'
            : 'none'
          
          setImportance(importanceValue)
        }
      } catch (err) {
        console.error('Error loading event:', err)
        setError('Failed to load event data')
      } finally {
        setLoadingData(false)
      }
    }

    loadEventData()
  }, [isOpen, eventId])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Placeholder for update logic
      console.log('Update event:', {
        eventId,
        title,
        description,
        startDate,
        startTime,
        endDate,
        endTime,
        importance,
        isTask,
      })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Show success toast
      setShowSuccess(true)
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (err) {
      console.error('Error updating event:', err)
      setError('Failed to update event')
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
        onClick={handleBackdropClick}
      >
        <div 
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-[#1c1c1c] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-[#3a3a3a] dark:[&::-webkit-scrollbar-thumb]:hover:bg-[#4a4a4a]"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#3a3a3a #1c1c1c'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-[#2d2d2d]">
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              {isTask ? 'Edit Task' : 'Edit Event'}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-black dark:text-gray-400 dark:hover:bg-[#2a2a2a] dark:hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form className="p-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Loading State */}
              {loadingData ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="h-8 w-8 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <>
                  {/* Error Message */}
                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
                      {error}
                    </div>
                  )}
                  
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="mb-2 block text-sm font-medium text-black dark:text-white">
                      {isTask ? 'Task' : 'Event'} Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder={`Enter ${isTask ? 'task' : 'event'} title`}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-black placeholder-gray-400 transition-colors focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-[#3a3a3a] dark:bg-[#212121] dark:text-white dark:placeholder-gray-500 dark:focus:border-white dark:focus:ring-white/20"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="mb-2 block text-sm font-medium text-black dark:text-white">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add description (optional)"
                      rows={3}
                      className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-black placeholder-gray-400 transition-colors focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-[#3a3a3a] dark:bg-[#212121] dark:text-white dark:placeholder-gray-500 dark:focus:border-white dark:focus:ring-white/20"
                    />
                  </div>

                  {/* Start Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="mb-2 block text-sm font-medium text-black dark:text-white">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-black transition-colors focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-[#3a3a3a] dark:bg-[#212121] dark:text-white dark:focus:border-white dark:focus:ring-white/20"
                      />
                    </div>
                    <div>
                      <label htmlFor="startTime" className="mb-2 block text-sm font-medium text-black dark:text-white">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        id="startTime"
                        name="startTime"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-black transition-colors focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-[#3a3a3a] dark:bg-[#212121] dark:text-white dark:focus:border-white dark:focus:ring-white/20"
                      />
                    </div>
                  </div>

                  {/* End Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="endDate" className="mb-2 block text-sm font-medium text-black dark:text-white">
                        End Date *
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-black transition-colors focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-[#3a3a3a] dark:bg-[#212121] dark:text-white dark:focus:border-white dark:focus:ring-white/20"
                      />
                    </div>
                    <div>
                      <label htmlFor="endTime" className="mb-2 block text-sm font-medium text-black dark:text-white">
                        End Time *
                      </label>
                      <input
                        type="time"
                        id="endTime"
                        name="endTime"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-black transition-colors focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-[#3a3a3a] dark:bg-[#212121] dark:text-white dark:focus:border-white dark:focus:ring-white/20"
                      />
                    </div>
                  </div>

                  {/* Importance */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                      Importance
                    </label>
                    <SliderToggle
                      options={[
                        { value: 'none', label: 'None' },
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' },
                      ]}
                      value={importance}
                      onChange={setImportance}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gray-50 dark:border-[#3a3a3a] dark:bg-[#212121] dark:text-white dark:hover:bg-[#2a2a2a]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || loadingData}
                className="flex-1 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Toast */}
      <SuccessToast
        message={isTask ? "Task updated successfully!" : "Event updated successfully!"}
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
        duration={3000}
      />
    </>
  )
}
