"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  token: string | null;
  role: string | null;
  userId: string | null;
  fullName: string | null;
  login: (token: string, role: string, userId: string, fullName?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  role: null,
  userId: null,
  fullName: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [fullName, setFullName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check localStorage on mount
    const storedToken = localStorage.getItem('astra_token')
    const storedRole = localStorage.getItem('astra_role')
    const storedUserId = localStorage.getItem('astra_userId')
    const storedFullName = localStorage.getItem('astra_fullName')

    if (storedToken) {
      setToken(storedToken)
      setRole(storedRole)
      setUserId(storedUserId)
      setFullName(storedFullName)
    }
    
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Basic route protection
    if (!isLoading) {
      if (!token && pathname !== '/login') {
        router.push('/login')
      } else if (token && pathname === '/login') {
        router.push('/')
      }
    }
  }, [token, isLoading, pathname, router])

  const login = (newToken: string, newRole: string, newUserId: string, newFullName?: string) => {
    setToken(newToken)
    setRole(newRole)
    setUserId(newUserId)
    if (newFullName) setFullName(newFullName)
    
    localStorage.setItem('astra_token', newToken)
    localStorage.setItem('astra_role', newRole)
    localStorage.setItem('astra_userId', newUserId)
    if (newFullName) localStorage.setItem('astra_fullName', newFullName)
    
    router.push('/')
  }

  const logout = () => {
    setToken(null)
    setRole(null)
    setUserId(null)
    setFullName(null)
    localStorage.removeItem('astra_token')
    localStorage.removeItem('astra_role')
    localStorage.removeItem('astra_userId')
    localStorage.removeItem('astra_fullName')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{
      token,
      role,
      userId,
      fullName,
      login,
      logout,
      isAuthenticated: !!token,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
