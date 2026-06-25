"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, Clock, Globe, Shield, Menu } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter()
  const { toast } = useToast()
  // useAuth removed since we no longer display user info here
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' }))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      toast(`Searching for "${searchQuery}"...`, 'info')
      setSearchQuery('')
    }
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search surveillance records..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full bg-secondary border border-border rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full border border-border">
            <Globe className="w-3 h-3 text-primary" />
            <span>MISSION UTC: {currentTime || '—'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full border border-border">
            <Shield className="w-3 h-3 text-green-500" />
            <span>SYSTEM STATUS: SECURE</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/alerts')}
          className="p-2 hover:bg-secondary rounded-full transition-colors relative cursor-pointer"
          title="View Alerts"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></span>
        </button>
        <button
          onClick={() => toast('Activity timeline coming soon', 'info')}
          className="p-2 hover:bg-secondary rounded-full transition-colors cursor-pointer"
          title="Activity Timeline"
        >
          <Clock className="w-5 h-5" />
        </button>
        
        <div className="h-8 w-[1px] bg-border mx-2"></div>
      </div>
    </header>
  )
}
