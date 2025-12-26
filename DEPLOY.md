# Complete Deployment Guide - 508 Ministry Dashboard

This guide will walk you through deploying the application from scratch to production.

## Prerequisites Checklist

- [ ] Coolify instance running
- [ ] GitHub account
- [ ] Cognabase Supabase instance accessible
- [ ] Clerk account configured
- [ ] Domain name ready (508ministry.com)

---

## PHASE 1: Database Setup (20 minutes)

### Step 1.1: Access Supabase

1. Go to: `http://supabasekong-wo4k0wck8cg84c04gcc008sw.72.60.119.182.sslip.io`
2. Log into Supabase Studio
3. Click **SQL Editor** in sidebar

### Step 1.2: Run Schema Migration

1. Click **+ New Query**
2. Copy entire contents of `database-schema.sql`
3. Paste into SQL Editor
4. Click **RUN**
5. Wait for "Success. No rows returned"

### Step 1.3: Run RLS Policies

1. Click **+ New Query** (new tab)
2. Copy entire contents of `database-rls-policies.sql`
3. Paste into SQL Editor
4. Click **RUN**
5. Wait for "Success"

### Step 1.4: Verify Database

Run this verification query:

```sql
-- Should return 15
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- All should be true
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' ORDER BY tablename;
```

✅ **Phase 1 Complete:** Database is ready

---

## PHASE 2: Git Repository Setup (10 minutes)

### Step 2.1: Initialize Git

```bash
cd "C:\Users\flowc\Documents\508 ministry dot com prior to edit 12-25-25"

# Initialize repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: 508 Ministry Dashboard"
```

### Step 2.2: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click **+ New repository**
3. Repository name: `508-ministry-dashboard`
4. Description: `508(c)(1)(A) Ministry Management Dashboard`
5. Privacy: **Private** (recommended)
6. **Do NOT** initialize with README
7. Click **Create repository**

### Step 2.3: Push to GitHub

GitHub will show you commands. Run these:

```bash
git remote add origin https://github.com/YOUR_USERNAME/508-ministry-dashboard.git
git branch -M main
git push -u origin main
```

✅ **Phase 2 Complete:** Code is on GitHub

---

## PHASE 3: Coolify Deployment (30 minutes)

### Step 3.1: Create New Resource

1. Open Coolify dashboard
2. Click **+ New Resource**
3. Select **Application**
4. Select **Git Repository**

### Step 3.2: Connect Repository

1. Click **GitHub**
2. Authorize Coolify to access GitHub (if first time)
3. Select `508-ministry-dashboard` repository
4. Branch: `main`
5. Click **Continue**

### Step 3.3: Configure Build

1. **Build Pack**: Dockerfile
2. **Dockerfile Location**: `/Dockerfile`
3. **Publish Directory**: Leave empty
4. **Port**: `3000`
5. **Health Check Path**: `/`
6. Click **Save**

### Step 3.4: Add Environment Variables

Click **Environment Variables** tab and add these (copy from `.env.local`):

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_aW52aXRpbmctZnJvZy01MC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_BtDewUWTu0kEufaWaWeXAnX47YG6tSlgPJou1AteOU
CLERK_WEBHOOK_SECRET=whsec_PLACEHOLDER_UPDATE_AFTER_WEBHOOK_SETUP

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://supabasekong-wo4k0wck8cg84c04gcc008sw.72.60.119.182.sslip.io
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NjY2MzQ2MCwiZXhwIjo0OTIyMzM3MDYwLCJyb2xlIjoiYW5vbiJ9.fLfOPCCOzy_GCLEodievfvuLJlqGjmVUvYwlsdeoGjI
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NjY2MzQ2MCwiZXhwIjo0OTIyMzM3MDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.7gWbmyxKPkqxziU-N-tsEFB6E6wHUpbAwq4F1Uzo1EY

# Anthropic Claude API
ANTHROPIC_API_KEY=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

# Polar.sh Payments
POLAR_ACCESS_TOKEN=your_polar_access_token_here
NEXT_PUBLIC_POLAR_CHECKOUT_URL=https://buy.polar.sh/polar_cl_CducjBA5CFUyaS1dcA5b8iqPdDS7rvAvZUffm3RQcEk

# Email (SMTP)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=outreach@508ministry.com
SMTP_PASSWORD=Thepassword#123
SMTP_FROM=outreach@508ministry.com

