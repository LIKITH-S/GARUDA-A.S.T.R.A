import React from 'react'
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
  ShieldAlert
} from 'lucide-react'
import { cn } from "@/lib/utils"

const persons = [
  { id: 'MP-8812', name: 'Rohan Deshmukh', age: 24, lastSeen: 'Indiranagar Metro', date: '2024-05-10', status: 'Active Search', priority: 'High' },
  { id: 'MP-8811', name: 'Ananya Rao', age: 19, lastSeen: 'Phoenix Mall', date: '2024-05-11', status: 'Reported', priority: 'Normal' },
  { id: 'MP-8810', name: 'Vikram Singh', age: 45, lastSeen: 'Koramangala 4th Block', date: '2024-05-09', status: 'Active Search', priority: 'High' },
  { id: 'MP-8809', name: 'Sana Khan', age: 31, lastSeen: 'Majestic Bus Stand', date: '2024-05-12', status: 'Priority', priority: 'URGENT' },
  { id: 'MP-8808', name: 'Deepak Patel', age: 62, lastSeen: 'Whitefield', date: '2024-05-08', status: 'Active Search', priority: 'Normal' },
  { id: 'MP-8807', name: 'Meera Iyer', age: 12, lastSeen: 'Lalbagh Botanical Garden', date: '2024-05-12', status: 'Priority', priority: 'URGENT' },
]

export default function MissingPersonsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Missing Persons Registry</h1>
          <p className="text-muted-foreground">Centralized database for active search operations and AI matching.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <UserSearch className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
          <Button size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            New Case
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search by name, ID, or last seen location..." className="w-full bg-card border border-border rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" size="sm">
             <Filter className="w-4 h-4 mr-2" />
             Filters
           </Button>
           <Button variant="secondary" size="sm">
             Sort: Recent
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {persons.map((person) => (
          <Card key={person.id} className={cn(
            "group overflow-hidden transition-all hover:shadow-lg hover:border-primary/30",
            person.priority === 'URGENT' ? "border-red-500/20 shadow-red-500/5" : ""
          )}>
            <div className="h-48 bg-slate-800 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-500">
               <div className="text-muted-foreground flex flex-col items-center gap-2 opacity-20">
                 <UserSearch className="w-12 h-12" />
                 <span className="text-[10px] uppercase tracking-widest font-bold">Encrypted Archive</span>
               </div>
               <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <Badge variant={person.priority === 'URGENT' ? 'destructive' : person.priority === 'High' ? 'warning' : 'secondary'}>
                    {person.priority}
                  </Badge>
                  <Badge variant="outline" className="bg-black/50 backdrop-blur-md text-white border-white/10">
                    ID: {person.id}
                  </Badge>
               </div>
               {person.priority === 'URGENT' && (
                 <div className="absolute bottom-3 right-3 animate-bounce">
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
                 <Button className="flex-1 text-xs" size="sm">
                   <Search className="w-3.5 h-3.5 mr-2" />
                   AI Match Search
                 </Button>
                 <Button variant="outline" size="icon" className="h-9 w-9">
                   <ExternalLink className="w-3.5 h-3.5" />
                 </Button>
                 <Button variant="ghost" size="icon" className="h-9 w-9">
                   <MoreVertical className="w-3.5 h-3.5" />
                 </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center py-12 border-t border-border mt-8">
         <p className="text-muted-foreground text-sm">Showing all active cases. End of mission registry.</p>
      </div>
    </div>
  )
}
