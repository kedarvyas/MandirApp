import { createClient } from '@/lib/supabase/server'
import { getOrganization } from '@/lib/supabase/get-org'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Mail, Phone, Calendar, Users, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending_invite: 'bg-yellow-100 text-yellow-700',
  pending_registration: 'bg-blue-100 text-blue-700',
  inactive: 'bg-gray-100 text-gray-700',
}

const statusLabels: Record<string, string> = {
  active: 'Active',
  pending_invite: 'Pending Invite',
  pending_registration: 'Pending Registration',
  inactive: 'Inactive',
}

export default async function MemberDetailPage({
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

  const { organization } = orgContext

  // Fetch member with organization scope
  const { data: member, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organization.id)
    .single()

  if (error || !member) {
    notFound()
  }

  // Fetch family members if this member has a family group
  let familyMembers: typeof member[] = []
  if (member.family_group_id) {
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('family_group_id', member.family_group_id)
      .eq('organization_id', organization.id)
      .neq('id', member.id)
      .order('created_at', { ascending: true })

    familyMembers = data || []
  }

  // Fetch recent payments
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('member_id', member.id)
    .eq('organization_id', organization.id)
    .order('payment_date', { ascending: false })
    .limit(5)

  // Fetch recent check-ins
  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('*')
    .eq('member_id', member.id)
    .eq('organization_id', organization.id)
    .order('checked_in_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/members">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Members
          </Button>
        </Link>
      </div>

      {/* Member Profile Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={member.photo_url || undefined} />
              <AvatarFallback className="bg-secondary text-primary text-2xl font-semibold">
                {member.first_name[0]}{member.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {member.first_name} {member.last_name}
                </h1>
                <Badge className={statusColors[member.status]}>
                  {statusLabels[member.status]}
                </Badge>
                {member.is_prime_member && (
                  <Badge variant="outline" className="border-primary text-primary">
                    Primary Member
                  </Badge>
                )}
              </div>
              <div className="space-y-2 text-muted-foreground">
                {member.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{member.email}</span>
                  </div>
                )}
                {member.membership_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {new Date(member.membership_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Family Members */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-primary" />
              Family Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            {familyMembers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No family members</p>
            ) : (
              <div className="space-y-3">
                {familyMembers.map((fm) => (
                  <Link
                    key={fm.id}
                    href={`/dashboard/members/${fm.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={fm.photo_url || undefined} />
                      <AvatarFallback className="bg-secondary text-primary text-sm">
                        {fm.first_name[0]}{fm.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{fm.first_name} {fm.last_name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {fm.relationship_to_prime?.replace('_', ' ') || 'Family'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5 text-primary" />
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!payments || payments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No payments recorded</p>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        ${Number(payment.amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {payment.payment_method}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Check-ins */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-primary" />
              Recent Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!checkIns || checkIns.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No check-ins recorded</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {checkIns.map((checkIn) => (
                  <div
                    key={checkIn.id}
                    className="p-3 rounded-lg bg-secondary/50 text-center"
                  >
                    <p className="font-medium text-foreground">
                      {new Date(checkIn.checked_in_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(checkIn.checked_in_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
