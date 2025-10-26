export default function LoadingSkeleton() {
  return (
    <div className="w-full mx-auto mt-8 space-y-6 animate-pulse">
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <div className="h-4 bg-gray-300 rounded w-24" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j}>
                  <div className="h-3 bg-gray-200 rounded w-12 mb-1" />
                  <div className="h-4 bg-gray-300 rounded w-8" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-6 bg-gray-300 rounded w-40 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-gray-200 rounded-md" />
            <div className="h-9 w-24 bg-gray-200 rounded-md" />
          </div>
        </div>

        <div className="h-[450px] bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <p className="text-sm text-gray-500 font-medium">Loading trends data...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
