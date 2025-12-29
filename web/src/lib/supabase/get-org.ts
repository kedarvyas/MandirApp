import { createClient } from './server'
import type { Organization, Staff } from '@/types/database'

/**
 * Get the current staff member's organization from the server context.
 * Use this in server components to scope queries by organization.
 * Returns null if user is not authenticated or not a staff member.
 */
export async function getOrganization(): Promise<{
  organization: Organization
  staff: Staff
} | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch staff record
  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (staffError || !staff) return null

  // Fetch organization
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', staff.organization_id)
    .single()

  if (orgError || !organization) return null

  return {
    organization: organization as Organization,
    staff: staff as Staff,
  }
}
