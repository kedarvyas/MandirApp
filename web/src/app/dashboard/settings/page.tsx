'use client'

import { useOrganization, useStaff } from '@/lib/org-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, Building2, QrCode, Tablet, ExternalLink, Plus, X, DollarSign } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { KioskSettings, DEFAULT_KIOSK_SETTINGS, KioskPaymentMethod } from '@/types/database'

const PAYMENT_METHOD_LABELS: Record<KioskPaymentMethod, string> = {
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
  card: 'Credit / Debit Card',
  venmo: 'Venmo',
}

export default function SettingsPage() {
  const organization = useOrganization()
  const staff = useStaff()
  const [copied, setCopied] = useState(false)
  const [kioskCopied, setKioskCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [kioskSettings, setKioskSettings] = useState<KioskSettings>(
    (organization.settings?.kiosk as KioskSettings) || DEFAULT_KIOSK_SETTINGS
  )
  const [newAmount, setNewAmount] = useState('')
  const [kioskUrl, setKioskUrl] = useState(`/kiosk/${organization.org_code}/donate`)

  // Set full URL on client mount to avoid hydration mismatch
  useEffect(() => {
    setKioskUrl(`${window.location.origin}/kiosk/${organization.org_code}/donate`)
  }, [organization.org_code])

  // Check if user can edit settings (owner, admin, or treasurer)
  const canEditKiosk = ['owner', 'admin', 'treasurer'].includes(staff.role)

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(organization.org_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleCopyKioskUrl = async () => {
    try {
      await navigator.clipboard.writeText(kioskUrl)
      setKioskCopied(true)
      setTimeout(() => setKioskCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSaveKioskSettings = async () => {
    if (!canEditKiosk) return

    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('organizations')
        .update({
          settings: {
            ...organization.settings,
            kiosk: kioskSettings,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', organization.id)

      if (error) throw error

      // Refresh page to get updated data
      window.location.reload()
    } catch (err) {
      console.error('Failed to save kiosk settings:', err)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const togglePaymentMethod = (method: KioskPaymentMethod) => {
    setKioskSettings(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.includes(method)
        ? prev.payment_methods.filter(m => m !== method)
        : [...prev.payment_methods, method],
    }))
  }

  const addPresetAmount = () => {
    const amount = parseFloat(newAmount)
    if (amount > 0 && !kioskSettings.preset_amounts.includes(amount)) {
      setKioskSettings(prev => ({
        ...prev,
        preset_amounts: [...prev.preset_amounts, amount].sort((a, b) => a - b),
      }))
      setNewAmount('')
    }
  }

  const removePresetAmount = (amount: number) => {
    setKioskSettings(prev => ({
      ...prev,
      preset_amounts: prev.preset_amounts.filter(a => a !== amount),
    }))
  }

  const hasChanges = JSON.stringify(kioskSettings) !== JSON.stringify(
    (organization.settings?.kiosk as KioskSettings) || DEFAULT_KIOSK_SETTINGS
  )

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

      {/* Donation Kiosk Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-secondary">
                <Tablet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Donation Kiosk</CardTitle>
                <CardDescription>
                  Set up a tablet or iPad for members to make donations
                </CardDescription>
              </div>
            </div>
            {canEditKiosk && (
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={kioskSettings.enabled}
                    onChange={(e) => setKioskSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  <span className="ml-3 text-sm font-medium text-foreground">
                    {kioskSettings.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Kiosk URL */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Kiosk URL</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-secondary rounded-lg px-4 py-3 text-sm font-mono text-foreground truncate">
                {kioskUrl}
              </div>
              <Button
                onClick={handleCopyKioskUrl}
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-secondary"
              >
                {kioskCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                onClick={() => window.open(kioskUrl, '_blank')}
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-secondary"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Open this URL on your kiosk device and enable full-screen mode
            </p>
          </div>

          {canEditKiosk && (
            <>
              {/* Preset Amounts */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Preset Donation Amounts</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {kioskSettings.preset_amounts.map((amount) => (
                    <div
                      key={amount}
                      className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1"
                    >
                      <span className="text-sm font-medium">${amount}</span>
                      <button
                        onClick={() => removePresetAmount(amount)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 max-w-[150px]">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      placeholder="0"
                      className="w-full pl-8 pr-3 py-2 border border-border rounded-lg text-sm"
                    />
                  </div>
                  <Button
                    onClick={addPresetAmount}
                    variant="outline"
                    size="sm"
                    disabled={!newAmount || parseFloat(newAmount) <= 0}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Custom Amount Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-foreground">Allow Custom Amount</label>
                  <p className="text-xs text-muted-foreground">Let donors enter their own amount</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={kioskSettings.custom_amount_enabled}
                    onChange={(e) => setKioskSettings(prev => ({ ...prev, custom_amount_enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Payment Methods</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(PAYMENT_METHOD_LABELS) as KioskPaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      onClick={() => togglePaymentMethod(method)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        kioskSettings.payment_methods.includes(method)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {PAYMENT_METHOD_LABELS[method]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thank You Message */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Thank You Message</label>
                <textarea
                  value={kioskSettings.thank_you_message}
                  onChange={(e) => setKioskSettings(prev => ({ ...prev, thank_you_message: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-3 border border-border rounded-lg text-sm resize-none"
                  placeholder="Thank you for your generous donation!"
                />
              </div>

              {/* Show Org Logo */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-foreground">Show Organization Logo</label>
                  <p className="text-xs text-muted-foreground">Display your logo on the kiosk</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={kioskSettings.show_org_logo}
                    onChange={(e) => setKioskSettings(prev => ({ ...prev, show_org_logo: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Save Button */}
              {hasChanges && (
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button
                    onClick={handleSaveKioskSettings}
                    disabled={saving}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {saving ? 'Saving...' : 'Save Kiosk Settings'}
                  </Button>
                </div>
              )}
            </>
          )}

          {!canEditKiosk && (
            <p className="text-sm text-muted-foreground bg-secondary p-4 rounded-lg">
              You don&apos;t have permission to edit kiosk settings. Contact an admin or treasurer.
            </p>
          )}
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
              <span className="text-muted-foreground">Your Role</span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary capitalize">
                {staff.role}
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
