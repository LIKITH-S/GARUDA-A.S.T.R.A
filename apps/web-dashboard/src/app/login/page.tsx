"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { ShieldAlert, ScanLine } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/ui/Toast'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@astra.gov')
  const [password, setPassword] = useState('Password123!')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
      
      const formData = new URLSearchParams()
      formData.append('username', email.trim().toLowerCase())
      formData.append('password', password)

      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      })

      const data = await response.json()

      if (!response.ok) {
        let errorMsg = 'Login failed'
        if (data.error && data.error.message) {
          errorMsg = data.error.message
        } else if (typeof data.detail === 'string') {
          errorMsg = data.detail
        } else if (Array.isArray(data.detail)) {
          errorMsg = data.detail[0].msg
        }
        toast(errorMsg, 'error')
        return
      }

      // Block Patrol Units from logging into Web Dashboard
      if (data.role && (data.role.toLowerCase() === 'patrol officer' || data.role.toLowerCase() === 'patrol')) {
        toast('Patrol Units cannot access the Web Dashboard.', 'error')
        return
      }

      login(data.access_token, data.role, data.user_id, data.full_name)
      toast('Authorization granted.', 'success')
      
    } catch (err: any) {
      toast(err.message || 'Access denied. Invalid credentials.', 'error')
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
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-secondary/50 border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono transition-shadow pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
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
