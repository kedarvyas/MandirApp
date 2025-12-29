'use client'

import { useOrganization } from '@/lib/org-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, Building2, QrCode } from 'lucide-react'
import { useState } from 'react'

export default function SettingsPage() {
  const organization = useOrganization()
  const [copied, setCopied] = useState(false)

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(organization.org_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your organization settings</p>
      </div>

      {/* Organization Code Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-secondary">
              <QrCode className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Organization Code</CardTitle>
              <CardDescription>
                Share this code with members so they can join via the mobile app
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-secondary rounded-lg px-6 py-4">
              <p className="text-2xl font-mono font-bold tracking-wider text-foreground">
                {organization.org_code}
              </p>
            </div>
            <Button
              onClick={handleCopyCode}
              variant="outline"
              className="border-primary text-primary hover:bg-secondary"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Members enter this code when they first open the mobile app to connect to your organization.
          </p>
        </CardContent>
      </Card>

      {/* Organization Details Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-secondary">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Organization Details</CardTitle>
              <CardDescription>
                Basic information about your organization
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-foreground">{organization.name}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                organization.is_active
                  ? 'bg-[#E8F5E9] text-[#4A7C59]'
                  : 'bg-red-100 text-red-700'
              }`}>
                {organization.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium text-foreground">
                {new Date(organization.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">Primary Color</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border border-border"
                  style={{ backgroundColor: organization.primary_color }}
                />
                <span className="font-mono text-sm text-foreground">{organization.primary_color}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
