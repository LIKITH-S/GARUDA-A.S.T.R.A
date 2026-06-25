"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { 
  Shield, 
  Eye, 
  Bell, 
  Lock, 
  Globe, 
  Cpu,
  Save,
  RotateCcw
} from 'lucide-react'
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const [threshold, setThreshold] = useState(85)
  const [notifications, setNotifications] = useState(true)
  const [faceExtraction, setFaceExtraction] = useState(true)

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Configure AI thresholds, security protocols, and platform preferences.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Defaults
          </Button>
          <Button size="sm">
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
                  onClick={() => setFaceExtraction(!faceExtraction)}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none",
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

        {/* Security & Access */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Mission Security</CardTitle>
                <CardDescription>Manage platform-wide security protocols and encryption standards.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Encryption: AES-256-GCM</span>
                  </div>
                  <p className="text-xs text-muted-foreground">All surveillance data is encrypted at rest and in transit.</p>
                  <Button variant="outline" size="sm" className="w-full text-xs">Rotate Mission Keys</Button>
               </div>
               <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Global Feed Sync</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Sync with international intelligence databases (Interpol/UN).</p>
                  <Button variant="outline" size="sm" className="w-full text-xs">Manage Integrations</Button>
               </div>
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
                  onClick={() => setNotifications(!notifications)}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none",
                    notifications ? "bg-primary" : "bg-secondary"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full bg-white transition-transform duration-200",
                    notifications ? "translate-x-6" : "translate-x-0"
                  )} />
                </button>
             </div>
             <div className="pt-6 border-t border-border flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Visual Strobe on Emergency</label>
                  <p className="text-xs text-muted-foreground">Flash the UI background red when a critical incident is reported.</p>
                </div>
                <button className="w-12 h-6 rounded-full p-1 bg-secondary transition-colors duration-200">
                  <div className="w-4 h-4 rounded-full bg-white" />
                </button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
