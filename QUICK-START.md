# 508 Ministry Dashboard - Quick Start Guide

## Step 1: Deploy Database (15-20 minutes)

### Access Your Cognabase Supabase Instance

1. Go to: `http://supabasekong-wo4k0wck8cg84c04gcc008sw.72.60.119.182.sslip.io`
2. Log in to Supabase Studio
3. Click **SQL Editor** in the left sidebar

### Run Migration Files

#### Migration 1: Create Tables and Indexes

1. Click **+ New Query**
2. Open `database-schema.sql` in VS Code
3. Copy the entire contents (Ctrl+A, Ctrl+C)
4. Paste into Supabase SQL Editor
5. Click **RUN** (bottom right)
6. Wait for "Success. No rows returned"

**Expected Result:** 15 tables created with indexes and triggers

#### Migration 2: Set Up Security Policies

1. Click **+ New Query** (new tab)
2. Open `database-rls-policies.sql` in VS Code
3. Copy the entire contents
4. Paste into Supabase SQL Editor
5. Click **RUN**
6. Wait for "Success"

**Expected Result:** RLS enabled on all tables, policies created

### Verify Database Setup

Run this verification query:

```sql
-- Check tables created (should return 15)
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';

-- Check RLS enabled (all should be true)
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check policies created (should have 30+)
SELECT COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public';
```

✅ **Database is ready when you see:**
- 15 tables
- All have `rowsecurity = true`
- 30+ policies created

---

## Step 2: Configure Clerk JWT Template (10 minutes)

### Create Supabase JWT Template

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application: **inviting-frog-50**
3. Click **JWT Templates** in the left sidebar
4. Click **+ New template**
5. Select **Supabase** from the integrations list
6. Name: `supabase` (exactly this name)
7. Click **Create**

### Configure Token Claims

In the template editor, ensure it includes these claims:

```json
{
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "org_id": "{{user.organization_memberships[0].organization.id}}",
  "role": "authenticated"
}
```

### Set Issuer

1. Find **Issuer (iss)** field
2. Set to: `https://inviting-frog-50.clerk.accounts.dev`
3. Set **Lifetime** to: `3600` (1 hour)
4. Click **Apply Changes**

✅ **JWT Template is ready**

---

## Step 3: Set Up Webhook (10 minutes)

### Create Webhook Endpoint

1. Still in Clerk Dashboard
2. Click **Webhooks** in the left sidebar
3. Click **+ Add Endpoint**

### For Local Testing (Development):

1. Install ngrok: `npm install -g ngrok`
2. In one terminal: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Webhook URL: `https://abc123.ngrok.io/api/webhooks/clerk`

### For Production:

Webhook URL: `https://508ministry.com/api/webhooks/clerk`

### Subscribe to Events

Select these events:
- ✅ `user.created`
- ✅ `user.updated`
- ✅ `user.deleted`
- ✅ `organization.created`
- ✅ `organizationMembership.created`

Click **Create**

### Get Webhook Secret

1. Click on the webhook you just created
2. Find **Signing Secret** section
3. Click **Reveal**
4. Copy the secret (starts with `whsec_`)
5. Update `.env.local`:

```env
CLERK_WEBHOOK_SECRET=whsec_paste_your_actual_secret_here
```

✅ **Webhook is configured**

---

## Step 4: Test the Complete Flow (15 minutes)

### Test User Signup

1. Go to Clerk Dashboard → **Users**
2. Click **+ Create User**
3. Fill in test details:
   - Email: `test@ministry.com`
   - First Name: `Test`
   - Last Name: `User`
4. Click **Create**

### Verify Webhook Fired

1. In Clerk Dashboard → **Webhooks**
2. Click your webhook endpoint
3. Click **Logs** tab
4. You should see `user.created` event with **200 status**

### Check Database Records Created

Go to Supabase SQL Editor and run:

