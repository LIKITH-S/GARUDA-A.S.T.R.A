import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { 
  Bell, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  CheckCircle, 
  XCircle,
  Eye,
  Filter
} from 'lucide-react'

import { cn } from "@/lib/utils"

const alerts = [
  { id: 'AL-9021', location: 'Commercial Street Entrance', confidence: 99.2, status: 'Critical', time: '2 mins ago', camera: 'CAM-012' },
  { id: 'AL-9020', location: 'Lalbagh West Gate', confidence: 88.5, status: 'Pending', time: '5 mins ago', camera: 'CAM-088' },
  { id: 'AL-9019', location: 'Brigade Road Junction', confidence: 96.7, status: 'Critical', time: '12 mins ago', camera: 'CAM-003' },
  { id: 'AL-9018', location: 'Bannerghatta Zoo Entrance', confidence: 72.1, status: 'Resolved', time: '45 mins ago', camera: 'CAM-112' },
  { id: 'AL-9017', location: 'Phoenix Mall Atrium', confidence: 94.3, status: 'Critical', time: '1 hour ago', camera: 'CAM-045' },
  { id: 'AL-9016', location: 'Kempagowda Airport T2', confidence: 91.0, status: 'Pending', time: '2 hours ago', camera: 'CAM-201' },
]

export default function AlertsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Alerts</h1>
          <p className="text-muted-foreground">High-confidence facial recognition alerts across the network.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            Resolve All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alerts.map((alert) => (
          <Card key={alert.id} className={cn(
            "group transition-all hover:border-primary/50",
            alert.status === 'Critical' ? "border-red-500/20 bg-red-500/5" : ""
          )}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={alert.status === 'Critical' ? 'destructive' : alert.status === 'Resolved' ? 'success' : 'warning'}>
                  {alert.status}
                </Badge>
                <span className="text-[10px] font-mono text-muted-foreground">{alert.id}</span>
              </div>
              <CardTitle className="text-lg leading-tight">{alert.location}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3" />
                {alert.time} • {alert.camera}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-secondary/50 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden border border-border">
                <ShieldAlert className="w-8 h-8 opacity-20" />
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
            <CardFooter className="flex gap-2">
              <Button size="sm" className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <XCircle className="w-4 h-4 mr-2" />
                Dismiss
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

