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
  AlertCircle,
  X,
  Video
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/Toast"
import { uploadFootage, uploadFootageWithProgress, getUploads, analyzeVideo, batchAnalyzeVideos } from "@/lib/api"

export default function UploadsPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedPriority, setSelectedPriority] = useState('High')
  const [cameraId, setCameraId] = useState('')
  const [sector, setSector] = useState('Sector Alpha (Central)')
  const [uploads, setUploads] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const file = files[0]
    setSelectedFile(file)
    
    // Create a local object URL for the video thumbnail
    if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file)
      setVideoPreviewUrl(url)
    }
  }

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedFile(null)
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl)
      setVideoPreviewUrl(null)
    }
  }

  const handleUploadSubmit = async () => {
    if (!selectedFile) return
    
    setIsUploading(true)
    try {
      setUploadProgress(0)
      await uploadFootageWithProgress(selectedFile, cameraId, sector, selectedPriority, (percent) => {
        setUploadProgress(percent)
      })
      toast(`File ${selectedFile.name} uploaded! Processing started.`, 'success')
      setSelectedFile(null)
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl)
        setVideoPreviewUrl(null)
      }
    } catch (err) {
      toast(`Failed to upload ${selectedFile.name}`, 'error')
    }
    
    setIsUploading(false)
    setUploadProgress(0)
    fetchUploads()
  }

  const handleAnalyze = async (id: string) => {
    try {
      const res = await analyzeVideo(id)
      toast(res.message, 'success')
      fetchUploads()
    } catch (err: any) {
      toast(err.message || 'Failed to trigger analysis', 'error')
    }
  }

  const handleBatchAnalyze = async () => {
    try {
      const res = await batchAnalyzeVideos()
      toast(res.message, 'success')
      fetchUploads()
    } catch (err: any) {
      toast(err.message || 'Failed to trigger batch analysis', 'error')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Surveillance Uploads</h1>
        <p className="text-muted-foreground">Ingest footage and images for batch AI processing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 border-none shadow-none">
            <div 
              className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-colors bg-secondary/20 relative"
              onClick={handleFileDrop}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                onChange={handleFileChange}
                accept="video/*"
              />
              
              {selectedFile ? (
                <div className="w-full flex flex-col items-center gap-4 relative">
                  <button 
                    onClick={handleRemoveFile}
                    className="absolute -top-4 -right-4 p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/80 transition-colors z-10 shadow-lg"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {videoPreviewUrl ? (
                    <video 
                      src={videoPreviewUrl} 
                      className="w-full max-h-48 object-cover rounded-lg shadow-sm border border-border"
                      controls={false}
                      muted
                    />
                  ) : (
                    <Video className="w-16 h-16 text-primary mb-2" />
                  )}
                  <div>
                    <p className="font-semibold text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Drop Footage Here</h3>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse from your computer</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                    <Video className="w-4 h-4" />
                    <span>MP4, AVI, MOV up to 500MB</span>
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg">Stored Recordings</CardTitle>
                <CardDescription>Footage securely stored on the server ready for analysis</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBatchAnalyze}
                disabled={uploads.filter(u => u.status === 'PENDING' || u.status === 'ERROR').length === 0}
              >
                <Play className="w-4 h-4 mr-2" />
                Batch Analyze Pending
              </Button>
            </CardHeader>
            <CardContent>
               {uploads.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-8 text-center">
                   <Cloud className="w-8 h-8 text-muted-foreground/30 mb-3" />
                   <p className="text-sm text-muted-foreground">No recordings stored.</p>
                   <p className="text-xs text-muted-foreground/60 mt-1">Upload footage above to start.</p>
                 </div>
               ) : (
                 <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-2">
                    {uploads.map(u => {
                      const ext = u.filename.substring(u.filename.lastIndexOf('.'))
                      const staticUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'}/uploads/videos/${u.id}${ext}`
                      
                      return (
                      <div key={u.id} className="flex flex-col p-4 rounded-lg bg-secondary/20 border border-border gap-3">
                        <div className="flex items-start gap-4 w-full">
                          <video 
                            src={staticUrl} 
                            preload="metadata" 
                            className="w-24 h-16 object-cover bg-black rounded border border-border shrink-0" 
                          />
                          <div className="flex-1 min-w-0 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold truncate text-foreground">{u.filename}</p>
                              <Badge variant={u.status === 'ERROR' ? 'destructive' : u.status === 'COMPLETED' ? 'default' : 'secondary'}>
                                {u.status === 'PENDING' ? 'Not Analysed' : u.status === 'COMPLETED' ? 'Analysed' : u.status}
                              </Badge>
                            </div>
                            <div className="flex flex-col text-xs text-muted-foreground mt-1">
                              <span>Uploaded: {new Date(u.uploaded_at).toLocaleString()}</span>
                              {u.status === 'COMPLETED' && u.updated_at ? (
                                <span>Last analysed: {new Date(u.updated_at).toLocaleString()}</span>
                              ) : (
                                <span>Not analysed yet</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-end w-full pt-2 border-t border-border/50">
                          {u.status === 'PROCESSING' ? (
                            <div className="w-full flex items-center gap-3">
                              <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                              <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="bg-primary h-full transition-all duration-500 ease-out" 
                                  style={{ width: `${u.progress || 0}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-12 text-right">{Math.round(u.progress || 0)}%</span>
                            </div>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => handleAnalyze(u.id)} className="h-8 px-3 hover:bg-primary hover:text-primary-foreground">
                              <Play className="w-4 h-4 mr-2" /> 
                              {u.status === 'COMPLETED' ? 'Re-Analyse' : 'Analyse'}
                            </Button>
                          )}
                        </div>
                      </div>
                    )})}
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
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-primary animate-pulse">Uploading to AI Engine...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden border border-border">
                    <div 
                      className="bg-primary h-full transition-all duration-300 ease-out" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              <Button 
                className="w-full mt-4" 
                disabled={!selectedFile || isUploading} 
                onClick={handleUploadSubmit}
              >
                <Play className="w-4 h-4 mr-2" />
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
