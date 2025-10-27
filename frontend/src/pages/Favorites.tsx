import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getFavorites, removeFavorite, type Favorite } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function Favorites() {
  const { user, session } = useAuth()
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }

    loadFavorites()
  }, [user, navigate])

  const loadFavorites = async () => {
    if (!session?.access_token) return

    try {
      setLoading(true)
      const data = await getFavorites(session.access_token)
      setFavorites(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id: string) => {
    if (!session?.access_token) return

    try {
      await removeFavorite(id, session.access_token)
      setFavorites(favorites.filter(f => f.id !== id))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSearch = (term: string) => {
    navigate(`/?search=${encodeURIComponent(term)}`)
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 transition-colors">Loading favorites...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors">My Favorites</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 transition-colors">
          Your saved trend searches
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 transition-colors">
          {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center dark:bg-gray-800 dark:border-gray-700 transition-colors">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors">No favorites yet</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors">
            Start by searching for trends and clicking the star icon to save them here.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden dark:bg-gray-800 dark:border-gray-700 transition-colors">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {favorites.map((favorite) => (
              <li
                key={favorite.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors"
              >
                <div className="flex-1">
                  <button
                    onClick={() => handleSearch(favorite.term)}
                    className="text-lg font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    {favorite.term}
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                    Saved on {new Date(favorite.saved_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(favorite.id)}
                  className="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 transition-colors"
                  title="Remove from favorites"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
