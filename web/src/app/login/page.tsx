'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        window.location.href = '/dashboard'
      }
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
          {/* Om Symbol Logo */}
          <div className="mx-auto w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
            <span className="text-5xl text-primary">ॐ</span>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Mandir Front Desk</CardTitle>
          <CardDescription className="text-muted-foreground">Sign in to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
