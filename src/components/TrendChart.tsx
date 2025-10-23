export default function TrendChart() {
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
