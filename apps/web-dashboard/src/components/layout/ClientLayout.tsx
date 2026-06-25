"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from "@/components/layout/Sidebar"
import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { Topbar } from "@/components/layout/Topbar"
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { role, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  
  // Don't show sidebar/topbar on login page
  const isLoginPage = pathname === '/login'
  const isAdminRoute = pathname.startsWith('/admin')

  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdminRoute && role !== 'admin') {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, isAdminRoute, role, router])

  if (isAdminRoute && role !== 'admin') {
    return null // Return nothing while redirecting
  }

  return (
    <div className="flex min-h-screen bg-background">
      {!isLoginPage && (isAdminRoute ? <AdminSidebar /> : <Sidebar />)}
      <div className="flex-1 flex flex-col min-w-0">
        {!isLoginPage && <Topbar />}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </AuthProvider>
  )
}
