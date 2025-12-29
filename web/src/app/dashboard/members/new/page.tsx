'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useOrganization } from '@/lib/org-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function NewMemberPage() {
  const router = useRouter()
  const supabase = createClient()
  const organization = useOrganization()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create family group first (scoped to organization)
      const { data: familyGroup, error: familyError } = await supabase
        .from('family_groups')
        .insert({
          organization_id: organization.id,
        })
        .select()
        .single()

      if (familyError) throw familyError

      // Create member (scoped to organization)
      const { data: member, error: memberError } = await supabase
        .from('members')
        .insert({
          organization_id: organization.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || null,
          email: formData.email || null,
          family_group_id: familyGroup.id,
          is_prime_member: true,
          status: formData.phone ? 'pending_invite' : 'active',
        })
        .select()
        .single()

      if (memberError) throw memberError

      // Update family group with prime member
      await supabase
        .from('family_groups')
        .update({ prime_member_id: member.id })
        .eq('id', familyGroup.id)

      toast.success('Member created successfully!')
      router.push('/dashboard/members')
    } catch (error) {
      console.error('Error creating member:', error)
      toast.error('Failed to create member. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/members">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add New Member</h1>
          <p className="text-muted-foreground">Register a new temple member</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Member Information</CardTitle>
          <CardDescription>
            Enter the member&apos;s details. If you provide a phone number, they will receive an SMS invitation to complete their registration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-sm font-medium">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="John"
                  required
                  className="border-accent focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-medium">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Doe"
                  required
                  className="border-accent focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="border-accent focus:border-primary focus:ring-primary"
              />
              <p className="text-sm text-muted-foreground">
                Used for SMS verification and membership login
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="border-accent focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/dashboard/members">
                <Button type="button" variant="outline" className="border-primary text-primary hover:bg-secondary">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-primary hover:bg-[#5D2850]">
                <UserPlus className="w-4 h-4 mr-2" />
                {loading ? 'Creating...' : 'Create Member'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
