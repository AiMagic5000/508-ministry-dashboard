# 508 Ministry Dashboard - Database Setup Guide

## Overview

This database schema provides complete multi-tenant isolation for the 508 Ministry Dashboard, allowing multiple ministries to securely use the same application while keeping their data completely separate.

## Architecture

### Multi-Tenant Design
- **Organization Isolation**: Each ministry is an organization with a unique `clerk_org_id`
- **User Management**: Users belong to organizations with role-based access control
- **Row Level Security (RLS)**: Postgres RLS policies ensure users can only access their organization's data
- **Clerk Integration**: Uses Clerk authentication for secure user/org identification

### Database Structure

#### Core Tables (15 tables total)

1. **organizations** - Ministry information and subscription details
2. **users** - User profiles linked to Clerk accounts
3. **dashboard_configs** - Customizable dashboard settings per organization
4. **trustees** - Board members and trustees for governance
5. **compliance_items** - 508(c)(1)(A) compliance tracking
6. **documents** - File storage with AI analysis metadata
7. **donations** - Donation tracking with receipt management
8. **volunteers** - Volunteer information
9. **volunteer_hours** - Individual service hour logs
10. **meetings** - Board meeting records and minutes
11. **transactions** - Income and expense tracking
12. **food_production** - Farm/food production metrics
13. **distributions** - Food distribution records
14. **notification_settings** - User notification preferences
15. **activity_log** - Audit trail of all actions

## Setup Instructions

### 1. Access Supabase

Your Supabase instance is already configured:
- **URL**: `http://supabasekong-wo4k0wck8cg84c04gcc008sw.72.60.119.182.sslip.io`
- **Access**: Through Supabase Studio dashboard

### 2. Run Database Migrations

#### Option A: Using Supabase Studio (Recommended)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Create a new query
4. Copy the entire contents of `database-schema.sql`
5. Paste and click **RUN**
6. Wait for confirmation (should see "Success")
7. Create another new query
8. Copy the entire contents of `database-rls-policies.sql`
9. Paste and click **RUN**
10. Verify success

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run schema migration
supabase db push --file database-schema.sql

# Run RLS policies
supabase db push --file database-rls-policies.sql
```

### 3. Verify Installation

After running the migrations, verify the setup:

```sql
-- Check that all tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Should return 15 tables:
-- activity_log, compliance_items, dashboard_configs, distributions,
-- documents, donations, food_production, meetings, notification_settings,
-- organizations, transactions, trustees, users, volunteer_hours, volunteers

-- Check that RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- All tables should show rowsecurity = true

-- Check policies exist
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## Role-Based Access Control (RBAC)

### User Roles (Hierarchical)

1. **Owner** - Full access to everything
   - Can delete organization
   - Can manage all users
   - Can manage subscriptions
   - Can access all financial data

2. **Admin** - Administrative access
   - Can manage users (except owners)
   - Can manage all content
   - Can access financial data
   - Cannot delete organization

3. **Trustee** - Board member access
   - Can manage trustees
   - Can manage meetings
   - Can manage compliance items
   - Can manage financial transactions
   - Cannot manage users

4. **Member** - Standard access
   - Can create/update most content
   - Can view all data
   - Cannot manage users or trustees
   - Cannot manage financial transactions

5. **Viewer** - Read-only access
   - Can view all data
   - Cannot create, update, or delete anything

### Permission Matrix

| Resource | Owner | Admin | Trustee | Member | Viewer |
|----------|-------|-------|---------|--------|--------|
| Organization Settings | ✓ | ✓ | ✗ | ✗ | ✗ |
| Users | ✓ | ✓ | ✗ | ✗ | ✗ |
| Trustees | ✓ | ✓ | ✓ | ✗ | ✗ |
| Compliance Items | ✓ | ✓ | ✓ | ✓ | View Only |
| Documents | ✓ | ✓ | ✓ | ✓ | View Only |
| Donations | ✓ | ✓ | ✓ | ✓ | View Only |
| Volunteers | ✓ | ✓ | ✓ | ✓ | View Only |
| Meetings | ✓ | ✓ | ✓ | ✗ | View Only |
| Transactions | ✓ | ✓ | ✓ | ✗ | View Only |
| Food Production | ✓ | ✓ | ✓ | ✓ | View Only |
| Distributions | ✓ | ✓ | ✓ | ✓ | View Only |

## Data Flow

### New User Signup Flow

1. User signs up through Clerk on landing page
2. Clerk creates user account and organization
3. Webhook triggers server function to:
   - Create organization record with `clerk_org_id`
   - Create user record with `clerk_user_id` and role='owner'
   - Create default dashboard_config
   - Create default notification_settings
4. User is redirected to dashboard
5. RLS policies ensure user only sees their org's data

### Data Access Flow

1. User makes request to dashboard (e.g., view donations)
2. Frontend calls Supabase client with auth token
3. Supabase extracts Clerk user ID from JWT token
4. Helper function `get_user_organization_id()` queries user's org
5. RLS policy checks if requested data belongs to user's org
6. If yes: return data; If no: return empty/error

## Security Features

