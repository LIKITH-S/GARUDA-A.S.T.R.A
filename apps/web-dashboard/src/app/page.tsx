"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { 
  ShieldAlert, 
  UserCheck, 
  Clock, 
  ExternalLink,
  Eye,
  Fingerprint,
  ScanLine
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/Toast"
import { useWebSocket } from '@/lib/websocket'
import { getAlerts, getMissingPersons } from '@/lib/api'

export default function Dashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { lastMessage, isConnected } = useWebSocket()
  
  const [stats, setStats] = useState({
    cameras: '1,248',
    identified: 0,
    alerts: 0,
    patrolResponse: '98%'
  })

  const [latestMatch, setLatestMatch] = useState<any>(null)
  const [activityLogs, setActivityLogs] = useState<any[]>([
    { time: new Date().toLocaleTimeString(), event: 'System Check: All modules OK', type: 'info' }
  ])
  const [patrolUnits, setPatrolUnits] = useState<Record<string, any>>({})

  useEffect(() => {
    // Initial fetch for stats
    Promise.all([getAlerts(), getMissingPersons()]).then(([alertsRes, personsRes]) => {
      setStats(prev => ({
        ...prev,
        alerts: alertsRes.length,
        identified: personsRes.filter((p: any) => p.status === 'Found').length
      }))
    }).catch(console.error)
  }, [])

  useEffect(() => {
    if (!lastMessage) return

    const timeStr = new Date().toLocaleTimeString()

    if (lastMessage.event === 'possible_match_detected') {
      const data = lastMessage.data
      setLatestMatch({
        id: data.missing_person_id,
        name: `Subject #${data.missing_person_id.substring(0, 6)}`, // We would normally fetch the full name here
        location: `Lat: ${data.lat.toFixed(4)}, Lng: ${data.lng.toFixed(4)}`,
        confidence: data.confidence,
        camera: data.camera_id,
        time: timeStr
      })
      setActivityLogs(prev => [
        { time: timeStr, event: `Positive Match: ${data.camera_id} (${data.confidence}%)`, type: 'success' },
        ...prev
      ].slice(0, 10))
      
      toast(`New match detected on ${data.camera_id}!`, 'warning')
      
      setStats(prev => ({ ...prev, alerts: prev.alerts + 1 }))
    } else if (lastMessage.type === 'telemetry') {
      const unit = lastMessage.unit_id
      const data = lastMessage.data
      setPatrolUnits(prev => ({
        ...prev,
        [unit]: {
          id: unit,
          location: `Lat: ${data.lat?.toFixed(4)}, Lng: ${data.lng?.toFixed(4)}`,
          status: 'Active',
          time: 'Just Now'
        }
      }))
    } else if (lastMessage.type === 'assignment') {
      setActivityLogs(prev => [
        { time: timeStr, event: `Patrol Unit Assigned to Alert ${lastMessage.alert_id}`, type: 'warning' },
        ...prev
      ].slice(0, 10))
    }
  }, [lastMessage, toast])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Command Overview</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Real-time surveillance and system intelligence.
            <Badge variant={isConnected ? "success" : "destructive"}>
              {isConnected ? "Live Connection" : "Disconnected"}
            </Badge>
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="sm" onClick={() => router.push('/alerts')}>
            <ShieldAlert className="w-4 h-4 mr-2" />
            Active Alerts
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 overflow-hidden border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                Latest Positive Match
              </CardTitle>
              <CardDescription>
                {latestMatch ? `Confidence Level: ${latestMatch.confidence}%` : 'Waiting for incoming match...'}
              </CardDescription>
            </div>
            {latestMatch && <Badge variant="success" className="animate-glow-ring">MATCH CONFIRMED</Badge>}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 h-[240px]">
              <div className="relative rounded-lg overflow-hidden border border-border group bg-slate-900 flex items-center justify-center">
                <div className="absolute top-2 left-2 z-10">
                  <Badge variant="secondary" className="bg-black/60 backdrop-blur-sm border-white/10">
                    {latestMatch?.camera || 'SURVEILLANCE CAM'}
                  </Badge>
                </div>
                {latestMatch && (
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-red-400">LIVE</span>
                  </div>
                )}
                <div className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                ></div>
                {latestMatch && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="w-full h-12 bg-gradient-to-b from-transparent via-primary/15 to-transparent animate-scan-line"></div>
                  </div>
                )}
                <div className="text-muted-foreground flex flex-col items-center gap-2 z-10">
                  <ScanLine className={cn("w-10 h-10 opacity-30", latestMatch && "text-primary opacity-80")} />
                  <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">
                    {latestMatch ? 'Active Feed' : 'Standby Mode'}
                  </span>
                </div>
              </div>

              <div className="relative rounded-lg overflow-hidden border border-border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center">
                <div className="absolute top-2 left-2 z-10">
                  <Badge variant="secondary" className="bg-black/60 backdrop-blur-sm border-white/10">
                    DATABASE RECORD
                  </Badge>
                </div>
                {latestMatch ? (
                  <div className="flex flex-col items-center gap-3 z-10">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/30 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary/80">ID</span>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground/90">{latestMatch.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">ID: {latestMatch.id}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Fingerprint className="w-3 h-3 text-green-500/70" />
                      <span className="text-[9px] text-green-400/80 font-bold uppercase tracking-wider">AI Verified</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No recent matches</p>
                )}
              </div>
            </div>
            
            {latestMatch && (
              <div className="mt-6 flex items-center justify-between pt-6 border-t border-border">
                 <div className="flex gap-6">
                   <div>
                     <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Target ID</p>
                     <p className="text-sm font-medium">{latestMatch.name}</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Location</p>
                     <p className="text-sm font-medium">{latestMatch.location}</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Time</p>
                     <p className="text-sm font-medium">{latestMatch.time}</p>
                   </div>
                 </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Activity</CardTitle>
            <CardDescription>Live processing logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityLogs.map((log, i) => (
                <div key={i} className="flex gap-3 text-xs border-l-2 border-border pl-3 pb-4 last:pb-0 relative">
                  <div className={cn(
                    "absolute -left-[5px] top-0 w-2 h-2 rounded-full",
                    log.type === 'success' ? 'bg-green-500' :
                    log.type === 'warning' ? 'bg-yellow-500' :
                    log.type === 'info' ? 'bg-blue-500' : 'bg-muted-foreground'
                  )}></div>
                  <span className="font-mono text-muted-foreground whitespace-nowrap">{log.time}</span>
                  <span className="font-medium">{log.event}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Cameras', value: stats.cameras, icon: Eye, color: 'text-blue-500' },
          { label: 'Identified Targets', value: stats.identified, icon: UserCheck, color: 'text-green-500' },
          { label: 'Total Alerts', value: stats.alerts, icon: ShieldAlert, color: 'text-yellow-500' },
          { label: 'Patrol Response', value: stats.patrolResponse, icon: Clock, color: 'text-primary' },
        ].map((stat, i) => (
          <Card key={i} className="group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={cn("p-2 bg-secondary rounded-lg", stat.color)}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
           <div>
             <CardTitle className="text-lg">Recent Patrol Units Status</CardTitle>
             <CardDescription>Live deployment tracking via WebSocket</CardDescription>
           </div>
           <Button variant="outline" size="sm" onClick={() => router.push('/patrol')}>Manage Units</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             {Object.keys(patrolUnits).length === 0 ? (
               <p className="text-sm text-muted-foreground">No live telemetry received yet.</p>
             ) : (
               Object.values(patrolUnits).map((unit: any, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent border-border cursor-pointer"
                      onClick={() => router.push('/patrol')}>
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center font-bold text-[10px] truncate px-1">
                       {unit.id.substring(0, 6)}
                     </div>
                     <div>
                       <p className="text-sm font-medium">{unit.location}</p>
                       <p className="text-xs text-muted-foreground">ID: {unit.id}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="text-right">
                        <Badge variant="success">{unit.status}</Badge>
                        <p className="text-[10px] text-muted-foreground mt-1">{unit.time}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); router.push('/patrol'); }}>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                   </div>
                 </div>
               ))
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
