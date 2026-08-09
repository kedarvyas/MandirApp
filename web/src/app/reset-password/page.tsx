'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const MIN_PASSWORD_LENGTH = 8

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // null while we are still checking, so we don't flash the wrong state.
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  const supabase = createClient()

  // /auth/confirm exchanges the recovery token for a session before redirecting
  // here. Landing here without one means the link was stale, already used, or
  // opened directly.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session)
    })
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setError(error.message)
        return
      }

      window.location.href = '/dashboard'
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
            {hasSession === false ? 'Link expired' : 'Set a new password'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {hasSession === false
              ? 'This password reset link is no longer valid.'
              : 'Choose a new password for your Sanctum account.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {hasSession === null ? (
            <p className="text-sm text-muted-foreground text-center py-4">Checking your link...</p>
          ) : hasSession === false ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Reset links expire after one hour and can only be used once.
                Request a new one to continue.
              </p>
              <Link href="/forgot-password">
                <Button className="w-full bg-primary hover:bg-[#5D2850] text-primary-foreground font-semibold py-5">
                  Request a new link
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-accent focus:border-primary focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground">
                  At least {MIN_PASSWORD_LENGTH} characters.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? 'Saving...' : 'Update password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
