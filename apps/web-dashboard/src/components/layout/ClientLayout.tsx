"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from "@/components/layout/Sidebar"
import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { Topbar } from "@/components/layout/Topbar"
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useWebSocket, WebSocketProvider } from '@/lib/websocket'

export function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { role, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { lastMessage } = useWebSocket()
  
  // Audio context ref
  const audioContextRef = useRef<AudioContext | null>(null)

  // Pre-warm AudioContext on first user interaction (browser autoplay policy)
  useEffect(() => {
    const unlock = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume()
      }
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchstart', unlock)
      document.removeEventListener('keydown', unlock)
    }
    document.addEventListener('click', unlock)
    document.addEventListener('touchstart', unlock)
    document.addEventListener('keydown', unlock)
    return () => {
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchstart', unlock)
      document.removeEventListener('keydown', unlock)
    }
  }, [])
  
  // Don't show sidebar/topbar on login page
  const isLoginPage = pathname === '/login'
  const isAdminRoute = pathname.startsWith('/admin')

  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdminRoute && role !== 'admin') {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, isAdminRoute, role, router])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Global alert sound
  useEffect(() => {
    if (lastMessage && lastMessage.event === 'possible_match_detected') {
      const ctx = audioContextRef.current
      if (!ctx) return // Not yet unlocked by user interaction
      
      const play = () => {
        const playBeep = (freq: number, startTime: number, duration: number) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'square'
          osc.frequency.setValueAtTime(freq, startTime)
          gain.gain.setValueAtTime(0.1, startTime)
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(startTime)
          osc.stop(startTime + duration)
        }
        const now = ctx.currentTime
        playBeep(880, now, 0.15)
        playBeep(1108, now + 0.2, 0.3)
      }

      if (ctx.state === 'suspended') {
        ctx.resume().then(play).catch(e => console.error('Audio resume failed', e))
      } else {
        try { play() } catch (e) { console.error('Failed to play alert sound', e) }
      }
    }
  }, [lastMessage])

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (isAdminRoute && role !== 'admin') {
    return null // Return nothing while redirecting
  }

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      {/* Mobile Overlay */}
      {mobileMenuOpen && !isLoginPage && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar */}
      {!isLoginPage && (
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:flex",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          {isAdminRoute ? <AdminSidebar /> : <Sidebar />}
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {!isLoginPage && <Topbar onMenuClick={() => setMobileMenuOpen(true)} />}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ClientLayoutBridge>{children}</ClientLayoutBridge>
    </AuthProvider>
  )
}

/** Bridge component that reads auth context and passes it to WebSocketProvider */
function ClientLayoutBridge({ children }: { children: React.ReactNode }) {
  const { token, logout } = useAuth()
  return (
    <WebSocketProvider token={token} onAuthExpired={logout}>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </WebSocketProvider>
  )
}
