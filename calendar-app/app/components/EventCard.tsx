'use client'

export interface EventCardProps {
  id: string
  title: string
  description?: string
  startTimestamp: number
  endTimestamp: number
  importance: 'none' | 'low' | 'medium' | 'high'
  completed?: boolean
  onToggleComplete?: (id: string) => void
  onClick?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  layout?: 'horizontal' | 'vertical' // horizontal for calendar, vertical for todo
}

export default function EventCard({
  id,
  title,
  description,
  startTimestamp,
  endTimestamp,
  importance,
  completed = false,
  onToggleComplete,
  onClick,
  onEdit,
  onDelete,
  layout = 'horizontal',
}: EventCardProps) {
  // Convert Unix timestamps to time strings
  const startTime = new Date(startTimestamp * 1000).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
  const endTime = new Date(endTimestamp * 1000).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
  const importanceColors = {
    none: 'border-gray-300 dark:border-[#3a3a3a]',
    low: 'border-blue-500 dark:border-blue-400',
    medium: 'border-yellow-500 dark:border-yellow-400',
    high: 'border-red-500 dark:border-red-400',
  }

  const importanceLabels = {
    none: '',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  }

  if (layout === 'vertical') {
    // Vertical layout for todo list - thinner, taller cards
    return (
      <div
        className={`group relative rounded-lg border-l-4 bg-white p-3 transition-all hover:shadow-md hover:bg-gray-50 dark:bg-[#212121] dark:hover:bg-[#2a2a2a] animate-in fade-in slide-in-from-bottom-2 duration-300 ${
          importanceColors[importance]
        } ${completed ? 'opacity-60' : ''}`}
      >
        {/* Edit and Delete buttons - top right */}
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(id)
              }}
              className="rounded p-1 text-gray-600 transition-colors hover:bg-gray-200 hover:text-black dark:text-gray-400 dark:hover:bg-[#3a3a3a] dark:hover:text-white"
              title="Edit"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(id)
              }}
              className="rounded p-1 text-gray-600 transition-colors hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              title="Delete"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Checkbox at top */}
        <div className="mb-2 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleComplete?.(id)
            }}
            className="shrink-0"
          >
            <div
              className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                completed
                  ? 'border-black bg-black dark:border-white dark:bg-white'
                  : 'border-gray-300 bg-white hover:border-gray-400 dark:border-[#3a3a3a] dark:bg-[#212121] dark:hover:border-[#4a4a4a]'
              }`}
            >
              {completed && (
                <svg
                  className="h-3 w-3 text-white dark:text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
          {importance !== 'none' && (
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                importance === 'low'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : importance === 'medium'
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {importanceLabels[importance]}
            </span>
          )}
        </div>

        {/* Content - stacked vertically */}
        <div
          className="cursor-pointer"
          onClick={() => onClick?.(id)}
        >
          <h3
            className={`mb-2 text-sm font-semibold text-black dark:text-white ${
              completed ? 'line-through' : ''
            }`}
          >
            {title}
          </h3>
          
          {description && (
            <p
              className={`mb-2 text-sm text-gray-600 dark:text-gray-400 ${
                completed ? 'line-through' : ''
              }`}
            >
              {description}
            </p>
          )}

          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {startTime} - {endTime}
          </div>
        </div>
      </div>
    )
  }

  // Horizontal layout for calendar - original wider cards
  return (
    <div
      className={`group relative rounded-lg border-l-4 bg-white p-4 transition-all hover:shadow-md hover:bg-gray-50 dark:bg-[#212121] dark:hover:bg-[#2a2a2a] animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        importanceColors[importance]
      } ${completed ? 'opacity-60' : ''}`}
    >
      {/* Edit and Delete buttons - top right */}
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(id)
            }}
            className="rounded p-1 text-gray-600 transition-colors hover:bg-gray-200 hover:text-black dark:text-gray-400 dark:hover:bg-[#3a3a3a] dark:hover:text-white"
            title="Edit"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(id)
            }}
            className="rounded p-1 text-gray-600 transition-colors hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            title="Delete"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleComplete?.(id)
          }}
          className="mt-1 shrink-0"
        >
          <div
            className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
              completed
                ? 'border-black bg-black dark:border-white dark:bg-white'
                : 'border-gray-300 bg-white hover:border-gray-400 dark:border-[#3a3a3a] dark:bg-[#212121] dark:hover:border-[#4a4a4a]'
            }`}
          >
            {completed && (
              <svg
                className="h-3 w-3 text-white dark:text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </button>

        {/* Content */}
        <div
          className="flex-1 cursor-pointer"
          onClick={() => onClick?.(id)}
        >
          {/* Title with Importance Badge and Time */}
          <div className="mb-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {importance !== 'none' && (
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    importance === 'low'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : importance === 'medium'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {importanceLabels[importance]}
                </span>
              )}
              <h3
                className={`text-sm font-semibold text-black dark:text-white ${
                  completed ? 'line-through' : ''
                }`}
              >
                {title}
              </h3>
            </div>
            <span className="shrink-0 text-base font-bold text-gray-900 dark:text-gray-100">
              {startTime} - {endTime}
            </span>
          </div>

          {/* Description */}
          {description && (
            <p
              className={`text-sm text-gray-600 dark:text-gray-400 ${
                completed ? 'line-through' : ''
              }`}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
