import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { 
  ShieldAlert, 
  UserCheck, 
  Activity, 
  MapPin, 
  Clock, 
  ExternalLink,
  Search,
  Eye
} from 'lucide-react'
import Image from 'next/image'
import { cn } from "@/lib/utils"

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Command Overview</h1>
          <p className="text-muted-foreground">Real-time surveillance and system intelligence.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            System Metrics
          </Button>
          <Button size="sm">
            <ShieldAlert className="w-4 h-4 mr-2" />
            Active Alerts
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Match Detection Card */}
        <Card className="lg:col-span-2 overflow-hidden border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                Latest Positive Match
              </CardTitle>
              <CardDescription>Confidence Level: 98.4%</CardDescription>
            </div>
            <Badge variant="success" className="animate-pulse">MATCH CONFIRMED</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 h-[240px]">
              <div className="relative rounded-lg overflow-hidden border border-border group cursor-crosshair">
                <div className="absolute top-2 left-2 z-10">
                  <Badge variant="secondary" className="bg-black/50 backdrop-blur-sm">SURVEILLANCE CAM-042</Badge>
                </div>
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                   {/* Placeholder for surveillance image */}
                   <div className="text-muted-foreground flex flex-col items-center gap-2">
                     <Search className="w-8 h-8 opacity-20" />
                     <span className="text-[10px] uppercase tracking-widest opacity-40">Capturing Feed...</span>
                   </div>
                </div>
                <div className="absolute inset-0 border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                  <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                  <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                  <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
                </div>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-border group">
                <div className="absolute top-2 left-2 z-10">
                  <Badge variant="secondary" className="bg-black/50 backdrop-blur-sm">DATABASE RECORD #8812</Badge>
                </div>
                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                   {/* Placeholder for database image */}
                   <div className="text-muted-foreground flex flex-col items-center gap-2">
                     <UserCheck className="w-8 h-8 opacity-20" />
                     <span className="text-[10px] uppercase tracking-widest opacity-40">ID: AR-9921-X</span>
                   </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between pt-6 border-t border-border">
               <div className="flex gap-6">
                 <div>
                   <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Target ID</p>
                   <p className="text-sm font-medium">Aravind Sharma</p>
                 </div>
                 <div>
                   <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Location</p>
                   <p className="text-sm font-medium">Indiranagar Metro Station</p>
                 </div>
                 <div>
                   <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Time</p>
                   <p className="text-sm font-medium">15:40:22 UTC</p>
                 </div>
               </div>
               <Button size="sm" variant="ghost">
                 <Eye className="w-4 h-4 mr-2" />
                 Full Profile
               </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Activity</CardTitle>
            <CardDescription>Live processing logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: '15:42:01', event: 'Camera 042 Feed Reconnected', type: 'info' },
                { time: '15:40:22', event: 'Positive Match: Indiranagar', type: 'success' },
                { time: '15:38:15', event: 'Patrol Unit P-09 Dispatched', type: 'warning' },
                { time: '15:35:50', event: 'Face Detection: 42 objects', type: 'default' },
                { time: '15:30:12', event: 'System Check: All modules OK', type: 'info' },
              ].map((log, i) => (
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
            <Button variant="ghost" className="w-full mt-4 text-xs h-8">View All Logs</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Cameras', value: '1,248', icon: Eye, color: 'text-blue-500' },
          { label: 'Identified Targets', value: '82', icon: UserCheck, color: 'text-green-500' },
          { label: 'Total Alerts (24h)', value: '156', icon: ShieldAlert, color: 'text-yellow-500' },
          { label: 'Patrol Response', value: '98%', icon: Clock, color: 'text-primary' },
        ].map((stat, i) => (
          <Card key={i}>
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
             <CardDescription>Real-time deployment tracking</CardDescription>
           </div>
           <Button variant="outline" size="sm">Manage Units</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             {[
               { id: 'P-09', location: 'Indiranagar', status: 'En Route', time: '4 mins ago' },
               { id: 'P-04', location: 'MG Road', status: 'On Site', time: '12 mins ago' },
               { id: 'P-12', location: 'Koramangala', status: 'Standby', time: 'Now' },
               { id: 'P-22', location: 'Whitefield', status: 'Patrolling', time: '1 hour ago' },
             ].map((unit, i) => (
               <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent hover:border-border">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center font-bold text-xs">
                     {unit.id}
                   </div>
                   <div>
                     <p className="text-sm font-medium">{unit.location}</p>
                     <p className="text-xs text-muted-foreground">ID: {unit.id}-BGLR</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="text-right">
                      <Badge variant={unit.status === 'En Route' ? 'warning' : unit.status === 'On Site' ? 'success' : 'secondary'}>
                        {unit.status}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">{unit.time}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                 </div>
               </div>
             ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
