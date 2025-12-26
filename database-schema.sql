-- 508 Ministry Dashboard - Supabase Database Schema
-- Multi-tenant architecture with Clerk authentication integration

-- ============================================================================
-- ORGANIZATIONS TABLE
-- Stores ministry information with Clerk organization ID for isolation
-- ============================================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_org_id TEXT UNIQUE NOT NULL, -- Clerk organization ID
  name TEXT NOT NULL,
  ein_number TEXT, -- Tax ID for 508(c)(1)(A)
  formation_date DATE,
  ministry_type TEXT CHECK (ministry_type IN ('traditional', 'nondenominational', 'interdenominational')),
  state_of_formation TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  brand_colors JSONB DEFAULT '{"primary": "#2563eb", "secondary": "#10b981", "accent": "#f59e0b"}'::jsonb,
  mission_statement TEXT,
  statement_of_faith TEXT,
  subscription_tier TEXT DEFAULT 'trial' CHECK (subscription_tier IN ('trial', 'basic', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'past_due')),
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USERS TABLE
-- Links Clerk users to organizations with role-based access
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL, -- Clerk user ID
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'trustee', 'member', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DASHBOARD CONFIGS TABLE
-- Stores customizable dashboard settings per organization
-- ============================================================================
CREATE TABLE dashboard_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  header_title TEXT DEFAULT 'Welcome to Your Ministry Dashboard',
  header_subtitle TEXT DEFAULT 'Managing your 508(c)(1)(A) ministry with transparency',
  weather_zip_code TEXT,
  weather_city TEXT,
  weather_state TEXT,
  weather_data JSONB,
  farm_location JSONB DEFAULT '{
    "city": "",
    "state": "",
    "latitude": 0,
    "longitude": 0,
    "hours": "Mon-Sat: 9:00 AM - 5:00 PM"
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TRUSTEES TABLE
-- Board members and trustees for governance compliance
-- ============================================================================
CREATE TABLE trustees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL, -- e.g., "Lead Trustee", "Secretary", "Treasurer"
  email TEXT,
  phone TEXT,
  address TEXT,
  date_appointed DATE,
  term_expires DATE,
  is_active BOOLEAN DEFAULT true,
  signature_on_file BOOLEAN DEFAULT false,
  credentials TEXT, -- Professional credentials or background
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COMPLIANCE ITEMS TABLE
-- Tracks 508(c)(1)(A) compliance tasks and deadlines
-- ============================================================================
CREATE TABLE compliance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('governance', 'financial', 'operational', 'legal')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  completed_date DATE,
  frequency TEXT, -- e.g., "monthly", "quarterly", "annual"
  points_value INTEGER DEFAULT 10, -- For compliance scoring
  reminder_sent BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DOCUMENTS TABLE
-- Stores uploaded documents with AI analysis metadata
-- ============================================================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- MIME type
  file_size INTEGER, -- bytes
  storage_path TEXT NOT NULL, -- Supabase Storage path
  category TEXT CHECK (category IN ('bylaws', 'minutes', 'financial', 'tax', 'contracts', 'other')),
  description TEXT,
  ai_analysis JSONB, -- Store Claude API analysis results
  tags TEXT[], -- Array of tags for search
  is_template BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  replaced_by UUID REFERENCES documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DONATIONS TABLE
-- Tracks donations with receipt and tax deduction info
-- ============================================================================
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  donor_address TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  date_received DATE DEFAULT CURRENT_DATE,
  method TEXT CHECK (method IN ('cash', 'check', 'card', 'bank_transfer', 'crypto', 'other')),
  purpose TEXT, -- Designated purpose if any
  receipt_issued BOOLEAN DEFAULT false,
  receipt_number TEXT,
  receipt_date DATE,
  tax_deductible BOOLEAN DEFAULT true,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- VOLUNTEERS TABLE
-- Manages volunteer information and service hours
-- ============================================================================
CREATE TABLE volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  skills TEXT[], -- Array of skills/interests
  background_check_date DATE,
  background_check_status TEXT CHECK (background_check_status IN ('pending', 'approved', 'rejected', 'expired')),
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  total_hours DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- VOLUNTEER HOURS TABLE
-- Logs individual volunteer service hours
-- ============================================================================
CREATE TABLE volunteer_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours DECIMAL(5, 2) NOT NULL,
  activity TEXT NOT NULL,
  notes TEXT,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MEETINGS TABLE
