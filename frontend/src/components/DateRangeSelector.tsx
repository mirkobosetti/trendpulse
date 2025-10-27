interface DateRangeSelectorProps {
  value: number
  onChange: (days: number) => void
}

const DATE_RANGES = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
  { label: '6 months', value: 180 },
  { label: '1 year', value: 365 }
]

export default function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Time range:</span>
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg transition-colors">
        {DATE_RANGES.map(range => (
          <button
            key={range.value}
            onClick={() => onChange(range.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              value === range.value
                ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  )
}
