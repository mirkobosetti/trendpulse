/**
 * Supabase Client Configuration
 *
 * Configura e esporta un'istanza del client Supabase
 * per interagire con il database e i servizi auth.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carica variabili ambiente dal file .env
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Verifica che le variabili ambiente siano configurate
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('⚠️  Mancano le variabili ambiente SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  console.error('   Copia .env.example in .env e configura le credenziali')
  process.exit(1)
}

// Crea e esporta il client Supabase
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

console.log('✅ Supabase client configurato correttamente')
