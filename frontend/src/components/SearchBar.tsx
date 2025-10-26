import { useState } from 'react'

interface SearchBarProps {
  onSearch: (terms: string[]) => Promise<void>
  loading: boolean
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim() || loading) return

    // Split by comma and clean up
    const terms = searchQuery
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .slice(0, 5)

    if (terms.length > 0) {
      await onSearch(terms)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Compare topics (separate with commas: React, Vue, Angular)"
            disabled={loading}
            className="w-full px-5 py-4 pr-32 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span>Analyzing...</span>
              </div>
            ) : (
              'Compare'
            )}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500 text-center">
          💡 Tip: Enter up to 5 topics separated by commas
        </p>
      </form>
    </div>
  )
}
