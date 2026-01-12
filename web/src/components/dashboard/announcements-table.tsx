'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { AnnouncementWithAuthor } from '@/types/database'

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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  function stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .trim()
  }

  function truncateText(text: string, maxLength: number = 100): string {
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
      <Card className="p-12 text-center">
        <div className="text-4xl mb-4">📰</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Announcements Yet</h3>
        <p className="text-muted-foreground">
          Create your first announcement to share news with your members.
        </p>
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Title</TableHead>
            <TableHead>Preview</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            {canManage && <TableHead className="w-[70px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {announcements.map((announcement) => (
            <TableRow key={announcement.id}>
              <TableCell className="font-medium">{announcement.title}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {truncateText(announcement.content)}
              </TableCell>
              <TableCell className="text-sm">
                {announcement.author?.name || 'Unknown'}
              </TableCell>
              <TableCell>
                <Badge
                  variant={announcement.is_published ? 'default' : 'secondary'}
                  className={announcement.is_published ? 'bg-green-100 text-green-800' : ''}
                >
                  {announcement.is_published ? 'Published' : 'Draft'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(announcement.is_published ? announcement.published_at : announcement.created_at)}
              </TableCell>
              {canManage && (
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
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
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
