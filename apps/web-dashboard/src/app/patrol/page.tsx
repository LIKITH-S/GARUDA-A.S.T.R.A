"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { 
  ShieldAlert, 
  MapPin, 
  Radio, 
  Navigation, 
  Phone,
  Cpu,
  MoreVertical,
  Activity,
  Battery
} from 'lucide-react'
import { cn } from "@/lib/utils"

interface TelemetryRecord {
  unitId: string;
  latitude: number;
  longitude: number;
  batteryLevel: number;
  latencyMs: number;
  timestamp: number;
  lastSeen?: string;
}

const STATIC_UNIT_TEMPLATES: Record<string, { type: string; location: string; status: string; health: string }> = {
  'P-09': { type: 'Rapid Response', location: 'Indiranagar Sector 4', status: 'En Route', health: 'Optimal' },
  'P-04': { type: 'Surveillance', location: 'MG Road Junction', status: 'On Site', health: 'Optimal' },
  'P-12': { type: 'General Patrol', location: 'Koramangala 1st Block', status: 'Standby', health: 'Check Required' },
  'P-22': { type: 'Interceptor', location: 'Whitefield Flyover', status: 'Patrolling', health: 'Optimal' },
  'P-31': { type: 'Rapid Response', location: 'Jayanagar 4th Block', status: 'Standby', health: 'Optimal' },
  'P-15': { type: 'Surveillance', location: 'Hebbal Flyover', status: 'En Route', health: 'Optimal' },
};

export default function PatrolPage() {
  const [patrolUnits, setPatrolUnits] = useState<any[]>([]);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/telemetry');
      if (res.ok) {
        const liveData: TelemetryRecord[] = await res.json();
        
        // Merge live data with our layout templates
        const merged = Object.keys(STATIC_UNIT_TEMPLATES).map((id) => {
          const live = liveData.find((u) => u.unitId === id);
          const template = STATIC_UNIT_TEMPLATES[id];

          if (live) {
            // Compute dynamic location readout based on GPS coordinates
            const locationStr = `${live.latitude.toFixed(4)}° N, ${live.longitude.toFixed(4)}° E`;
            return {
              id,
              ...template,
              location: locationStr,
              battery: live.batteryLevel,
              ping: `${live.latencyMs}ms`,
            };
          }

          // Fallback static mock defaults
          return {
            id,
            ...template,
            battery: id === 'P-09' ? 88 : id === 'P-04' ? 92 : id === 'P-12' ? 45 : id === 'P-22' ? 76 : id === 'P-31' ? 98 : 62,
            ping: id === 'P-09' ? '12ms' : id === 'P-04' ? '24ms' : id === 'P-12' ? '18ms' : id === 'P-22' ? '42ms' : id === 'P-31' ? '8ms' : '56ms',
          };
        });

        setPatrolUnits(merged);
      }
    } catch (error) {
      console.error('Failed to pull telemetry:', error);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    // Poll updates every 4 seconds to be snappy
    const timer = setInterval(fetchTelemetry, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patrol Unit Management</h1>
          <p className="text-muted-foreground">Monitor and coordinate real-time deployment of tactical units.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={fetchTelemetry}>
            <Radio className="w-4 h-4 mr-2" />
            Refresh Telemetry
          </Button>
          <Button size="sm">
            <Navigation className="w-4 h-4 mr-2" />
            Deploy Unit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patrolUnits.map((unit) => (
          <Card key={unit.id} className="relative overflow-hidden group">
            <div className={cn(
              "absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 group-hover:scale-110 transition-transform",
              unit.status === 'En Route' ? 'bg-yellow-500' : unit.status === 'On Site' ? 'bg-green-500' : 'bg-primary'
            )}></div>
            <CardHeader className="pb-2">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Badge variant="outline" className="bg-secondary/50 font-mono">{unit.id}</Badge>
                     <span className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">{unit.type}</span>
                  </div>
                  <Badge variant={unit.status === 'En Route' ? 'warning' : unit.status === 'On Site' ? 'success' : 'secondary'}>
                     <div className={cn(
                       "w-1.5 h-1.5 rounded-full mr-2",
                       unit.status === 'En Route' ? 'bg-yellow-500 animate-pulse' : unit.status === 'On Site' ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'
                     )}></div>
                     {unit.status}
                  </Badge>
               </div>
               <CardTitle className="mt-4 flex items-center gap-2">
                 <ShieldAlert className="w-5 h-5 text-primary" />
                 Tactical Unit {unit.id}
               </CardTitle>
               <CardDescription className="flex items-center gap-2">
                 <MapPin className="w-3.5 h-3.5" />
                 {unit.location}
               </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 bg-secondary/30 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Power</span>
                      <Battery className={cn("w-3 h-3", unit.battery < 50 ? "text-red-500" : "text-green-500")} />
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-lg font-bold">{unit.battery}</span>
                      <span className="text-xs text-muted-foreground mb-1">%</span>
                    </div>
                 </div>
                 <div className="p-3 bg-secondary/30 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Latency</span>
                      <Activity className="w-3 h-3 text-blue-500" />
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-lg font-bold">{unit.ping}</span>
                    </div>
                 </div>
              </div>
              
              <div className="mt-4 p-3 bg-secondary/30 rounded-lg border border-border/50 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
                   <span className="text-xs font-medium">Core Integrity</span>
                 </div>
                 <Badge variant="outline" className={cn(
                   "text-[10px] h-5",
                   unit.health === 'Optimal' ? "text-green-500 border-green-500/20" : "text-yellow-500 border-yellow-500/20"
                 )}>
                   {unit.health}
                 </Badge>
              </div>

              <div className="flex gap-2 mt-6">
                 <Button className="flex-1" size="sm">
                   <Radio className="w-3.5 h-3.5 mr-2" />
                   Comms
                 </Button>
                 <Button variant="outline" className="flex-1" size="sm">
                   <Phone className="w-3.5 h-3.5 mr-2" />
                   Call
                 </Button>
                 <Button variant="ghost" size="icon" className="h-9 w-9">
                   <MoreVertical className="w-3.5 h-3.5" />
                 </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
