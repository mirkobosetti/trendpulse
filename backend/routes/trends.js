/**
 * Trends Routes
 *
 * Handles trend analysis endpoints with Google Trends API integration.
 * Includes intelligent caching and search logging.
 */

import express from 'express'
import { supabase } from '../services/supabaseClient.js'
import { fetchInterestOverTime, fetchComparisonData, calculateTrendStats } from '../services/googleTrendsService.js'

const router = express.Router()

// Cache duration in hours (24 hours = 1 day)
const CACHE_DURATION_HOURS = 24

/**
 * GET /api/trends?term=keyword&geo=US
 *
 * Returns trend data for a specific keyword from Google Trends.
 * Uses cached data if available and recent, otherwise fetches fresh data.
 *
 * Query params:
 *   - term: the keyword to analyze (required)
 *   - geo: geographic location code (optional, default: '' for worldwide)
 *
 * Response:
 *   {
 *     "term": "React",
 *     "geo": "",
 *     "interest": [
 *       { "date": "2025-10-01", "value": 78 },
 *       { "date": "2025-10-02", "value": 82 }
 *     ],
 *     "stats": {
 *       "avg_score": 75,
 *       "max_score": 95,
 *       "min_score": 58,
 *       "delta_7d": 5
 *     },
 *     "cached": false
 *   }
 */
router.get('/', async (req, res) => {
  const { term, geo = '' } = req.query

  // Validation
  if (!term) {
    return res.status(400).json({
      error: 'Missing required parameter: term',
      example: '/api/trends?term=React&geo=US'
    })
  }

  try {
    // 1️⃣ Log the search (analytics) - extract user_id from token if present
    let userId = null
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user } } = await supabase.auth.getUser(token)
        if (user) userId = user.id
      } catch (e) {
        // Ignore auth errors for logging
      }
    }
    await logSearch(term, geo, userId)

    // 2️⃣ Check cache first
    const cachedSnapshot = await getCachedSnapshot(term, geo)

    if (cachedSnapshot) {
      console.log(`✅ Cache HIT for "${term}" (${geo || 'worldwide'})`)
      return res.json({
        term,
        geo,
        interest: cachedSnapshot.data,
        stats: {
          avg_score: cachedSnapshot.avg_score,
          max_score: cachedSnapshot.max_score,
          min_score: cachedSnapshot.min_score,
          delta_7d: cachedSnapshot.delta_7d
        },
        cached: true,
        cached_at: cachedSnapshot.captured_at
      })
    }

    // 3️⃣ Cache MISS - fetch from Google Trends
    console.log(`❌ Cache MISS for "${term}" (${geo || 'worldwide'}) - fetching from Google Trends...`)
    const timelineData = await fetchInterestOverTime(term, geo, 30)
    const stats = calculateTrendStats(timelineData)

    // 4️⃣ Save to cache
    await saveSnapshot(term, geo, timelineData, stats)

    // 5️⃣ Return fresh data
    res.json({
      term,
      geo,
      interest: timelineData,
      stats,
      cached: false
    })

  } catch (error) {
    console.error('Error fetching trend data:', error.message)
    res.status(500).json({
      error: 'Failed to fetch trend data',
      message: error.message
    })
  }
})

/**
 * POST /api/trends/compare
 *
 * Compare multiple terms with weighted/relative values.
 * When comparing terms, Google Trends returns values relative to each other,
 * showing actual popularity differences (e.g., React 85, Angular 28).
 *
 * Body:
 *   {
 *     "terms": ["React", "Vue", "Angular"],
 *     "geo": "" (optional)
 *   }
 *
 * Response:
 *   {
 *     "comparison": [
 *       {
 *         "term": "React",
 *         "geo": "",
 *         "interest": [...],
 *         "stats": {...}
 *       },
 *       ...
 *     ]
 *   }
 */
router.post('/compare', async (req, res) => {
  const { terms, geo = '' } = req.body

  // Validation
  if (!terms || !Array.isArray(terms) || terms.length === 0) {
    return res.status(400).json({
      error: 'Missing or invalid "terms" array in request body',
      example: { terms: ['React', 'Vue', 'Angular'], geo: '' }
    })
  }

  if (terms.length > 5) {
    return res.status(400).json({
      error: 'Maximum 5 terms allowed for comparison'
    })
  }

  try {
    // Log searches for authenticated user
    let userId = null
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user } } = await supabase.auth.getUser(token)
        if (user) userId = user.id
      } catch (e) {
        // Ignore auth errors
      }
    }

    // Log all search terms
    await Promise.all(terms.map(term => logSearch(term, geo, userId)))

    // Fetch comparison data (weighted/relative values)
    const comparisonData = await fetchComparisonData(terms, geo, 30)

    // Transform to response format
    const comparison = terms.map(term => {
      const interest = comparisonData[term]
      const stats = calculateTrendStats(interest)

      return {
        term,
        geo,
        interest,
        stats,
        cached: false
      }
    })

    res.json({ comparison })

  } catch (error) {
    console.error('Error fetching comparison data:', error.message)
    res.status(500).json({
      error: 'Failed to fetch comparison data',
      message: error.message
    })
  }
})

