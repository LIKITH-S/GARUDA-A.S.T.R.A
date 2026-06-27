"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { 
  UserPlus, 
  Search, 
  MapPin, 
  Calendar, 
  UserSearch,
  Filter,
  MoreVertical,
  ExternalLink,
  ShieldAlert,
  X
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/Toast"
import { getMissingPersons, createMissingPerson, uploadMissingPersonImage, searchPerson, massSearch } from '@/lib/api'

export default function MissingPersonsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [persons, setPersons] = useState<any[]>([])
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '', age: '', gender: '', description: '', last_seen_location: '', last_seen_at: '', priority: 'Normal'
  })
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearching, setIsSearching] = useState<string | null>(null)
  const [isMassSearching, setIsMassSearching] = useState(false)

  const fetchPersons = async () => {
    try {
      const data = await getMissingPersons()
      const mapped = data.map((p: any) => ({
        id: p.id,
        caseNumber: p.case_number,
        name: p.full_name,
        age: p.age || 'Unknown',
        lastSeen: p.last_seen_location || 'Unknown',
        date: new Date(p.created_at).toLocaleDateString(),
        status: p.status,
        priority: p.priority,
        photoPath: p.photo_path || null,
      }))
      setPersons(mapped)
    } catch (e) {
      toast('Failed to load missing persons', 'error')
    }
  }

  useEffect(() => {
    fetchPersons()
  }, [])

  const filteredPersons = useMemo(() => {
    if (!searchQuery.trim()) return persons
    const q = searchQuery.toLowerCase()
    return persons.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.caseNumber.toLowerCase().includes(q) ||
      p.lastSeen.toLowerCase().includes(q)
    )
  }, [searchQuery, persons])

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const newPerson = await createMissingPerson({
        ...formData,
        age: parseInt(formData.age) || null,
        last_seen_at: formData.last_seen_at ? new Date(formData.last_seen_at).toISOString() : null,
        description: formData.description || null
      })
      
      if (file) {
        await uploadMissingPersonImage(newPerson.id, file)
      }
      
      toast('New missing person registered and AI embedding generated', 'success')
      setIsModalOpen(false)
      setFormData({ full_name: '', age: '', gender: '', description: '', last_seen_location: '', last_seen_at: '', priority: 'Normal' })
      setFile(null)
      fetchPersons()
    } catch (err) {
      toast('Failed to register missing person', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSearchPerson = async (id: string, name: string) => {
    setIsSearching(id)
    toast(`Initiating AI Vector Search against CCTV database for ${name}...`, 'success')
    try {
      const response = await searchPerson(id)
      if (response.matches_found > 0) {
        toast(`Search complete! Found ${response.matches_found} potential matches. Check Alerts tab.`, 'warning')
      } else {
        toast(`Search complete. No matches found for ${name} in the CCTV database.`, 'success')
      }
    } catch (e) {
      toast(`Search failed for ${name}`, 'error')
    } finally {
      setIsSearching(null)
    }
  }

  const handleMassSearch = async () => {
    setIsMassSearching(true)
    toast('Initiating Mass Vector Search for ALL missing persons...', 'success')
    try {
      const response = await massSearch()
      if (response.matches_found > 0) {
        toast(`Mass Sweep complete! Found ${response.matches_found} new matches. Check Alerts tab.`, 'warning')
      } else {
        toast('Mass Sweep complete. No new matches found.', 'success')
      }
    } catch (e) {
      toast('Mass Search failed', 'error')
    } finally {
      setIsMassSearching(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Missing Persons Registry</h1>
          <p className="text-muted-foreground">Centralized database for active search operations and AI matching.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={handleMassSearch} disabled={isMassSearching}>
            <Search className={`w-4 h-4 mr-2 ${isMassSearching ? 'animate-spin' : ''}`} />
            {isMassSearching ? 'Sweeping DB...' : 'Mass Search All'}
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            New Case
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, ID, or last seen location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" size="sm">
             <Filter className="w-4 h-4 mr-2" />
             Filters
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPersons.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <UserSearch className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No matching records found.</p>
          </div>
        ) : (
          filteredPersons.map((person) => (
            <Card key={person.id} className={cn(
              "group overflow-hidden transition-all hover:shadow-lg hover:border-primary/30 animate-fade-in",
              person.priority === 'URGENT' ? "border-red-500/20 shadow-red-500/5" : ""
            )}>
              <div className="h-48 bg-slate-800 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[1]"></div>
                 {person.photoPath ? (
                   <img
                     src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'}/${person.photoPath}`}
                     alt={person.name}
                     className="w-full h-full object-cover"
                   />
                 ) : (
                   <div className="text-muted-foreground flex flex-col items-center gap-2 opacity-20">
                     <UserSearch className="w-12 h-12" />
                     <span className="text-[10px] uppercase tracking-widest font-bold">No Photo</span>
                   </div>
                 )}
                 <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    <Badge variant={person.priority === 'URGENT' ? 'destructive' : person.priority === 'High' ? 'warning' : 'secondary'}>
                      {person.priority}
                    </Badge>
                    <Badge variant="outline" className="bg-black/50 backdrop-blur-md text-white border-white/10">
                      {person.caseNumber}
                    </Badge>
                 </div>
                 {person.priority === 'URGENT' && (
                   <div className="absolute bottom-3 right-3 animate-bounce z-10">
                     <ShieldAlert className="w-6 h-6 text-red-500 drop-shadow-lg" />
                   </div>
                 )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{person.name}</CardTitle>
                  <span className="text-sm font-medium text-muted-foreground">{person.age} Years</span>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  Last seen: {person.lastSeen}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 py-3 border-y border-border/50 my-2">
                   <div className="flex-1">
                     <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Report Date</p>
                     <p className="text-xs font-medium flex items-center gap-1 mt-0.5">
                       <Calendar className="w-3 h-3" />
                       {person.date}
                     </p>
                   </div>
                   <div className="flex-1">
                     <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Case Status</p>
                     <p className="text-xs font-medium mt-0.5">{person.status}</p>
                   </div>
                </div>
                <div className="flex gap-2 mt-4">
                   <Button 
                     className="flex-1 text-xs" 
                     size="sm" 
                     onClick={() => handleSearchPerson(person.id, person.name)}
                     disabled={isSearching === person.id}
                   >
                     <Search className={`w-3.5 h-3.5 mr-2 ${isSearching === person.id ? 'animate-spin' : ''}`} />
                     {isSearching === person.id ? 'Searching DB...' : 'AI Match Search'}
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
              <div>
                <CardTitle>Register New Case</CardTitle>
                <CardDescription>Upload a reference photo to generate an AI facial embedding.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Full Name *</label>
                    <input required type="text" className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                      value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Age</label>
                    <input type="number" className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                      value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-xs font-medium text-muted-foreground">Gender</label>
                     <select className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                       value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                       <option value="">Select...</option>
                       <option value="Male">Male</option>
                       <option value="Female">Female</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-medium text-muted-foreground">Priority</label>
                     <select className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                       value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                       <option value="Normal">Normal</option>
                       <option value="High">High</option>
                       <option value="URGENT">URGENT</option>
                     </select>
                   </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-xs font-medium text-muted-foreground">Last Seen Location</label>
                     <input type="text" className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                       value={formData.last_seen_location} onChange={e => setFormData({...formData, last_seen_location: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-medium text-muted-foreground">Last Seen Date & Time</label>
                     <input type="datetime-local" className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                       value={formData.last_seen_at} onChange={e => setFormData({...formData, last_seen_at: e.target.value})} />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-medium text-muted-foreground">Physical Description</label>
                   <textarea rows={3} placeholder="Height, build, clothing, distinguishing features..." className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary resize-none"
                     value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-medium text-muted-foreground">Reference Photo *</label>
                   <input required type="file" accept="image/*" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] || null)}
                     className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 bg-secondary/30 rounded-md border border-border p-2" />
                 </div>
                <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing & Extracting Embedding...' : 'Register Case & Run AI Extraction'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
