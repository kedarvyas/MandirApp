import { createClient } from '@/lib/supabase/server'
import { getOrganization } from '@/lib/supabase/get-org'
import { AnnouncementsTable } from '@/components/dashboard/announcements-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function NewsPage() {
  const supabase = await createClient()
  const orgContext = await getOrganization()

  if (!orgContext) {
    redirect('/login')
  }

  const { organization, staff } = orgContext

  // Check if user can create announcements
  const canCreate = ['owner', 'admin', 'secretary'].includes(staff.role)

  const { data: announcements, error } = await supabase
    .from('announcements')
    .select(`
      *,
      author:staff!author_id (
        id,
        name
      )
    `)
    .eq('organization_id', organization.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching announcements:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">News & Announcements</h1>
          <p className="text-muted-foreground">Create and manage announcements for your members</p>
        </div>
        {canCreate && (
          <Link href="/dashboard/news/new">
            <Button className="bg-primary hover:bg-[#5D2850]">
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          </Link>
        )}
      </div>

      <AnnouncementsTable
        announcements={announcements || []}
        canManage={canCreate}
      />
    </div>
  )
}
