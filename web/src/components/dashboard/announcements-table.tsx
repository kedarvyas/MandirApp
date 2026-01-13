'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, EyeOff, Pencil, Trash2, Calendar, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { AnnouncementWithAuthor } from '@/types/database'
import Image from 'next/image'
import { AuthorNameEditor } from '@/components/author-name-editor'

interface AnnouncementsTableProps {
  announcements: AnnouncementWithAuthor[]
  canManage: boolean
}

export function AnnouncementsTable({ announcements, canManage }: AnnouncementsTableProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)

  function formatDate(dateString: string | null): string {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  function stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .trim()
  }

  function truncateText(text: string, maxLength: number = 200): string {
    const stripped = stripHtml(text)
    if (stripped.length <= maxLength) return stripped
    return stripped.substring(0, maxLength).trim() + '...'
  }

  async function togglePublish(announcement: AnnouncementWithAuthor) {
    setLoading(announcement.id)
    try {
      const newStatus = !announcement.is_published
      const { error } = await supabase
        .from('announcements')
        .update({
          is_published: newStatus,
          published_at: newStatus ? new Date().toISOString() : announcement.published_at,
        })
        .eq('id', announcement.id)

      if (error) throw error

      toast.success(newStatus ? 'Announcement published' : 'Announcement unpublished')
      router.refresh()
    } catch (error) {
      console.error('Error toggling publish:', error)
      toast.error('Failed to update announcement')
    } finally {
      setLoading(null)
    }
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    setLoading(id)
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Announcement deleted')
      router.refresh()
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('Failed to delete announcement')
    } finally {
      setLoading(null)
    }
  }

  if (announcements.length === 0) {
    return (
      <Card className="p-12 text-center border-0 shadow-sm">
        <div className="text-4xl mb-4">📰</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Announcements Yet</h3>
        <p className="text-muted-foreground">
          Create your first announcement to share news with your members.
        </p>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      {announcements.map((announcement) => (
        <Card
          key={announcement.id}
          className="border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="flex">
            {/* Image Section */}
            {announcement.image_url && (
              <div className="relative w-64 min-h-[200px] bg-secondary flex-shrink-0">
                <Image
                  src={announcement.image_url}
                  alt={announcement.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Content Section */}
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Status Badge */}
                  <div className="mb-3">
                    <Badge
                      variant={announcement.is_published ? 'default' : 'secondary'}
                      className={announcement.is_published
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : 'bg-gray-100 text-gray-600'
                      }
                    >
                      {announcement.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-foreground mb-2 leading-tight">
                    {announcement.title}
                  </h3>

                  {/* Content Preview */}
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {truncateText(announcement.content, 250)}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {announcement.author ? (
                        <AuthorNameEditor
                          authorId={announcement.author.id}
                          authorName={announcement.author.name}
                        />
                      ) : (
                        <span>Unknown</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(announcement.is_published ? announcement.published_at : announcement.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 flex-shrink-0"
                        disabled={loading === announcement.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/news/${announcement.id}`)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePublish(announcement)}>
                        {announcement.is_published ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteAnnouncement(announcement.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
