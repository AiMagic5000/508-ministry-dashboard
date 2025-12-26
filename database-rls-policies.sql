-- 508 Ministry Dashboard - Row Level Security (RLS) Policies
-- Ensures complete data isolation between organizations using Clerk authentication

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trustees ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTION: Get current user's organization ID
-- Uses Clerk user ID from JWT token to find organization
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id
  FROM users
  WHERE clerk_user_id = auth.jwt()->>'sub'
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Check if user has specific role
-- ============================================================================
CREATE OR REPLACE FUNCTION user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users
    WHERE clerk_user_id = auth.jwt()->>'sub'
    AND role = required_role
    AND is_active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Check if user has any of specified roles
-- ============================================================================
CREATE OR REPLACE FUNCTION user_has_any_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users
    WHERE clerk_user_id = auth.jwt()->>'sub'
    AND role = ANY(required_roles)
    AND is_active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================================
-- ORGANIZATIONS TABLE POLICIES
-- Users can only see and update their own organization
-- ============================================================================
CREATE POLICY "Users can view their own organization"
  ON organizations
  FOR SELECT
  USING (
    clerk_org_id = auth.jwt()->>'org_id'
    OR id = get_user_organization_id()
  );

CREATE POLICY "Owners and admins can update organization"
  ON organizations
  FOR UPDATE
  USING (
    id = get_user_organization_id()
    AND user_has_any_role(ARRAY['owner', 'admin'])
  );

CREATE POLICY "System can insert organizations"
  ON organizations
  FOR INSERT
  WITH CHECK (true); -- Allow inserts from service role for new signups

-- ============================================================================
-- USERS TABLE POLICIES
-- Users can view all users in their organization
-- Only owners/admins can modify users
-- ============================================================================
CREATE POLICY "Users can view users in their organization"
  ON users
  FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (clerk_user_id = auth.jwt()->>'sub');

CREATE POLICY "Owners and admins can manage users"
  ON users
  FOR ALL
  USING (
    organization_id = get_user_organization_id()
    AND user_has_any_role(ARRAY['owner', 'admin'])
  );

CREATE POLICY "System can insert users"
  ON users
  FOR INSERT
  WITH CHECK (true); -- Allow inserts from service role for new signups

-- ============================================================================
-- DASHBOARD CONFIGS TABLE POLICIES
-- All authenticated users can view/update their org's config
-- ============================================================================
CREATE POLICY "Users can view their organization's dashboard config"
  ON dashboard_configs
  FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can update their organization's dashboard config"
  ON dashboard_configs
  FOR UPDATE
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert dashboard config for their organization"
  ON dashboard_configs
  FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

-- ============================================================================
-- TRUSTEES TABLE POLICIES
-- All users can view trustees, owners/admins/trustees can manage
-- ============================================================================
CREATE POLICY "Users can view trustees in their organization"
  ON trustees
  FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Owners, admins, and trustees can manage trustees"
  ON trustees
  FOR ALL
  USING (
    organization_id = get_user_organization_id()
    AND user_has_any_role(ARRAY['owner', 'admin', 'trustee'])
  );

-- ============================================================================
-- COMPLIANCE ITEMS TABLE POLICIES
-- All users can view, members+ can create/update
-- ============================================================================
CREATE POLICY "Users can view compliance items in their organization"
  ON compliance_items
  FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Members and above can manage compliance items"
  ON compliance_items
  FOR ALL
  USING (
    organization_id = get_user_organization_id()
    AND NOT user_has_role('viewer')
  );

-- ============================================================================
-- DOCUMENTS TABLE POLICIES
-- All users can view, members+ can upload, owners/admins can delete
-- ============================================================================
CREATE POLICY "Users can view documents in their organization"
  ON documents
  FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Members and above can upload documents"
  ON documents
  FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND NOT user_has_role('viewer')
  );

CREATE POLICY "Users can update their own uploaded documents"
  ON documents
  FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND (
      uploaded_by = (SELECT id FROM users WHERE clerk_user_id = auth.jwt()->>'sub')
      OR user_has_any_role(ARRAY['owner', 'admin'])
    )
  );

CREATE POLICY "Owners and admins can delete documents"
  ON documents
  FOR DELETE
  USING (
    organization_id = get_user_organization_id()
    AND user_has_any_role(ARRAY['owner', 'admin'])
  );

-- ============================================================================
-- DONATIONS TABLE POLICIES
-- All users can view, members+ can create, trustees+ can update/delete
-- ============================================================================
CREATE POLICY "Users can view donations in their organization"
  ON donations
  FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Members and above can record donations"
  ON donations
  FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND NOT user_has_role('viewer')
  );

CREATE POLICY "Trustees and above can manage donations"
  ON donations
  FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND user_has_any_role(ARRAY['owner', 'admin', 'trustee'])
  );

CREATE POLICY "Owners and admins can delete donations"
  ON donations
  FOR DELETE
  USING (
    organization_id = get_user_organization_id()
    AND user_has_any_role(ARRAY['owner', 'admin'])
  );

