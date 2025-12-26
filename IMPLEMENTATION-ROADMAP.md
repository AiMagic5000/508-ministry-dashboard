# 508 Ministry Dashboard - Implementation Roadmap

Complete guide to deploying the full-stack multi-tenant 508(c)(1)(A) ministry management system.

## Current Status ✅

### Completed Features

1. **✅ Authentication System**
   - Clerk integration with sign-in/sign-up pages
   - Protected routes via middleware
   - User session management
   - UserButton with profile dropdown

2. **✅ Database Architecture**
   - Complete schema with 15 tables
   - Row Level Security (RLS) policies
   - Multi-tenant isolation
   - Role-based access control
   - Automatic timestamps and triggers

3. **✅ Webhook Handler**
   - Automatic organization creation on signup
   - User profile creation with roles
   - Default compliance items
   - Notification settings
   - Activity logging

4. **✅ JWT Integration**
   - Clerk JWT template for Supabase
   - Authenticated Supabase client
   - Server-side and client-side support

5. **✅ Dashboard Features (Frontend Only)**
   - Editable header and weather widget
   - Farm location with Google Maps
   - Food production metrics (UI only)
   - Compliance tracking (demo data)
   - localStorage persistence (temporary)

## Implementation Steps

### Phase 1: Database Setup (Do This First)

#### 1.1 Run Database Migrations

```bash
# Access your Supabase instance at Cognabase
# Go to SQL Editor
# Run these files in order:

1. database-schema.sql         # Creates all tables and indexes
2. database-rls-policies.sql   # Sets up security policies
```

**Verification:**
```sql
-- Should return 15 tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- All should show rowsecurity = true
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public';
```

#### 1.2 Configure Environment Variables

Add to `.env.local`:
```env
CLERK_WEBHOOK_SECRET=whsec_your_actual_secret_here
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Phase 2: Clerk Configuration

#### 2.1 Set Up JWT Template

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create `supabase` JWT template
3. Configure claims (see CLERK-SUPABASE-JWT-SETUP.md)
4. Set issuer to Clerk Frontend API URL
5. Save template

#### 2.2 Configure Webhooks

1. Add webhook endpoint: `https://your-domain.com/api/webhooks/clerk`
2. Subscribe to events:
   - user.created
   - user.updated
   - user.deleted
   - organization.created
   - organizationMembership.created
3. Copy webhook secret to `.env.local`
4. Test with sample user creation

**Verification:**
- Create test user in Clerk
- Check webhook logs (should show 200 status)
- Query Supabase to verify records created

### Phase 3: Landing Page Integration

#### 3.1 Payment Flow

Your existing landing page should:
1. Collect payment via Polar.sh
2. On success, redirect to Clerk sign-up
3. User creates account
4. Webhook creates database records
5. User redirects to dashboard

**Landing Page Code:**
```javascript
// After Polar.sh payment success
async function handlePaymentSuccess(checkoutId) {
  // Redirect to Clerk sign-up
  window.location.href = '/sign-up?checkout=' + checkoutId
}
```

#### 3.2 Sign-Up Configuration

In Clerk Dashboard:
- Collect: First name, Last name, Email
- After sign-up redirect: `/dashboard`
- Skip email verification for faster onboarding (or require if preferred)

### Phase 4: Migrate Dashboard to Database

#### 4.1 Update Dashboard Page to Use Database

Replace localStorage with Supabase queries:

**Current (localStorage):**
```typescript
const [dashboardHeader, setDashboardHeader] = useState({
  title: 'Welcome...',
  subtitle: '...'
})

useEffect(() => {
  const saved = localStorage.getItem('dashboardHeader')
  if (saved) setDashboardHeader(JSON.parse(saved))
}, [])

const handleSave = () => {
  localStorage.setItem('dashboardHeader', JSON.stringify(tempHeader))
}
```

