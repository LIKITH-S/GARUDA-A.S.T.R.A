"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { 
  Clock, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  MoreHorizontal,
  Plus
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/Toast"

type Unit = {
  id: string;
  location: string;
  time: string;
  type: string;
  target?: string;
  task?: string;
};

type Column = {
  id: string;
  title: string;
  units: Unit[];
};

const columns: Column[] = [
  {
    id: 'standby',
    title: 'Standby / Ready',
    units: [
      { id: 'P-12', location: 'Koramangala HQ', time: 'Since 14:00', type: 'General' },
      { id: 'P-31', location: 'Jayanagar Depot', time: 'Since 15:20', type: 'Rapid' },
    ]
  },
  {
    id: 'enroute',
    title: 'En Route',
    units: [
      { id: 'P-09', location: 'Indiranagar', target: 'Commercial St.', time: 'E.T.A 4m', type: 'Rapid' },
      { id: 'P-15', location: 'Hebbal', target: 'Airport T1', time: 'E.T.A 12m', type: 'Surv' },
    ]
  },
  {
    id: 'onsite',
    title: 'On Site / Active',
    units: [
      { id: 'P-04', location: 'MG Road Junction', task: 'Crowd Control', time: 'Active 22m', type: 'Surv' },
      { id: 'P-22', location: 'Whitefield', task: 'Search Ops', time: 'Active 1h', type: 'Interceptor' },
    ]
  }
]

export default function StatusPage() {
  const { toast } = useToast()

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Response Board</h1>
          <p className="text-muted-foreground">Tactical Kanban view of unit deployments and operational states.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => toast('Operational map coming soon', 'info')}>
            Operational Map
          </Button>
          <Button size="sm" onClick={() => toast('Incident creation form coming soon', 'info')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Incident
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col gap-4 bg-secondary/10 rounded-xl p-4 border border-border/50">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm uppercase tracking-wider">{column.title}</h3>
                <Badge variant="secondary" className="bg-secondary text-[10px] h-5">{column.units.length}</Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast(`${column.title} options coming soon`, 'info')}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-4">
              {column.units.map((unit) => (
                <Card key={unit.id} className="cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-secondary/50 font-mono text-[10px]">{unit.id}</Badge>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{unit.type}</span>
                      </div>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        column.id === 'onsite' ? 'bg-green-500' : column.id === 'enroute' ? 'bg-yellow-500' : 'bg-blue-500'
                      )}></div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                         <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                         <span className="text-sm font-medium">{unit.location}</span>
                      </div>
                      
                      {unit.target && (
                        <div className="flex items-start gap-2">
                           <ShieldAlert className="w-3.5 h-3.5 text-primary mt-0.5" />
                           <span className="text-xs text-muted-foreground">Target: {unit.target}</span>
                        </div>
                      )}

                      {unit.task && (
                        <div className="flex items-start gap-2">
                           <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5" />
                           <span className="text-xs text-muted-foreground">Task: {unit.task}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 text-[10px] text-muted-foreground border-t border-border/50 mt-3">
                        <Clock className="w-3 h-3" />
                        {unit.time}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button
                variant="ghost"
                className="w-full border border-dashed border-border/50 h-12 text-muted-foreground hover:text-primary hover:border-primary/50 text-xs"
                onClick={() => toast(`Assign unit to ${column.title} coming soon`, 'info')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Assign Unit
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
