import { createClient } from '@/lib/supabase/server'
import { getOrganization } from '@/lib/supabase/get-org'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const methodColors: Record<string, string> = {
  cash: 'bg-green-100 text-green-700',
  check: 'bg-blue-100 text-blue-700',
  card: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-700',
}

export default async function PaymentsPage() {
  const supabase = await createClient()
  const orgContext = await getOrganization()

  if (!orgContext) {
    redirect('/login')
  }

  const { organization } = orgContext

  const { data: payments } = await supabase
    .from('payments')
    .select(`
      *,
      member:members(first_name, last_name)
    `)
    .eq('organization_id', organization.id)
    .order('payment_date', { ascending: false })
    .limit(100)

  // Calculate totals
  const totalAmount = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const monthlyAmount = payments
    ?.filter(p => new Date(p.payment_date) >= thisMonth)
    .reduce((sum, p) => sum + Number(p.amount), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Track donations and membership payments</p>
        </div>
        <Link href="/dashboard/payments/new">
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${monthlyAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Recorded</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments && payments.length > 0 ? (
                payments.map((payment) => {
                  const member = payment.member as { first_name: string; last_name: string } | null
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {member ? `${member.first_name} ${member.last_name}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={methodColors[payment.payment_method]}>
                          {payment.payment_method.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${Number(payment.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-gray-500 max-w-xs truncate">
                        {payment.notes || '-'}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No payments recorded yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
