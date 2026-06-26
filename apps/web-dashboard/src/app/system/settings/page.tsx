"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { 
  Bell, 
  Cpu,
  Save,
  RotateCcw
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/Toast"
import { getSettings, updateSettings } from "@/lib/api"

export default function SettingsPage() {
  const { toast } = useToast()
  const [threshold, setThreshold] = useState(45)
  const [notifications, setNotifications] = useState(true)
  const [faceExtraction, setFaceExtraction] = useState(true)
  const [processingEngine, setProcessingEngine] = useState('cpu')

  useEffect(() => {
    getSettings()
      .then(data => {
        if (data) {
          setThreshold(data.detection_threshold ? Math.round(data.detection_threshold * 100) : 45)
          setFaceExtraction(data.face_extraction_enabled ?? true)
          setNotifications(data.sound_alerts_enabled ?? true)
          setProcessingEngine(data.processing_engine || 'cpu')
        }
      })
      .catch(err => console.error("Failed to load settings", err))
  }, [])

  const handleSave = async () => {
    try {
      await updateSettings({
        detection_threshold: threshold / 100.0,
        face_extraction_enabled: faceExtraction,
        sound_alerts_enabled: notifications,
        processing_engine: processingEngine
      })
      toast('Settings saved successfully', 'success')
    } catch (err) {
      toast('Failed to save settings', 'error')
    }
  }

  const handleReset = () => {
    setThreshold(45)
    setNotifications(true)
    setFaceExtraction(true)
    setProcessingEngine('cpu')
    toast('All settings reset to defaults', 'info')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Configure AI thresholds and platform preferences.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Defaults
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Processing Intelligence</CardTitle>
                <CardDescription>Adjust the sensitivity of facial recognition and object detection algorithms.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <div className="space-y-0.5">
                    <label className="text-sm font-medium">Processing Engine</label>
                    <p className="text-xs text-muted-foreground">Select AI inference engine. CPU uses heavily optimized ONNX Runtime.</p>
                 </div>
                 <div className="flex gap-2">
                   <Button 
                     variant={processingEngine === 'cpu' ? 'default' : 'outline'} 
                     size="sm"
                     onClick={() => setProcessingEngine('cpu')}
                   >
                     CPU (ONNX)
                   </Button>
                   <Button 
                     variant={processingEngine === 'gpu' ? 'default' : 'outline'} 
                     size="sm"
                     onClick={() => setProcessingEngine('gpu')}
                   >
                     GPU (CUDA)
                   </Button>
                 </div>
               </div>
             </div>

             <div className="space-y-4 border-t border-border pt-6">
               <div className="flex items-center justify-between">
                 <div className="space-y-0.5">
                    <label className="text-sm font-medium">Matching Confidence Threshold</label>
                    <p className="text-xs text-muted-foreground">Minimum percentage required to flag a positive identity match.</p>
                 </div>
                 <Badge variant="outline" className="font-mono">{threshold}%</Badge>
               </div>
               <input 
                 type="range" 
                 min="50" 
                 max="99" 
                 value={threshold} 
                 onChange={(e) => setThreshold(parseInt(e.target.value))}
                 className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" 
               />
               <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                 <span>Lenient (50%)</span>
                 <span>Balanced</span>
                 <span>Strict (99%)</span>
               </div>
             </div>

             <div className="flex items-center justify-between pt-6 border-t border-border">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Automatic Face Extraction</label>
                  <p className="text-xs text-muted-foreground">Automatically isolate and crop facial images from live streams.</p>
                </div>
                <button 
                  onClick={() => {
                    setFaceExtraction(!faceExtraction)
                    toast(faceExtraction ? 'Face extraction disabled' : 'Face extraction enabled', faceExtraction ? 'warning' : 'success')
                  }}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer",
                    faceExtraction ? "bg-primary" : "bg-secondary"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full bg-white transition-transform duration-200",
                    faceExtraction ? "translate-x-6" : "translate-x-0"
                  )} />
                </button>
             </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Command Center Alerts</CardTitle>
                <CardDescription>Personalize how you receive mission-critical updates.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Critical Match Sound Alerts</label>
                  <p className="text-xs text-muted-foreground">Play audible alarm when a high-confidence match is detected.</p>
                </div>
                <button 
                  onClick={() => {
                    setNotifications(!notifications)
                    toast(notifications ? 'Sound alerts disabled' : 'Sound alerts enabled', notifications ? 'warning' : 'success')
                  }}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer",
                    notifications ? "bg-primary" : "bg-secondary"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full bg-white transition-transform duration-200",
                    notifications ? "translate-x-6" : "translate-x-0"
                  )} />
                </button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
