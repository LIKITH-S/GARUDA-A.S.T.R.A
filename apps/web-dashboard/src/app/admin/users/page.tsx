"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { useAuth } from '@/lib/auth-context'
import { Plus, Edit, Shield, Mail, User, Clock, Loader2 } from 'lucide-react'

// Dialog mock (we might not have a generic Dialog component yet, so using native prompt/state for MVP)
// Ideally we'd build/use a proper Radix Dialog component.

interface AdminUser {
  id: string
  email: string
  full_name: string
  role_name: string
  created_at: string
}

export default function UserManagementPage() {
  const { token, role } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    role_name: 'officer'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token && role === 'admin') {
      fetchUsers()
    }
  }, [token, role])

  const openCreateModal = () => {
    setModalMode('create')
    setFormData({ email: '', full_name: '', password: '', role_name: 'officer' })
    setEditingUserId(null)
    setIsModalOpen(true)
  }

  const openEditModal = (u: AdminUser) => {
    setModalMode('edit')
    setFormData({ email: u.email, full_name: u.full_name, password: '', role_name: u.role_name })
    setEditingUserId(u.id)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
      const url = modalMode === 'create' 
        ? `${API_URL}/admin/users` 
        : `${API_URL}/admin/users/${editingUserId}`
      
      const method = modalMode === 'create' ? 'POST' : 'PUT'
      
      const payload: any = {
        email: formData.email,
        full_name: formData.full_name,
        role_name: formData.role_name,
      }
      
      // Only send password if it's not empty
      if (formData.password) {
        payload.password = formData.password
      } else if (modalMode === 'create') {
        throw new Error("Password is required for new users")
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || 'Failed to save user')
      }

      await fetchUsers()
      setIsModalOpen(false)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <div className="p-8 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <div className="text-muted-foreground flex items-center gap-2 mt-2">
            Create and manage operator and patrol accounts.
          </div>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create User
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/20">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Created At</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/10 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {u.full_name}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {u.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={u.role_name === 'admin' ? 'destructive' : u.role_name === 'dispatcher' ? 'default' : 'secondary'} className="uppercase">
                      <Shield className="w-3 h-3 mr-1" />
                      {u.role_name}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(u.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openEditModal(u)}
                      className="text-primary hover:text-primary/80 transition-colors flex items-center justify-end gap-1 w-full"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/40 bg-secondary/10">
              <h2 className="text-xl font-bold">
                {modalMode === 'create' ? 'Create New User' : 'Edit User Profile'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {modalMode === 'create' ? 'Provision a new account.' : 'Update existing details.'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. Inspector Sharma"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="name@garuda.astra"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {modalMode === 'create' ? 'Password' : 'New Password (leave blank to keep current)'}
                </label>
                <input 
                  type="password" 
                  required={modalMode === 'create'}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <select 
                  value={formData.role_name}
                  onChange={e => setFormData({...formData, role_name: e.target.value})}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="admin">Admin</option>
                  <option value="dispatcher">Dispatcher</option>
                  <option value="officer">Officer (Web Access)</option>
                  <option value="patrol">Patrol Unit (Mobile Only)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {modalMode === 'create' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
