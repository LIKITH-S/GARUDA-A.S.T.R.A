import React from 'react'
import { Search, Bell, Clock, Globe, Shield } from 'lucide-react'

export function Topbar() {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search surveillance records..." 
            className="w-full bg-secondary border border-border rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        
        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full border border-border">
            <Globe className="w-3 h-3 text-primary" />
            <span>MISSION UTC: 15:42:01</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full border border-border">
            <Shield className="w-3 h-3 text-green-500" />
            <span>SYSTEM STATUS: SECURE</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-secondary rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></span>
        </button>
        <button className="p-2 hover:bg-secondary rounded-full transition-colors">
          <Clock className="w-5 h-5" />
        </button>
        
        <div className="h-8 w-[1px] bg-border mx-2"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">COMMAND CENTER</p>
            <p className="text-[10px] text-primary uppercase font-bold tracking-tighter">Level 4 Clearance</p>
          </div>
        </div>
      </div>
    </header>
  )
}
