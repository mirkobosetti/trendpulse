import { useState, useRef, useEffect } from 'react'
import type { RecentSearch } from '../lib/api'

interface SearchBarProps {
  onSearch: (terms: string[]) => Promise<void>
  loading: boolean
  recentSearches?: RecentSearch[]
}

export default function SearchBar({ onSearch, loading, recentSearches = [] }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showRecent, setShowRecent] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowRecent(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      setShowRecent(false)
      await onSearch(terms)
    }
  }

  const handleRecentClick = async (term: string) => {
    setSearchQuery(term)
    setShowRecent(false)
    await onSearch([term])
  }

  return (
    <div className="w-full max-w-4xl mx-auto" ref={wrapperRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => recentSearches.length > 0 && setShowRecent(true)}
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

          {/* Recent Searches Dropdown */}
          {showRecent && recentSearches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Recent Searches</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleRecentClick(search.term)}
                    className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors flex items-center justify-between group"
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                      {search.term}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(search.searched_at).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-500 text-center">
          💡 Tip: Enter up to 5 topics separated by commas
        </p>
      </form>
    </div>
  )
}
