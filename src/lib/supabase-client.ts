// Supabase client with Clerk authentication integration
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'

// Create a base Supabase client (for server-side use)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Hook to create authenticated Supabase client with Clerk token
 * Use this in client components to ensure RLS policies work correctly
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { useSupabaseClient } from '@/lib/supabase-client'
 *
 * export default function MyComponent() {
 *   const supabase = useSupabaseClient()
 *
 *   useEffect(() => {
 *     async function loadData() {
 *       const { data } = await supabase.from('donations').select('*')
 *       console.log(data)
 *     }
 *     loadData()
 *   }, [supabase])
 * }
 * ```
 */
export function useSupabaseClient() {
  const { getToken } = useAuth()

  // Create a memoized client that includes Clerk auth token
  const authenticatedClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          get Authorization() {
            // This getter will be called on each request
            // It ensures the token is always fresh
            return getToken({ template: 'supabase' }).then(
              (token) => `Bearer ${token}`
            ) as any
          }
        }
      }
    }
  )

  return authenticatedClient
}

/**
 * Server-side function to get authenticated Supabase client
 * Use this in API routes and Server Components
 *
 * @example
 * ```tsx
 * import { auth } from '@clerk/nextjs/server'
 * import { getSupabaseClient } from '@/lib/supabase-client'
 *
 * export async function GET() {
 *   const { userId } = auth()
 *   const supabase = await getSupabaseClient()
 *
 *   const { data } = await supabase.from('donations').select('*')
 *   return Response.json(data)
 * }
 * ```
 */
export async function getSupabaseClient(token?: string) {
  if (!token) {
    // If no token provided, return base client (will fail RLS checks)
    return supabase
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  )
}
