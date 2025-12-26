# 508 Ministry Dashboard - Deployment Checklist

Use this checklist to ensure you complete all deployment steps correctly.

## Pre-Deployment Preparation

### Files Created ✅
- [x] Dockerfile
- [x] .gitignore
- [x] next.config.js updated with standalone output
- [x] deploy.bat (Windows)
- [x] deploy.sh (Linux/Mac)
- [x] DEPLOY.md (full guide)
- [x] All database migration files

### Required Access
- [ ] Coolify dashboard access
- [ ] GitHub account
- [ ] Cognabase Supabase admin access
- [ ] Clerk dashboard access
- [ ] Domain DNS control (508ministry.com)

---

## PHASE 1: Database Setup ⏱️ 20 minutes

### Supabase Access
- [ ] Logged into Cognabase Supabase
- [ ] SQL Editor opened

### Schema Migration
- [ ] Opened `database-schema.sql` in VS Code
- [ ] Copied entire file contents
- [ ] Pasted into Supabase SQL Editor
- [ ] Clicked RUN
- [ ] Saw "Success. No rows returned"
- [ ] Verified 15 tables created

### RLS Policies
- [ ] Opened `database-rls-policies.sql` in VS Code
- [ ] Copied entire file contents
- [ ] Pasted into new SQL Editor tab
- [ ] Clicked RUN
- [ ] Saw "Success"
- [ ] Verified RLS enabled on all tables

### Verification Query
- [ ] Ran table count query (should return 15)
- [ ] Ran RLS check query (all should be true)
- [ ] Ran policy count query (should be 30+)

**✅ Phase 1 Status:** [ ] Complete

---

## PHASE 2: Git Repository Setup ⏱️ 10 minutes

### Local Git Setup
- [ ] Opened terminal in project directory
- [ ] Ran `git init` (if not already initialized)
- [ ] Verified `.gitignore` exists
- [ ] Ran `git add .`
- [ ] Ran `git commit -m "Initial commit"`

### GitHub Repository
- [ ] Logged into GitHub
- [ ] Created new repository: `508-ministry-dashboard`
- [ ] Set repository to Private
- [ ] Did NOT initialize with README
- [ ] Copied repository URL

### Push to GitHub
- [ ] Ran `git remote add origin [URL]`
- [ ] Ran `git branch -M main`
- [ ] Ran `git push -u origin main`
- [ ] Verified code appears on GitHub

**Alternative:** [ ] Ran `deploy.bat` script (automates above)

**✅ Phase 2 Status:** [ ] Complete

---

## PHASE 3: Coolify Deployment ⏱️ 30 minutes

### Create Application
- [ ] Opened Coolify dashboard
- [ ] Clicked **+ New Resource**
- [ ] Selected **Application**
- [ ] Selected **Git Repository**

### Connect Repository
- [ ] Authorized GitHub (if first time)
- [ ] Selected `508-ministry-dashboard` repo
- [ ] Selected `main` branch
- [ ] Clicked Continue

### Build Configuration
- [ ] Build Pack set to: **Dockerfile**
- [ ] Dockerfile Location: `/Dockerfile`
- [ ] Port set to: **3000**
- [ ] Health Check Path: `/`
- [ ] Clicked Save

### Environment Variables
- [ ] Clicked **Environment Variables** tab
- [ ] Added all variables from `.env.local`:
  - [ ] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  - [ ] CLERK_SECRET_KEY
  - [ ] CLERK_WEBHOOK_SECRET (placeholder for now)
  - [ ] NEXT_PUBLIC_CLERK_SIGN_IN_URL
  - [ ] NEXT_PUBLIC_CLERK_SIGN_UP_URL
  - [ ] NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
  - [ ] NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] ANTHROPIC_API_KEY
  - [ ] POLAR_ACCESS_TOKEN
  - [ ] NEXT_PUBLIC_POLAR_CHECKOUT_URL
  - [ ] SMTP_HOST
  - [ ] SMTP_PORT
  - [ ] SMTP_USER
  - [ ] SMTP_PASSWORD
  - [ ] SMTP_FROM
  - [ ] NEXT_PUBLIC_APP_URL (set to Coolify domain)
  - [ ] TRIAL_DAYS

### Domain Configuration
- [ ] Clicked **Domains** tab
- [ ] Added custom domain: `508ministry.com`
- [ ] Noted DNS records to add
- [ ] Added DNS records at DNS provider
- [ ] Clicked **Check DNS**
- [ ] DNS verification passed
- [ ] Enabled **SSL Certificate**

