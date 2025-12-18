'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Member } from '@/types/database'
import { Input } from '@/components/ui/input'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Eye, QrCode } from 'lucide-react'
import Link from 'next/link'

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

export function MembersTable({ members }: { members: Member[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery) {
      params.set('search', searchQuery)
    } else {
      params.delete('search')
    }
    router.push(`/dashboard/members?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      {/* Table */}
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Member Since</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No members found
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={member.photo_url || undefined} />
                        <AvatarFallback className="bg-orange-100 text-orange-600 text-sm">
                          {member.first_name[0]}{member.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.first_name} {member.last_name}</p>
                        {member.email && (
                          <p className="text-sm text-gray-500">{member.email}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.phone || <span className="text-gray-400">-</span>}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[member.status]}>
                      {statusLabels[member.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.membership_date
                      ? new Date(member.membership_date).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/members/${member.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      {member.qr_token && (
                        <Button variant="ghost" size="sm">
                          <QrCode className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
