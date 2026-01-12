'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface MemberNameEditorProps {
  memberId: string
  firstName: string
  lastName: string
  className?: string
}

export function MemberNameEditor({
  memberId,
  firstName: initialFirstName,
  lastName: initialLastName,
  className = '',
}: MemberNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) return

    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('members')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', memberId)

      if (error) throw error

      setIsEditing(false)
      // Refresh page to get updated data
      window.location.reload()
    } catch (err) {
      console.error('Failed to save member name:', err)
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFirstName(initialFirstName)
    setLastName(initialLastName)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First name"
          className="px-3 py-1.5 border border-border rounded-lg text-xl font-bold text-foreground w-40"
          autoFocus
        />
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last name"
          className="px-3 py-1.5 border border-border rounded-lg text-xl font-bold text-foreground w-40"
        />
        <Button
          onClick={handleSave}
          size="sm"
          disabled={saving || !firstName.trim() || !lastName.trim()}
          className="bg-primary hover:bg-primary/90"
        >
          {saving ? 'Saving...' : <Check className="w-4 h-4" />}
        </Button>
        <Button onClick={handleCancel} size="sm" variant="outline">
          <X className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <h1 className="text-2xl font-bold text-foreground">
        {initialFirstName} {initialLastName}
      </h1>
      <Button
        onClick={() => setIsEditing(true)}
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0"
      >
        <Pencil className="w-4 h-4 text-muted-foreground" />
      </Button>
    </div>
  )
}
