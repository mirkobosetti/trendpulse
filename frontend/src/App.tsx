import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import TrendChart from './components/TrendChart'

function App() {
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

        <SearchBar />
        <TrendChart />
      </main>
    </div>
  )
}

export default App
