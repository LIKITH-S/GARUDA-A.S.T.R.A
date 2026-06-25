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
  UserPlus, 
  Search, 
  Shield, 
  Mail, 
  MoreVertical,
  Key
} from 'lucide-react'
import { useToast } from "@/components/ui/Toast"

const allUsers = [
  { id: 'USR-001', name: 'John Doe', email: 'j.doe@astra.mission', role: 'Super Admin', status: 'Active', access: 'Level 4' },
  { id: 'USR-002', name: 'Sarah Connor', email: 's.connor@astra.mission', role: 'Operator', status: 'Active', access: 'Level 2' },
  { id: 'USR-003', name: 'James Smith', email: 'j.smith@astra.mission', role: 'Analyst', status: 'Away', access: 'Level 1' },
  { id: 'USR-004', name: 'Elena Rodriguez', email: 'e.rodriguez@astra.mission', role: 'Lead Field Officer', status: 'Active', access: 'Level 3' },
  { id: 'USR-005', name: 'Mark Wilson', email: 'm.wilson@astra.mission', role: 'Systems Engineer', status: 'Maintenance', access: 'Level 3' },
]

export default function UsersPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')

  const users = useMemo(() => {
    if (!searchQuery.trim()) return allUsers
    const q = searchQuery.toLowerCase()
    return allUsers.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    )
  }, [searchQuery])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Access Control</h1>
          <p className="text-muted-foreground">Manage mission-critical personnel and their clearance levels.</p>
        </div>
        <Button size="sm" onClick={() => toast('Access provisioning form coming soon', 'info')}>
          <UserPlus className="w-4 h-4 mr-2" />
          Provision Access
        </Button>
      </div>

      <Card>
        <CardHeader>
           <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Authorized Personnel</CardTitle>
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter by name, email, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
           </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Identity</TableHead>
                <TableHead>Role / Assignment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Clearance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No personnel match your search.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                         <span className="text-sm">{user.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'Active' ? 'success' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2 font-mono text-xs">
                          <Key className="w-3.5 h-3.5 text-primary" />
                          {user.access}
                       </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => toast(`Actions for ${user.name} coming soon`, 'info')}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
