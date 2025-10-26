import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import TrendChart from '../components/TrendChart'
import { fetchTrend, type TrendResponse } from '../lib/api'

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [trendsData, setTrendsData] = useState<TrendResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const searchTerms = searchParams.get('search')?.split(',').filter(Boolean)
    if (searchTerms && searchTerms.length > 0) {
      handleSearch(searchTerms)
    }
  }, [searchParams])

  const handleSearch = async (terms: string[]) => {
    setLoading(true)
    setError(null)

    try {
      const promises = terms.map(term => fetchTrend(term))
      const results = await Promise.all(promises)
      setTrendsData(results)
      setSearchParams({ search: terms.join(',') }, { replace: true })
    } catch (err: any) {
      setError(err.message)
      setTrendsData([])
    } finally {
      setLoading(false)
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

      <SearchBar onSearch={handleSearch} loading={loading} />

      {error && (
        <div className="mt-8 max-w-5xl mx-auto">
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            <p className="font-medium">Error loading trend data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <TrendChart data={trendsData} />
    </div>
  )
}
