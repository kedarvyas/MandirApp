'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      // Always show the same confirmation, even for addresses with no account.
      // Saying "no such user" would let anyone test which staff emails exist.
      setSent(true)
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <Image src="/logo.svg" alt="Sanctum" width={80} height={80} className="w-20 h-20" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {sent ? 'Check your email' : 'Reset your password'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {sent
              ? `If an account exists for ${email}, we've sent a link to reset your password.`
              : "Enter your email and we'll send you a link to set a new password."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {sent ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The link expires in one hour. If it doesn&apos;t arrive within a few
                minutes, check your spam folder.
              </p>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full border-accent text-foreground font-semibold py-5"
                >
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="staff@mandir.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-accent focus:border-primary focus:ring-primary"
                />
              </div>
              {error && (
                <div className="p-3 text-sm text-[#C45B4A] bg-[#FFEBEE] rounded-lg">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-[#5D2850] text-primary-foreground font-semibold py-5"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
              <div className="text-center">
                <Link href="/login" className="text-sm text-primary hover:underline">
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
