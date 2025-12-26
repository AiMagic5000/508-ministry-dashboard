# Clerk + Supabase JWT Integration Setup

This guide explains how to configure Clerk to issue JWT tokens that Supabase can validate, enabling Row Level Security policies to work correctly.

## Why This Is Needed

- **Clerk** handles user authentication
- **Supabase** handles data storage with Row Level Security (RLS)
- **RLS policies** need to identify which user is making the request
- **JWT tokens** from Clerk must include user/org info that Supabase can read

## Step-by-Step Setup

### Step 1: Create Supabase JWT Template in Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **JWT Templates** in the left sidebar
4. Click **+ New template**
5. Select **Supabase** from the list of integrations
6. Name it: `supabase`
7. Click **Create**

### Step 2: Configure JWT Claims

The template should include these claims:

```json
{
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "org_id": "{{user.organization_memberships[0].organization.id}}",
  "role": "authenticated"
}
```

Explanation:
- `sub` - Clerk user ID (used in RLS helper function `get_user_organization_id()`)
- `email` - User's email address
- `org_id` - Clerk organization ID
- `role` - Must be "authenticated" for Supabase RLS

### Step 3: Set JWT Issuer and Audience

In the template settings:

1. **Issuer**: `https://your-clerk-frontend-api.clerk.accounts.dev`
   - Find this in Clerk Dashboard → **API Keys** → **Frontend API**
   - Example: `https://inviting-frog-50.clerk.accounts.dev`

2. **Audience**: Leave blank or set to your app domain
   - Example: `508ministry.com`

3. **Lifetime**: 3600 (1 hour)

4. Click **Save**

### Step 4: Configure Supabase to Accept Clerk JWTs

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or use your self-hosted Cognabase instance)
3. Go to **Settings** → **Auth**
4. Scroll to **JWT Settings**
5. Set **JWT Secret** to match Clerk's signing secret:

   **For Clerk:**
   - Go to Clerk Dashboard → **API Keys**
   - Copy the **JWT Verification Key** (PEM format)
   - Convert to base64 if needed

   **For Supabase:**
   - Paste the key in **JWT Secret** field
   - Or keep the default and configure Clerk to use Supabase's secret

6. Click **Save**

### Step 5: Test JWT Token Generation

Test that Clerk is generating tokens correctly:

```typescript
// In a client component
import { useAuth } from '@clerk/nextjs'

export default function TestComponent() {
  const { getToken } = useAuth()

  async function testToken() {
    const token = await getToken({ template: 'supabase' })
    console.log('Token:', token)

    // Decode to verify claims (using jwt-decode library)
    const decoded = jwtDecode(token)
    console.log('Decoded:', decoded)
    // Should show: { sub, email, org_id, role: 'authenticated' }
  }

  return <button onClick={testToken}>Test Token</button>
}
```

### Step 6: Update Supabase Client to Use Clerk Tokens

The new `src/lib/supabase-client.ts` file already handles this:

```typescript
import { useSupabaseClient } from '@/lib/supabase-client'

export default function MyComponent() {
  const supabase = useSupabaseClient() // Automatically includes Clerk token

  async function fetchData() {
    const { data } = await supabase.from('donations').select('*')
    // RLS policies will automatically filter to user's organization
  }
}
```

## How It Works

### Client-Side Flow

1. User logs in via Clerk
2. Clerk stores session in cookies
3. Component calls `useSupabaseClient()`
4. Hook calls `getToken({ template: 'supabase' })`
5. Clerk generates JWT with user/org info
6. Supabase client includes token in Authorization header
7. Supabase validates token and extracts claims
8. RLS policies use `auth.jwt()->>'sub'` to identify user
9. Helper function `get_user_organization_id()` looks up user's org
10. Query results filtered to user's organization only

### Server-Side Flow (API Routes)

```typescript
import { auth } from '@clerk/nextjs/server'
import { getSupabaseClient } from '@/lib/supabase-client'

export async function GET() {
  const { getToken } = auth()
  const token = await getToken({ template: 'supabase' })
  const supabase = await getSupabaseClient(token)

  const { data } = await supabase.from('donations').select('*')
  return Response.json(data)
}
```