**New (Supabase):**
```typescript
import { useSupabaseClient } from '@/lib/supabase-client'

const supabase = useSupabaseClient()
const { user } = useUser()

const [dashboardHeader, setDashboardHeader] = useState({
  title: 'Welcome...',
  subtitle: '...'
})

useEffect(() => {
  async function loadConfig() {
    const { data } = await supabase
      .from('dashboard_configs')
      .select('header_title, header_subtitle')
      .single()

    if (data) {
      setDashboardHeader({
        title: data.header_title,
        subtitle: data.header_subtitle
      })
    }
  }
  if (user) loadConfig()
}, [user, supabase])

const handleSave = async () => {
  await supabase
    .from('dashboard_configs')
    .update({
      header_title: tempHeader.title,
      header_subtitle: tempHeader.subtitle
    })
    .eq('organization_id', /* get from RLS */)
}
```

#### 4.2 Update All Dashboard Sections

Apply similar pattern to:
- Weather widget → `dashboard_configs.weather_*` fields
- Farm location → `dashboard_configs.farm_location` JSONB
- Food production → `food_production` table
- Compliance items → `compliance_items` table

#### 4.3 Migration Strategy

For existing localStorage users:

```typescript
useEffect(() => {
  async function migrateData() {
    // Check if already migrated
    const { data: existing } = await supabase
      .from('dashboard_configs')
      .select('id')
      .single()

    if (existing) return // Already migrated

    // Read from localStorage
    const headerData = localStorage.getItem('dashboardHeader')
    const weatherData = localStorage.getItem('dashboardWeather')
    const locationData = localStorage.getItem('farmLocation')

    // Insert into database
    if (headerData || weatherData || locationData) {
      await supabase.from('dashboard_configs').insert({
        organization_id: userOrgId,
        header_title: JSON.parse(headerData)?.title,
        header_subtitle: JSON.parse(headerData)?.subtitle,
        weather_zip_code: JSON.parse(weatherData)?.zipCode,
        weather_data: weatherData,
        farm_location: locationData
      })

      // Clear localStorage
      localStorage.removeItem('dashboardHeader')
      localStorage.removeItem('dashboardWeather')
      localStorage.removeItem('farmLocation')
    }
  }

  migrateData()
}, [])
```

### Phase 5: Implement Remaining Features

#### 5.1 Document Management

1. Create file upload component
2. Upload to Supabase Storage
3. Store metadata in `documents` table
4. Implement AI analysis with Anthropic Claude API

**Storage Structure:**
```
documents/
  {org_clerk_id}/
    {document_id}/
      original.pdf
      processed.pdf
```

**Upload Code:**
```typescript
async function uploadDocument(file: File) {
  const orgId = /* get from user session */

  // Upload to storage
  const { data: fileData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(`${orgId}/${Date.now()}_${file.name}`, file)

  if (uploadError) throw uploadError

  // Create document record
  const { data: docData } = await supabase
    .from('documents')
    .insert({
      organization_id: orgId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: fileData.path,
      category: 'financial' // or let user select
    })
    .select()
    .single()

  // Run AI analysis (optional)
  await analyzeDocument(docData.id)
}
```

#### 5.2 Compliance Scoring System

Implement 100-point scoring:

```typescript
async function calculateComplianceScore(organizationId: string) {
  const { data: items } = await supabase
    .from('compliance_items')
    .select('status, points_value')
    .eq('organization_id', organizationId)

  const totalPoints = items.reduce((sum, item) => sum + item.points_value, 0)
  const earnedPoints = items
    .filter(item => item.status === 'completed')
    .reduce((sum, item) => sum + item.points_value, 0)

  const score = (earnedPoints / totalPoints) * 100

  return Math.round(score)
}
```

#### 5.3 Automated Notifications

Create email notification system:

```typescript
import nodemailer from 'nodemailer'

async function sendComplianceReminder(userId: string, item: ComplianceItem) {
  const { data: user } = await supabase
    .from('users')
    .select('email, full_name')
    .eq('id', userId)
    .single()

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  })

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: `Compliance Reminder: ${item.title}`,
    html: `
      <h2>Upcoming Compliance Task</h2>
      <p>Hi ${user.full_name},</p>
      <p>This is a reminder that "${item.title}" is due on ${item.due_date}.</p>
      <p><a href="https://508ministry.com/compliance">View in Dashboard</a></p>
    `
  })

  // Mark reminder as sent
  await supabase
    .from('compliance_items')
    .update({ reminder_sent: true })
    .eq('id', item.id)
}
```

