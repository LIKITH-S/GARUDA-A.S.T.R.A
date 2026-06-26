"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/Table"
import { 
  Search, 
  Filter, 
  Download, 
  Calendar,
  MoreVertical,
  ArrowUpDown
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { PremiumLock } from '@/components/ui/PremiumLock'

const sampleDetections = [
  { id: 'DET-10292', person: '████████', confidence: 94.2, camera: 'CAM-012', location: '██████████', time: '2024-05-12 15:42:01', status: 'Flagged' },
  { id: 'DET-10291', person: '████████', confidence: 99.8, camera: 'CAM-088', location: '██████████', time: '2024-05-12 15:40:45', status: 'Matched' },
  { id: 'DET-10290', person: '████████', confidence: 42.5, camera: 'CAM-003', location: '██████████', time: '2024-05-12 15:38:12', status: 'Low Conf' },
  { id: 'DET-10289', person: '████████', confidence: 98.1, camera: 'CAM-045', location: '██████████', time: '2024-05-12 15:35:50', status: 'Matched' },
  { id: 'DET-10288', person: '████████', confidence: 88.9, camera: 'CAM-201', location: '██████████', time: '2024-05-12 15:30:12', status: 'Matched' },
]

function LogsContent() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detection Logs</h1>
          <p className="text-muted-foreground">Comprehensive audit trail of all AI-processed surveillance events.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Select Range
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="relative max-w-sm w-full">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <input
                 type="text"
                 placeholder="Search by ID, location, or target..."
                 disabled
                 className="w-full bg-secondary border border-border rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
               />
             </div>
             <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9" disabled>
                  <Filter className="w-3.5 h-3.5 mr-2" />
                  Status
                </Button>
                <Button variant="outline" size="sm" className="h-9" disabled>
                  <ArrowUpDown className="w-3.5 h-3.5 mr-2" />
                  Confidence
                </Button>
             </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Event ID</TableHead>
                <TableHead>Target Identity</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleDetections.map((det) => (
                <TableRow key={det.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{det.id}</TableCell>
                  <TableCell className="font-medium">{det.person}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full",
                            det.confidence > 90 ? "bg-green-500" : det.confidence > 70 ? "bg-yellow-500" : "bg-red-500"
                          )} 
                          style={{ width: `${det.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-mono">{det.confidence}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{det.location}</span>
                      <span className="text-[10px] text-muted-foreground">{det.camera}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{det.time}</TableCell>
                  <TableCell>
                    <Badge variant={det.status === 'Matched' ? 'success' : det.status === 'Flagged' ? 'destructive' : 'secondary'}>
                      {det.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" disabled>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LogsPage() {
  return (
    <PremiumLock
      title="Coming Soon"
      version="V2"
      description="Detection log analytics, CSV export, and historical audit trails are being built for the next release."
    >
      <LogsContent />
    </PremiumLock>
  )
}
