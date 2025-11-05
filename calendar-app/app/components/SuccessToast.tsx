'use client'

import { useEffect } from 'react'

interface SuccessToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number // in milliseconds
}

export default function SuccessToast({ 
  message, 
  isVisible, 
  onClose, 
  duration = 3000 
}: SuccessToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className="animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300 pointer-events-auto">
        <div className="rounded-2xl bg-white shadow-2xl dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2d2d2d] p-6 min-w-[320px] max-w-md">
          {/* Success Icon */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            
            {/* Message */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Success!
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {message}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#2a2a2a] dark:hover:text-gray-300"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}