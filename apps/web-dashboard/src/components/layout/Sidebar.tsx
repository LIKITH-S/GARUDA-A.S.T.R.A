"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Bell,
  Upload,
  History,
  UserSearch,
  ShieldAlert,
  CheckCircle2,
  Cpu,
  Users,
  Settings,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Live Alerts', href: '/alerts', icon: Bell },
  { name: 'Surveillance Uploads', href: '/uploads', icon: Upload },
  { name: 'Detection Logs', href: '/logs', icon: History },
  { name: 'Missing Persons', href: '/missing', icon: UserSearch },
  { name: 'Patrol Units', href: '/patrol', icon: ShieldAlert },
  { name: 'Response Status', href: '/status', icon: CheckCircle2 },
]

const systemNavigation = [
  { name: 'AI Services', href: '/system/services', icon: Cpu },
  { name: 'Users', href: '/system/users', icon: Users },
  { name: 'Settings', href: '/system/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { role, fullName, logout } = useAuth()

  return (
    <div className="flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0 overflow-y-auto">
      <div className="p-4 border-b border-border/40 flex items-center justify-center bg-secondary/10">
        <img
          src="/GarudASTRAtransparent.png"
          alt="Garuda ASTRA Logo"
          className="h-16 w-auto object-contain"
        />
      </div>

      <nav className="flex-1 px-4 space-y-8">
        <div>
          <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            OPERATIONS
          </h3>
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground"
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

        <div>
          <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            SYSTEM
          </h3>
          <ul className="space-y-1">
            {systemNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground"
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
            
            {role === 'admin' && (
              <li className="mt-4 pt-4 border-t border-border/40">
                <Link
                  href="/admin/users"
                  className="flex items-center justify-between px-4 py-2 text-sm font-bold rounded-md transition-all text-red-500 hover:bg-red-500/10"
                >
                  <div className="flex items-center gap-3">
                    <img src="/GarudASTRAtransparent.png" alt="Logo" className="w-5 h-5 object-contain" />
                    Admin Portal
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <img
              src="/GarudaASTRApfp.png"
              alt="User Profile"
              className="w-9 h-9 rounded-full object-cover border border-border/60"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate max-w-[100px]" title={fullName || 'COMMAND CENTER'}>
                {fullName || 'COMMAND CENTER'}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase">
                {role ? role : 'Level 4 Clearance'}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              logout()
              // Next.js Link/router will handle redirect but since we are in Sidebar we need router
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
