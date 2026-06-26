"use client"

import React from 'react'
import { Rocket, Construction } from 'lucide-react'

interface ComingSoonLockProps {
  children: React.ReactNode
  version?: string
  title?: string
  description?: string
}

export function PremiumLock({
  children,
  version = 'V2',
  title = 'Coming Soon',
  description = 'This feature is currently under development and will be available in the next major release.'
}: ComingSoonLockProps) {
  return (
    <div className="relative min-h-[60vh]">
      {/* Blurred background content */}
      <div className="pointer-events-none select-none" style={{ filter: 'blur(6px)', opacity: 0.3 }}>
        {children}
      </div>

      {/* Coming Soon overlay */}
      <div className="absolute inset-0 z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 max-w-md text-center px-6">
          {/* Animated icon */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 flex items-center justify-center backdrop-blur-sm">
              <Rocket className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Version badge */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
            <Construction className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">{title} in {version}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

          {/* Status pill */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border/50">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">Under Active Development</span>
          </div>
        </div>
      </div>
    </div>
  )
}
