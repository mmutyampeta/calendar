'use client'

import Link from 'next/link'

interface HeaderProps {
  title: string
  userEmail: string
  currentPage: 'calendar' | 'todo'
  onSignOut: () => void
}

export default function Header({ title, userEmail, currentPage, onSignOut }: HeaderProps) {
  const swapUrl = currentPage === 'calendar' ? '/todo' : '/calendar'

  return (
    <header className="border-b border-gray-200 bg-white dark:border-[#2d2d2d] dark:bg-[#1c1c1c]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            {title}
          </h1>
          <Link
            href={swapUrl}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-black dark:hover:bg-[#2a2a2a] dark:hover:text-white"
            title={currentPage === 'calendar' ? 'Switch to To-Do List' : 'Switch to Calendar'}
          >
            <svg 
              className="h-5 w-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" 
              />
            </svg>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {userEmail}
          </span>
          <button
            onClick={onSignOut}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700 dark:bg-gray-100 dark:text-black dark:hover:bg-gray-300"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  )
}
