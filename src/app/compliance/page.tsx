'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Shield, Plus, Trash2, Edit, Check, X, Calendar, AlertCircle } from 'lucide-react'
import { getComplianceItems, createComplianceItem, updateComplianceItem, deleteComplianceItem, type ComplianceItem } from '@/lib/database'

export default function CompliancePage() {
  const [items, setItems] = useState<ComplianceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'financial' as 'governance' | 'financial' | 'operational' | 'legal',
    status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'overdue',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    points_value: 10,
    reminder_sent: false,
  })

  // Mock organization ID - in production this would come from auth context
  const organizationId = 'demo-org-id'

  useEffect(() => {
    loadItems()
  }, [])

  async function loadItems() {
    try {
      setLoading(true)
      const data = await getComplianceItems(organizationId)
      setItems(data)
    } catch (error) {
      console.error('Failed to load compliance items:', error)
      // Use demo data if database fails
      setItems([
        {
          id: '1',
          organization_id: organizationId,
          title: 'Form 990 Filing',
          description: 'Annual tax return for tax-exempt organizations',
          category: 'financial',
          status: 'in_progress',
          due_date: '2025-05-15',
          priority: 'urgent',
          points_value: 25,
          reminder_sent: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          organization_id: organizationId,
          title: 'State Registration Renewal',
          description: 'Renew state charitable registration',
          category: 'legal',
          status: 'pending',
          due_date: '2025-06-30',
          priority: 'medium',
          points_value: 15,
          reminder_sent: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          organization_id: organizationId,
          title: 'Board Meeting Minutes',
          description: 'Document Q1 board meeting',
          category: 'governance',
          status: 'completed',
          due_date: '2025-04-01',
          priority: 'medium',
          points_value: 10,
          reminder_sent: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    try {
      const newItem = await createComplianceItem({
        organization_id: organizationId,
        ...formData,
      })
      setItems([...items, newItem])
      setShowAddForm(false)
      resetForm()
    } catch (error) {
      console.error('Failed to create item:', error)
      // Fallback to local state update
      const newItem: ComplianceItem = {
        id: Date.now().toString(),
        organization_id: organizationId,
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setItems([...items, newItem])
      setShowAddForm(false)
      resetForm()
    }
  }

  async function handleUpdate(id: string) {
    try {
      const updated = await updateComplianceItem(id, formData)
      setItems(items.map(item => item.id === id ? updated : item))
      setEditingId(null)
      resetForm()
    } catch (error) {
      console.error('Failed to update item:', error)
      // Fallback to local state update
      setItems(items.map(item => item.id === id ? { ...item, ...formData, updated_at: new Date().toISOString() } : item))
      setEditingId(null)
      resetForm()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this compliance item?')) return

    try {
      await deleteComplianceItem(id)
      setItems(items.filter(item => item.id !== id))
    } catch (error) {
      console.error('Failed to delete item:', error)
      // Fallback to local state update
      setItems(items.filter(item => item.id !== id))
    }
  }

  function startEdit(item: ComplianceItem) {
    setEditingId(item.id)
    setFormData({
      title: item.title,
      description: item.description || '',
      category: item.category || 'financial',
      status: item.status,
      due_date: item.due_date || '',
      priority: item.priority,
      points_value: item.points_value,
      reminder_sent: item.reminder_sent,
    })
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      category: 'financial',
      status: 'pending',
      due_date: '',
      priority: 'medium',
      points_value: 10,
      reminder_sent: false,
    })
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-300'
      default: return 'bg-light-100 text-light-700 border-light-300'
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300'
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'overdue': return 'bg-red-100 text-red-700 border-red-300'
      case 'pending': return 'bg-light-100 text-light-700 border-light-300'
      default: return 'bg-light-100 text-light-700 border-light-300'
    }
  }

  const statsByStatus = {
    pending: items.filter(i => i.status === 'pending').length,
    in_progress: items.filter(i => i.status === 'in_progress').length,
    completed: items.filter(i => i.status === 'completed').length,
  }

  return (
    <div className="min-h-screen bg-light-200">
      <Sidebar />

      <div className="lg:ml-64">
        <Header />

        <main className="p-6">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-light-900 mb-2">Compliance Tracker</h1>
              <p className="text-light-600">Track and manage 508(c)(1)(A) compliance requirements</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add Item
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-light-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-light-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-light-600" />
                </div>
                <div>
                  <p className="text-light-600 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-light-900">{statsByStatus.pending}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-light-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-light-600 text-sm">In Progress</p>
                  <p className="text-2xl font-bold text-light-900">{statsByStatus.in_progress}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-light-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-light-600 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-light-900">{statsByStatus.completed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Add/Edit Form */}
          {(showAddForm || editingId) && (
            <div className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-primary-200">
              <h2 className="text-xl font-bold text-light-900 mb-4">
                {editingId ? 'Edit Compliance Item' : 'Add New Compliance Item'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-light-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-light-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                    placeholder="Enter compliance item title"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-light-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-light-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                    rows={3}
                    placeholder="Enter description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-light-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  >
                    <option value="governance">Governance</option>
                    <option value="financial">Financial</option>
                    <option value="operational">Operational</option>
                    <option value="legal">Legal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-light-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-light-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-light-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  {editingId ? 'Update' : 'Add'} Item
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingId(null)
                    resetForm()
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-light-100 text-light-700 font-semibold hover:bg-light-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Compliance Items List */}
          <div className="bg-white rounded-xl shadow-sm border border-light-200">
            <div className="p-6 border-b border-light-200">
              <h2 className="text-xl font-bold text-light-900">Compliance Items</h2>
            </div>
            {loading ? (
              <div className="p-12 text-center text-light-500">Loading...</div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center text-light-500">
                <Shield className="w-12 h-12 mx-auto mb-4 text-light-400" />
                <p>No compliance items yet. Add your first item to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-light-200">
                {items.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-light-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-light-900">{item.title}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-lg border ${getPriorityColor(item.priority)}`}>
                            {item.priority.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-lg border ${getStatusColor(item.status)}`}>
                            {item.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-light-600 mb-3">{item.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-light-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Due: {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'No date set'}
                          </span>
                          <span className="capitalize">{item.category.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
