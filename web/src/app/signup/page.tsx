'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Building2, User, CheckCircle2, Copy, Check } from 'lucide-react'

type OrganizationType = 'temple' | 'church' | 'mosque' | 'synagogue' | 'gurdwara' | 'other'

interface FormData {
  orgName: string
  orgType: OrganizationType
  adminName: string
  adminEmail: string
  adminPassword: string
  adminPhone: string
}

interface SignupResult {
  orgCode: string
  orgName: string
  adminEmail: string
}

const orgTypes: { value: OrganizationType; label: string }[] = [
  { value: 'temple', label: 'Hindu Temple / Mandir' },
  { value: 'church', label: 'Church' },
  { value: 'mosque', label: 'Mosque / Masjid' },
  { value: 'synagogue', label: 'Synagogue' },
  { value: 'gurdwara', label: 'Gurdwara' },
  { value: 'other', label: 'Other' },
]

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SignupResult | null>(null)
  const [copied, setCopied] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    orgName: '',
    orgType: 'temple',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminPhone: '',
  })

  const supabase = createClient()

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const validateStep1 = () => {
    if (!formData.orgName.trim()) {
      setError('Organization name is required')
      return false
    }
    if (formData.orgName.trim().length < 3) {
      setError('Organization name must be at least 3 characters')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.adminName.trim()) {
      setError('Your name is required')
      return false
    }
    if (!formData.adminEmail.trim()) {
      setError('Email is required')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      setError('Please enter a valid email address')
      return false
    }
    if (!formData.adminPassword) {
      setError('Password is required')
      return false
    }
    if (formData.adminPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    return true
  }

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      handleSubmit()
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // 1. Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.adminEmail,
        password: formData.adminPassword,
        options: {
          data: {
            name: formData.adminName,
          },
        },
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      // 2. Generate org slug from name
      const slug = formData.orgName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)

      // 3. Create the organization using the database function
      const { data: orgData, error: orgError } = await supabase
        .rpc('create_organization_with_admin', {
          p_org_name: formData.orgName,
          p_org_slug: slug,
          p_org_type: formData.orgType,
          p_admin_user_id: authData.user.id,
          p_admin_name: formData.adminName,
          p_admin_email: formData.adminEmail,
        })

      if (orgError) {
        // If org creation fails, we should ideally delete the user
        // For now, just show the error
        console.error('Organization creation error:', orgError)

        // Fallback: Create org directly without the RPC function
        const { data: newOrg, error: directOrgError } = await supabase
          .from('organizations')
          .insert({
            name: formData.orgName,
            slug: `${slug}-${Date.now()}`,
            org_code: `${formData.orgName.substring(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            settings: { type: formData.orgType },
          })
          .select()
          .single()

        if (directOrgError) {
          throw new Error('Failed to create organization: ' + directOrgError.message)
        }

        // Create staff record
        const { error: staffError } = await supabase
          .from('staff')
          .insert({
            organization_id: newOrg.id,
            user_id: authData.user.id,
            name: formData.adminName,
            email: formData.adminEmail,
            role: 'admin',
          })

        if (staffError) {
          console.error('Staff creation error:', staffError)
        }

        setResult({
          orgCode: newOrg.org_code,
          orgName: newOrg.name,
          adminEmail: formData.adminEmail,
        })
      } else {
        setResult({
          orgCode: orgData.org_code,
          orgName: formData.orgName,
          adminEmail: formData.adminEmail,
        })
      }

      setStep(3)
    } catch (err) {
      console.error('Signup error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const copyOrgCode = async () => {
    if (result?.orgCode) {
      await navigator.clipboard.writeText(result.orgCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Sanctum"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-xl font-bold text-foreground">Sanctum</span>
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground text-sm">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Progress Steps */}
        {step < 3 && (
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <Building2 className="h-5 w-5" />
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <User className="h-5 w-5" />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Organization Info */}
        {step === 1 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">Create Your Organization</CardTitle>
              <CardDescription>
                Tell us about your religious organization
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    placeholder="e.g., Sri Venkateswara Temple"
                    value={formData.orgName}
                    onChange={(e) => updateFormData('orgName', e.target.value)}
                    className="border-accent focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgType">Organization Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {orgTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => updateFormData('orgType', type.value)}
                        className={`p-3 rounded-lg border-2 text-sm text-left transition-colors ${
                          formData.orgType === type.value
                            ? 'border-primary bg-primary/5 text-foreground'
                            : 'border-border hover:border-primary/50 text-muted-foreground'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3 text-sm text-[#C45B4A] bg-[#FFEBEE] rounded-lg">
                    {error}
                  </div>
                )}

                <Button
                  onClick={nextStep}
                  className="w-full bg-primary hover:bg-[#5D2850] text-primary-foreground py-5"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Admin Info */}
        {step === 2 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">Create Admin Account</CardTitle>
              <CardDescription>
                You will be the administrator for {formData.orgName}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminName">Your Name</Label>
                  <Input
                    id="adminName"
                    placeholder="Full name"
                    value={formData.adminName}
                    onChange={(e) => updateFormData('adminName', e.target.value)}
                    className="border-accent focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email Address</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.adminEmail}
                    onChange={(e) => updateFormData('adminEmail', e.target.value)}
                    className="border-accent focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Password</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    placeholder="At least 8 characters"
                    value={formData.adminPassword}
                    onChange={(e) => updateFormData('adminPassword', e.target.value)}
                    className="border-accent focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPhone">Phone Number (Optional)</Label>
                  <Input
                    id="adminPhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.adminPhone}
                    onChange={(e) => updateFormData('adminPhone', e.target.value)}
                    className="border-accent focus:border-primary"
                  />
                </div>

                {error && (
                  <div className="p-3 text-sm text-[#C45B4A] bg-[#FFEBEE] rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1 border-primary text-primary"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    disabled={loading}
                    className="flex-1 bg-primary hover:bg-[#5D2850] text-primary-foreground"
                  >
                    {loading ? 'Creating...' : 'Create Organization'}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center pt-2">
                  By creating an account, you agree to our{' '}
                  <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Success */}
        {step === 3 && result && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-[#4A7C59]" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Welcome to Sanctum!
              </CardTitle>
              <CardDescription className="text-base">
                Your organization has been created successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-6">
                {/* Organization Code Box */}
                <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-6">
                  <p className="text-sm text-muted-foreground text-center mb-2">
                    Your Organization Code
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl font-mono font-bold text-primary tracking-wider">
                      {result.orgCode}
                    </span>
                    <button
                      onClick={copyOrgCode}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                      title="Copy code"
                    >
                      {copied ? (
                        <Check className="h-5 w-5 text-[#4A7C59]" />
                      ) : (
                        <Copy className="h-5 w-5 text-primary" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Share this code with your members to join your organization
                  </p>
                </div>

                {/* Next Steps */}
                <div className="bg-card rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-foreground">Next Steps:</h3>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium shrink-0">1</span>
                      <span>Check your email ({result.adminEmail}) to verify your account</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium shrink-0">2</span>
                      <span>Sign in to access your dashboard and add staff members</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium shrink-0">3</span>
                      <span>Share your organization code with members so they can register on the mobile app</span>
                    </li>
                  </ol>
                </div>

                <div className="flex gap-3">
                  <Link href="/login" className="flex-1">
                    <Button className="w-full bg-primary hover:bg-[#5D2850] text-primary-foreground py-5">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
