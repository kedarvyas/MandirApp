import { createClient } from '@/lib/supabase/server'
import { getOrganization } from '@/lib/supabase/get-org'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, CreditCard, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const orgContext = await getOrganization()

  if (!orgContext) {
    redirect('/login')
  }

  const { organization } = orgContext

  // Calculate date boundaries for queries (server-side at request time)
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Get stats scoped to this organization
  const [
    { count: totalMembers },
    { count: todayCheckIns },
    { data: recentPayments },
  ] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true })
      .eq('organization_id', organization.id),
    supabase.from('check_ins').select('*', { count: 'exact', head: true })
      .eq('organization_id', organization.id)
      .gte('checked_in_at', today),
    supabase.from('payments').select('amount')
      .eq('organization_id', organization.id)
      .gte('payment_date', thirtyDaysAgo),
  ])

  const monthlyPayments = recentPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  // Get recent check-ins with member names (scoped to organization)
  const { data: recentCheckIns } = await supabase
    .from('check_ins')
    .select(`
      id,
      checked_in_at,
      member:members(first_name, last_name)
    `)
    .eq('organization_id', organization.id)
    .order('checked_in_at', { ascending: false })
    .limit(5)

  const stats = [
    {
      title: 'Total Members',
      value: totalMembers || 0,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-secondary',
    },
    {
      title: "Today's Check-ins",
      value: todayCheckIns || 0,
      icon: UserCheck,
      color: 'text-[#4A7C59]',
      bgColor: 'bg-[#E8F5E9]',
    },
    {
      title: 'Monthly Donations',
      value: `$${monthlyPayments.toLocaleString()}`,
      icon: CreditCard,
      color: 'text-[#D4A03E]',
      bgColor: 'bg-[#FFF8E1]',
    },
    {
      title: 'Active Families',
      value: '-',
      icon: TrendingUp,
      color: 'text-[#6B3050]',
      bgColor: 'bg-[#F5E6DC]',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to {organization.name}</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/check-in">
          <Button className="bg-primary hover:bg-[#5D2850]">
            <UserCheck className="w-4 h-4 mr-2" />
            Scan Check-in
          </Button>
        </Link>
        <Link href="/dashboard/members/new">
          <Button variant="outline" className="border-primary text-primary hover:bg-secondary">
            <Users className="w-4 h-4 mr-2" />
            New Member
          </Button>
        </Link>
        <Link href="/dashboard/payments/new">
          <Button variant="outline" className="border-primary text-primary hover:bg-secondary">
            <CreditCard className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1 text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Check-ins */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Recent Check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          {recentCheckIns && recentCheckIns.length > 0 ? (
            <div className="space-y-3">
              {recentCheckIns.map((checkIn) => {
                const memberData = checkIn.member as unknown as { first_name: string; last_name: string } | null
                return (
                  <div key={checkIn.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {memberData ? memberData.first_name[0] + memberData.last_name[0] : '?'}
                        </span>
                      </div>
                      <p className="font-medium text-foreground">
                        {memberData ? `${memberData.first_name} ${memberData.last_name}` : 'Unknown'}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(checkIn.checked_in_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center mb-4">
                <UserCheck className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No check-ins today</p>
              <p className="text-sm text-muted-foreground mt-1">Check-ins will appear here as members arrive</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
