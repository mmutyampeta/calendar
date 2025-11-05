'use client'

import { useState } from 'react'
import SliderToggle from './SliderToggle'
import SuccessToast from './SuccessToast'
import { createEvent } from './createEventAction'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date
}

export default function CreateEventModal({ isOpen, onClose, selectedDate }: CreateEventModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState(selectedDate.toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('09:00')
  const [endDate, setEndDate] = useState(selectedDate.toISOString().split('T')[0])
  const [endTime, setEndTime] = useState('10:00')
  const [importance, setImportance] = useState<'none' | 'low' | 'medium' | 'high'>('none')
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null


  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setLoading(true)

  //   try {
  //     const response = await fetch('/api/events', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         title,
  //         description,
  //         start: new Date(`${startDate}T${startTime}`),
  //         end: new Date(`${endDate}T${endTime}`),
  //         importance,
  //       }),
  //     })

  //     if (!response.ok) {
  //       throw new Error('Failed to create event')
  //     }

  //     // Show success toast
  //     setShowSuccess(true)
      
  //     // Reset form
  //     setTitle('')
  //     setDescription('')
  //     setImportance('none')
      
  //     // Close modal after a short delay
  //     setTimeout(() => {
  //       onClose()
  //     }, 500)
  //   } catch (error) {
  //     console.error(error)
  //     // You could add an error toast here too
  //   } finally {
  //     setLoading(false)
  //   }
  // }

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
            <h2 className="text-2xl font-semibold text-black dark:text-white">Create Event</h2>
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
          <form className="p-6" action={async (formData) => {
            setLoading(true)
            setError('')
            
            const result = await createEvent(formData)
            
            if (result.success) {
              // Show success toast
              setShowSuccess(true)
              // Reset form
              setTitle('')
              setDescription('')
              setImportance('none')
              // Close modal after a short delay
              setTimeout(() => {
                onClose()
                setLoading(false)
              }, 500)
            } else {
              // Show error
              setError(result.error || 'Failed to create event')
              setLoading(false)
            }
          }}>
            <div className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
                  {error}
                </div>
              )}
              
              {/* Title */}
              <div>
                <label htmlFor="title" className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Enter event title"
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
                  placeholder="Add event description (optional)"
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
                <div className="relative inline-flex w-full rounded-lg border border-gray-300 bg-white p-1 dark:border-[#3a3a3a] dark:bg-[#1c1c1c]">
                  <div
                    className={`absolute top-1 h-9 rounded-md bg-black transition-transform duration-300 ease-in-out dark:bg-white ${
                      importance === 'none' ? 'translate-x-0 w-[calc(25%-0.25rem)]' :
                      importance === 'low' ? 'translate-x-[calc(100%+0.25rem)] w-[calc(25%-0.25rem)]' :
                      importance === 'medium' ? 'translate-x-[calc(200%+0.5rem)] w-[calc(25%-0.25rem)]' :
                      'translate-x-[calc(300%+0.75rem)] w-[calc(25%-0.25rem)]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setImportance('none')}
                    className={`relative z-10 flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                      importance === 'none'
                        ? 'text-white dark:text-black'
                        : 'text-black dark:text-white'
                    }`}
                  >
                    None
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportance('low')}
                    className={`relative z-10 flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                      importance === 'low'
                        ? 'text-white dark:text-black'
                        : 'text-black dark:text-white'
                    }`}
                  >
                    Low
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportance('medium')}
                    className={`relative z-10 flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                      importance === 'medium'
                        ? 'text-white dark:text-black'
                        : 'text-black dark:text-white'
                    }`}
                  >
                    Medium
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportance('high')}
                    className={`relative z-10 flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                      importance === 'high'
                        ? 'text-white dark:text-black'
                        : 'text-black dark:text-white'
                    }`}
                  >
                    High
                  </button>
                </div>
              </div>
            </div>
            <input type="hidden" name="importance" value={importance} />

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
                disabled={loading}
                className="flex-1 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Toast */}
      <SuccessToast
        message="Event created successfully!"
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
        duration={3000}
      />
    </>
  )
}