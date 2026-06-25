"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { ShieldAlert, ScanLine } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/ui/Toast'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@garuda.astra')
  const [password, setPassword] = useState('admin123')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
      
      const formData = new URLSearchParams()
      formData.append('username', email)
      formData.append('password', password)

      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      })

      if (!response.ok) {
        throw new Error('Invalid credentials')
      }

      const data = await response.json()
      login(data.access_token, data.role, data.user_id)
      toast('Authorization granted.', 'success')
      
    } catch (err) {
      toast('Access denied. Invalid credentials.', 'destructive')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background styling */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      ></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(3,181,211,0.05),transparent_60%)]"></div>
      
      <Card className="w-full max-w-md relative z-10 border-primary/20 bg-card/80 backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 relative">
            <ScanLine className="absolute w-12 h-12 text-primary opacity-20 animate-pulse" />
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">GARUDA A.S.T.R.A</CardTitle>
            <CardDescription className="text-xs uppercase tracking-widest mt-1">Command Center Access</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Operator ID</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono transition-shadow"
                  placeholder="admin@garuda.astra"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Encryption Key</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono transition-shadow"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full h-12 font-bold tracking-widest text-sm relative overflow-hidden group" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  <span>AUTHORIZING...</span>
                </div>
              ) : (
                <span>INITIATE LINK</span>
              )}
              {!isLoading && (
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
              )}
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-border/50 text-center">
             <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
               Secure Connection • AES-256 • Authorized Personnel Only
             </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
