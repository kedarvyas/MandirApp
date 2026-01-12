'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Save, Send, ImagePlus, X } from 'lucide-react'
import Link from 'next/link'
import type { Announcement } from '@/types/database'

interface AnnouncementFormProps {
  staffId: string
  organizationId: string
  announcement?: Announcement
}

export function AnnouncementForm({ staffId, organizationId, announcement }: AnnouncementFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!announcement
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(announcement?.title || '')
  const [content, setContent] = useState(announcement?.content || '')
  const [imageUrl, setImageUrl] = useState<string | null>(announcement?.image_url || null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(announcement?.image_url || null)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    setImageUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return imageUrl

    setUploadingImage(true)
    try {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${organizationId}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('announcement-images')
        .upload(fileName, imageFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('announcement-images')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleSave(publish: boolean = false) {
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (!content.trim()) {
      toast.error('Please enter some content')
      return
    }

    const isPublishing = publish || (isEditing && announcement?.is_published)

    if (publish) {
      setPublishing(true)
    } else {
      setSaving(true)
    }

    try {
      // Upload image if there's a new one
      let finalImageUrl = imageUrl
      if (imageFile) {
        finalImageUrl = await uploadImage()
      } else if (!imagePreview) {
        // Image was removed
        finalImageUrl = null
      }

      const data = {
        title: title.trim(),
        content: content.trim(),
        image_url: finalImageUrl,
        is_published: isPublishing,
        published_at: isPublishing ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }

      if (isEditing) {
        const { error } = await supabase
          .from('announcements')
          .update(data)
          .eq('id', announcement.id)

        if (error) throw error
        toast.success(publish ? 'Announcement published!' : 'Announcement updated')
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert({
            ...data,
            author_id: staffId,
            organization_id: organizationId,
          })

        if (error) throw error
        toast.success(publish ? 'Announcement published!' : 'Draft saved')
      }

      router.push('/dashboard/news')
      router.refresh()
    } catch (error) {
      console.error('Error saving announcement:', error)
      toast.error('Failed to save announcement')
    } finally {
      setSaving(false)
      setPublishing(false)
    }
  }

  const isLoading = saving || publishing || uploadingImage

  return (
    <div className="max-w-3xl">
      <Link
        href="/dashboard/news"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to News
      </Link>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter announcement title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Featured Image (Optional)</Label>
            {imagePreview ? (
              <div className="relative">
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload an image
                </p>
                <p className="text-xs text-muted-foreground/75 mt-1">
                  PNG, JPG up to 5MB
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your announcement here...

You can write about:
- Upcoming events and celebrations
- Holiday meanings and traditions
- Community updates
- Important notices"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="resize-y min-h-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              Write naturally - your content will be displayed as plain text to members.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={isLoading}
              className="bg-primary hover:bg-[#5D2850]"
            >
              <Send className="w-4 h-4 mr-2" />
              {publishing ? 'Publishing...' : uploadingImage ? 'Uploading...' : 'Publish Now'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
