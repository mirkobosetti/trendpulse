import { useState, useEffect } from 'react'
import { getTopSearches, type TopSearch } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const [topSearches, setTopSearches] = useState<TopSearch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTopSearches()
  }, [])

  const loadTopSearches = async () => {
    try {
      setLoading(true)
      const data = await getTopSearches(20)
      setTopSearches(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (term: string) => {
    navigate(`/?search=${encodeURIComponent(term)}`)
  }

  const maxCount = topSearches.length > 0 ? topSearches[0].count : 1

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Most searched trends on TrendPulse
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {topSearches.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No searches yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Be the first to search for trends!
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Top 20 Searched Terms
            </h2>
            <div className="space-y-4">
              {topSearches.map((search, index) => (
                <div key={search.term} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 text-right">
                    <span className={`text-lg font-bold ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-orange-600' :
                      'text-gray-500'
                    }`}>
                      #{index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <button
                      onClick={() => handleSearch(search.term)}
                      className="text-left w-full"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 hover:text-blue-600">
                          {search.term}
                        </span>
                        <span className="text-sm text-gray-500">
                          {search.count} {search.count === 1 ? 'search' : 'searches'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(search.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          About the Dashboard
        </h3>
        <p className="text-sm text-blue-800">
          This dashboard shows the most popular search terms across all TrendPulse users.
          Click on any term to view its trend data. The data updates in real-time as users
          perform searches.
        </p>
      </div>
    </div>
  )
}
