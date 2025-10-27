/**
 * API Client per TrendPulse Backend
 *
 * Gestisce tutte le chiamate al backend Express.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

/**
 * Interfaccia per i dati di interesse di un trend
 */
export interface TrendDataPoint {
  date: string
  value: number  // changed from 'score' to match Google Trends API
}

/**
 * Statistiche aggregate per un trend
 */
export interface TrendStats {
  avg_score: number
  max_score: number
  min_score: number
  delta_7d: number
}

/**
 * Interfaccia per la risposta del backend
 */
export interface TrendResponse {
  term: string
  geo: string
  interest: TrendDataPoint[]
  stats: TrendStats
  cached: boolean
  cached_at?: string
}

/**
 * Fetcha i dati di trend per una keyword dal backend
 *
 * @param term - La keyword da cercare (es. "React", "TypeScript")
 * @param token - Optional auth token to log search with user_id
 * @param days - Number of days for trend data (default: 30)
 * @param geo - Geographic location code (default: '' for worldwide)
 * @returns Promise con i dati del trend
 * @throws Error se la richiesta fallisce
 */
export async function fetchTrend(term: string, token?: string, days: number = 30, geo: string = ''): Promise<TrendResponse> {
  if (!term || term.trim() === '') {
    throw new Error('Il termine di ricerca non può essere vuoto')
  }

  try {
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}/api/trends?term=${encodeURIComponent(term)}&days=${days}&geo=${geo}`, {
      headers
    })

    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status} ${response.statusText}`)
    }

    const data: TrendResponse = await response.json()
    return data
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Errore nel recupero dei dati: ${error.message}`)
    }
    throw new Error('Errore sconosciuto nel recupero dei dati')
  }
}

/**
 * Confronta più termini con valori pesati/relativi
 * Usa una singola chiamata API per ottenere dati comparativi reali
 *
 * @param terms - Array di termini da confrontare (max 5)
 * @param token - Optional auth token to log searches with user_id
 * @param days - Number of days for trend data (default: 30)
 * @param geo - Geographic location code (default: '' for worldwide)
 * @returns Promise con array di TrendResponse pesati
 */
export async function fetchComparison(terms: string[], token?: string, days: number = 30, geo: string = ''): Promise<TrendResponse[]> {
  if (!terms || terms.length === 0) {
    throw new Error('Almeno un termine è richiesto')
  }

  if (terms.length > 5) {
    throw new Error('Massimo 5 termini per confronto')
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}/api/trends/compare`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ terms, geo, days })
    })

    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.comparison
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Errore nel confronto: ${error.message}`)
    }
    throw new Error('Errore sconosciuto nel confronto')
  }
}

/**
 * Health check del backend
 *
 * @returns Promise<boolean> true se il backend è raggiungibile
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/`)
    return response.ok
  } catch {
    return false
  }
}

/**
 * Favorites API
 */

export interface Favorite {
  id: string
  user_id: string
  term: string
  saved_at: string
  alert_enabled?: boolean
  alert_threshold?: number
  alert_frequency?: 'daily' | '6hours' | 'hourly'
  last_check_score?: number
  last_check_at?: string
  geo?: string
}

export async function getFavorites(token: string): Promise<Favorite[]> {
  const response = await fetch(`${API_URL}/api/favorites`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch favorites')
  }

  const data = await response.json()
  return data.favorites
}

export async function addFavorite(term: string, token: string): Promise<Favorite> {
  const response = await fetch(`${API_URL}/api/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ term })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to add favorite')
  }

  const data = await response.json()
  return data.favorite
}

export async function removeFavorite(id: string, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/favorites/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to remove favorite')
  }
}

export async function checkIsFavorite(term: string, token: string): Promise<{ isFavorite: boolean; favoriteId?: string }> {
  const response = await fetch(`${API_URL}/api/favorites/check/${encodeURIComponent(term)}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to check favorite')
  }

  return await response.json()
}

/**
 * Top Searches API
 */

export interface TopSearch {
  term: string
  count: number
}

export async function getTopSearches(limit: number = 10): Promise<TopSearch[]> {
  const response = await fetch(`${API_URL}/api/trends/top-searches?limit=${limit}`)

  if (!response.ok) {
    throw new Error('Failed to fetch top searches')
  }

  const data = await response.json()
  return data.topSearches
}

/**
 * Recent Searches API
 */

export interface RecentSearch {
  term: string
  searched_at: string
}

export async function getRecentSearches(token: string, limit: number = 10): Promise<RecentSearch[]> {
  const response = await fetch(`${API_URL}/api/trends/recent-searches?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch recent searches')
  }

  const data = await response.json()
  return data.recentSearches
}

/**
 * Alerts API
 */

export interface AlertLog {
  id: string
  user_id: string
  favorite_id: string
  term: string
  geo: string
  old_score: number
  new_score: number
  change_percent: number
  alert_type: 'threshold' | 'spike' | 'drop'
  email_sent: boolean
  sent_at: string
}

export async function updateAlertSettings(
  favoriteId: string,
  settings: {
    alert_enabled: boolean
    alert_threshold?: number
    alert_frequency?: 'daily' | '6hours' | 'hourly'
  },
  token: string
): Promise<void> {
  const response = await fetch(`${API_URL}/api/favorites/${favoriteId}/alerts`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(settings)
  })

  if (!response.ok) {
    throw new Error('Failed to update alert settings')
  }
}

export async function getAlertLogs(token: string, limit: number = 20): Promise<AlertLog[]> {
  const response = await fetch(`${API_URL}/api/favorites/alerts/logs?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch alert logs')
  }

  const data = await response.json()
  return data.logs
}
