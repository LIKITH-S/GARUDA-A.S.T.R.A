import React from 'react'
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

export default function UploadsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Surveillance Uploads</h1>
        <p className="text-muted-foreground">Ingest footage and images for batch AI processing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-dashed border-2 bg-secondary/20 hover:bg-secondary/30 transition-colors cursor-pointer group">
            <CardContent className="flex flex-col items-center justify-center py-12">
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
               <div className="space-y-4">
                 {[
                   { name: 'CAM-042_20240512_1430.mp4', size: '248.5 MB', progress: 100, status: 'Completed' },
                   { name: 'SUSPECT_CROP_HD.jpg', size: '1.2 MB', progress: 100, status: 'Completed' },
                   { name: 'DRONE_SCAN_SOUTH.mp4', size: '1.2 GB', progress: 65, status: 'Uploading' },
                 ].map((file, i) => (
                   <div key={i} className="p-4 rounded-lg bg-secondary/30 border border-border flex flex-col gap-3">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-secondary rounded">
                           {file.name.endsWith('.mp4') ? <FileVideo className="w-4 h-4 text-blue-400" /> : <ImageIcon className="w-4 h-4 text-green-400" />}
                         </div>
                         <div>
                           <p className="text-sm font-medium">{file.name}</p>
                           <p className="text-xs text-muted-foreground">{file.size}</p>
                         </div>
                       </div>
                       <Badge variant={file.status === 'Completed' ? 'success' : 'secondary'}>
                         {file.status === 'Completed' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Cloud className="w-3 h-3 mr-1 animate-bounce" />}
                         {file.status}
                       </Badge>
                     </div>
                     <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all duration-500", file.status === 'Completed' ? 'bg-green-500' : 'bg-primary')} 
                          style={{ width: `${file.progress}%` }}
                        ></div>
                     </div>
                   </div>
                 ))}
               </div>
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
                <input type="text" placeholder="e.g. CAM-XXX" className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mission Sector</label>
                <select className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  <option>Sector Alpha (Central)</option>
                  <option>Sector Beta (North)</option>
                  <option>Sector Gamma (South)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Priority</label>
                <div className="flex gap-2">
                  {['Low', 'Normal', 'High', 'URGENT'].map((p) => (
                    <button key={p} className={cn(
                      "flex-1 py-1 text-[10px] font-bold rounded border border-border transition-all",
                      p === 'High' ? "bg-primary text-primary-foreground border-primary" : "hover:bg-secondary"
                    )}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <Button className="w-full mt-4">
                <Play className="w-4 h-4 mr-2" />
                Initialize AI Scan
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 text-center">
               <AlertCircle className="w-8 h-8 text-primary mx-auto mb-3" />
               <h4 className="font-semibold text-sm">Hardware Acceleration</h4>
               <p className="text-xs text-muted-foreground mt-1">Local GPU clusters are available for ultra-fast facial extraction.</p>
               <Button variant="outline" size="sm" className="mt-4 w-full">Manage Clusters</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
