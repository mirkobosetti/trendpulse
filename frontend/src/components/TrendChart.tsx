import type { TrendResponse } from '../lib/api'

interface TrendChartProps {
  data: TrendResponse | null
}

export default function TrendChart({ data }: TrendChartProps) {
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
          <h3 className="text-2xl font-bold text-gray-900">
            Trend: {data.term}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {data.geo ? `Geographic: ${data.geo}` : 'Worldwide'} • Last 30 days
            {data.cached && (
              <span className="ml-2 text-blue-600">
                (Cached data from {new Date(data.cached_at || '').toLocaleString()})
              </span>
            )}
          </p>
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

        {/* Tabella con i dati - Placeholder prima di implementare Recharts */}
        <div className="overflow-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interest Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.interest.map((point, index) => {
                const prevValue = index > 0 ? data.interest[index - 1].value : point.value
                const diff = point.value - prevValue

                return (
                  <tr key={point.date} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(point.date).toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${point.value}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {point.value}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {index === 0 ? (
                        <span className="text-gray-400">-</span>
                      ) : diff > 0 ? (
                        <span className="text-green-600 font-medium">↑ +{diff}</span>
                      ) : diff < 0 ? (
                        <span className="text-red-600 font-medium">↓ {diff}</span>
                      ) : (
                        <span className="text-gray-400">→ 0</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">
          📊 Grafico interattivo con Recharts in arrivo...
        </div>
      </div>
    </div>
  )
}
