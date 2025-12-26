import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase admin client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Admin key with full access
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error: Verification failed', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, organization_memberships } = evt.data

    console.log('New user created:', id)

    try {
      // Get the user's email
      const primaryEmail = email_addresses.find(email => email.id === evt.data.primary_email_address_id)
      const email = primaryEmail?.email_address || ''

      // Get organization ID from Clerk (if user was invited to existing org)
      // or create a new organization
      let clerkOrgId = organization_memberships?.[0]?.organization?.id
      let isNewOrg = false

      if (!clerkOrgId) {
        // This is a new signup - they need a new organization
        // In a real scenario, Clerk would create an org automatically
        // For now, we'll use a convention: org_{user_id}
        clerkOrgId = `org_${id}`
        isNewOrg = true
      }

      // Create or get organization
      let organizationId: string

      if (isNewOrg) {
        // Create new organization
        const { data: newOrg, error: orgError } = await supabaseAdmin
          .from('organizations')
          .insert({
            clerk_org_id: clerkOrgId,
            name: `${first_name || ''} ${last_name || ''}'s Ministry`.trim() || 'New Ministry',
            email: email,
            subscription_tier: 'trial',
            subscription_status: 'active',
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
          })
          .select('id')
          .single()

        if (orgError) {
          console.error('Error creating organization:', orgError)
          throw orgError
        }

        organizationId = newOrg.id
        console.log('Created new organization:', organizationId)
      } else {
        // Get existing organization
        const { data: existingOrg, error: orgError } = await supabaseAdmin
          .from('organizations')
          .select('id')
          .eq('clerk_org_id', clerkOrgId)
          .single()

        if (orgError) {
          console.error('Error fetching organization:', orgError)
          throw orgError
        }

        organizationId = existingOrg.id
        console.log('Found existing organization:', organizationId)
      }

      // Create user record
      const { data: newUser, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_user_id: id,
          organization_id: organizationId,
          email: email,
          full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          role: isNewOrg ? 'owner' : 'member', // First user in new org is owner
          is_active: true,
          last_login_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (userError) {
        console.error('Error creating user:', userError)
        throw userError
      }

      console.log('Created new user:', newUser.id)

      // Create default dashboard config for new organizations
      if (isNewOrg) {
        const { error: configError } = await supabaseAdmin
          .from('dashboard_configs')
          .insert({
            organization_id: organizationId,
            header_title: `Welcome to ${first_name || 'Your'}'s Ministry Dashboard`,
            header_subtitle: 'Managing your 508(c)(1)(A) ministry with transparency',
          })

        if (configError) {
          console.error('Error creating dashboard config:', configError)
          // Don't throw - this is non-critical
        } else {
          console.log('Created default dashboard config')
        }

        // Create default notification settings
        const { error: notifError } = await supabaseAdmin
          .from('notification_settings')
          .insert({
            user_id: newUser.id,
            email_notifications: true,
            compliance_reminders: true,
            donation_receipts: true,
            weekly_digest: true,
          })

        if (notifError) {
          console.error('Error creating notification settings:', notifError)
          // Don't throw - this is non-critical
        } else {
          console.log('Created notification settings')
        }

        // Create some default compliance items for new organizations
        const defaultComplianceItems = [
          {
            organization_id: organizationId,
            title: 'Set up Board of Trustees',
            description: 'Establish a board with at least 3 trustees as required for 508(c)(1)(A) status',
            category: 'governance',
            status: 'pending',
            priority: 'urgent',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            points_value: 25,
            reminder_sent: false,
          },
          {
            organization_id: organizationId,
            title: 'Document Mission Statement',
            description: 'Create and document your ministry mission statement and statement of faith',
            category: 'governance',
            status: 'pending',
            priority: 'high',
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
            points_value: 15,
            reminder_sent: false,
          },
          {
            organization_id: organizationId,
            title: 'Set up Donation Tracking',
            description: 'Implement system for tracking donations and issuing receipts',
            category: 'financial',
            status: 'pending',
            priority: 'high',
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
            points_value: 20,
            reminder_sent: false,
          },
        ]

        const { error: complianceError } = await supabaseAdmin
          .from('compliance_items')
          .insert(defaultComplianceItems)

        if (complianceError) {
          console.error('Error creating default compliance items:', complianceError)
          // Don't throw - this is non-critical
        } else {
          console.log('Created default compliance items')
        }
      }

      // Log activity
      await supabaseAdmin
        .from('activity_log')
        .insert({
          organization_id: organizationId,
          user_id: newUser.id,
          action: 'created',
          resource_type: 'user',
          resource_id: newUser.id,
          details: {
            event: 'user_signup',
            email: email,
            is_new_organization: isNewOrg,
          },
        })

      console.log('Successfully processed user.created webhook')

      return new Response('User created successfully', { status: 200 })
    } catch (error) {
      console.error('Error processing webhook:', error)
      return new Response('Error processing webhook', { status: 500 })
    }
  }

  if (eventType === 'organization.created') {
    const { id, name, created_by } = evt.data

    console.log('New organization created:', id)

    try {
      // Create organization record
      const { data: newOrg, error: orgError } = await supabaseAdmin
        .from('organizations')
        .insert({
          clerk_org_id: id,
          name: name || 'New Ministry',
          subscription_tier: 'trial',
          subscription_status: 'active',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select('id')
        .single()

      if (orgError) {
        console.error('Error creating organization:', orgError)
        throw orgError
      }

      console.log('Created organization:', newOrg.id)

      // Create default dashboard config
      await supabaseAdmin
        .from('dashboard_configs')
        .insert({
          organization_id: newOrg.id,
          header_title: `Welcome to ${name || 'Your Ministry'} Dashboard`,
          header_subtitle: 'Managing your 508(c)(1)(A) ministry with transparency',
        })

      console.log('Successfully processed organization.created webhook')

      return new Response('Organization created successfully', { status: 200 })
    } catch (error) {
      console.error('Error processing webhook:', error)
      return new Response('Error processing webhook', { status: 500 })
    }
  }

  if (eventType === 'organizationMembership.created') {
    const { organization, public_user_data } = evt.data

    console.log('New organization membership:', public_user_data.user_id)

    try {
      // Get organization
      const { data: org, error: orgError } = await supabaseAdmin
        .from('organizations')
        .select('id')
        .eq('clerk_org_id', organization.id)
        .single()

      if (orgError) {
        console.error('Error fetching organization:', orgError)
        throw orgError
      }

      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('clerk_user_id', public_user_data.user_id)
        .single()

      if (!existingUser) {
        // Create user if they don't exist yet
        const { data: newUser, error: userError } = await supabaseAdmin
          .from('users')
          .insert({
            clerk_user_id: public_user_data.user_id,
            organization_id: org.id,
            email: public_user_data.identifier || '',
            full_name: `${public_user_data.first_name || ''} ${public_user_data.last_name || ''}`.trim() || null,
            role: 'member',
            is_active: true,
          })
          .select('id')
          .single()

        if (userError) {
          console.error('Error creating user:', userError)
          throw userError
        }

        // Create notification settings
        await supabaseAdmin
          .from('notification_settings')
          .insert({
            user_id: newUser.id,
          })

        console.log('Created user from org membership:', newUser.id)
      } else {
        // Update existing user's organization
        await supabaseAdmin
          .from('users')
          .update({ organization_id: org.id })
          .eq('clerk_user_id', public_user_data.user_id)

        console.log('Updated existing user organization')
      }

      return new Response('Membership processed successfully', { status: 200 })
    } catch (error) {
      console.error('Error processing webhook:', error)
      return new Response('Error processing webhook', { status: 500 })
    }
  }

  // Handle user updates (name changes, etc.)
  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data

    try {
      const primaryEmail = email_addresses.find(email => email.id === evt.data.primary_email_address_id)

      await supabaseAdmin
        .from('users')
        .update({
          email: primaryEmail?.email_address || '',
          full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
        })
        .eq('clerk_user_id', id)

      console.log('Updated user:', id)

      return new Response('User updated successfully', { status: 200 })
    } catch (error) {
      console.error('Error updating user:', error)
      return new Response('Error updating user', { status: 500 })
    }
  }

  // Handle user deletion
  if (eventType === 'user.deleted') {
    const { id } = evt.data

    try {
      await supabaseAdmin
        .from('users')
        .update({ is_active: false })
        .eq('clerk_user_id', id)

      console.log('Deactivated user:', id)

      return new Response('User deactivated successfully', { status: 200 })
    } catch (error) {
      console.error('Error deactivating user:', error)
      return new Response('Error deactivating user', { status: 500 })
    }
  }

  return new Response('Webhook event not handled', { status: 200 })
}
