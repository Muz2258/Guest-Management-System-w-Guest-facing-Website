import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_APP_DATABASE_URL
const supabaseKey = import.meta.env.VITE_APP_DATABASE_ANON_KEY

console.log('🔧 Supabase Configuration:', {
  hasUrl: !!supabaseUrl,
  urlLength: supabaseUrl?.length,
  hasKey: !!supabaseKey,
  keyLength: supabaseKey?.length
})

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials:', {
    url: supabaseUrl ? 'Present' : 'Missing',
    key: supabaseKey ? 'Present' : 'Missing'
  })
  throw new Error('Missing Supabase credentials')
}

const client = createClient(supabaseUrl, supabaseKey)

// Test the client configuration
client.auth.onAuthStateChange((event, session) => {
  console.log('🔑 Supabase Auth State Change:', {
    event,
    hasSession: !!session,
    userId: session?.user?.id
  })
})

export const supabase = client