#### 5.4 Payment Tier Management

Implement subscription upgrades:

```typescript
async function upgradeSubscription(organizationId: string, tier: string) {
  const { data, error } = await supabase
    .from('organizations')
    .update({
      subscription_tier: tier,
      subscription_status: 'active',
      subscription_ends_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    })
    .eq('id', organizationId)

  // Redirect to Polar.sh checkout for tier
  // After payment, webhook updates subscription
}
```

### Phase 6: Testing

#### 6.1 Multi-Tenant Isolation Test

1. Create 2 test accounts
2. Add data to each organization
3. Verify user A cannot see user B's data
4. Test with direct Supabase queries
5. Check RLS policies block unauthorized access

#### 6.2 Role Permission Test

Create users with different roles:
- Owner: Full access
- Admin: Can't delete org
- Trustee: Can manage compliance/finance
- Member: Can add data, can't manage users
- Viewer: Read-only

#### 6.3 Payment Flow Test

1. Complete payment on landing page
2. Sign up via Clerk
3. Verify database records created
4. Access dashboard
5. Verify trial period set correctly

### Phase 7: Deployment

#### 7.1 Deploy Database

- Supabase schema already on Cognabase
- Verify RLS policies active
- Test connection from production

#### 7.2 Deploy Next.js App

**Recommended: Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# - CLERK_PUBLISHABLE_KEY
# - CLERK_SECRET_KEY
# - CLERK_WEBHOOK_SECRET
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - ANTHROPIC_API_KEY
# - SMTP credentials
```

#### 7.3 Update Clerk Webhook URL

Change webhook endpoint to production:
```
https://508ministry.com/api/webhooks/clerk
```

#### 7.4 DNS Configuration

Point your domain to deployment:
- Vercel provides automatic HTTPS
- Add custom domain in Vercel dashboard
- Update DNS records

### Phase 8: Launch Checklist

- [ ] Database schema deployed
- [ ] RLS policies enabled and tested
- [ ] Clerk JWT template configured
- [ ] Webhook endpoint working
- [ ] Landing page redirects to Clerk signup
- [ ] New signups create database records
- [ ] Dashboard loads user-specific data
- [ ] Multi-tenant isolation verified
- [ ] File uploads work
- [ ] Email notifications sending
- [ ] Trial period expires correctly
- [ ] Payment upgrades work
- [ ] All 15 dashboard tabs functional
- [ ] Mobile responsive
- [ ] Security audit passed
- [ ] Performance optimized

## Timeline Estimate

- **Phase 1 (Database)**: 1-2 hours
- **Phase 2 (Clerk)**: 1 hour
- **Phase 3 (Landing Page)**: 2 hours
- **Phase 4 (Dashboard Migration)**: 8-12 hours
- **Phase 5 (New Features)**: 20-30 hours
- **Phase 6 (Testing)**: 4-6 hours
- **Phase 7 (Deployment)**: 2-4 hours
- **Phase 8 (Launch)**: 2 hours

**Total**: ~40-60 hours of development work

## Support Resources

### Documentation Created

1. `database-schema.sql` - Complete database structure
2. `database-rls-policies.sql` - Security policies
3. `DATABASE-SETUP.md` - Database setup guide
4. `WEBHOOK-SETUP.md` - Webhook configuration
5. `CLERK-SUPABASE-JWT-SETUP.md` - JWT integration
6. `IMPLEMENTATION-ROADMAP.md` - This file

### Key Files

1. `src/app/api/webhooks/clerk/route.ts` - Webhook handler
2. `src/lib/supabase-client.ts` - Authenticated Supabase client
3. `src/middleware.ts` - Route protection
4. `src/app/sign-in/[[...sign-in]]/page.tsx` - Sign in page
5. `src/app/sign-up/[[...sign-up]]/page.tsx` - Sign up page

### External Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com)
- [Polar.sh Payments](https://docs.polar.sh)

## Next Immediate Steps

1. **Run database migrations** (30 minutes)
2. **Configure Clerk JWT template** (15 minutes)
3. **Set up webhook** (15 minutes)
4. **Test signup flow** (30 minutes)
5. **Start dashboard migration** (Begin Phase 4)

Ready to proceed with Phase 1?
