/**
 * Favorites Routes
 *
 * Handles user favorite searches.
 * Requires authentication.
 */

import express from 'express'
import { supabase } from '../services/supabaseClient.js'

const router = express.Router()

/**
 * Middleware to verify user authentication
 * Expects Authorization header with Bearer token
 */
async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Auth error:', error)
    res.status(401).json({ error: 'Authentication failed' })
  }
}

/**
 * GET /api/favorites
 *
 * Get all favorites for the authenticated user
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', req.user.id)
      .order('saved_at', { ascending: false })

    if (error) throw error

    res.json({ favorites: data })
  } catch (error) {
    console.error('Error fetching favorites:', error.message)
    res.status(500).json({ error: 'Failed to fetch favorites' })
  }
})

/**
 * POST /api/favorites
 *
 * Add a term to favorites
 * Body: { term: string }
 */
router.post('/', authenticateUser, async (req, res) => {
  const { term } = req.body

  if (!term) {
    return res.status(400).json({ error: 'Missing required field: term' })
  }

  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: req.user.id,
        term: term
      })
      .select()
      .single()

    if (error) {
      // Handle unique constraint violation (already favorited)
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Term already in favorites' })
      }
      throw error
    }

    res.status(201).json({ favorite: data })
  } catch (error) {
    console.error('Error adding favorite:', error.message)
    res.status(500).json({ error: 'Failed to add favorite' })
  }
})

/**
 * DELETE /api/favorites/:id
 *
 * Remove a favorite by ID
 */
router.delete('/:id', authenticateUser, async (req, res) => {
  const { id } = req.params

  try {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id) // Ensure user owns this favorite

    if (error) throw error

    res.json({ message: 'Favorite deleted successfully' })
  } catch (error) {
    console.error('Error deleting favorite:', error.message)
    res.status(500).json({ error: 'Failed to delete favorite' })
  }
})

/**
 * DELETE /api/favorites/term/:term
 *
 * Remove a favorite by term name
 */
router.delete('/term/:term', authenticateUser, async (req, res) => {
  const { term } = req.params

  try {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('term', term)
      .eq('user_id', req.user.id)

    if (error) throw error

    res.json({ message: 'Favorite deleted successfully' })
  } catch (error) {
    console.error('Error deleting favorite:', error.message)
    res.status(500).json({ error: 'Failed to delete favorite' })
  }
})

/**
 * GET /api/favorites/check/:term
 *
 * Check if a term is favorited by the user
 */
router.get('/check/:term', authenticateUser, async (req, res) => {
  const { term } = req.params

  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('term', term)
      .maybeSingle()

    if (error) throw error

    res.json({ isFavorite: !!data, favoriteId: data?.id })
  } catch (error) {
    console.error('Error checking favorite:', error.message)
    res.status(500).json({ error: 'Failed to check favorite' })
  }
})

/**
 * PATCH /api/favorites/:id/alerts
 *
 * Update alert settings for a favorite
 * Body: { alert_enabled: boolean, alert_threshold?: number, alert_frequency?: string }
 */
router.patch('/:id/alerts', authenticateUser, async (req, res) => {
  const { id } = req.params
  const { alert_enabled, alert_threshold, alert_frequency } = req.body

  if (alert_enabled === undefined) {
    return res.status(400).json({ error: 'Missing required field: alert_enabled' })
  }

  try {
    const updateData = { alert_enabled }

    if (alert_threshold !== undefined) {
      updateData.alert_threshold = alert_threshold
    }

    if (alert_frequency !== undefined) {
      updateData.alert_frequency = alert_frequency
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id) // Ensure user owns this favorite
      .select()
      .single()

    if (error) throw error

    res.json({ favorite: data })
  } catch (error) {
    console.error('Error updating alert settings:', error.message)
    res.status(500).json({ error: 'Failed to update alert settings' })
  }
})

/**
 * GET /api/favorites/alerts/logs
 *
 * Get alert logs for the authenticated user
 */
router.get('/alerts/logs', authenticateUser, async (req, res) => {
  const limit = parseInt(req.query.limit) || 20

  try {
    const { data, error } = await supabase
      .from('alert_logs')
      .select('*')
      .eq('user_id', req.user.id)
      .order('sent_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    res.json({ logs: data })
  } catch (error) {
    console.error('Error fetching alert logs:', error.message)
    res.status(500).json({ error: 'Failed to fetch alert logs' })
  }
})

export default router
