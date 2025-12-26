'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Users, Plus, Edit2, Trash2, Save, X, Mail, Phone } from 'lucide-react'

interface Volunteer {
  id: string
  name: string
  email: string
  phone: string
  skills: string
  availability: string
  hours_logged: number
  status: string
}

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@email.com',
      phone: '(555) 123-4567',
      skills: 'Gardening, Harvesting',
      availability: 'Weekends',
      hours_logged: 24,
      status: 'active'
    },
    {
      id: '2',
      name: 'Mike Williams',
      email: 'mike@email.com',
      phone: '(555) 987-6543',
      skills: 'Distribution, Driving',
      availability: 'Weekdays',
      hours_logged: 18,
      status: 'active'
    }
  ])

  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skills: '',
    availability: '',
    hours_logged: 0,
    status: 'active'
  })

  const handleAdd = () => {
    setIsEditing(true)
    setEditingId(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      skills: '',
      availability: '',
      hours_logged: 0,
      status: 'active'
    })
  }

  const handleEdit = (volunteer: Volunteer) => {
    setIsEditing(true)
    setEditingId(volunteer.id)
    setFormData(volunteer)
  }

  const handleSave = () => {
    if (editingId) {
      setVolunteers(volunteers.map(vol =>
        vol.id === editingId ? { ...vol, ...formData } : vol
      ))
    } else {
      const newVolunteer: Volunteer = {
        id: Date.now().toString(),
        ...formData
      }
      setVolunteers([...volunteers, newVolunteer])
    }
    setIsEditing(false)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this volunteer?')) {
      setVolunteers(volunteers.filter(vol => vol.id !== id))
    }
  }

  const totalHours = volunteers.reduce((sum, vol) => sum + vol.hours_logged, 0)

  return (
    <div className="min-h-screen bg-light-200">
      <Sidebar />

      <div style={{ marginLeft: '256px' }} className="hidden lg:block">
        <Header />

        <main className="p-4 md:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-light-900 mb-2 flex items-center gap-2">
                <Users className="w-8 h-8 text-primary-500" />
                Volunteers
              </h1>
              <p className="text-light-500">Manage volunteer information and hours</p>
            </div>
            <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Volunteer
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-accent-purple/5 border border-accent-purple/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-light-500 mb-2">Total Volunteers</p>
                  <p className="text-4xl font-bold text-accent-purple">{volunteers.length}</p>
                </div>
                <Users className="w-16 h-16 text-accent-purple/20" />
              </div>
            </div>
            <div className="card bg-accent-teal/5 border border-accent-teal/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-light-500 mb-2">Total Hours This Month</p>
                  <p className="text-4xl font-bold text-accent-teal">{totalHours} hrs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="card">
              <h3 className="text-lg font-semibold text-light-900 mb-4">
                {editingId ? 'Edit Volunteer' : 'Add New Volunteer'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-2">Skills</label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    className="w-full px-4 py-2 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Gardening, Distribution"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-2">Availability</label>
                  <input
                    type="text"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full px-4 py-2 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Weekends, Mornings"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-2">Hours Logged</label>
                  <input
                    type="number"
                    value={formData.hours_logged}
                    onChange={(e) => setFormData({ ...formData, hours_logged: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button onClick={() => setIsEditing(false)} className="btn-ghost flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Volunteers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {volunteers.map((volunteer) => (
              <div key={volunteer.id} className="card hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-light-900">{volunteer.name}</h3>
                    <p className="text-sm text-light-500">{volunteer.skills}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(volunteer)}
                      className="p-2 rounded-lg hover:bg-light-100 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-primary-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(volunteer.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-light-600">
                    <Mail className="w-4 h-4 text-light-400" />
                    <span className="text-sm">{volunteer.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-light-600">
                    <Phone className="w-4 h-4 text-light-400" />
                    <span className="text-sm">{volunteer.phone}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-light-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-light-500">Availability</p>
                    <p className="text-sm font-medium text-light-900">{volunteer.availability}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-light-500">Hours Logged</p>
                    <p className="text-sm font-bold text-primary-600">{volunteer.hours_logged} hrs</p>
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
