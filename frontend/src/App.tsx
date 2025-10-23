import { useState } from 'react'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import TrendChart from './components/TrendChart'
import { fetchTrend, type TrendResponse } from './lib/api'

function App() {
  const [trendData, setTrendData] = useState<TrendResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (term: string) => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchTrend(term)
      setTrendData(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto'
      setError(errorMessage)
      console.error('Errore nel recupero dei dati:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Analyze Online Trends
          </h2>
          <p className="text-lg text-gray-600">
            Discover what's trending and track topics over time
          </p>
        </div>

        <SearchBar onSearch={handleSearch} loading={loading} />

        {/* Messaggio di errore */}
        {error && (
          <div className="max-w-3xl mx-auto mt-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Errore durante il caricamento
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                    <p className="mt-1 text-xs">
                      Assicurati che il backend sia avviato su http://localhost:5001
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loader */}
        {loading && (
          <div className="w-full max-w-5xl mx-auto mt-8 flex justify-center">
            <div className="flex items-center space-x-2 text-blue-600">
              <svg
                className="animate-spin h-8 w-8"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-lg font-medium">Caricamento dati...</span>
            </div>
          </div>
        )}

        {/* Chart - mostrato solo se non è in loading */}
        {!loading && <TrendChart data={trendData} />}
      </main>
    </div>
  )
}

export default App