-- Board meeting records and minutes
-- ============================================================================
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  meeting_type TEXT CHECK (meeting_type IN ('board', 'trustee', 'special', 'annual', 'other')),
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  attendees TEXT[], -- Array of attendee names
  agenda TEXT,
  minutes TEXT,
  recording_url TEXT, -- Link to recording if available
  action_items JSONB, -- Array of action items with assignees
  next_meeting_date DATE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FINANCIAL TRANSACTIONS TABLE
-- Tracks income and expenses for transparency
-- ============================================================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  category TEXT NOT NULL, -- e.g., "donations", "supplies", "utilities", "salaries"
  amount DECIMAL(10, 2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  payee_payer TEXT, -- Who paid or was paid
  payment_method TEXT,
  reference_number TEXT, -- Check number, invoice number, etc.
  receipt_url TEXT, -- Link to receipt/invoice in storage
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT, -- "monthly", "quarterly", etc.
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FOOD PRODUCTION TABLE
-- Tracks farm/food production metrics
-- ============================================================================
CREATE TABLE food_production (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  production_date DATE DEFAULT CURRENT_DATE,
  fish_produced_lbs DECIMAL(10, 2) DEFAULT 0,
  vertical_gardens_lbs DECIMAL(10, 2) DEFAULT 0,
  food_forest_lbs DECIMAL(10, 2) DEFAULT 0,
  water_quality JSONB, -- Store water quality parameters
  notes TEXT,
  recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DISTRIBUTION RECORDS TABLE
-- Tracks food/resource distribution to churches and shelters
-- ============================================================================
CREATE TABLE distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  distribution_date DATE DEFAULT CURRENT_DATE,
  recipient_name TEXT NOT NULL, -- Church or shelter name
  recipient_type TEXT CHECK (recipient_type IN ('church', 'shelter', 'individual', 'other')),
  recipient_contact TEXT,
  items_distributed JSONB, -- Array of items with quantities
  total_weight_lbs DECIMAL(10, 2),
  total_value DECIMAL(10, 2), -- Estimated value for tax purposes
  delivery_method TEXT,
  delivered_by UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATION SETTINGS TABLE
-- User notification preferences
-- ============================================================================
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  compliance_reminders BOOLEAN DEFAULT true,
  donation_receipts BOOLEAN DEFAULT true,
  weekly_digest BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ACTIVITY LOG TABLE
-- Audit trail of all significant actions
-- ============================================================================
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- e.g., "created", "updated", "deleted"
  resource_type TEXT NOT NULL, -- e.g., "document", "donation", "trustee"
  resource_id UUID,
  details JSONB, -- Additional context about the action
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_orgs_clerk_id ON organizations(clerk_org_id);
CREATE INDEX idx_compliance_org ON compliance_items(organization_id);
CREATE INDEX idx_compliance_status ON compliance_items(status);
CREATE INDEX idx_compliance_due_date ON compliance_items(due_date);
CREATE INDEX idx_documents_org ON documents(organization_id);
CREATE INDEX idx_donations_org ON donations(organization_id);
CREATE INDEX idx_donations_date ON donations(date_received);
CREATE INDEX idx_volunteers_org ON volunteers(organization_id);
CREATE INDEX idx_meetings_org ON meetings(organization_id);
CREATE INDEX idx_meetings_date ON meetings(date);
CREATE INDEX idx_transactions_org ON transactions(organization_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_activity_log_org ON activity_log(organization_id);
CREATE INDEX idx_activity_log_user ON activity_log(user_id);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- Automatically updates updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_configs_updated_at BEFORE UPDATE ON dashboard_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trustees_updated_at BEFORE UPDATE ON trustees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_items_updated_at BEFORE UPDATE ON compliance_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_volunteers_updated_at BEFORE UPDATE ON volunteers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_volunteer_hours_updated_at BEFORE UPDATE ON volunteer_hours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_food_production_updated_at BEFORE UPDATE ON food_production FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_distributions_updated_at BEFORE UPDATE ON distributions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
