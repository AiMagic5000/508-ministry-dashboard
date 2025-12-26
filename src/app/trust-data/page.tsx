'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Building2, Plus, Edit2, Trash2, Save, X } from 'lucide-react'

interface Organization {
  id: string
  name: string
  ein: string
  address: string
  formation_date: string
  status: string
}

export default function TrustDataPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    ein: '',
    address: '',
    formation_date: '',
    status: 'active'
  })

  // Mock data for demo - replace with actual database calls
  useEffect(() => {
    const mockData: Organization[] = [
      {
        id: '1',
        name: 'Harvest Hope Farm Ministry',
        ein: '45-1234567',
        address: '123 Farm Road, Homestead, FL 33030',
        formation_date: '2022-05-15',
        status: 'active'
      }
    ]
    setOrganizations(mockData)
  }, [])

  const handleAdd = () => {
    setIsEditing(true)
    setEditingId(null)
    setFormData({
      name: '',
      ein: '',
      address: '',
      formation_date: '',
      status: 'active'
    })
  }

  const handleEdit = (org: Organization) => {
    setIsEditing(true)
    setEditingId(org.id)
    setFormData({
      name: org.name,
      ein: org.ein,
      address: org.address,
      formation_date: org.formation_date,
      status: org.status
    })
  }

  const handleSave = () => {
    if (editingId) {
      // Update existing
      setOrganizations(organizations.map(org =>
        org.id === editingId ? { ...org, ...formData } : org
      ))
    } else {
      // Add new
      const newOrg: Organization = {
        id: Date.now().toString(),
        ...formData
      }
      setOrganizations([...organizations, newOrg])
    }
    setIsEditing(false)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this organization?')) {
      setOrganizations(organizations.filter(org => org.id !== id))
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingId(null)
  }

  return (
    <div className="min-h-screen bg-light-200">
      <Sidebar />

      <div style={{ marginLeft: '256px' }} className="hidden lg:block">
        <Header />

        <main className="p-4 md:p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-light-900 mb-2 flex items-center gap-2">
                <Building2 className="w-8 h-8 text-primary-500" />
                Trust Data
              </h1>
              <p className="text-light-500">Manage your 508(c)(1)(A) organization information</p>
            </div>
            <button
              onClick={handleAdd}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Organization
            </button>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="card">
              <h3 className="text-lg font-semibold text-light-900 mb-4">
                {editingId ? 'Edit Organization' : 'Add New Organization'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter organization name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-2">
                    EIN (Tax ID)
                  </label>
                  <input
                    type="text"
                    value={formData.ein}
                    onChange={(e) => setFormData({ ...formData, ein: e.target.value })}
                    className="w-full px-4 py-2 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="XX-XXXXXXX"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-light-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Full address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-2">
                    Formation Date
                  </label>
                  <input
                    type="date"
                    value={formData.formation_date}
                    onChange={(e) => setFormData({ ...formData, formation_date: e.target.value })}
                    className="w-full px-4 py-2 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="btn-ghost flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Organizations List */}
          <div className="grid grid-cols-1 gap-6">
            {organizations.map((org) => (
              <div key={org.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-light-900">{org.name}</h3>
                    <p className="text-sm text-light-500">EIN: {org.ein}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(org)}
                      className="p-2 rounded-lg hover:bg-light-100 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-primary-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(org.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-light-500">Address</p>
                    <p className="text-light-900">{org.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-light-500">Formation Date</p>
                    <p className="text-light-900">{new Date(org.formation_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-light-500">Status</p>
                    <span className={`badge ${
                      org.status === 'active' ? 'badge-success' : 'bg-light-100 text-light-700'
                    }`}>
                      {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
