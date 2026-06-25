"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { ShieldAlert, Crosshair, Map as MapIcon, Battery, Navigation, Radio, Zap } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useWebSocket } from '@/lib/websocket'

import dynamic from 'next/dynamic'

export interface PatrolUnit {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  battery: number;
  charging: boolean;
  status: string;
  lastUpdate: Date;
}

const LiveMap = dynamic(() => import('@/components/map/LiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 border border-border rounded-xl">
      <MapIcon className="w-12 h-12 text-muted-foreground/50 animate-pulse" />
    </div>
  )
})

export default function PatrolBoard() {
  const { lastMessage, isConnected } = useWebSocket()
  const [units, setUnits] = useState<Record<string, PatrolUnit>>({})
  const [focusedLocation, setFocusedLocation] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (!lastMessage) return

    if (lastMessage.type === 'telemetry') {
      const data = lastMessage.data

      if (data.event_type === 'DUTY_OFF' || data.status === 'OFF DUTY') {
        setUnits(prev => {
          const updated = { ...prev }
          delete updated[lastMessage.unit_id]
          return updated
        })
      } else {
        setUnits(prev => ({
          ...prev,
          [lastMessage.unit_id]: {
            id: lastMessage.unit_id,
            name: data.officer_name || `Unit ${lastMessage.unit_id.substring(0, 4).toUpperCase()}`,
            lat: data.lat,
            lng: data.lng,
            battery: data.battery ?? 0,
            charging: data.charging ?? false,
            status: data.status === 'on_duty' ? 'Active Patrol' : data.status || 'Active Patrol',
            lastUpdate: new Date()
          }
        }))
      }
    }
  }, [lastMessage])

  // Simple cleanup of old units
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      setUnits(prev => {
        const updated = { ...prev }
        let changed = false
        for (const [id, unit] of Object.entries(updated)) {
          if (now - unit.lastUpdate.getTime() > 60000) { // older than 60s
            delete updated[id]
            changed = true
          }
        }
        return changed ? updated : prev
      })
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const unitList = Object.values(units)

  const handleUnitClick = (unit: PatrolUnit) => {
    if (unit.lat != null && unit.lng != null) {
      setFocusedLocation([unit.lat, unit.lng])
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patrol & Response Fleet</h1>
          <div className="text-muted-foreground flex items-center gap-2 mt-2">
            Live tactical deployment tracking.
            <Badge variant={isConnected ? "success" : "destructive"}>
              {isConnected ? "Telemetry Active" : "Telemetry Offline"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative h-[600px] bg-slate-900 rounded-xl overflow-hidden border border-border">
          <LiveMap units={unitList} focusedLocation={focusedLocation} />
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          <h3 className="font-semibold uppercase tracking-wider text-sm text-muted-foreground mb-4">Deployed Units ({unitList.length})</h3>
          
          {unitList.length === 0 ? (
            <Card className="bg-secondary/20 border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                <Radio className="w-8 h-8 mx-auto mb-2 opacity-20" />
                No telemetry signals received.
              </CardContent>
            </Card>
          ) : (
            unitList.map(unit => (
              <Card 
                key={unit.id} 
                onClick={() => handleUnitClick(unit)}
                className={cn(
                  "transition-all cursor-pointer hover:border-primary/60",
                  unit.status === 'Offline' ? "opacity-50" : "border-primary/30 bg-primary/5"
                )}
              >
                <CardHeader className="pb-2 p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{unit.name}</CardTitle>
                    <Badge variant={unit.status === 'Offline' ? 'secondary' : 'success'}>{unit.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Navigation className="w-3 h-3" /> Location
                      </span>
                      <span className="font-mono">
                        {unit.lat != null ? unit.lat.toFixed(4) : 'N/A'}, {unit.lng != null ? unit.lng.toFixed(4) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Battery className="w-3 h-3" /> Power
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className={cn(
                            "h-full rounded-full",
                            unit.charging ? "bg-green-400 animate-pulse" : unit.battery > 50 ? "bg-green-500" : unit.battery > 20 ? "bg-yellow-500" : "bg-red-500"
                          )} style={{ width: `${unit.battery}%` }}></div>
                        </div>
                        <span className="font-mono flex items-center gap-1">
                          {unit.battery}%
                          {unit.charging && <Zap className="w-3 h-3 text-green-400 fill-green-400" />}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
