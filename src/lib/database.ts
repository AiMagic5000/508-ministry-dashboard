// Database helper functions for 508 Ministry Dashboard
import { createClient } from './supabase'

export interface Ministry {
  id: string
  name: string
  ein_number?: string
  formation_date?: string
  ministry_type?: 'traditional' | 'nondenominational' | 'interdenominational'
  state_of_formation?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  logo_url?: string
  brand_colors?: Record<string, string>
  mission_statement?: string
  statement_of_faith?: string
  created_at: string
  updated_at: string
}

export interface Trustee {
  id: string
  organization_id: string
  first_name: string
  last_name: string
  role: string
  email?: string
  phone?: string
  address?: string
  date_appointed?: string
  term_expires?: string
  is_active: boolean
  signature_on_file: boolean
  credentials?: string
  created_at: string
  updated_at: string
}

export interface ComplianceItem {
  id: string
  organization_id: string
  title: string
  description?: string
  due_date?: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category?: 'governance' | 'financial' | 'operational' | 'legal'
  frequency?: string
  points_value: number
  completed_date?: string
  reminder_sent: boolean
  created_at: string
  updated_at: string
}

export interface Donation {
  id: string
  organization_id: string
  donor_name: string
  donor_email?: string
  amount: number
  date_received?: string
  method?: string
  purpose?: string
  receipt_issued: boolean
  receipt_date?: string
  tax_deductible: boolean
  notes?: string
  created_at: string
}

export interface Document {
  id: string
  organization_id: string
  name: string
  type: string
  document_type?: string
  file_url: string
  file_size: number
  category?: string
  requires_signature: boolean
  signatures_required: number
  signatures_collected: number
  status: string
  expiration_date?: string
  version: number
  uploaded_by: string
  created_at: string
  updated_at: string
}

export interface Meeting {
  id: string
  organization_id: string
  meeting_type: 'board' | 'congregation' | 'special' | 'committee'
  title: string
  date: string
  location?: string
  attendees: string[]
  agenda?: string
  minutes_document_id?: string
  quorum_met?: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  organization_id: string
  notification_type: 'reminder' | 'alert' | 'update' | 'achievement'
  title: string
  message: string
  is_read: boolean
  action_url?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
}

export interface ActivityLog {
  id: string
  organization_id: string
  action: string
  description: string
  user_id?: string
  metadata: Record<string, any>
  created_at: string
}

// Get user's organization ID
export async function getUserOrganizationId(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_id', userId)
    .single()

  if (error) throw error
  return data.id
}

// Dashboard Stats
export async function getDashboardStats(organizationId: string) {
  const supabase = createClient()

  const [donations, volunteers, partners, documents, complianceScore] = await Promise.all([
    supabase
      .from('donations')
      .select('amount')
      .eq('organization_id', organizationId)
      .eq('status', 'completed'),

    supabase
      .from('volunteers')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('status', 'active'),

    supabase
      .from('partners')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('status', 'active'),

    supabase
      .from('documents')
      .select('id')
      .eq('organization_id', organizationId),

    supabase
      .from('organizations')
      .select('compliance_score')
      .eq('id', organizationId)
      .single()
  ])

  const totalDonations = donations.data?.reduce((sum, d) => sum + parseFloat(d.amount), 0) || 0
  const volunteerCount = volunteers.data?.length || 0
  const partnerCount = partners.data?.length || 0
  const documentCount = documents.data?.length || 0
  const score = complianceScore.data?.compliance_score || 0

  return {
    totalDonations,
    volunteerCount,
    partnerCount,
    documentCount,
    complianceScore: score
  }
}

// Recent Activity
export async function getRecentActivity(organizationId: string, limit = 10) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as ActivityLog[]
}

// Upcoming Events
export async function getUpcomingEvents(organizationId: string, limit = 5) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data
}

// Notifications
export async function getNotifications(organizationId: string, unreadOnly = false) {
  const supabase = createClient()
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Notification[]
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) throw error
}

// Trustees
export async function getTrustees(organizationId: string, activeOnly = false) {
  const supabase = createClient()
  let query = supabase
    .from('trustees')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Trustee[]
}

export async function createTrustee(trustee: Omit<Trustee, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('trustees')
    .insert(trustee)
    .select()
    .single()

  if (error) throw error
  return data as Trustee
}

export async function updateTrustee(id: string, updates: Partial<Trustee>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('trustees')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Trustee
}

// Compliance Items
export async function getComplianceItems(organizationId: string, status?: string) {
  const supabase = createClient()
  let query = supabase
    .from('compliance_items')
    .select('*')
    .eq('organization_id', organizationId)
    .order('due_date', { ascending: true })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw error
  return data as ComplianceItem[]
}

export async function createComplianceItem(item: Omit<ComplianceItem, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('compliance_items')
    .insert(item)
    .select()
    .single()

  if (error) throw error
  return data as ComplianceItem
}

export async function updateComplianceItem(id: string, updates: Partial<ComplianceItem>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('compliance_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as ComplianceItem
}

export async function deleteComplianceItem(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('compliance_items')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Donations
export async function getDonations(organizationId: string, startDate?: string, endDate?: string) {
  const supabase = createClient()
  let query = supabase
    .from('donations')
    .select('*')
    .eq('organization_id', organizationId)
    .order('date_received', { ascending: false })

  if (startDate) {
    query = query.gte('date_received', startDate)
  }
  if (endDate) {
    query = query.lte('date_received', endDate)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Donation[]
}

export async function createDonation(donation: Omit<Donation, 'id' | 'created_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('donations')
    .insert(donation)
    .select()
    .single()

  if (error) throw error
  return data as Donation
}

export async function updateDonation(id: string, updates: Partial<Donation>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('donations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Donation
}

export async function deleteDonation(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('donations')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Documents
export async function getDocuments(organizationId: string, category?: string) {
  const supabase = createClient()
  let query = supabase
    .from('documents')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Document[]
}

// Meetings
export async function getMeetings(organizationId: string, upcoming = false) {
  const supabase = createClient()
  let query = supabase
    .from('meetings')
    .select('*')
    .eq('organization_id', organizationId)
    .order('date', { ascending: !upcoming })

  if (upcoming) {
    query = query.gte('date', new Date().toISOString())
  }

  const { data, error } = await query
  if (error) throw error
  return data as Meeting[]
}

export async function createMeeting(meeting: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('meetings')
    .insert(meeting)
    .select()
    .single()

  if (error) throw error
  return data as Meeting
}

// Activity Logging
export async function logActivity(
  organizationId: string,
  action: string,
  description: string,
  userId?: string,
  metadata: Record<string, any> = {}
) {
  const supabase = createClient()
  const { error } = await supabase
    .from('activity_logs')
    .insert({
      organization_id: organizationId,
      action,
      description,
      user_id: userId,
      metadata
    })

  if (error) throw error
}
