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
import { PremiumLock } from '@/components/ui/PremiumLock'

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
      { id: 'P-██', location: '██████████', time: 'Since ██:██', type: 'General' },
      { id: 'P-██', location: '██████████', time: 'Since ██:██', type: 'Rapid' },
    ]
  },
  {
    id: 'enroute',
    title: 'En Route',
    units: [
      { id: 'P-██', location: '██████████', target: '██████████', time: 'E.T.A ██m', type: 'Rapid' },
      { id: 'P-██', location: '██████████', target: '██████████', time: 'E.T.A ██m', type: 'Surv' },
    ]
  },
  {
    id: 'onsite',
    title: 'On Site / Active',
    units: [
      { id: 'P-██', location: '██████████', task: '██████████', time: 'Active ██m', type: 'Surv' },
      { id: 'P-██', location: '██████████', task: '██████████', time: 'Active ██h', type: 'Interceptor' },
    ]
  }
]

function StatusContent() {
  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Response Board</h1>
          <p className="text-muted-foreground">Tactical Kanban view of unit deployments and operational states.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" disabled>
            Operational Map
          </Button>
          <Button size="sm" disabled>
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
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-4">
              {column.units.map((unit, idx) => (
                <Card key={idx} className="hover:border-primary/40 transition-colors shadow-sm">
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
                className="w-full border border-dashed border-border/50 h-12 text-muted-foreground text-xs"
                disabled
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

export default function StatusPage() {
  return (
    <PremiumLock
      title="Coming Soon"
      version="V2"
      description="The tactical Response Board with real-time unit deployment tracking, incident management, and Kanban-style operational views is being built for the next release."
    >
      <StatusContent />
    </PremiumLock>
  )
}
