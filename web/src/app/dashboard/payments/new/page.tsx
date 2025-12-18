'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, DollarSign, Search } from 'lucide-react'
import Link from 'next/link'
import { Member } from '@/types/database'

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'card', label: 'Card' },
  { value: 'other', label: 'Other' },
]

export default function NewPaymentPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  useEffect(() => {
    const searchMembers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([])
        return
      }

      const { data } = await supabase
        .from('members')
        .select('*')
        .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
        .limit(5)

      setSearchResults(data || [])
    }

    const debounce = setTimeout(searchMembers, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedMember) {
      toast.error('Please select a member')
      return
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          member_id: selectedMember.id,
          family_group_id: selectedMember.family_group_id,
          organization_id: selectedMember.organization_id,
          amount: parseFloat(formData.amount),
          payment_method: formData.payment_method,
          payment_date: formData.payment_date,
          notes: formData.notes || null,
        })

      if (error) throw error

      toast.success('Payment recorded successfully!')
      router.push('/dashboard/payments')
    } catch (error) {
      console.error('Error recording payment:', error)
      toast.error('Failed to record payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/payments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Record Payment</h1>
          <p className="text-gray-600">Record a donation or membership payment</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            Search for a member and enter the payment information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Member Search */}
            <div className="space-y-2">
              <Label>Member *</Label>
              {selectedMember ? (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
                  <div>
                    <p className="font-medium">
                      {selectedMember.first_name} {selectedMember.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{selectedMember.phone}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedMember(null)
                      setSearchQuery('')
                    }}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="border rounded-lg divide-y">
                      {searchResults.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            setSelectedMember(member)
                            setSearchResults([])
                          }}
                          className="w-full text-left p-3 hover:bg-gray-50 transition-colors"
                        >
                          <p className="font-medium">
                            {member.first_name} {member.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{member.phone}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method *</Label>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <Button
                    key={method.value}
                    type="button"
                    variant={formData.payment_method === method.value ? 'default' : 'outline'}
                    className={formData.payment_method === method.value ? 'bg-orange-500 hover:bg-orange-600' : ''}
                    onClick={() => setFormData({ ...formData, payment_method: method.value })}
                  >
                    {method.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Payment Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/dashboard/payments">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
                {loading ? 'Recording...' : 'Record Payment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
