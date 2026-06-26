"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { getUploads } from "@/lib/api"
import { CheckCircle2, AlertCircle, Video, Search, Clock, MapPin, Loader2 } from 'lucide-react'

export default function SurveillanceHistoryPage() {
  const [uploads, setUploads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchUploads()
  }, [])

  const fetchUploads = async () => {
    try {
      setLoading(true)
      const data = await getUploads()
      setUploads(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredUploads = uploads.filter(u => 
    u.filename.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.camera_id && u.camera_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.sector && u.sector.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Footage Archive</h1>
          <p className="text-muted-foreground">Browse and review all historically processed CCTV videos.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, camera, sector..."
            className="w-full bg-secondary border border-border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Processed Recordings</CardTitle>
          <CardDescription>All footages that have been analyzed by the Face Extraction Engine.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredUploads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No video records found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-md">Filename</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Camera / Sector</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3 rounded-tr-md">Uploaded At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUploads.map((video) => (
                    <tr key={video.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-4 font-medium flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                          <Video className="w-4 h-4 text-primary" />
                        </div>
                        <span className="truncate max-w-[200px]">{video.filename}</span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={video.status === 'COMPLETED' ? 'default' : video.status === 'ERROR' ? 'destructive' : 'secondary'}>
                          {video.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3 mr-1 inline" />}
                          {video.status === 'ERROR' && <AlertCircle className="w-3 h-3 mr-1 inline" />}
                          {video.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">{video.camera_id || 'Unknown Camera'}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {video.sector || 'Unassigned Sector'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className={video.priority === 'URGENT' ? 'border-red-500 text-red-500' : ''}>
                          {video.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {new Date(video.uploaded_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