### 1. Row Level Security (RLS)
- Every table has RLS enabled
- Policies prevent cross-organization data access
- Even direct database access is protected

### 2. JWT-Based Authentication
- Clerk JWT tokens contain user and organization IDs
- Supabase validates tokens on every request
- No manual session management needed

### 3. Storage Isolation
- Documents stored in organization-specific folders
- Folder structure: `documents/{clerk_org_id}/{file_name}`
- Storage RLS policies prevent cross-org file access

### 4. Audit Trail
- `activity_log` table tracks all significant actions
- Includes user, timestamp, IP address, and action details
- Useful for compliance and debugging

## Database Functions

### Helper Functions

```sql
-- Get current user's organization ID
get_user_organization_id() → UUID

-- Check if user has specific role
user_has_role(required_role TEXT) → BOOLEAN

-- Check if user has any of specified roles
user_has_any_role(required_roles TEXT[]) → BOOLEAN
```

### Automatic Triggers

- `update_updated_at_column()` - Auto-updates `updated_at` on every UPDATE

## Performance Optimization

### Indexes Created

- All foreign keys indexed
- Common query patterns indexed (date ranges, status filters)
- Clerk ID fields uniquely indexed
- Organization ID indexed on all multi-tenant tables

### Query Performance Tips

```sql
-- ✓ GOOD: Uses index on organization_id
SELECT * FROM donations
WHERE organization_id = get_user_organization_id()
AND date_received > '2024-01-01';

-- ✗ BAD: Full table scan without org filter
SELECT * FROM donations
WHERE date_received > '2024-01-01';
```

## Subscription Tier Management

Organizations have subscription tiers stored in the `organizations` table:

```sql
subscription_tier: 'trial' | 'basic' | 'pro' | 'enterprise'
subscription_status: 'active' | 'cancelled' | 'expired' | 'past_due'
trial_ends_at: TIMESTAMPTZ
subscription_ends_at: TIMESTAMPTZ
```

### Checking Subscription in Code

```typescript
const { data: org } = await supabase
  .from('organizations')
  .select('subscription_tier, subscription_status')
  .single()

if (org.subscription_tier === 'trial' && new Date(org.trial_ends_at) < new Date()) {
  // Trial expired - show upgrade prompt
}
```

## Migration Strategy

### Migrating from localStorage

Current dashboard uses localStorage for:
- Dashboard header (title, subtitle)
- Weather widget (zip code, city, state, weather data)
- Farm location (city, state, lat/lon, hours)

Migration steps:

1. User signs up and logs in
2. Check if `dashboard_configs` exists for their org
3. If not, read localStorage data
4. Insert into `dashboard_configs`:
   ```typescript
   await supabase.from('dashboard_configs').insert({
     organization_id: userOrgId,
     header_title: localStorage.getItem('dashboardHeader.title'),
     header_subtitle: localStorage.getItem('dashboardHeader.subtitle'),
     weather_zip_code: localStorage.getItem('dashboardWeather.zipCode'),
     weather_data: localStorage.getItem('dashboardWeather'),
     farm_location: localStorage.getItem('farmLocation')
   })
   ```
5. Clear localStorage
6. Future reads/writes go to database

## Maintenance

### Regular Tasks

1. **Weekly**: Review activity_log for suspicious activity
2. **Monthly**: Check for expired trials and subscriptions
3. **Quarterly**: Analyze storage usage and optimize
4. **Annually**: Audit RLS policies for security

### Backup Strategy

Supabase provides automatic backups. For additional safety:

```bash
# Create manual backup
pg_dump -h db.YOUR_PROJECT.supabase.co \
        -U postgres \
        -d postgres \
        > backup-$(date +%Y%m%d).sql
```

## Troubleshooting

### Issue: User can't see any data after signup

**Cause**: No organization created or user not linked to org

**Solution**:
```sql
-- Check user record
SELECT * FROM users WHERE clerk_user_id = 'user_xxx';

-- Check organization
SELECT * FROM organizations WHERE clerk_org_id = 'org_xxx';

-- Verify organization_id link
SELECT u.clerk_user_id, u.organization_id, o.clerk_org_id
FROM users u
LEFT JOIN organizations o ON u.organization_id = o.id
WHERE u.clerk_user_id = 'user_xxx';
```

### Issue: RLS policy errors

**Cause**: Missing or incorrect JWT token

**Solution**:
```typescript
// Ensure Supabase client uses Clerk session
import { useAuth } from '@clerk/nextjs'

const { getToken } = useAuth()
const token = await getToken({ template: 'supabase' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  }
)
```

## Next Steps

After database setup is complete:

1. ✅ Database schema created
2. ✅ RLS policies implemented
3. ⏭️ Create Clerk webhook handler for new signups
4. ⏭️ Update Supabase client to use Clerk tokens
5. ⏭️ Migrate localStorage data to database
6. ⏭️ Test multi-tenant isolation
7. ⏭️ Implement document upload with AI analysis
8. ⏭️ Build automated compliance scoring

## Support

For issues or questions:
- Check Supabase logs in dashboard
- Review RLS policies in SQL Editor
- Test policies with different user roles
- Contact Supabase support for infrastructure issues
