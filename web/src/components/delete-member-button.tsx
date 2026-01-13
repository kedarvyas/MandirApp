'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DeleteMemberButtonProps {
  memberId: string
  memberName: string
}

export function DeleteMemberButton({ memberId, memberName }: DeleteMemberButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const supabase = createClient()

      // Delete related records first (check-ins, payments)
      await supabase.from('check_ins').delete().eq('member_id', memberId)
      await supabase.from('payments').delete().eq('member_id', memberId)

      // Delete the member
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      // Redirect to members list
      router.push('/dashboard/members')
      router.refresh()
    } catch (err) {
      console.error('Failed to delete member:', err)
      alert('Failed to delete member. Please try again.')
      setIsDeleting(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
        <span className="text-sm text-red-700">Delete {memberName}?</span>
        <Button
          onClick={handleDelete}
          disabled={isDeleting}
          size="sm"
          variant="destructive"
          className="bg-red-600 hover:bg-red-700"
        >
          {isDeleting ? 'Deleting...' : 'Yes, Delete'}
        </Button>
        <Button
          onClick={() => setShowConfirm(false)}
          size="sm"
          variant="outline"
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={() => setShowConfirm(true)}
      size="sm"
      variant="outline"
      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Delete Member
    </Button>
  )
}