## Troubleshooting

### "JWT expired" Error

**Issue**: Token lifetime too short

**Solution**:
- Increase lifetime in Clerk JWT template to 3600 (1 hour)
- Tokens auto-refresh in `useSupabaseClient()` hook

### "Invalid JWT" Error

**Issue**: Supabase can't verify Clerk's signature

**Solution**:
- Verify JWT template name is exactly `supabase`
- Check issuer matches Clerk's Frontend API URL
- Ensure JWT secret/verification key is configured correctly

### RLS Policies Not Working

**Issue**: Policies can't find user's organization

**Solution**:
```sql
-- Test the helper function
SELECT get_user_organization_id();
-- Should return a UUID

-- Check if user exists
SELECT * FROM users WHERE clerk_user_id = auth.jwt()->>'sub';
-- Should return user record

-- Verify organization link
SELECT u.clerk_user_id, u.organization_id, o.clerk_org_id
FROM users u
JOIN organizations o ON u.organization_id = o.id
WHERE u.clerk_user_id = auth.jwt()->>'sub';
```

### "role claim missing" Error

**Issue**: JWT doesn't include required `role` claim

**Solution**:
- Add `"role": "authenticated"` to JWT template claims
- Supabase requires this claim to identify authenticated users

## Testing the Integration

### 1. Test Token Generation

```bash
# In browser console after logging in
const { getToken } = window.Clerk.session
const token = await getToken({ template: 'supabase' })
console.log(token)
```

### 2. Test Supabase Query

```typescript
const supabase = useSupabaseClient()

// This should only return the user's org data
const { data, error } = await supabase
  .from('organizations')
  .select('*')

console.log(data) // Should see 1 organization
console.log(error) // Should be null
```

### 3. Test RLS Isolation

```typescript
// Try to access another org's data (should fail)
const supabase = useSupabaseClient()

const { data, error } = await supabase
  .from('organizations')
  .select('*')
  .eq('id', 'some-other-org-uuid')

console.log(data) // Should be empty []
console.log(error) // Might show RLS violation
```

## Security Checklist

- [ ] JWT template name is exactly `supabase`
- [ ] Template includes `sub`, `email`, `org_id`, `role` claims
- [ ] Token lifetime is appropriate (3600 seconds recommended)
- [ ] Supabase JWT secret matches Clerk verification key
- [ ] RLS is enabled on all tables
- [ ] Helper functions use `auth.jwt()->>'sub'`
- [ ] Webhook uses service role key (bypasses RLS)
- [ ] Client code uses `useSupabaseClient()` hook
- [ ] Server code uses `getSupabaseClient(token)`

## Production Considerations

### Token Refresh

Clerk automatically refreshes tokens:
- Tokens expire after configured lifetime
- `getToken()` automatically gets fresh token if expired
- No manual refresh needed

### Rate Limiting

Supabase has rate limits:
- Anonymous key: Limited requests per second
- Consider implementing client-side caching
- Use React Query or SWR for data fetching

### Error Handling

Always handle RLS errors gracefully:

```typescript
const { data, error } = await supabase.from('donations').select('*')

if (error) {
  if (error.code === 'PGRST301') {
    // RLS policy violation
    console.error('Access denied')
  } else {
    console.error('Database error:', error)
  }
}
```

## Next Steps

After JWT integration is working:

1. ✅ Clerk generates Supabase-compatible tokens
2. ✅ Supabase validates tokens
3. ✅ RLS policies enforce organization isolation
4. ⏭️ Migrate localStorage data to database
5. ⏭️ Update all dashboard pages to use database
6. ⏭️ Test multi-tenant isolation
7. ⏭️ Deploy to production

## Resources

- [Clerk JWT Templates](https://clerk.com/docs/backend-requests/jwt-templates)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Clerk + Supabase Integration](https://clerk.com/docs/integrations/databases/supabase)
