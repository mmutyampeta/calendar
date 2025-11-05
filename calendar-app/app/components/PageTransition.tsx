'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState, startTransition } from 'react'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Reset animation on route change
    startTransition(() => {
      setIsVisible(false)
    })
    const timer = setTimeout(() => {
      startTransition(() => {
        setIsVisible(true)
      })
    }, 50)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      }`}
    >
      {children}
    </div>
  )
}
