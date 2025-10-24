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

export default router