# Application
NEXT_PUBLIC_APP_URL=https://YOUR_COOLIFY_DOMAIN
TRIAL_DAYS=14
```

**Important:** Replace `YOUR_COOLIFY_DOMAIN` with the actual domain Coolify assigns

### Step 3.5: Configure Domain

1. Click **Domains** tab
2. Add your custom domain: `508ministry.com`
3. Coolify will provide DNS records to add
4. Go to your DNS provider and add records:
   - Type: A or CNAME (as instructed)
   - Name: @ or specified subdomain
   - Value: Coolify server IP or domain
5. Click **Check DNS** in Coolify
6. Enable **SSL Certificate** (automatic Let's Encrypt)

### Step 3.6: Deploy

1. Click **Deploy** button
2. Watch build logs
3. Wait for deployment to complete (5-10 minutes)
4. You'll see "Deployment successful"

✅ **Phase 3 Complete:** Application deployed to Coolify

---

## PHASE 4: Clerk Configuration (20 minutes)

### Step 4.1: Update Clerk URLs

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select **inviting-frog-50** application
3. Go to **Paths** in sidebar
4. Update URLs:
   - **Home URL**: `https://508ministry.com`
   - **Sign-in URL**: `https://508ministry.com/sign-in`
   - **Sign-up URL**: `https://508ministry.com/sign-up`
   - **After sign-in URL**: `https://508ministry.com/dashboard`
   - **After sign-up URL**: `https://508ministry.com/dashboard`
5. Click **Save**

### Step 4.2: Create JWT Template

1. Click **JWT Templates** in sidebar
2. Click **+ New template**
3. Select **Supabase** from integrations
4. Name: `supabase` (exactly this)
5. Ensure claims include:
   ```json
   {
     "sub": "{{user.id}}",
     "email": "{{user.primary_email_address}}",
     "org_id": "{{user.organization_memberships[0].organization.id}}",
     "role": "authenticated"
   }
   ```
6. Set **Issuer**: `https://inviting-frog-50.clerk.accounts.dev`
7. Set **Lifetime**: `3600` (1 hour)
8. Click **Apply Changes**

### Step 4.3: Set Up Webhook

1. Click **Webhooks** in sidebar
2. Click **+ Add Endpoint**
3. **Endpoint URL**: `https://508ministry.com/api/webhooks/clerk`
4. Subscribe to events:
   - ✅ user.created
   - ✅ user.updated
   - ✅ user.deleted
   - ✅ organization.created
   - ✅ organizationMembership.created
5. Click **Create**
6. Click on the webhook you just created
7. Click **Signing Secret** → **Reveal**
8. Copy the secret (starts with `whsec_`)

### Step 4.4: Update Webhook Secret

1. Go back to Coolify
2. Navigate to your application
3. Click **Environment Variables**
4. Find `CLERK_WEBHOOK_SECRET`
5. Update value with the actual secret
6. Click **Save**
7. Click **Redeploy** to restart with new env var

✅ **Phase 4 Complete:** Clerk fully configured

---

## PHASE 5: Test Deployment (15 minutes)

### Step 5.1: Test Homepage

1. Go to `https://508ministry.com`
2. Should redirect to `/sign-in`
3. Sign-in page should load with Clerk UI

### Step 5.2: Create Test User

1. In Clerk Dashboard → **Users**
2. Click **+ Create User**
3. Email: `test@ministry.com`
4. First Name: `Test`
5. Last Name: `Ministry`
6. Click **Create**

### Step 5.3: Verify Webhook

1. Go to Clerk Dashboard → **Webhooks**
2. Click your webhook
3. Click **Logs** tab
4. Should see `user.created` with status **200**

### Step 5.4: Verify Database Records

In Supabase SQL Editor:

```sql
-- Should see 1 organization
SELECT clerk_org_id, name, subscription_tier, trial_ends_at
FROM organizations
ORDER BY created_at DESC
LIMIT 1;

-- Should see 1 user with role='owner'
SELECT clerk_user_id, email, full_name, role
FROM users
ORDER BY created_at DESC
LIMIT 1;

-- Should see 3 compliance items
SELECT title, category, priority
FROM compliance_items
ORDER BY created_at DESC
LIMIT 3;
```

### Step 5.5: Test Login

1. Go to `https://508ministry.com/sign-in`
2. Sign in with test user credentials
3. Should redirect to `/dashboard`
4. Dashboard should load with default data