### Initial Deployment
- [ ] Clicked **Deploy** button
- [ ] Watched build logs
- [ ] Build completed successfully
- [ ] Application started
- [ ] Noted the Coolify-assigned URL

**✅ Phase 3 Status:** [ ] Complete

---

## PHASE 4: Clerk Configuration ⏱️ 20 minutes

### Update URLs
- [ ] Logged into Clerk Dashboard
- [ ] Selected **inviting-frog-50** app
- [ ] Clicked **Paths** in sidebar
- [ ] Updated Home URL to: `https://508ministry.com`
- [ ] Updated Sign-in URL to: `https://508ministry.com/sign-in`
- [ ] Updated Sign-up URL to: `https://508ministry.com/sign-up`
- [ ] Updated After sign-in URL to: `https://508ministry.com/dashboard`
- [ ] Updated After sign-up URL to: `https://508ministry.com/dashboard`
- [ ] Clicked **Save**

### JWT Template
- [ ] Clicked **JWT Templates** in sidebar
- [ ] Clicked **+ New template**
- [ ] Selected **Supabase** integration
- [ ] Named it: `supabase` (exactly)
- [ ] Verified claims include:
  - [ ] `"sub": "{{user.id}}"`
  - [ ] `"email": "{{user.primary_email_address}}"`
  - [ ] `"org_id": "{{user.organization_memberships[0].organization.id}}"`
  - [ ] `"role": "authenticated"`
- [ ] Set Issuer: `https://inviting-frog-50.clerk.accounts.dev`
- [ ] Set Lifetime: `3600`
- [ ] Clicked **Apply Changes**

### Webhook Setup
- [ ] Clicked **Webhooks** in sidebar
- [ ] Clicked **+ Add Endpoint**
- [ ] Endpoint URL: `https://508ministry.com/api/webhooks/clerk`
- [ ] Selected events:
  - [ ] user.created
  - [ ] user.updated
  - [ ] user.deleted
  - [ ] organization.created
  - [ ] organizationMembership.created
- [ ] Clicked **Create**
- [ ] Clicked on newly created webhook
- [ ] Clicked **Signing Secret** → **Reveal**
- [ ] Copied webhook secret (starts with `whsec_`)

### Update Webhook Secret
- [ ] Went to Coolify dashboard
- [ ] Navigated to application
- [ ] Clicked **Environment Variables**
- [ ] Updated `CLERK_WEBHOOK_SECRET` with actual value
- [ ] Clicked **Save**
- [ ] Clicked **Redeploy**
- [ ] Waited for redeploy to complete

**✅ Phase 4 Status:** [ ] Complete

---

## PHASE 5: Testing ⏱️ 15 minutes

### Homepage Test
- [ ] Opened `https://508ministry.com` in browser
- [ ] Page loaded successfully
- [ ] Redirected to `/sign-in`
- [ ] Sign-in page shows Clerk UI

### Create Test User
- [ ] Went to Clerk Dashboard → **Users**
- [ ] Clicked **+ Create User**
- [ ] Entered test details:
  - Email: `test@ministry.com`
  - First Name: `Test`
  - Last Name: `Ministry`
- [ ] Clicked **Create**
- [ ] User created successfully

### Verify Webhook
- [ ] Went to Clerk Dashboard → **Webhooks**
- [ ] Clicked webhook endpoint
- [ ] Clicked **Logs** tab
- [ ] Saw `user.created` event
- [ ] Status shows **200**

### Verify Database
- [ ] Opened Supabase SQL Editor
- [ ] Ran organization query
- [ ] Found 1 organization with trial period set
- [ ] Ran user query
- [ ] Found 1 user with role='owner'
- [ ] Ran compliance items query
- [ ] Found 3 default compliance items
- [ ] Ran notification settings query
- [ ] Found 1 notification settings record

### Test Login
- [ ] Went to `https://508ministry.com/sign-in`
- [ ] Signed in with test user
- [ ] Redirected to `/dashboard`
- [ ] Dashboard loaded successfully
- [ ] Saw personalized header
- [ ] All dashboard tabs accessible
- [ ] No console errors

### Multi-Tenant Test
- [ ] Created second test user in Clerk
- [ ] Verified second organization created
- [ ] Logged in as second user
- [ ] Verified can only see own data
- [ ] Logged out and back in as first user
- [ ] Verified first user's data still isolated

**✅ Phase 5 Status:** [ ] Complete

