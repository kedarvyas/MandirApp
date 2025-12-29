import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/nav'
import { Toaster } from '@/components/ui/sonner'
import { OrgProvider } from '@/lib/org-context'
import type { Organization, Staff } from '@/types/database'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch staff record for the logged-in user
  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (staffError || !staff) {
    // User is not a staff member, redirect to login
    console.error('Staff lookup error:', staffError)
    redirect('/login?error=not_staff')
  }

  // Fetch the organization
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', staff.organization_id)
    .single()

  if (orgError || !organization) {
    console.error('Organization lookup error:', orgError)
    redirect('/login?error=no_org')
  }

  return (
    <OrgProvider organization={organization as Organization} staff={staff as Staff}>
      <div className="min-h-screen bg-gray-50">
        <DashboardNav user={user} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Toaster />
      </div>
    </OrgProvider>
  )
}
