# Clerk Webhook Setup Guide

This guide explains how to configure Clerk webhooks to automatically create database records when users sign up through your landing page.

## What the Webhook Does

When a user completes payment on your landing page and creates a Clerk account, the webhook automatically:

1. **Creates Organization Record** - Sets up the ministry's organization in the database
2. **Creates User Record** - Links the Clerk user to the organization with 'owner' role
3. **Sets Up Trial Period** - Configures 14-day free trial with expiration date
4. **Creates Dashboard Config** - Initializes default dashboard settings
5. **Creates Notification Settings** - Sets up user notification preferences
6. **Creates Default Compliance Items** - Adds initial compliance tasks for new ministries
7. **Logs Activity** - Records the signup event in the activity log

## Setup Instructions

### Step 1: Get Your Webhook Endpoint URL

Your webhook is located at:
```
https://your-domain.com/api/webhooks/clerk
```

For local development:
```
http://localhost:3000/api/webhooks/clerk
```

### Step 2: Set Up Ngrok (for Local Testing)

If testing locally, you need to expose your localhost to the internet:

```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js dev server
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Ngrok will give you a URL like: https://abc123.ngrok.io
# Your webhook URL becomes: https://abc123.ngrok.io/api/webhooks/clerk
```

### Step 3: Configure Webhook in Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Click **Webhooks** in the left sidebar
4. Click **+ Add Endpoint**
5. Enter your webhook URL:
   - Production: `https://508ministry.com/api/webhooks/clerk`
   - Development: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
6. Click **Subscribe to events**
7. Select the following events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
   - ✅ `organization.created`
   - ✅ `organizationMembership.created`
8. Click **Create**

### Step 4: Get Your Webhook Secret

After creating the webhook:

1. Click on the webhook you just created
2. Click **Signing Secret** section
3. Click **Reveal** to see the secret
4. Copy the secret (starts with `whsec_`)
5. Add it to your `.env.local` file:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_your_actual_secret_here
   ```

### Step 5: Verify Setup

Test the webhook:

1. Create a new test user in Clerk Dashboard:
   - Go to **Users** in Clerk Dashboard
   - Click **+ Create User**
   - Fill in test details
   - Click **Create**

2. Check webhook delivery:
   - Go to **Webhooks** in Clerk Dashboard
   - Click your webhook endpoint
   - Click **Logs** tab
   - You should see the `user.created` event with status 200

3. Verify database records:
   ```sql
   -- Check in Supabase SQL Editor
   SELECT * FROM organizations ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM users ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM dashboard_configs ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM compliance_items ORDER BY created_at DESC LIMIT 3;
   ```

## Webhook Events Handled

### `user.created`
Triggered when a new user signs up.

**Actions:**
- Creates new organization with `clerk_org_id`
- Creates user record with role='owner'
- Sets 14-day trial period
- Creates default dashboard config
- Creates notification settings
- Adds 3 default compliance items
- Logs signup event

**Database Tables Updated:**
- `organizations` - 1 record
- `users` - 1 record
- `dashboard_configs` - 1 record
- `notification_settings` - 1 record
- `compliance_items` - 3 records
- `activity_log` - 1 record

### `user.updated`
Triggered when user profile is updated.

**Actions:**
- Updates user's email and name in database

**Database Tables Updated:**
- `users` - Updated

### `user.deleted`
Triggered when user is deleted from Clerk.

**Actions:**
- Sets `is_active = false` instead of deleting (soft delete)
- Preserves all historical data

**Database Tables Updated:**
- `users` - Updated

### `organization.created`
Triggered when organization is created in Clerk.

**Actions:**
- Creates organization record
- Creates default dashboard config

**Database Tables Updated:**
- `organizations` - 1 record
- `dashboard_configs` - 1 record

### `organizationMembership.created`
Triggered when user is invited to join existing organization.

**Actions:**
- Creates user record if new
- Links user to organization
- Sets role='member' for invited users

**Database Tables Updated:**
- `users` - 1 record (new or updated)
- `notification_settings` - 1 record (if new user)

## Default Compliance Items Created

New organizations get these starter compliance items:

1. **Set up Board of Trustees** (Urgent, 7 days)
   - Category: Governance
   - Points: 25
   - Description: Establish minimum 3 trustees

2. **Document Mission Statement** (High, 14 days)
   - Category: Governance
   - Points: 15
   - Description: Create mission and statement of faith

3. **Set up Donation Tracking** (High, 14 days)
   - Category: Financial
   - Points: 20
   - Description: Implement donation receipt system

## Environment Variables Required

Make sure these are set in your `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://supabasekong-wo4k0wck8cg84c04gcc008sw.72.60.119.182.sslip.io
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## Landing Page Integration