```sql
-- Check organization created
SELECT * FROM organizations
ORDER BY created_at DESC
LIMIT 1;

-- Check user created
SELECT * FROM users
ORDER BY created_at DESC
LIMIT 1;

-- Check dashboard config created
SELECT * FROM dashboard_configs
ORDER BY created_at DESC
LIMIT 1;

-- Check default compliance items created
SELECT * FROM compliance_items
ORDER BY created_at DESC
LIMIT 3;

-- Check notification settings created
SELECT * FROM notification_settings
ORDER BY created_at DESC
LIMIT 1;
```

✅ **Expected Results:**
- 1 organization with trial period set
- 1 user with role='owner'
- 1 dashboard config
- 3 compliance items
- 1 notification settings record

### Test Dashboard Access

1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000`
3. You should be redirected to `/sign-in`
4. Sign in with the test user you created
5. You should see the dashboard

✅ **Authentication is working**

---

## Step 5: Test Multi-Tenant Isolation (10 minutes)

### Create Second Test User

1. In Clerk Dashboard, create another user
2. Check that new organization is created
3. Sign out and sign in as second user

### Verify Data Isolation

In Supabase SQL Editor:

```sql
-- Should see 2 organizations
SELECT clerk_org_id, name FROM organizations;

-- Each user should only see their own org's data
-- This is enforced by RLS policies
```

Try to query from dashboard as each user - they should only see their own data.

✅ **Multi-tenant isolation is working**

---

## Troubleshooting

### Webhook Returns 400 Error

**Check:**
- `.env.local` has correct `CLERK_WEBHOOK_SECRET`
- Webhook URL is accessible (ngrok running for local dev)
- Headers are being sent correctly

**Fix:**
```bash
# Restart ngrok and update webhook URL in Clerk
ngrok http 3000
```

### Database Records Not Created

**Check:**
- Webhook logs show 200 status
- Server logs for errors: `npm run dev` output
- Supabase service role key is correct in `.env.local`

**Test webhook manually:**
```bash
# In Clerk Dashboard → Webhooks → Your Endpoint → Testing
# Click "Send Example" for user.created event
```

### RLS Errors

**Check:**
- JWT template name is exactly `supabase`
- Template includes all required claims
- Issuer matches Clerk Frontend API URL

**Test token:**
```typescript
// In browser console after login
const token = await window.Clerk.session.getToken({ template: 'supabase' })
console.log(token)
```

---

## Next Steps After Testing

Once Steps 1-5 are complete and working:

1. ✅ Database deployed with RLS
2. ✅ JWT template configured
3. ✅ Webhook creating records
4. ✅ Users can sign up and access dashboard
5. ✅ Data isolation verified

**Then proceed to:**
- Integrate your landing page with Clerk signup
- Migrate dashboard from localStorage to database
- Build document upload system
- Implement compliance scoring
- Add email notifications

---

## Common Commands

```bash
# Start development server
npm run dev

# Start ngrok tunnel
ngrok http 3000

# Build for production
npm run build

# Run production build locally
npm start

# Check for TypeScript errors
npm run build
```

---

## Support Files Reference

- `database-schema.sql` - Database structure
- `database-rls-policies.sql` - Security policies
- `DATABASE-SETUP.md` - Detailed database guide
- `WEBHOOK-SETUP.md` - Webhook configuration details
- `CLERK-SUPABASE-JWT-SETUP.md` - JWT integration details
- `IMPLEMENTATION-ROADMAP.md` - Full implementation plan

---

## Environment Variables Checklist

Ensure these are set in `.env.local`:

```env
✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
✅ CLERK_SECRET_KEY
✅ CLERK_WEBHOOK_SECRET (get from Clerk after creating webhook)
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ ANTHROPIC_API_KEY
✅ SMTP credentials
```

---

## Success Indicators

You know everything is working when:

1. ✅ Database tables are created (15 total)
2. ✅ RLS policies are active (30+ policies)
3. ✅ Clerk can create users
4. ✅ Webhook fires on user creation
5. ✅ Database records are created automatically
6. ✅ Users can sign in and access dashboard
7. ✅ Each user only sees their own organization's data
8. ✅ Trial period is set correctly (14 days)

**You're ready to go live!** 🚀
