import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ymcyjwuxqqdooighbnwy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltY3lqd3V4cXFkb29pZ2hibnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTAyNTYsImV4cCI6MjA3MzY2NjI1Nn0.xXIrP_CtSQl-lrmsTc9FXgHaHP7t1xh0yXUg_Wa53_4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  phone?: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  phone?: string
  country: string
  occupation: string
  monthly_income?: number
  financial_goals?: string[]
  created_at: string
  updated_at: string
}
