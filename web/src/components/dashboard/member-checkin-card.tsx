'use client'

import { Member } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, X, Phone, Mail, Calendar } from 'lucide-react'

interface MemberCheckInCardProps {
  member: Member
  onCheckIn: () => void
  onClose: () => void
}

const statusColors: Record<string, string> = {
  active: 'bg-[#E8F5E9] text-[#4A7C59]',
  pending_invite: 'bg-[#FFF8E1] text-[#D4A03E]',
  pending_registration: 'bg-[#E3F2FD] text-[#5B7C9A]',
  inactive: 'bg-muted text-muted-foreground',
}

export function MemberCheckInCard({ member, onCheckIn, onClose }: MemberCheckInCardProps) {
  const isActive = member.status === 'active'

  return (
    <Card className={`border-2 shadow-sm ${isActive ? 'border-[#4A7C59]' : 'border-[#D4A03E]'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg text-foreground">Member Found</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Member Info */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={member.photo_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
              {member.first_name[0]}{member.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              {member.first_name} {member.last_name}
            </h3>
            <Badge className={statusColors[member.status]}>
              {member.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 text-sm">
          {member.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{member.phone}</span>
            </div>
          )}
          {member.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{member.email}</span>
            </div>
          )}
          {member.membership_date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Member since {new Date(member.membership_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Check-in Button */}
        {isActive ? (
          <Button
            onClick={onCheckIn}
            className="w-full bg-[#4A7C59] hover:bg-[#3d6549] text-white"
            size="lg"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Check In
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="p-3 bg-[#FFF8E1] text-[#D4A03E] rounded-lg text-sm">
              This member&apos;s status is &quot;{member.status.replace('_', ' ')}&quot;.
              They may need to complete registration first.
            </div>
            <Button
              onClick={onCheckIn}
              className="w-full border-primary text-primary hover:bg-secondary"
              variant="outline"
            >
              Check In Anyway
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
