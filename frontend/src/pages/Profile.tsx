import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { getFavorites, updateAlertSettings, getAlertLogs, type Favorite, type AlertLog } from '../lib/api'

export default function Profile() {
  const { user, session } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'alerts'>('profile')

  if (!user) {
    navigate('/login')
    return null
  }

  const createdDate = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Unknown'

  const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Never'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors">Account</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 transition-colors">Manage your profile and settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8 transition-colors">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'alerts'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Alerts
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors">Profile Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1 transition-colors">Email</label>
                <p className="text-base text-gray-900 dark:text-gray-100 transition-colors">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1 transition-colors">User ID</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded border border-gray-200 dark:border-gray-600 break-all transition-colors">
                  {user.id}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1 transition-colors">Account Created</label>
                <p className="text-base text-gray-900 dark:text-gray-100 transition-colors">{createdDate}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1 transition-colors">Last Sign In</label>
                <p className="text-base text-gray-900 dark:text-gray-100 transition-colors">{lastSignIn}</p>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <ChangePasswordCard />
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <AlertsTab />
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <SettingsTab />
      )}
    </div>
  )
}

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setLoading(true)

    try {
      // Import supabase client
      const { supabase } = await import('../lib/supabase')

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors">Change Password</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter new password"
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
            Confirm New Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Confirm new password"
          />
        </div>

        {message && (
          <div className={`p-3 rounded-lg transition-colors ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}

function AlertsTab() {
  const { session } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!session?.access_token) return

    try {
      setLoading(true)
      const [favs, logs] = await Promise.all([
        getFavorites(session.access_token),
        getAlertLogs(session.access_token, 20)
      ])
      setFavorites(favs)
      setAlertLogs(logs)
    } catch (error) {
      console.error('Error loading alerts data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAlert = async (favorite: Favorite, enabled: boolean) => {
    if (!session?.access_token) return

    try {
      await updateAlertSettings(
        favorite.id,
        {
          alert_enabled: enabled,
          alert_threshold: favorite.alert_threshold || 20,
          alert_frequency: favorite.alert_frequency || 'daily'
        },
        session.access_token
      )

      // Update local state
      setFavorites(prev =>
        prev.map(f => f.id === favorite.id ? { ...f, alert_enabled: enabled } : f)
      )
    } catch (error) {
      console.error('Error updating alert:', error)
    }
  }

  const handleUpdateThreshold = async (favorite: Favorite, threshold: number) => {
    if (!session?.access_token) return

    try {
      await updateAlertSettings(
        favorite.id,
        {
          alert_enabled: favorite.alert_enabled || false,
          alert_threshold: threshold,
          alert_frequency: favorite.alert_frequency || 'daily'
        },
        session.access_token
      )

      // Update local state
      setFavorites(prev =>
        prev.map(f => f.id === favorite.id ? { ...f, alert_threshold: threshold } : f)
      )
    } catch (error) {
      console.error('Error updating threshold:', error)
    }
  }

  const handleUpdateFrequency = async (favorite: Favorite, frequency: 'daily' | '6hours' | 'hourly') => {
    if (!session?.access_token) return

    try {
      await updateAlertSettings(
        favorite.id,
        {
          alert_enabled: favorite.alert_enabled || false,
          alert_threshold: favorite.alert_threshold || 20,
          alert_frequency: frequency
        },
        session.access_token
      )

      // Update local state
      setFavorites(prev =>
        prev.map(f => f.id === favorite.id ? { ...f, alert_frequency: frequency } : f)
      )
    } catch (error) {
      console.error('Error updating frequency:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">Loading alerts...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-colors">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔔</span>
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Trend Alerts</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Get notified when your favorite trends change significantly. Configure threshold and frequency for each trend.
            </p>
          </div>
        </div>
      </div>

      {/* Favorites with Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Favorites</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enable alerts for trends you want to monitor
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No favorites yet. Add some trends to your favorites to enable alerts!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{favorite.term}</h3>
                      <button
                        type="button"
                        onClick={() => handleToggleAlert(favorite, !favorite.alert_enabled)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          favorite.alert_enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            favorite.alert_enabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {favorite.alert_enabled && (
                      <div className="space-y-3 mt-4">
                        {/* Threshold Slider */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Alert Threshold: {favorite.alert_threshold || 20}%
                          </label>
                          <input
                            type="range"
                            min="5"
                            max="50"
                            step="5"
                            value={favorite.alert_threshold || 20}
                            onChange={(e) => handleUpdateThreshold(favorite, parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>5%</span>
                            <span>50%</span>
                          </div>
                        </div>

                        {/* Frequency Selector */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Check Frequency
                          </label>
                          <select
                            value={favorite.alert_frequency || 'daily'}
                            onChange={(e) => handleUpdateFrequency(favorite, e.target.value as 'daily' | '6hours' | 'hourly')}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="daily">Daily (8 AM)</option>
                            <option value="6hours">Every 6 hours</option>
                            <option value="hourly">Hourly</option>
                          </select>
                        </div>

                        {/* Last Check Info */}
                        {favorite.last_check_at && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                            Last checked: {new Date(favorite.last_check_at).toLocaleString()}
                            {favorite.last_check_score !== undefined && ` • Score: ${favorite.last_check_score}`}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="text-left">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Alert History</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {alertLogs.length} alerts received
            </p>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${showHistory ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showHistory && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            {alertLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No alerts sent yet
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {alertLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {log.alert_type === 'spike' ? '🚀' : log.alert_type === 'drop' ? '📉' : '🔔'}
                          </span>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">{log.term}</h3>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {log.old_score} → {log.new_score}
                          </span>
                          <span className={`font-medium ${
                            log.new_score > log.old_score
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {log.new_score > log.old_score ? '+' : ''}{(log.change_percent).toFixed(1)}%
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {new Date(log.sent_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {log.email_sent ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            Sent
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Not sent</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SettingsTab() {
  const { darkMode, setDarkMode } = useTheme()

  const [emailNotifications, setEmailNotifications] = useState(() => {
    return localStorage.getItem('emailNotifications') !== 'false'
  })

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled)
  }

  const handleEmailNotificationsToggle = (enabled: boolean) => {
    setEmailNotifications(enabled)
    localStorage.setItem('emailNotifications', enabled.toString())
  }

  return (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors">Appearance</h2>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors">Dark Mode</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">Enable dark mode for better viewing at night</p>
          </div>
          <button
            type="button"
            onClick={() => handleDarkModeToggle(!darkMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              darkMode ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors">Notifications</h2>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors">Email Notifications</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">Receive updates about new features and trends</p>
          </div>
          <button
            type="button"
            onClick={() => handleEmailNotificationsToggle(!emailNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              emailNotifications ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