Your landing page should:

1. **Collect Payment** via Polar.sh
2. **Redirect to Clerk Sign-Up** after successful payment
3. **Clerk Creates User Account**
4. **Webhook Fires** → Creates database records automatically
5. **User Redirects to Dashboard** → They see their new ministry dashboard

### Example Landing Page Flow

```javascript
// After successful Polar.sh payment
const handlePaymentSuccess = async (sessionId) => {
  // Redirect to Clerk sign-up with metadata
  window.location.href = '/sign-up?plan=pro&session=' + sessionId
}
```

### Clerk Sign-Up Configuration

In your Clerk Dashboard → User & Authentication → Email, Phone, Username:
- Enable Email
- Disable Phone (unless needed)
- Collect first name and last name

After signup → Redirects to `/dashboard` (set in `.env.local`)

## Troubleshooting

### Webhook Returns 400 Error

**Issue:** Missing or invalid Svix headers

**Solution:**
- Verify `CLERK_WEBHOOK_SECRET` is correct
- Check webhook configuration in Clerk Dashboard
- Ensure endpoint URL is accessible

### Database Records Not Created

**Issue:** RLS policies blocking inserts

**Solution:**
- Webhook uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS
- Verify service role key is correct
- Check Supabase logs for errors

### User Created But No Organization

**Issue:** Webhook didn't create organization

**Solution:**
- Check webhook logs in Clerk Dashboard
- Verify webhook handled `user.created` event
- Check server logs: `console.log` statements in webhook handler

### Trial Period Not Set Correctly

**Issue:** `trial_ends_at` is null or wrong

**Solution:**
```typescript
// Should be 14 days from signup
trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
```

Check in Supabase:
```sql
SELECT
  name,
  subscription_tier,
  trial_ends_at,
  EXTRACT(DAY FROM (trial_ends_at - created_at)) as trial_days
FROM organizations
WHERE subscription_tier = 'trial';
```

## Testing Checklist

Before going to production:

- [ ] Webhook endpoint is accessible (test with curl)
- [ ] `CLERK_WEBHOOK_SECRET` is set correctly
- [ ] Supabase service role key has full permissions
- [ ] Database schema is deployed
- [ ] RLS policies are enabled
- [ ] Test user signup creates all expected records
- [ ] Trial period is set to 14 days
- [ ] Default compliance items are created
- [ ] Activity log records signup event
- [ ] User can access dashboard after signup
- [ ] User only sees their own organization's data

## Production Deployment

1. Deploy database schema to production Supabase
2. Deploy Next.js app to production (Vercel recommended)
3. Update webhook URL in Clerk to production domain
4. Update `.env` variables in production
5. Test with real signup flow
6. Monitor webhook logs in Clerk Dashboard

## Security Notes

- **Never commit** `.env.local` to git
- **Service role key** bypasses RLS - only use in webhook/server code
- **Webhook secret** validates requests are from Clerk
- **Soft delete** preserves data when users are deleted
- **Activity log** provides audit trail of all actions

## Support

If webhooks aren't working:
1. Check Clerk webhook logs
2. Check Vercel/hosting logs
3. Check Supabase logs
4. Test endpoint with curl
5. Verify environment variables

## Next Steps

After webhook is working:
1. ✅ Users can sign up and get database records
2. ⏭️ Update Supabase client to use Clerk auth tokens
3. ⏭️ Migrate localStorage data to database
4. ⏭️ Test multi-tenant isolation
5. ⏭️ Implement payment tier upgrades
6. ⏭️ Build document upload system