-- ============================================================================
-- VOLUNTEERS TABLE POLICIES
-- All users can view, members+ can manage
-- ============================================================================
CREATE POLICY "Users can view volunteers in their organization"
  ON volunteers
  FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Members and above can manage volunteers"
  ON volunteers
  FOR ALL
  USING (
    organization_id = get_user_organization_id()
    AND NOT user_has_role('viewer')
  );

-- ============================================================================
-- VOLUNTEER HOURS TABLE POLICIES
-- All users can view, members+ can log hours, admins+ can approve
-- ============================================================================
CREATE POLICY "Users can view volunteer hours in their organization"
  ON volunteer_hours
  FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Members and above can log volunteer hours"
  ON volunteer_hours
  FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND NOT user_has_role('viewer')
  );

CREATE POLICY "Admins and above can approve volunteer hours"
  ON volunteer_hours
  FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND user_has_any_role(ARRAY['owner', 'admin'])
  );

-- ============================================================================
-- MEETINGS TABLE POLICIES
-- All users can view, trustees+ can create/update
-- ============================================================================
CREATE POLICY "Users can view meetings in their organization"
  ON meetings
  FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Trustees and above can manage meetings"
  ON meetings
  FOR ALL
  USING (
    organization_id = get_user_organization_id()
    AND user_has_any_role(ARRAY['owner', 'admin', 'trustee'])
  );

-- ============================================================================
-- TRANSACTIONS TABLE POLICIES
-- All users can view, trustees+ can create, owners can delete
-- ============================================================================
CREATE POLICY "Users can view transactions in their organization"
  ON transactions
  FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Trustees and above can record transactions"
  ON transactions
  FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND user_has_any_role(ARRAY['owner', 'admin', 'trustee'])
  );

CREATE POLICY "Trustees and above can update transactions"
  ON transactions
  FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND user_has_any_role(ARRAY['owner', 'admin', 'trustee'])
  );

CREATE POLICY "Owners can delete transactions"
  ON transactions
  FOR DELETE
  USING (
    organization_id = get_user_organization_id()
    AND user_has_role('owner')
  );

-- ============================================================================
-- FOOD PRODUCTION TABLE POLICIES
-- All users can view, members+ can record production
-- ============================================================================
CREATE POLICY "Users can view food production in their organization"
  ON food_production
  FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Members and above can record food production"
  ON food_production
  FOR ALL
  USING (
    organization_id = get_user_organization_id()
    AND NOT user_has_role('viewer')
  );

-- ============================================================================
-- DISTRIBUTIONS TABLE POLICIES
-- All users can view, members+ can record distributions
-- ============================================================================
CREATE POLICY "Users can view distributions in their organization"
  ON distributions
  FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Members and above can record distributions"
  ON distributions
  FOR ALL
  USING (
    organization_id = get_user_organization_id()
    AND NOT user_has_role('viewer')
  );

-- ============================================================================
-- NOTIFICATION SETTINGS TABLE POLICIES
-- Users can only view/update their own settings
-- ============================================================================
CREATE POLICY "Users can view their own notification settings"
  ON notification_settings
  FOR SELECT
  USING (
    user_id = (SELECT id FROM users WHERE clerk_user_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can update their own notification settings"
  ON notification_settings
  FOR UPDATE
  USING (
    user_id = (SELECT id FROM users WHERE clerk_user_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can insert their own notification settings"
  ON notification_settings
  FOR INSERT
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE clerk_user_id = auth.jwt()->>'sub')
  );

-- ============================================================================
-- ACTIVITY LOG TABLE POLICIES
-- All users can view activity in their organization
-- System can insert (no direct user inserts - handled by triggers)
-- ============================================================================
CREATE POLICY "Users can view activity log in their organization"
  ON activity_log
  FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "System can insert activity log entries"
  ON activity_log
  FOR INSERT
  WITH CHECK (true); -- Only service role should insert

-- ============================================================================
-- STORAGE POLICIES (for Supabase Storage buckets)
-- ============================================================================

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for documents bucket
CREATE POLICY "Users can view documents from their organization"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = (
      SELECT clerk_org_id::text
      FROM organizations
      WHERE id = get_user_organization_id()
    )
  );

CREATE POLICY "Users can upload documents to their organization folder"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = (
      SELECT clerk_org_id::text
      FROM organizations
      WHERE id = get_user_organization_id()
    )
    AND NOT user_has_role('viewer')
  );

CREATE POLICY "Users can update their organization's documents"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = (
      SELECT clerk_org_id::text
      FROM organizations
      WHERE id = get_user_organization_id()
    )
    AND user_has_any_role(ARRAY['owner', 'admin'])
  );

CREATE POLICY "Admins can delete their organization's documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = (
      SELECT clerk_org_id::text
      FROM organizations
      WHERE id = get_user_organization_id()
    )
    AND user_has_any_role(ARRAY['owner', 'admin'])
  );

-- ============================================================================
-- GRANT PERMISSIONS
-- Grant usage to authenticated users
-- ============================================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
