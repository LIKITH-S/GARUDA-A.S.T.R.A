"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
import { AuthProvider } from '@/lib/auth-context'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Don't show sidebar/topbar on login page
  const isLoginPage = pathname === '/login'

  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-background">
        {!isLoginPage && <Sidebar />}
        <div className="flex-1 flex flex-col min-w-0">
          {!isLoginPage && <Topbar />}
          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  )
}
