'use client'

interface SliderToggleOption<T extends string> {
  value: T
  label: string
}

interface SliderToggleProps<T extends string> {
  options: SliderToggleOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export default function SliderToggle<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SliderToggleProps<T>) {
  const selectedIndex = options.findIndex((option) => option.value === value)
  const optionCount = options.length
  const optionWidthPercent = 100 / optionCount

  return (
    <div className={`relative inline-flex w-full rounded-lg border border-gray-300 bg-white p-1 dark:border-[#3a3a3a] dark:bg-[#1c1c1c] ${className}`}>
      {/* Sliding indicator */}
      <div
        className="absolute top-1 h-9 rounded-md bg-black transition-transform duration-300 ease-in-out dark:bg-white"
        style={{
          width: `calc(${optionWidthPercent}% - 0.25rem)`,
          transform: `translateX(calc(${selectedIndex * 100}% + ${selectedIndex * 0.25}rem))`,
        }}
      />
      
      {/* Option buttons */}
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`relative z-10 flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
            value === option.value
              ? 'text-white dark:text-black'
              : 'text-black dark:text-white'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
