import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qqysxufjdnmqqdezndgq.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxeXN4dWZqZG5tcXFkZXpuZGdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MjE5MzUsImV4cCI6MjA3MTk5NzkzNX0.Ex8oSuvmnI5BNX6i2rI599VdqKeZ1By6VDjKokyigVk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper functions for common operations
export const auth = supabase.auth
export const db = supabase.from
export const storage = supabase.storage
export const rpc = supabase.rpc
