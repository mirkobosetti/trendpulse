import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import TrendChart from '../components/TrendChart'
import LoadingSkeleton from '../components/LoadingSkeleton'
import DateRangeSelector from '../components/DateRangeSelector'
import { fetchTrend, fetchComparison, getRecentSearches, type TrendResponse, type RecentSearch } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [trendsData, setTrendsData] = useState<TrendResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [dateRange, setDateRange] = useState<number>(30)
  const { session } = useAuth()
  const isManualChange = useRef(false)

  useEffect(() => {
    const searchTerms = searchParams.get('search')?.split(',').filter(Boolean)
    const days = parseInt(searchParams.get('days') || '30')

    setDateRange(days)

    // Skip if this change was triggered by handleDateRangeChange
    if (isManualChange.current) {
      isManualChange.current = false
      return
    }

    if (searchTerms && searchTerms.length > 0) {
      handleSearch(searchTerms, days)
    }
  }, [searchParams])

  useEffect(() => {
    if (session?.access_token) {
      loadRecentSearches()
    } else {
      setRecentSearches([])
    }
  }, [session])

  const loadRecentSearches = async () => {
    if (!session?.access_token) return

    try {
      const searches = await getRecentSearches(session.access_token, 8)
      setRecentSearches(searches)
    } catch (err) {
      console.error('Failed to load recent searches:', err)
    }
  }

  const handleSearch = async (terms: string[], days?: number) => {
    setLoading(true)
    setError(null)

    const daysToUse = days ?? dateRange

    try {
      const token = session?.access_token

      let results: TrendResponse[]

      if (terms.length === 1) {
        // Single term: use normal endpoint (normalized 0-100)
        const result = await fetchTrend(terms[0], token, daysToUse)
        results = [result]
      } else {
        // Multiple terms: use comparison endpoint (weighted/relative values)
        results = await fetchComparison(terms, token, daysToUse)
      }

      setTrendsData(results)

      // Mark this as manual change to prevent double-call from useEffect
      isManualChange.current = true
      setSearchParams({ search: terms.join(','), days: daysToUse.toString() }, { replace: true })

      // Reload recent searches after new search
      if (token) {
        setTimeout(loadRecentSearches, 500)
      }
    } catch (err: any) {
      setError(err.message)
      setTrendsData([])
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (days: number) => {
    setDateRange(days)
    isManualChange.current = true
    const searchTerms = searchParams.get('search')?.split(',').filter(Boolean)
    if (searchTerms && searchTerms.length > 0) {
      handleSearch(searchTerms, days)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Compare Global Trends
        </h2>
        <p className="text-lg text-gray-600">
          Analyze and compare up to 5 topics side by side
        </p>
      </div>

      <SearchBar onSearch={handleSearch} loading={loading} recentSearches={recentSearches} />

      {trendsData.length > 0 && (
        <div className="mt-6 flex justify-center">
          <DateRangeSelector value={dateRange} onChange={handleDateRangeChange} />
        </div>
      )}

      {error && (
        <div className="mt-8 max-w-5xl mx-auto">
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            <p className="font-medium">Error loading trend data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {loading ? <LoadingSkeleton /> : <TrendChart data={trendsData} dateRange={dateRange} />}
    </div>
  )
}
