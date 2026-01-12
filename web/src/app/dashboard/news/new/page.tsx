import { getOrganization } from '@/lib/supabase/get-org'
import { redirect } from 'next/navigation'
import { AnnouncementForm } from '@/components/dashboard/announcement-form'

export default async function NewAnnouncementPage() {
  const orgContext = await getOrganization()

  if (!orgContext) {
    redirect('/login')
  }

  const { staff } = orgContext

  // Check if user can create announcements
  const canCreate = ['owner', 'admin', 'secretary'].includes(staff.role)

  if (!canCreate) {
    redirect('/dashboard/news')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Announcement</h1>
        <p className="text-muted-foreground">Create a new announcement for your members</p>
      </div>

      <AnnouncementForm staffId={staff.id} organizationId={orgContext.organization.id} />
    </div>
  )
}
