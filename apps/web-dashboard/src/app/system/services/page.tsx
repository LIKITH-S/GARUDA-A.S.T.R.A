"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { 
  Cpu, 
  Database, 
  Activity, 
  Zap, 
  ShieldCheck, 
  RefreshCcw,
  BarChart3,
  Layers
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/Toast"
import { PremiumLock } from '@/components/ui/PremiumLock'

const services = [
  { name: 'Facial Extraction Engine', status: 'Operational', uptime: '99.99%', latency: '42ms', load: '12%', icon: Cpu },
  { name: 'Biometric Matcher (V4)', status: 'Operational', uptime: '99.95%', latency: '156ms', load: '65%', icon: Layers },
  { name: 'Motion Analytics API', status: 'Operational', uptime: '98.42%', latency: '12ms', load: '8%', icon: Activity },
  { name: 'Geospatial Coordinator', status: 'Operational', uptime: '100%', latency: '5ms', load: '2%', icon: ShieldCheck },
  { name: 'Missing Persons DB', status: 'Operational', uptime: '99.99%', latency: '24ms', load: '42%', icon: Database },
  { name: 'Neural Network Cluster A', status: 'Degraded', uptime: '84.21%', latency: '450ms', load: '98%', icon: Zap },
]

function ServicesContent() {
  const { toast } = useToast()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Services Health</h1>
          <p className="text-muted-foreground">Monitor the status and performance of backend intelligence modules.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Restart Cluster
          </Button>
          <Button size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Full Metrics
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.name} className={cn(
            "relative overflow-hidden",
            service.status === 'Degraded' ? "border-red-500/30" : ""
          )}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-secondary rounded-lg">
                  <service.icon className={cn(
                    "w-5 h-5",
                    service.status === 'Operational' ? "text-primary" : "text-red-500"
                  )} />
                </div>
                <Badge variant={service.status === 'Operational' ? 'success' : 'destructive'}>
                  {service.status}
                </Badge>
              </div>
              <CardTitle className="text-lg mt-4">{service.name}</CardTitle>
              <CardDescription>Module Instance ID: {Math.random().toString(36).substring(7).toUpperCase()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Uptime</p>
                     <p className="text-sm font-semibold">{service.uptime}</p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Latency</p>
                     <p className="text-sm font-semibold">{service.latency}</p>
                   </div>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Load / Traffic</span>
                      <span className="text-[10px] font-mono">{service.load}</span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                       <div 
                         className={cn(
                           "h-full transition-all",
                           parseInt(service.load) > 90 ? "bg-red-500" : parseInt(service.load) > 60 ? "bg-yellow-500" : "bg-primary"
                         )} 
                         style={{ width: service.load }}
                       ></div>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="bg-secondary/20">
         <CardHeader>
            <CardTitle className="text-lg">Infrastructure Log</CardTitle>
         </CardHeader>
         <CardContent>
            <div className="font-mono text-xs text-muted-foreground space-y-1">
               <p>[15:42:01] Service &apos;Facial Extraction&apos; received 1.2k new requests.</p>
               <p>[15:41:55] Neural Cluster A latency spiked to 450ms. Rerouting traffic...</p>
               <p>[15:41:30] Backup Matcher synced successfully with Registry DB.</p>
               <p className="text-primary animate-pulse">[15:42:15] Listening for incoming mission data...</p>
            </div>
         </CardContent>
      </Card>
    </div>
  )
}

export default function ServicesPage() {
  return (
    <PremiumLock
      title="Coming Soon"
      version="V2"
      description="Real-time AI service health monitoring, latency tracking, and cluster management are being built for the next release."
    >
      <ServicesContent />
    </PremiumLock>
  )
}