/**
 * GET /api/trends/top-searches?limit=10
 *
 * Returns the most searched terms with their search counts.
 *
 * Query params:
 *   - limit: number of results (default: 10, max: 50)
 *
 * Response:
 *   {
 *     "topSearches": [
 *       { "term": "React", "count": 145 },
 *       { "term": "TypeScript", "count": 98 }
 *     ]
 *   }
 */
router.get('/top-searches', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50)

  try {
    const { data, error } = await supabase
      .from('search_logs')
      .select('term')
      .order('searched_at', { ascending: false })
      .limit(1000) // get recent searches

    if (error) throw error

    // Count occurrences
    const termCounts = {}
    data.forEach(row => {
      termCounts[row.term] = (termCounts[row.term] || 0) + 1
    })

    // Sort by count and get top N
    const topSearches = Object.entries(termCounts)
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    res.json({ topSearches })
  } catch (error) {
    console.error('Error fetching top searches:', error.message)
    res.status(500).json({
      error: 'Failed to fetch top searches',
      message: error.message
    })
  }
})

/**
 * GET /api/trends/recent-searches?limit=10
 *
 * Returns recent unique searches for the authenticated user.
 *
 * Headers:
 *   - Authorization: Bearer <token> (required)
 *
 * Query params:
 *   - limit: number of results (default: 10, max: 20)
 *
 * Response:
 *   {
 *     "recentSearches": [
 *       { "term": "React", "searched_at": "2025-10-26T10:30:00Z" },
 *       { "term": "Vue", "searched_at": "2025-10-26T09:15:00Z" }
 *     ]
 *   }
 */
router.get('/recent-searches', async (req, res) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.replace('Bearer ', '')
  const limit = Math.min(parseInt(req.query.limit) || 10, 20)

  try {
    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Get recent searches for this user
    const { data, error } = await supabase
      .from('search_logs')
      .select('term, searched_at')
      .eq('user_id', user.id)
      .order('searched_at', { ascending: false })
      .limit(100) // get more to filter duplicates

    if (error) throw error

    // Remove duplicates, keep most recent
    const uniqueSearches = []
    const seenTerms = new Set()

    for (const search of data) {
      if (!seenTerms.has(search.term)) {
        seenTerms.add(search.term)
        uniqueSearches.push(search)
      }
      if (uniqueSearches.length >= limit) break
    }

    res.json({ recentSearches: uniqueSearches })
  } catch (error) {
    console.error('Error fetching recent searches:', error.message)
    res.status(500).json({
      error: 'Failed to fetch recent searches',
      message: error.message
    })
  }
})

/**
 * Helper: Log a search to the database
 */
async function logSearch(term, geo, userId) {
  try {
    const { error } = await supabase
      .from('search_logs')
      .insert({
        term,
        geo,
        user_id: userId
      })

    if (error) {
      console.error('Error logging search:', error.message)
    }
  } catch (error) {
    console.error('Error logging search:', error.message)
  }
}

/**
 * Helper: Get cached snapshot if available and recent
 */
async function getCachedSnapshot(term, geo) {
  try {
    const cacheThreshold = new Date()
    cacheThreshold.setHours(cacheThreshold.getHours() - CACHE_DURATION_HOURS)

    const { data, error } = await supabase
      .from('trend_snapshots')
      .select('*')
      .eq('term', term)
      .eq('geo', geo)
      .gte('captured_at', cacheThreshold.toISOString())
      .order('captured_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error fetching cache:', error.message)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching cache:', error.message)
    return null
  }
}

/**
 * Helper: Save trend snapshot to cache
 */
async function saveSnapshot(term, geo, timelineData, stats) {
  try {
    const { error } = await supabase
      .from('trend_snapshots')
      .insert({
        term,
        geo,
        avg_score: stats.avg_score,
        max_score: stats.max_score,
        min_score: stats.min_score,
        delta_7d: stats.delta_7d,
        data: timelineData
      })

    if (error) {
      console.error('Error saving snapshot:', error.message)
    }
  } catch (error) {
    console.error('Error saving snapshot:', error.message)
  }
}

export default router
