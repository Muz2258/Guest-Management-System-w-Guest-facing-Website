import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_APP_DATABASE_URL
const supabaseAnonKey = import.meta.env.VITE_APP_DATABASE_ANON_KEY

if(!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
