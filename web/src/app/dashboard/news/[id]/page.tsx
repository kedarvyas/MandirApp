import { createClient } from '@/lib/supabase/server'
import { getOrganization } from '@/lib/supabase/get-org'
import { redirect, notFound } from 'next/navigation'
import { AnnouncementForm } from '@/components/dashboard/announcement-form'

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const orgContext = await getOrganization()

  if (!orgContext) {
    redirect('/login')
  }

  const { staff, organization } = orgContext

  // Check if user can edit announcements
  const canEdit = ['owner', 'admin', 'secretary'].includes(staff.role)

  if (!canEdit) {
    redirect('/dashboard/news')
  }

  // Fetch the announcement
  const { data: announcement, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organization.id)
    .single()

  if (error || !announcement) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Announcement</h1>
        <p className="text-muted-foreground">Update your announcement</p>
      </div>

      <AnnouncementForm
        staffId={staff.id}
        organizationId={organization.id}
        announcement={announcement}
      />
    </div>
  )
}
