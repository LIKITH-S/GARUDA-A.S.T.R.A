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
import { useToast } from "@/components/ui/Toast"

const allDetections = [
  { id: 'DET-10292', person: 'Unidentified Male', confidence: 94.2, camera: 'CAM-012', location: 'Commercial St.', time: '2024-05-12 15:42:01', status: 'Flagged' },
  { id: 'DET-10291', person: 'Rahul Verma', confidence: 99.8, camera: 'CAM-088', location: 'Lalbagh West', time: '2024-05-12 15:40:45', status: 'Matched' },
  { id: 'DET-10290', person: 'Unidentified Female', confidence: 42.5, camera: 'CAM-003', location: 'Brigade Rd.', time: '2024-05-12 15:38:12', status: 'Low Conf' },
  { id: 'DET-10289', person: 'Suresh Kumar', confidence: 98.1, camera: 'CAM-045', location: 'Phoenix Mall', time: '2024-05-12 15:35:50', status: 'Matched' },
  { id: 'DET-10288', person: 'Unidentified Male', confidence: 88.9, camera: 'CAM-201', location: 'Airport T2', time: '2024-05-12 15:30:12', status: 'Matched' },
  { id: 'DET-10287', person: 'Priya Das', confidence: 97.6, camera: 'CAM-012', location: 'Commercial St.', time: '2024-05-12 15:28:44', status: 'Matched' },
  { id: 'DET-10286', person: 'Unidentified Male', confidence: 91.3, camera: 'CAM-088', location: 'Lalbagh West', time: '2024-05-12 15:25:01', status: 'Matched' },
  { id: 'DET-10285', person: 'Unidentified Female', confidence: 56.2, camera: 'CAM-003', location: 'Brigade Rd.', time: '2024-05-12 15:22:15', status: 'Low Conf' },
  { id: 'DET-10284', person: 'Anita Singh', confidence: 99.5, camera: 'CAM-045', location: 'Phoenix Mall', time: '2024-05-12 15:18:33', status: 'Matched' },
  { id: 'DET-10283', person: 'Unidentified Male', confidence: 93.4, camera: 'CAM-201', location: 'Airport T2', time: '2024-05-12 15:15:00', status: 'Matched' },
]

export default function LogsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    let results = allDetections
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      results = results.filter(d =>
        d.id.toLowerCase().includes(q) ||
        d.person.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.camera.toLowerCase().includes(q)
      )
    }
    results = [...results].sort((a, b) => sortAsc ? a.confidence - b.confidence : b.confidence - a.confidence)
    return results
  }, [searchQuery, sortAsc])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detection Logs</h1>
          <p className="text-muted-foreground">Comprehensive audit trail of all AI-processed surveillance events.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => toast('Exporting detection logs as CSV...', 'success')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => toast('Date range picker coming soon', 'info')}>
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
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-secondary border border-border rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
               />
             </div>
             <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9" onClick={() => toast('Status filter coming soon', 'info')}>
                  <Filter className="w-3.5 h-3.5 mr-2" />
                  Status
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => {
                    setSortAsc(!sortAsc)
                    toast(`Sorting by confidence: ${sortAsc ? 'highest first' : 'lowest first'}`, 'info')
                  }}
                >
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
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No detections match your search.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((det) => (
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
                      <Button variant="ghost" size="icon" onClick={() => toast(`Actions for ${det.id} coming soon`, 'info')}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-muted-foreground">
              {searchQuery ? `${filtered.length} results found` : `Showing ${filtered.length} of 1,294 detections`}
            </p>
            <div className="flex gap-2">
               <Button variant="outline" size="sm" disabled={page === 0} onClick={() => { setPage(p => p - 1); toast('Loading previous page...', 'info') }}>Previous</Button>
               <Button variant="outline" size="sm" onClick={() => { setPage(p => p + 1); toast('Loading next page...', 'info') }}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
