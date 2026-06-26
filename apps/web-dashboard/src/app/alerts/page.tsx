"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { 
  Clock, 
  ShieldAlert, 
  CheckCircle, 
  XCircle,
  Eye,
  Filter,
  User,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/Toast"
import { getAlerts, verifyAlert, rejectAlert } from '@/lib/api'
import { useWebSocket } from '@/lib/websocket'

function mapAlert(a: any) {
  return {
    id: String(a.id),
    personName: a.missing_person?.full_name ?? 'Unknown Subject',
    caseNumber: a.missing_person?.case_number ?? '—',
    confidence: a.detection_event?.confidence_score != null
      ? `${a.detection_event.confidence_score.toFixed(1)}`
      : '—',
    status: a.status === 'pending' || a.status === 'Pending'
      ? 'Pending'
      : a.status === 'Verified'
      ? 'Verified'
      : a.status === 'Rejected False Positive'
      ? 'Rejected'
      : a.status,
    rawTime: a.created_at, // ISO string for sorting
    time: new Date(a.created_at).toLocaleTimeString(),
    camera: a.detection_event?.camera_id
      ? String(a.detection_event.camera_id).substring(0, 8)
      : 'Unknown',
    imagePath: a.detection_event?.image_path ?? null,
  }
}

export default function AlertsPage() {
  const { toast } = useToast()
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc') // newest first by default
  const { lastMessage } = useWebSocket()

  const fetchAlerts = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const data = await getAlerts()
      setAlerts(data.map(mapAlert))
    } catch (err) {
      console.error('Failed to fetch alerts', err)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  // Initial load — defer slightly so auth token is available
  useEffect(() => {
    const timer = setTimeout(() => fetchAlerts(false), 100)
    return () => clearTimeout(timer)
  }, [fetchAlerts])

  // Real-time update: prepend alert from WS immediately, then silently re-fetch full data
  useEffect(() => {
    if (lastMessage && lastMessage.event === 'possible_match_detected') {
      const d = lastMessage.data
      // Optimistic UI: show immediately with partial data
      const optimistic = {
        id: String(d.alert_id),
        personName: 'Unknown Subject',
        caseNumber: '—',
        confidence: String(d.confidence),
        status: 'Pending',
        rawTime: new Date().toISOString(),
        time: new Date().toLocaleTimeString(),
        camera: String(d.camera_id).substring(0, 8),
        imagePath: null,
      }
      setAlerts(prev => {
        // avoid duplicate if already exists
        if (prev.find(a => a.id === optimistic.id)) return prev
        return [optimistic, ...prev]
      })
      // Silent background refresh to replace optimistic entry with full data
      setTimeout(() => fetchAlerts(true), 800)
    }
  }, [lastMessage, fetchAlerts])

  // Sorted list derived from state
  const sortedAlerts = [...alerts].sort((a, b) => {
    const ta = new Date(a.rawTime ?? a.time).getTime()
    const tb = new Date(b.rawTime ?? b.time).getTime()
    return sortDir === 'desc' ? tb - ta : ta - tb
  })

  const handleConfirm = async (id: string) => {
    try {
      await verifyAlert(id)
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Verified' } : a))
      toast(`Alert ${id.substring(0, 8)} confirmed`, 'success')
    } catch (err) {
      toast('Failed to confirm alert', 'error')
    }
  }

  const handleDismiss = async (id: string) => {
    try {
      await rejectAlert(id)
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Rejected' } : a))
      toast(`Alert ${id.substring(0, 8)} rejected`, 'warning')
    } catch (err) {
      toast('Failed to reject alert', 'error')
    }
  }

  const badgeVariant = (status: string) => {
    if (status === 'Verified') return 'destructive'
    if (status === 'Rejected') return 'success'
    return 'warning'
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Alerts</h1>
          <p className="text-muted-foreground">High-confidence facial recognition alerts across the network.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
          >
            {sortDir === 'desc'
              ? <ArrowDown className="w-4 h-4 mr-2" />
              : <ArrowUp className="w-4 h-4 mr-2" />}
            {sortDir === 'desc' ? 'Newest First' : 'Oldest First'}
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => fetchAlerts(false)}>
            <Filter className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading alerts...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAlerts.length === 0 ? (
            <p className="text-muted-foreground text-sm col-span-3">No active alerts.</p>
          ) : (
            sortedAlerts.map((alert) => (
              <Card key={alert.id} className={cn(
                "group transition-all hover:border-primary/50 animate-fade-in",
                alert.status === 'Verified' ? "border-red-500/20 bg-red-500/5" : "",
                alert.status === 'Pending' ? "border-yellow-500/20" : ""
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={badgeVariant(alert.status)}>
                      {alert.status}
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground truncate w-24 text-right" title={alert.id}>
                      #{alert.id.substring(0, 8)}
                    </span>
                  </div>
                  <CardTitle className="text-lg leading-tight">{alert.personName}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3" />
                    {alert.time} • Camera {alert.camera}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-secondary/50 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden border border-border">
                    {alert.status === 'Pending' && (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="w-full h-8 bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-scan-line"></div>
                      </div>
                    )}
                    <ShieldAlert className={cn("w-8 h-8 opacity-20", alert.status === 'Rejected' && "text-green-500")} />
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="bg-black/60 backdrop-blur-md border-white/10">
                        {alert.confidence}% Confidence
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border/50">
                    <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Missing Person</p>
                      <p className="text-sm font-medium">{alert.personName}</p>
                      <p className="text-xs text-muted-foreground">Case #{alert.caseNumber}</p>
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
                    <div className="flex items-center gap-2 w-full justify-center py-1 text-xs text-muted-foreground">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="font-medium">{alert.status === 'Verified' ? 'Dispatch Triggered' : 'Marked as False Positive'}</span>
                    </div>
                  </CardFooter>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
