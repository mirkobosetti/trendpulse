import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { TrendResponse } from '../lib/api'

interface TrendChartProps {
  data: TrendResponse[]
  dateRange?: number
}

const COLORS = ['#3b82f6', '#a855f7', '#10b981', '#f97316', '#ec4899']

function formatDateRange(days: number): string {
  if (days <= 7) return 'Last 7 days'
  if (days <= 30) return 'Last 30 days'
  if (days <= 90) return 'Last 90 days'
  if (days <= 180) return 'Last 6 months'
  return 'Last year'
}

export default function TrendChart({ data, dateRange = 30 }: TrendChartProps) {

  const exportCSV = () => {
    if (!data || data.length === 0) return

    const allDates = Array.from(new Set(data.flatMap(d => d.interest.map(p => p.date)))).sort()
    const headers = 'Date,' + data.map(d => d.term).join(',') + '\n'

    const rows = allDates.map(date => {
      const values = data.map(trend => {
        const point = trend.interest.find(p => p.date === date)
        return point ? point.value : ''
      })
      return `${date},${values.join(',')}`
    }).join('\n')

    const csv = headers + rows
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `trends_comparison_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportJSON = () => {
    if (!data || data.length === 0) return

    const exportData = {
      trends: data.map(d => ({
        term: d.term,
        stats: d.stats,
        data: d.interest
      })),
      exported_at: new Date().toISOString()
    }

    const json = JSON.stringify(exportData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `trends_comparison_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full mx-auto mt-8">
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-gray-400">
            <svg
              className="mx-auto h-12 w-12 mb-4"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start Comparing Trends
            </h3>
            <p className="text-sm text-gray-500">
              Add topics above to visualize and compare their trends
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Merge all data points by date
  const allDates = Array.from(new Set(data.flatMap(d => d.interest.map(p => p.date)))).sort()
  const mergedData = allDates.map(date => {
    const point: Record<string, string | number | null> = { date }
    data.forEach(trend => {
      const dataPoint = trend.interest.find(p => p.date === date)
      point[trend.term] = dataPoint?.value || null
    })
    return point
  })

  return (
    <div className="w-full mx-auto mt-8 space-y-6">
      {/* Stats Grid - only show if multiple trends */}
      {data.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {data.map((trend, index) => (
            <div key={trend.term} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <h4 className="font-semibold text-gray-900 truncate">{trend.term}</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-gray-500">Avg</div>
                  <div className="font-bold text-gray-900">{trend.stats.avg_score}</div>
                </div>
                <div>
                  <div className="text-gray-500">Max</div>
                  <div className="font-bold text-gray-900">{trend.stats.max_score}</div>
                </div>
                <div>
                  <div className="text-gray-500">Min</div>
                  <div className="font-bold text-gray-900">{trend.stats.min_score}</div>
                </div>
                <div>
                  <div className="text-gray-500">7d</div>
                  <div className={`font-bold ${trend.stats.delta_7d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.stats.delta_7d >= 0 ? '+' : ''}{trend.stats.delta_7d}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">
              {data.length === 1 ? `Trend: ${data[0].term}` : 'Trends Comparison'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {formatDateRange(dateRange)}
              {data.length > 1 && (
                <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  Weighted comparison - values show relative popularity
                </span>
              )}
            </p>
            {data.length === 1 && (
              <div className="mt-4 flex gap-6">
                <div>
                  <div className="text-xs text-gray-500">Average</div>
                  <div className="text-lg font-bold text-blue-600">{data[0].stats.avg_score}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Maximum</div>
                  <div className="text-lg font-bold text-green-600">{data[0].stats.max_score}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Minimum</div>
                  <div className="text-lg font-bold text-orange-600">{data[0].stats.min_score}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">7-Day Change</div>
                  <div className={`text-lg font-bold ${data[0].stats.delta_7d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data[0].stats.delta_7d >= 0 ? '+' : ''}{data[0].stats.delta_7d}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={exportJSON}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Export JSON
            </button>
          </div>
        </div>

        <div style={{ width: '100%', height: 450 }}>
          <ResponsiveContainer>
            <LineChart
              data={mergedData}
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
                label={{ value: 'Interest Score', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelFormatter={(date) => {
                  return new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              {data.map((trend, index) => (
                <Line
                  key={trend.term}
                  type="monotone"
                  dataKey={trend.term}
                  name={trend.term}
                  stroke={COLORS[index]}
                  strokeWidth={3}
                  dot={{ fill: COLORS[index], r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
