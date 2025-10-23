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
  score: number
}

/**
 * Interfaccia per la risposta del backend
 */
export interface TrendResponse {
  term: string
  interest: TrendDataPoint[]
}

/**
 * Fetcha i dati di trend per una keyword dal backend
 *
 * @param term - La keyword da cercare (es. "React", "TypeScript")
 * @returns Promise con i dati del trend
 * @throws Error se la richiesta fallisce
 */
export async function fetchTrend(term: string): Promise<TrendResponse> {
  if (!term || term.trim() === '') {
    throw new Error('Il termine di ricerca non può essere vuoto')
  }

  try {
    const response = await fetch(`${API_URL}/api/trends?term=${encodeURIComponent(term)}`)

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
