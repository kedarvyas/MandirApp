'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Pencil, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface AuthorNameEditorProps {
  authorId: string
  authorName: string
}

export function AuthorNameEditor({ authorId, authorName }: AuthorNameEditorProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(authorName)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return

    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('staff')
        .update({
          name: name.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', authorId)

      if (error) throw error

      setIsEditing(false)
      toast.success('Author name updated')
      router.refresh()
    } catch (err) {
      console.error('Failed to update author name:', err)
      toast.error('Failed to update name')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setName(authorName)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-2 py-0.5 border border-border rounded text-sm w-32"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') handleCancel()
          }}
        />
        <Button
          onClick={handleSave}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          disabled={saving}
        >
          <Check className="w-3 h-3 text-green-600" />
        </Button>
        <Button
          onClick={handleCancel}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
        >
          <X className="w-3 h-3 text-red-600" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 group">
      <span>{authorName}</span>
      <Button
        onClick={() => setIsEditing(true)}
        size="sm"
        variant="ghost"
        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Pencil className="w-3 h-3 text-muted-foreground" />
      </Button>
    </div>
  )
}
