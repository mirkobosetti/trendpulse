/**
 * Trends Routes
 *
 * Gestisce gli endpoint per l'analisi dei trend.
 * Al momento restituisce dati mock, in futuro integrerà API esterne.
 */

import express from 'express'
// import { supabase } from '../services/supabaseClient.js'

const router = express.Router()

/**
 * GET /api/trends?term=keyword
 *
 * Restituisce dati di trend per una keyword specifica.
 * Esempio: GET /api/trends?term=React
 *
 * Query params:
 *   - term: la keyword da analizzare
 *
 * Response:
 *   {
 *     "term": "React",
 *     "interest": [
 *       { "date": "2025-10-01", "score": 78 },
 *       { "date": "2025-10-02", "score": 82 }
 *     ]
 *   }
 */
router.get('/', (req, res) => {
  const { term } = req.query

  // Validazione: verifica che il parametro 'term' sia presente
  if (!term) {
    return res.status(400).json({
      error: 'Missing required parameter: term',
      example: '/api/trends?term=React'
    })
  }

  // Dati mock per testing
  // TODO: sostituire con chiamate a Google Trends API o Supabase
  const mockData = {
    term: term,
    interest: generateMockTrendData()
  }

  res.json(mockData)
})

/**
 * Genera dati mock per i trend degli ultimi 30 giorni
 * Simula punteggi di interesse tra 50 e 100
 */
function generateMockTrendData() {
  const data = []
  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    data.push({
      date: date.toISOString().split('T')[0], // formato YYYY-MM-DD
      score: Math.floor(Math.random() * 50) + 50 // score tra 50-100
    })
  }

  return data
}

export default router
