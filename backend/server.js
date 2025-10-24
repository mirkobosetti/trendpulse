/**
 * TrendPulse Backend Server
 *
 * Server Express.js per gestire le API di TrendPulse.
 * Fornisce endpoint per l'analisi dei trend e comunicazione con Supabase.
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import trendsRouter from './routes/trends.js'

// Carica variabili ambiente
dotenv.config()

// Inizializza Express
const app = express()
const PORT = process.env.PORT || 5001

/**
 * MIDDLEWARE
 */

// CORS: permetti richieste dal frontend in sviluppo
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Vite dev server
  credentials: true
}))

// Parser JSON per request body
app.use(express.json())

// Log delle richieste in arrivo
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

/**
 * ROUTES
 */

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TrendPulse API - Backend attivo',
    version: '1.0.0',
    endpoints: {
      trends: '/api/trends?term=keyword'
    }
  })
})

// Mount trends router
app.use('/api/trends', trendsRouter)

/**
 * ERROR HANDLING
 */

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint non trovato',
    path: req.path
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Errore server:', err)
  res.status(500).json({
    error: 'Errore interno del server',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

/**
 * START SERVER
 */

app.listen(PORT, () => {
  console.log('\n🚀 Backend running on port', PORT)
  console.log(`   http://localhost:${PORT}`)
  console.log(`   http://localhost:${PORT}/api/trends?term=React\n`)
})
