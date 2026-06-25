"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { 
  Clock, 
  ShieldAlert, 
  CheckCircle, 
  XCircle,
  Eye,
  Filter
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/Toast"
import { getAlerts, verifyAlert, rejectAlert } from '@/lib/api'
import { useWebSocket } from '@/lib/websocket'

export default function AlertsPage() {
  const { toast } = useToast()
  const [alerts, setAlerts] = useState<any[]>([])
  const { lastMessage } = useWebSocket()

  useEffect(() => {
    // Fetch initial alerts
    getAlerts()
      .then(data => {
        // Map backend alerts to UI structure
        const mapped = data.map((a: any) => ({
          id: a.id,
          location: 'Database Record', // Missing location in simple list
          confidence: 'N/A',
          status: a.status === 'pending' ? 'Pending' : a.status === 'Verified' ? 'Critical' : 'Resolved',
          time: new Date(a.created_at).toLocaleTimeString(),
          camera: 'Unknown'
        }))
        setAlerts(mapped.reverse()) // Show newest first
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (lastMessage && lastMessage.event === 'possible_match_detected') {
      const data = lastMessage.data
      setAlerts(prev => [
        {
          id: data.alert_id,
          location: `Lat: ${data.lat.toFixed(4)}, Lng: ${data.lng.toFixed(4)}`,
          confidence: data.confidence,
          status: 'Pending',
          time: new Date().toLocaleTimeString(),
          camera: data.camera_id
        },
        ...prev
      ])
    }
  }, [lastMessage])

  const handleConfirm = async (id: string) => {
    try {
      await verifyAlert(id)
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Critical' } : a))
      toast(`Alert ${id.substring(0, 8)} confirmed`, 'success')
    } catch (err) {
      toast('Failed to confirm alert', 'error')
    }
  }

  const handleDismiss = async (id: string) => {
    try {
      await rejectAlert(id)
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved' } : a))
      toast(`Alert ${id.substring(0, 8)} rejected`, 'warning')
    } catch (err) {
      toast('Failed to reject alert', 'error')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Alerts</h1>
          <p className="text-muted-foreground">High-confidence facial recognition alerts across the network.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alerts.length === 0 ? (
           <p className="text-muted-foreground text-sm col-span-3">No active alerts.</p>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className={cn(
              "group transition-all hover:border-primary/50 animate-fade-in",
              alert.status === 'Critical' ? "border-red-500/20 bg-red-500/5" : ""
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={alert.status === 'Critical' ? 'destructive' : alert.status === 'Resolved' ? 'success' : 'warning'}>
                    {alert.status}
                  </Badge>
                  <span className="text-[10px] font-mono text-muted-foreground truncate w-24 text-right" title={alert.id}>{alert.id.substring(0, 8)}</span>
                </div>
                <CardTitle className="text-lg leading-tight">{alert.location}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3" />
                  {alert.time} • {alert.camera}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-secondary/50 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden border border-border">
                  {alert.status !== 'Resolved' && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="w-full h-8 bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-scan-line"></div>
                    </div>
                  )}
                  <ShieldAlert className={cn("w-8 h-8 opacity-20", alert.status === 'Resolved' && "text-green-500")} />
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="bg-black/60 backdrop-blur-md border-white/10">
                      {alert.confidence}% Confidence
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border/50">
                   <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                     <Eye className="w-5 h-5 text-muted-foreground" />
                   </div>
                   <div>
                     <p className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Target Identified</p>
                     <p className="text-sm font-medium">Unidentified Subject</p>
                   </div>
                </div>
              </CardContent>
              {alert.status === 'Pending' ? (
                <CardFooter className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => handleConfirm(alert.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleDismiss(alert.id)}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Dismiss
                  </Button>
                </CardFooter>
              ) : (
                <CardFooter>
                  <div className="flex items-center gap-2 w-full justify-center py-1 text-xs text-green-500/70">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="font-medium">Action Taken</span>
                  </div>
                </CardFooter>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
