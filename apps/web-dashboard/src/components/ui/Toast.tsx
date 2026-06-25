"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react'

type ToastVariant = 'success' | 'info' | 'warning' | 'error'

interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextType {
  toast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const variantConfig: Record<ToastVariant, { icon: React.ElementType; bg: string; border: string; text: string }> = {
  success: { icon: CheckCircle2, bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
  info: { icon: Info, bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  error: { icon: XCircle, bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => {
          const config = variantConfig[t.variant] || variantConfig.info
          const Icon = config.icon
          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-xl shadow-2xl",
                "animate-slide-in-right min-w-[320px] max-w-[420px]",
                config.bg,
                config.border
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0", config.text)} />
              <p className="text-sm font-medium text-foreground flex-1">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded hover:bg-white/10 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
