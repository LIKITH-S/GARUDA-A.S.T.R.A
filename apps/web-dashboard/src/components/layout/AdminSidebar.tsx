"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users,
  ShieldAlert,
  Settings,
  ChevronRight,
  ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

const adminNavigation = [
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'System Logs', href: '/admin/logs', icon: ShieldAlert },
  { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { role, fullName, logout } = useAuth()

  return (
    <div className="flex flex-col w-64 bg-card border-r border-border h-full overflow-y-auto">
      <div className="p-4 border-b border-border/40 flex flex-col items-center justify-center bg-red-500/10 shrink-0">
        <img
          src="/GarudASTRAtransparent.png"
          alt="Garuda ASTRA Logo"
          className="h-12 w-auto object-contain mb-2"
        />
        <h2 className="text-sm font-bold text-red-500 tracking-widest uppercase">Admin Portal</h2>
      </div>

      <nav className="flex-1 px-4 space-y-8 mt-6">
        <div>
          <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            ADMINISTRATION
          </h3>
          <ul className="space-y-1">
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md transition-all",
                      isActive
                        ? "bg-red-500/20 text-red-500 border border-red-500/30"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <Link 
          href="/"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium rounded-md bg-secondary text-foreground hover:bg-secondary/80 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dispatch
        </Link>
        
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <img
              src="/GarudaASTRApfp.png"
              alt="User Profile"
              className="w-9 h-9 rounded-full object-cover border border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate max-w-[100px]" title={fullName || 'ADMIN'}>
                {fullName || 'ADMIN'}
              </span>
              <span className="text-[10px] text-red-500 font-bold uppercase">
                {role ? role : 'Administrator'}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              logout()
              window.location.href = '/login'
            }}
            className="p-2 hover:bg-red-500/10 text-red-500 rounded-full transition-colors cursor-pointer"
            title="Log Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
