import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Supabase client for browser-side operations
 * Uses the anon key which has RLS policies applied
 */
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

/**
 * Create a Supabase client for browser-side operations
 * Uses the anon key which has RLS policies applied
 */
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Create a Supabase client for server-side operations
 * Uses the service role key which bypasses RLS
 */
export function createServerClient() {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey)
}

/**
 * Database types will be generated from Supabase schema
 * For now, define basic types for the main tables
 */
export type Organization = {
  id: string
  name: string
  slug: string
  owner_id: string
  trial_ends_at: string
  subscription_status: 'trial' | 'active' | 'cancelled' | 'expired'
  polar_customer_id?: string
  created_at: string
  updated_at: string
}

export type TrustData = {
  id: string
  organization_id: string
  ministry_name: string
  ein_number?: string
  formation_date?: string
  state_of_formation?: string
  registered_agent?: string
  address?: string
  created_at: string
  updated_at: string
}

export type Partner = {
  id: string
  organization_id: string
  name: string
  email?: string
  phone?: string
  role?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export type Volunteer = {
  id: string
  organization_id: string
  name: string
  email?: string
  phone?: string
  skills?: string[]
  status: 'active' | 'inactive'
  total_hours: number
  created_at: string
  updated_at: string
}

export type Donation = {
  id: string
  organization_id: string
  donor_name: string
  donor_email?: string
  amount: number
  type: 'one-time' | 'recurring'
  status: 'pending' | 'completed' | 'failed'
  payment_method?: string
  created_at: string
}

export type Document = {
  id: string
  organization_id: string
  name: string
  type: string
  file_url: string
  file_size: number
  uploaded_by: string
  created_at: string
}

export type ActivityLog = {
  id: string
  organization_id: string
  action: string
  description: string
  user_id?: string
  metadata?: Record<string, unknown>
  created_at: string
}
