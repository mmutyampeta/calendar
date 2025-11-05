'use client'

import { useState } from 'react'
import SliderToggle from './SliderToggle'

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

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Handle event creation
    console.log({
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      importance,
    })
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
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
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-black dark:text-white">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
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
              className="flex-1 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
