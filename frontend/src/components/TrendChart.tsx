import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { addFavorite, removeFavorite, checkIsFavorite } from '../lib/api'
import type { TrendResponse } from '../lib/api'

interface TrendChartProps {
  data: TrendResponse | null
}

export default function TrendChart({ data }: TrendChartProps) {
  const { user, session } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteId, setFavoriteId] = useState<string | undefined>()
  const [favLoading, setFavLoading] = useState(false)

  useEffect(() => {
    if (data && user && session?.access_token) {
      checkFavoriteStatus()
    } else {
      setIsFavorite(false)
      setFavoriteId(undefined)
    }
  }, [data?.term, user, session])

  const checkFavoriteStatus = async () => {
    if (!data || !session?.access_token) return

    try {
      const result = await checkIsFavorite(data.term, session.access_token)
      setIsFavorite(result.isFavorite)
      setFavoriteId(result.favoriteId)
    } catch (err) {
      console.error('Error checking favorite:', err)
    }
  }

  const toggleFavorite = async () => {
    if (!data || !session?.access_token) return

    setFavLoading(true)
    try {
      if (isFavorite && favoriteId) {
        await removeFavorite(favoriteId, session.access_token)
        setIsFavorite(false)
        setFavoriteId(undefined)
      } else {
        const fav = await addFavorite(data.term, session.access_token)
        setIsFavorite(true)
        setFavoriteId(fav.id)
      }
    } catch (err: any) {
      console.error('Error toggling favorite:', err.message)
    } finally {
      setFavLoading(false)
    }
  }

  // Se non ci sono dati, mostra placeholder
  if (!data) {
    return (
      <div className="w-full max-w-5xl mx-auto mt-8">
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-gray-400">
            <svg
              className="mx-auto h-12 w-12 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Trend Chart Will Appear Here
            </h3>
            <p className="text-sm text-gray-500">
              Enter a topic and click "Analyze" to visualize trends
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Mostra i dati ricevuti dal backend
  return (
    <div className="w-full max-w-5xl mx-auto mt-8">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Trend: {data.term}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {data.geo ? `Geographic: ${data.geo}` : 'Worldwide'} • Last 30 days
                {data.cached && (
                  <span className="ml-2 text-blue-600">
                    (Cached data)
                  </span>
                )}
              </p>
            </div>
            {user && (
              <button
                onClick={toggleFavorite}
                disabled={favLoading}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite
                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                } disabled:opacity-50`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg
                  className="w-6 h-6"
                  fill={isFavorite ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            )}
          </div>
          {data.stats && (
            <div className="mt-3 grid grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-gray-600">Avg Score</div>
                <div className="text-lg font-bold text-blue-600">{data.stats.avg_score}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-xs text-gray-600">Max Score</div>
                <div className="text-lg font-bold text-green-600">{data.stats.max_score}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="text-xs text-gray-600">Min Score</div>
                <div className="text-lg font-bold text-orange-600">{data.stats.min_score}</div>
              </div>
              <div className={`rounded-lg p-3 ${data.stats.delta_7d >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="text-xs text-gray-600">7-Day Change</div>
                <div className={`text-lg font-bold ${data.stats.delta_7d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.stats.delta_7d >= 0 ? '+' : ''}{data.stats.delta_7d}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recharts Line Chart */}
        <div className="mt-6" style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart
              data={data.interest}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => {
                  const d = new Date(date)
                  return `${d.getMonth() + 1}/${d.getDate()}`
                }}
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '8px 12px'
                }}
                labelFormatter={(date) => {
                  return new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                }}
                formatter={(value: number) => [value, 'Interest Score']}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                type="monotone"
                dataKey="value"
                name="Interest Score"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