---

## PHASE 6: Landing Page Integration ⏱️ 10 minutes

### Update Landing Page
- [ ] Opened landing page code
- [ ] Updated post-payment redirect to:
  ```javascript
  window.location.href = 'https://508ministry.com/sign-up?plan=pro'
  ```
- [ ] Deployed landing page changes
- [ ] Tested landing page loads

### Test Full Flow
- [ ] Went to landing page
- [ ] Completed test payment (if available)
- [ ] Redirected to Clerk sign-up
- [ ] Created new account
- [ ] Webhook fired (check logs)
- [ ] Database records created
- [ ] Redirected to dashboard
- [ ] Dashboard shows new user's data

**✅ Phase 6 Status:** [ ] Complete

---

## Post-Deployment Verification

### Application Health
- [ ] Application is accessible at 508ministry.com
- [ ] SSL certificate is active (https)
- [ ] All pages load without errors
- [ ] No console errors in browser
- [ ] Coolify shows application as healthy

### Authentication Flow
- [ ] Users can sign up
- [ ] Users can sign in
- [ ] Users can sign out
- [ ] Session persists across page refreshes
- [ ] Clerk UserButton works

### Database Integration
- [ ] New signups create org records
- [ ] New signups create user records
- [ ] Trial period set correctly (14 days)
- [ ] Default compliance items created
- [ ] Notification settings created
- [ ] Activity log records signup

### Security
- [ ] RLS policies active
- [ ] Users can only see own data
- [ ] JWT tokens validated
- [ ] Webhook signature verified
- [ ] No sensitive data in logs

### Performance
- [ ] Homepage loads < 2 seconds
- [ ] Dashboard loads < 3 seconds
- [ ] No slow queries
- [ ] Images load properly
- [ ] No memory leaks

**✅ Post-Deployment Status:** [ ] Complete

---

## Monitoring Setup

### Coolify Monitoring
- [ ] Enabled application monitoring
- [ ] Set up alert notifications
- [ ] Configured log retention

### Supabase Monitoring
- [ ] Enabled database monitoring
- [ ] Set up query performance tracking
- [ ] Configured automatic backups

### Clerk Monitoring
- [ ] Reviewed webhook logs
- [ ] Checked authentication metrics
- [ ] Verified no failed logins

**✅ Monitoring Status:** [ ] Complete

---

## Final Checklist

### Documentation
- [ ] DEPLOY.md reviewed
- [ ] QUICK-START.md available
- [ ] IMPLEMENTATION-ROADMAP.md complete
- [ ] All env vars documented

### Credentials Secured
- [ ] `.env.local` not in Git
- [ ] Secrets stored securely
- [ ] Service role key not exposed
- [ ] Webhook secret rotated if needed

### Backups
- [ ] Database backup created
- [ ] Code repository backed up
- [ ] Environment variables saved
- [ ] DNS records documented

### Team Access
- [ ] Coolify access granted (if team)
- [ ] GitHub access granted (if team)
- [ ] Clerk access granted (if team)
- [ ] Supabase access granted (if team)

**✅ Final Status:** [ ] Complete

---

## Go-Live Decision

All phases complete?
- [ ] Phase 1: Database Setup
- [ ] Phase 2: Git Repository
- [ ] Phase 3: Coolify Deployment
- [ ] Phase 4: Clerk Configuration
- [ ] Phase 5: Testing
- [ ] Phase 6: Landing Page Integration
- [ ] Post-Deployment Verification
- [ ] Monitoring Setup
- [ ] Final Checklist

### If ALL checked above:

**🎉 YOU ARE LIVE! 🎉**

Update landing page to production mode:
- [ ] Remove test mode flags
- [ ] Enable real payments
- [ ] Update copy to production
- [ ] Announce launch

---

## Rollback Plan (If Needed)

If critical issues found:
1. [ ] Pause new signups
2. [ ] Revert to previous Coolify deployment
3. [ ] Fix issues in development
4. [ ] Test fixes thoroughly
5. [ ] Redeploy when ready

---

## Support Contacts

- Coolify Issues: [Coolify Logs]
- Clerk Issues: Clerk Dashboard → Support
- Supabase Issues: Cognabase Support
- DNS Issues: Your DNS Provider
- Payment Issues: Polar.sh Support

---

**Date Started:** _______________
**Date Completed:** _______________
**Deployed By:** _______________
**Application URL:** https://508ministry.com
**Status:** [ ] Development [ ] Staging [ ] Production
