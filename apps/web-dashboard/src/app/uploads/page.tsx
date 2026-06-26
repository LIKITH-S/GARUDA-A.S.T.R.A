"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { 
  Upload, 
  FileVideo, 
  Image as ImageIcon, 
  HardDrive, 
  Cloud,
  Play,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/Toast"
import { uploadFootage, uploadFootageWithProgress, getUploads } from "@/lib/api"

export default function UploadsPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedPriority, setSelectedPriority] = useState('High')
  const [cameraId, setCameraId] = useState('')
  const [sector, setSector] = useState('Sector Alpha (Central)')
  const [uploads, setUploads] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const fetchUploads = async () => {
    try {
      const data = await getUploads()
      setUploads(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchUploads()
    const interval = setInterval(fetchUploads, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleFileDrop = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    setIsUploading(true)
    for (let i = 0; i < files.length; i++) {
      try {
        setUploadProgress(0)
        await uploadFootageWithProgress(files[i], cameraId, sector, selectedPriority, (percent) => {
          setUploadProgress(percent)
        })
        toast(`File ${files[i].name} uploaded! Processing started.`, 'success')
      } catch (err) {
        toast(`Failed to upload ${files[i].name}`, 'error')
      }
    }
    setIsUploading(false)
    setUploadProgress(0)
    fetchUploads()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Surveillance Uploads</h1>
        <p className="text-muted-foreground">Ingest footage and images for batch AI processing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card
            className="border-dashed border-2 bg-secondary/20 hover:bg-secondary/30 transition-colors cursor-pointer group"
            onClick={handleFileDrop}
          >
            <CardContent className="flex flex-col items-center justify-center py-12">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".mp4,.avi,.mkv,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Drop footage here</h3>
              <p className="text-sm text-muted-foreground mt-1">or click to browse from mission archives</p>
              <div className="flex gap-4 mt-6">
                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                   <FileVideo className="w-3 h-3" />
                   MP4, AVI, MKV
                 </div>
                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                   <ImageIcon className="w-3 h-3" />
                   JPG, PNG, WEBP
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Queue</CardTitle>
              <CardDescription>Recently added files awaiting processing</CardDescription>
            </CardHeader>
            <CardContent>
               {uploads.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-8 text-center">
                   <Cloud className="w-8 h-8 text-muted-foreground/30 mb-3" />
                   <p className="text-sm text-muted-foreground">No files in the upload queue.</p>
                   <p className="text-xs text-muted-foreground/60 mt-1">Drop files above to start processing.</p>
                 </div>
               ) : (
                 <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                   {uploads.map(u => (
                     <div key={u.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/30 border border-border">
                       <div className="flex items-center gap-3 overflow-hidden">
                         {u.status === 'COMPLETED' ? (
                           <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                         ) : u.status === 'ERROR' ? (
                           <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                         ) : (
                           <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                         )}
                         <div className="truncate">
                           <p className="text-sm font-medium truncate">{u.filename}</p>
                           <p className="text-xs text-muted-foreground">{new Date(u.uploaded_at).toLocaleString()}</p>
                         </div>
                       </div>
                       <Badge variant={u.status === 'COMPLETED' ? 'default' : u.status === 'ERROR' ? 'destructive' : 'secondary'}>
                         {u.status}
                       </Badge>
                     </div>
                   ))}
                 </div>
               )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metadata Form</CardTitle>
              <CardDescription>Assign context to the uploaded footage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Source Camera ID</label>
                <input
                  type="text"
                  placeholder="e.g. CAM-XXX"
                  value={cameraId}
                  onChange={(e) => setCameraId(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mission Sector</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>Sector Alpha (Central)</option>
                  <option>Sector Beta (North)</option>
                  <option>Sector Gamma (South)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Priority</label>
                <div className="flex gap-2">
                  {['Low', 'Normal', 'High', 'URGENT'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPriority(p)}
                      className={cn(
                        "flex-1 py-1 text-[10px] font-bold rounded border border-border transition-all cursor-pointer",
                        selectedPriority === p ? "bg-primary text-primary-foreground border-primary" : "hover:bg-secondary"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              {isUploading && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Uploading file...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              <Button className="w-full mt-4" disabled={isUploading} onClick={handleFileDrop}>
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload & Analyze Video"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 text-center">
               <AlertCircle className="w-8 h-8 text-primary mx-auto mb-3" />
               <h4 className="font-semibold text-sm">Hardware Acceleration</h4>
               <p className="text-xs text-muted-foreground mt-1">Local GPU clusters are available for ultra-fast facial extraction.</p>
               <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => toast('Cluster management coming soon', 'info')}>
                 Manage Clusters
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
