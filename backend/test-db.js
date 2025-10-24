// Quick test script to check if tables exist using raw SQL
import { supabase } from './services/supabaseClient.js'

async function testTables() {
  console.log('Testing direct SQL queries...\n')

  // Test if search_logs exists
  try {
    const { data, error } = await supabase
      .rpc('test', { query: 'SELECT * FROM public.search_logs LIMIT 1' })
      .single()

    if (error) {
      console.log('❌ search_logs error:', error.message)
    } else {
      console.log('✅ search_logs accessible:', data)
    }
  } catch (err) {
    console.log('❌ search_logs exception:', err.message)
  }

  // Try direct table access
  try {
    const { data, error } = await supabase
      .from('search_logs')
      .select('*')
      .limit(1)

    if (error) {
      console.log('\n❌ Direct search_logs access error:', error.message)
    } else {
      console.log('\n✅ Direct search_logs access works! Rows:', data?.length || 0)
    }
  } catch (err) {
    console.log('\n❌ Direct search_logs exception:', err.message)
  }

  // Try inserting a test record
  try {
    const { data, error } = await supabase
      .from('search_logs')
      .insert({ term: 'TEST', geo: '', user_id: null })
      .select()

    if (error) {
      console.log('\n❌ Insert test error:', error.message)
      console.log('Error details:', error)
    } else {
      console.log('\n✅ Insert test works! Created:', data)
    }
  } catch (err) {
    console.log('\n❌ Insert exception:', err.message)
  }

  process.exit(0)
}

testTables()
