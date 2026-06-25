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
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-2">
          <img
            src="/GarudaASTRApfp.png"
            alt="Surya Pratap Profile"
            className="w-9 h-9 rounded-full object-cover border border-border/60"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Surya Pratap</span>
            <span className="text-xs text-muted-foreground">Tactical Inspector</span>
          </div>
        </div>
      </div>
    </div>
  )
}