✅ **Phase 5 Complete:** Everything working!

---

## PHASE 6: Connect Landing Page (10 minutes)

### Step 6.1: Update Landing Page Redirect

In your landing page code, after successful Polar.sh payment:

```javascript
// Redirect to Clerk sign-up
window.location.href = 'https://508ministry.com/sign-up?plan=pro'
```

### Step 6.2: Test Payment Flow

1. Go to your landing page
2. Complete a test payment
3. Should redirect to Clerk sign-up
4. Create account
5. Webhook fires → Database records created
6. Redirects to dashboard
7. User sees their personalized ministry dashboard

✅ **Phase 6 Complete:** Full flow working!

---

## Post-Deployment Checklist

- [ ] Database tables created (15 total)
- [ ] RLS policies active (30+ policies)
- [ ] Application deployed to Coolify
- [ ] Custom domain configured with SSL
- [ ] Clerk URLs updated to production
- [ ] JWT template created and configured
- [ ] Webhook endpoint configured
- [ ] Webhook secret added to environment
- [ ] Test user can sign up
- [ ] Database records created automatically
- [ ] User can access dashboard
- [ ] Landing page redirects to Clerk
- [ ] Full payment flow tested

---

## Monitoring & Maintenance

### Check Application Logs

In Coolify:
1. Go to your application
2. Click **Logs** tab
3. Monitor for errors

### Check Webhook Logs

In Clerk Dashboard:
1. Go to **Webhooks**
2. Click your endpoint
3. Review **Logs** tab
4. All should show 200 status

### Check Database Health

In Supabase:
```sql
-- Count users
SELECT COUNT(*) FROM users;

-- Count organizations
SELECT COUNT(*) FROM organizations;

-- Check trial periods
SELECT name, trial_ends_at,
  EXTRACT(DAY FROM (trial_ends_at - NOW())) as days_remaining
FROM organizations
WHERE subscription_tier = 'trial';
```

### Backup Database

In Supabase:
1. Go to **Database** → **Backups**
2. Click **Create Backup**
3. Schedule automatic backups (recommended: daily)

---

## Troubleshooting

### Build Fails in Coolify

**Check:**
- Docker file is correct
- `next.config.js` has `output: 'standalone'`
- All dependencies in `package.json`

**Fix:**
```bash
# Test build locally
npm run build

# If successful, commit and push
git add .
git commit -m "Fix build"
git push
```

### Application Won't Start

**Check:**
- Port 3000 is exposed in Dockerfile
- Environment variables are set
- Logs show specific error

**Fix:**
- Review Coolify logs
- Ensure all required env vars present

### Webhook Returns 400

**Check:**
- Webhook URL is accessible
- `CLERK_WEBHOOK_SECRET` matches Clerk
- Application is running

**Test:**
```bash
# Test endpoint
curl https://508ministry.com/api/webhooks/clerk
# Should return "Error: Missing svix headers" (expected)
```

### Database Connection Error

**Check:**
- Supabase URL is correct
- Anon key is correct
- Service role key is correct

**Test in SQL Editor:**
```sql
-- Test connection
SELECT NOW();
```

---

## Rollback Plan

If deployment fails:

1. **Revert in Coolify:**
   - Go to **Deployments** tab
   - Click previous successful deployment
   - Click **Redeploy**

2. **Revert in Git:**
   ```bash
   git revert HEAD
   git push
   ```

3. **Check Logs:**
   - Coolify deployment logs
   - Application logs
   - Clerk webhook logs
   - Supabase logs

---

## Success Indicators

You know deployment is successful when:

1. ✅ `https://508ministry.com` loads
2. ✅ Redirects to sign-in page
3. ✅ Clerk authentication works
4. ✅ New users create database records
5. ✅ Users can access dashboard
6. ✅ Each user sees only their data
7. ✅ SSL certificate is active
8. ✅ All 15 dashboard tabs load
9. ✅ No errors in logs
10. ✅ Landing page payment flow works

**You're live!** 🚀

---

## Next Steps After Deployment

1. Monitor for 24 hours
2. Create admin user for yourself
3. Test all dashboard features
4. Set up monitoring/alerts
5. Plan marketing launch
6. Prepare customer support

## Support

If you encounter issues:
1. Check Coolify logs
2. Check Clerk webhook logs
3. Check Supabase logs
4. Review this guide
5. Check environment variables
