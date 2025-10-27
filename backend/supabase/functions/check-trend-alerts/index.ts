/**
 * Supabase Edge Function: Check Trend Alerts
 *
 * This function runs periodically (via pg_cron) to:
 * 1. Fetch all user favorites with alert_enabled = true
 * 2. Check current Google Trends score for each
 * 3. Compare with last_check_score
 * 4. Send email if change exceeds threshold
 * 5. Update last_check_score and log alert
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') // Optional: for email

interface Favorite {
  id: string
  user_id: string
  term: string
  geo: string
  alert_threshold: number
  last_check_score: number | null
  user_email?: string
}

interface TrendData {
  interest: Array<{ date: string; value: number }>
}

serve(async (req) => {
  try {
    console.log('🔔 Starting trend alerts check...')

    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    // 1. Fetch all favorites with alerts enabled
    const { data: favorites, error: favError } = await supabase
      .from('user_favorites')
      .select(`
        id,
        user_id,
        term,
        geo,
        alert_threshold,
        last_check_score
      `)
      .eq('alert_enabled', true)

    if (favError) {
      console.error('Error fetching favorites:', favError)
      return new Response(JSON.stringify({ error: favError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!favorites || favorites.length === 0) {
      console.log('✅ No favorites with alerts enabled')
      return new Response(
        JSON.stringify({ message: 'No alerts to check', checked: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📊 Checking ${favorites.length} favorites...`)

    let alertsSent = 0
    const results = []

    // 2. Check each favorite
    for (const fav of favorites as Favorite[]) {
      try {
        // Fetch current trend data from your backend API
        const trendResponse = await fetch(
          `http://localhost:5001/api/trends?term=${encodeURIComponent(fav.term)}&days=7&geo=${fav.geo || ''}`
        )

        if (!trendResponse.ok) {
          console.error(`Failed to fetch trend for "${fav.term}"`)
          continue
        }

        const trendData: TrendData[] = await trendResponse.json()

        if (!trendData || trendData.length === 0) {
          console.error(`No data for "${fav.term}"`)
          continue
        }

        // Calculate current score (average of last 7 days)
        const currentScore = Math.round(
          trendData[0].interest.reduce((sum, point) => sum + point.value, 0) /
            trendData[0].interest.length
        )

        // 3. Compare with last check
        if (fav.last_check_score !== null) {
          const changePercent = Math.abs(
            ((currentScore - fav.last_check_score) / fav.last_check_score) * 100
          )

          // 4. Check if threshold exceeded
          if (changePercent >= fav.alert_threshold) {
            console.log(
              `🚨 Alert triggered for "${fav.term}": ${fav.last_check_score} → ${currentScore} (${changePercent.toFixed(1)}%)`
            )

            // Determine alert type
            const alertType =
              currentScore > fav.last_check_score
                ? changePercent > 50
                  ? 'spike'
                  : 'threshold'
                : 'drop'

            // Get user email
            const { data: userData } = await supabase.auth.admin.getUserById(
              fav.user_id
            )

            // 5. Send email (if Resend configured)
            if (RESEND_API_KEY && userData?.user?.email) {
              await sendAlertEmail(
                userData.user.email,
                fav.term,
                fav.last_check_score,
                currentScore,
                changePercent,
                alertType
              )
            }

            // 6. Log alert
            await supabase.from('alert_logs').insert({
              user_id: fav.user_id,
              favorite_id: fav.id,
              term: fav.term,
              geo: fav.geo,
              old_score: fav.last_check_score,
              new_score: currentScore,
              change_percent: changePercent,
              alert_type: alertType,
              email_sent: !!RESEND_API_KEY,
            })

            alertsSent++
          }
        }

        // 7. Update last_check_score and timestamp
        await supabase
          .from('user_favorites')
          .update({
            last_check_score: currentScore,
            last_check_at: new Date().toISOString(),
          })
          .eq('id', fav.id)

        results.push({
          term: fav.term,
          currentScore,
          previousScore: fav.last_check_score,
          alertSent: fav.last_check_score !== null &&
            Math.abs(((currentScore - fav.last_check_score) / fav.last_check_score) * 100) >= fav.alert_threshold
        })
      } catch (error) {
        console.error(`Error processing "${fav.term}":`, error)
      }
    }

    console.log(`✅ Checked ${favorites.length} favorites, sent ${alertsSent} alerts`)

    return new Response(
      JSON.stringify({
        success: true,
        checked: favorites.length,
        alertsSent,
        results,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

/**
 * Send alert email via Resend
 */
async function sendAlertEmail(
  to: string,
  term: string,
  oldScore: number,
  newScore: number,
  changePercent: number,
  alertType: string
) {
  if (!Deno.env.get('RESEND_API_KEY')) {
    console.log('⚠️  RESEND_API_KEY not configured, skipping email')
    return
  }

  const direction = newScore > oldScore ? '📈 increased' : '📉 decreased'
  const emoji = alertType === 'spike' ? '🚀' : alertType === 'drop' ? '⚠️' : '🔔'

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .score-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .score { font-size: 48px; font-weight: bold; color: #667eea; }
          .change { font-size: 24px; margin-top: 10px; }
          .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${emoji} Trend Alert</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0;">Your saved trend has changed significantly!</p>
          </div>
          <div class="content">
            <h2 style="margin-top: 0;">"${term}"</h2>
            <p>This trend has ${direction} by <strong>${changePercent.toFixed(1)}%</strong></p>

            <div class="score-box">
              <div style="color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Score Change</div>
              <div class="score">${oldScore} → ${newScore}</div>
              <div class="change" style="color: ${newScore > oldScore ? '#10b981' : '#ef4444'};">
                ${newScore > oldScore ? '+' : ''}${newScore - oldScore} points
              </div>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              This alert was triggered because the trend changed by more than ${Math.round(changePercent)}%, exceeding your threshold.
            </p>

            <div style="text-align: center;">
              <a href="http://localhost:5173/?search=${encodeURIComponent(term)}" class="btn">
                View on TrendPulse
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              You're receiving this because you enabled alerts for this trend.<br>
              Manage your alerts in your <a href="http://localhost:5173/profile">Profile Settings</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      },
      body: JSON.stringify({
        from: 'TrendPulse <alerts@trendpulse.dev>',
        to: [to],
        subject: `${emoji} Trend Alert: "${term}" ${direction}`,
        html: htmlContent,
      }),
    })

    if (!response.ok) {
      console.error('Failed to send email:', await response.text())
    } else {
      console.log(`✉️  Email sent to ${to}`)
    }
  } catch (error) {
    console.error('Error sending email:', error)
  }
}
