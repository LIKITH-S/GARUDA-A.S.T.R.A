"use client"

import React, { useState, useEffect, useMemo } from 'react'
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
  Key,
  Loader2
} from 'lucide-react'
import { useToast } from "@/components/ui/Toast"
import { getUsers } from '@/lib/api'

export default function UsersPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const data = await getUsers()
        setAllUsers(data)
      } catch (err: any) {
        console.error('Failed to fetch users:', err)
        if (err.message?.includes('403') || err.message?.includes('Not enough privileges')) {
          toast('Admin access required to view users', 'error')
        } else {
          toast('Failed to load users', 'error')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const users = useMemo(() => {
    if (!searchQuery.trim()) return allUsers
    const q = searchQuery.toLowerCase()
    return allUsers.filter((u: any) =>
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role_name || '').toLowerCase().includes(q)
    )
  }, [searchQuery, allUsers])

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'text-red-500'
      case 'dispatcher': return 'text-yellow-500'
      case 'officer': return 'text-blue-500'
      default: return 'text-muted-foreground'
    }
  }

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
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading personnel records...</span>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Identity</TableHead>
                <TableHead>Role / Assignment</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {allUsers.length === 0 ? 'No users found or insufficient permissions.' : 'No personnel match your search.'}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
                          {(user.full_name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.full_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <Shield className={`w-3.5 h-3.5 ${getRoleBadgeColor(user.role_name)}`} />
                         <span className="text-sm capitalize">{user.role_name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => toast(`Actions for ${user.full_name} coming soon`, 'info')}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
