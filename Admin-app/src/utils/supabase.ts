import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.APP_DATABASE_URL
const supabaseKey = import.meta.env.APP_DATABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
