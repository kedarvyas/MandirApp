import { createClient } from '@/lib/supabase/server'
import { getOrganization } from '@/lib/supabase/get-org'
import { MembersTable } from '@/components/dashboard/members-table'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const orgContext = await getOrganization()

  if (!orgContext) {
    redirect('/login')
  }

  const { organization } = orgContext

  let query = supabase
    .from('members')
    .select('*')
    .eq('organization_id', organization.id)
    .order('created_at', { ascending: false })

  if (params.search) {
    query = query.or(`first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,phone.ilike.%${params.search}%`)
  }

  if (params.status) {
    query = query.eq('status', params.status)
  }

  const { data: members, error } = await query.limit(100)

  if (error) {
    console.error('Error fetching members:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Members</h1>
          <p className="text-muted-foreground">Manage temple members and families</p>
        </div>
        <Link href="/dashboard/members/new">
          <Button className="bg-primary hover:bg-[#5D2850]">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </Link>
      </div>

      <MembersTable members={members || []} />
    </div>
  )
}
