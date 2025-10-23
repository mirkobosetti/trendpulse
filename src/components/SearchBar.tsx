import { useState } from 'react'

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleAnalyze = () => {
    console.log('Analyzing:', searchQuery)
    // Placeholder per logica futura
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter a topic to analyze trends..."
          className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleAnalyze}
          className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors whitespace-nowrap"
        >
          Analyze
        </button>
      </div>
    </div>
  )
}
