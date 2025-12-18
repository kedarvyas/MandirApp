'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { QRScanner } from '@/components/dashboard/qr-scanner'
import { MemberCheckInCard } from '@/components/dashboard/member-checkin-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, QrCode, Keyboard } from 'lucide-react'
import { Member } from '@/types/database'
import { toast } from 'sonner'

type CheckInMode = 'qr' | 'manual'

export default function CheckInPage() {
  const [mode, setMode] = useState<CheckInMode>('qr')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleQRScan = async (qrToken: string) => {
    setLoading(true)
    try {
      const { data: member, error } = await supabase
        .from('members')
        .select('*')
        .eq('qr_token', qrToken)
        .single()

      if (error || !member) {
        toast.error('Member not found. Invalid QR code.')
        return
      }

      setSelectedMember(member)
    } catch {
      toast.error('Error scanning QR code')
    } finally {
      setLoading(false)
    }
  }

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const { data: members, error } = await supabase
        .from('members')
        .select('*')
        .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
        .limit(10)

      if (error) throw error

      setSearchResults(members || [])
      if (members?.length === 0) {
        toast.info('No members found')
      }
    } catch {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (member: Member) => {
    try {
      const { error } = await supabase
        .from('check_ins')
        .insert({
          member_id: member.id,
          organization_id: member.organization_id,
        })

      if (error) throw error

      toast.success(`${member.first_name} ${member.last_name} checked in!`)
      setSelectedMember(null)
      setSearchResults([])
      setSearchQuery('')
    } catch {
      toast.error('Failed to check in')
    }
  }

  const handleClose = () => {
    setSelectedMember(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Check-In</h1>
        <p className="text-muted-foreground">Scan QR code or search for a member to check in</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'qr' ? 'default' : 'outline'}
          onClick={() => setMode('qr')}
          className={mode === 'qr' ? 'bg-primary hover:bg-[#5D2850]' : 'border-primary text-primary hover:bg-secondary'}
        >
          <QrCode className="w-4 h-4 mr-2" />
          QR Scanner
        </Button>
        <Button
          variant={mode === 'manual' ? 'default' : 'outline'}
          onClick={() => setMode('manual')}
          className={mode === 'manual' ? 'bg-primary hover:bg-[#5D2850]' : 'border-primary text-primary hover:bg-secondary'}
        >
          <Keyboard className="w-4 h-4 mr-2" />
          Manual Search
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner / Search Panel */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">
              {mode === 'qr' ? 'Scan QR Code' : 'Search Member'}
            </CardTitle>
            <CardDescription>
              {mode === 'qr'
                ? 'Point the camera at a member QR code'
                : 'Search by name or phone number'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === 'qr' ? (
              <QRScanner onScan={handleQRScan} />
            ) : (
              <div className="space-y-4">
                <form onSubmit={handleManualSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 border-accent focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="bg-primary hover:bg-[#5D2850]">
                    {loading ? 'Searching...' : 'Search'}
                  </Button>
                </form>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => setSelectedMember(member)}
                        className="w-full text-left p-4 bg-secondary border border-border rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-semibold text-sm">
                              {member.first_name[0]}{member.last_name[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {member.first_name} {member.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">{member.phone}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member Preview / Check-in Card */}
        <div>
          {selectedMember ? (
            <MemberCheckInCard
              member={selectedMember}
              onCheckIn={() => handleCheckIn(selectedMember)}
              onClose={handleClose}
            />
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[300px] border-0 shadow-sm">
              <CardContent className="text-center">
                <div className="w-20 h-20 mx-auto bg-secondary rounded-full flex items-center justify-center mb-4">
                  <QrCode className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Scan a QR code or search for a member</p>
                <p className="text-sm text-muted-foreground mt-1">Member details will appear here</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
