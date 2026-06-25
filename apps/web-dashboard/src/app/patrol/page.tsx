"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { ShieldAlert, Crosshair, Map as MapIcon, Battery, Navigation, Radio } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useWebSocket } from '@/lib/websocket'

export default function PatrolBoard() {
  const { lastMessage, isConnected } = useWebSocket()
  const [units, setUnits] = useState<Record<string, any>>({})

  useEffect(() => {
    if (!lastMessage) return

    if (lastMessage.type === 'telemetry') {
      const data = lastMessage.data
      setUnits(prev => ({
        ...prev,
        [lastMessage.unit_id]: {
          id: lastMessage.unit_id,
          name: `Unit ${lastMessage.unit_id.substring(0, 4).toUpperCase()}`,
          lat: data.lat,
          lng: data.lng,
          battery: data.battery,
          status: 'Active Patrol',
          lastUpdate: new Date()
        }
      }))
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
            updated[id] = { ...unit, status: 'Offline' }
            changed = true
          }
        }
        return changed ? updated : prev
      })
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const unitList = Object.values(units)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patrol & Response Fleet</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Live tactical deployment tracking.
            <Badge variant={isConnected ? "success" : "destructive"}>
              {isConnected ? "Telemetry Active" : "Telemetry Offline"}
            </Badge>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative h-[600px] bg-slate-900 rounded-xl overflow-hidden border border-border flex items-center justify-center">
           <div className="absolute inset-0 opacity-20"
             style={{
               backgroundImage: 'linear-gradient(rgba(3,181,211,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(3,181,211,0.2) 1px, transparent 1px)',
               backgroundSize: '40px 40px'
             }}
           ></div>
           
           <MapIcon className="w-24 h-24 text-muted-foreground/20 absolute" />
           <p className="text-muted-foreground/40 absolute mt-32 font-bold tracking-widest uppercase">Tactical Map Placeholder</p>

           {unitList.map((u) => (
             <div key={u.id} className="absolute z-10 flex flex-col items-center" style={{
               // Mocking a relative position on a 0-100 grid for demonstration if lat/lng are small diffs
               // Real map would use leaflet or mapbox
               left: `${(u.lng % 0.1) * 1000}%`,
               top: `${(u.lat % 0.1) * 1000}%`
             }}>
               <div className="w-4 h-4 bg-primary rounded-full animate-ping absolute opacity-75"></div>
               <div className="w-4 h-4 bg-primary border-2 border-background rounded-full relative z-10 shadow-[0_0_15px_rgba(3,181,211,0.8)]"></div>
               <Badge className="mt-2 bg-black/80 backdrop-blur-sm border-primary/50 text-[10px] whitespace-nowrap">
                 {u.name}
               </Badge>
             </div>
           ))}
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
              <Card key={unit.id} className={cn(
                "transition-all",
                unit.status === 'Offline' ? "opacity-50" : "border-primary/30 bg-primary/5"
              )}>
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
                      <span className="font-mono">{unit.lat.toFixed(4)}, {unit.lng.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Battery className="w-3 h-3" /> Power
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className={cn(
                            "h-full rounded-full",
                            unit.battery > 50 ? "bg-green-500" : unit.battery > 20 ? "bg-yellow-500" : "bg-red-500"
                          )} style={{ width: `${unit.battery}%` }}></div>
                        </div>
                        <span className="font-mono">{unit.battery}%</span>
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
