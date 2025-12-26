'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Heart, Plus, Edit2, Trash2, Save, X, DollarSign } from 'lucide-react'

interface Donation {
  id: string
  date: string
  donor_name: string
  amount: number
  type: string
  category: string
  notes: string
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([
    {
      id: '1',
      date: '2024-01-15',
      donor_name: 'John Smith',
      amount: 500,
      type: 'Monetary',
      category: 'General Fund',
      notes: 'Monthly donation'
    },
    {
      id: '2',
      date: '2024-01-14',
      donor_name: 'Jane Doe',
      amount: 1000,
      type: 'Monetary',
      category: 'Building Fund',
      notes: 'Annual gift'
    }
  ])

  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    date: '',
    donor_name: '',
    amount: 0,
    type: 'Monetary',
    category: 'General Fund',
    notes: ''
  })

  const handleAdd = () => {
    setIsEditing(true)
    setEditingId(null)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      donor_name: '',
      amount: 0,
      type: 'Monetary',
      category: 'General Fund',
      notes: ''
    })
  }

  const handleEdit = (donation: Donation) => {
    setIsEditing(true)
    setEditingId(donation.id)
    setFormData({
      date: donation.date,
      donor_name: donation.donor_name,
      amount: donation.amount,
      type: donation.type,
      category: donation.category,
      notes: donation.notes
    })
  }

  const handleSave = () => {
    if (editingId) {
      setDonations(donations.map(don =>
        don.id === editingId ? { ...don, ...formData } : don
      ))
    } else {
      const newDonation: Donation = {
        id: Date.now().toString(),
        ...formData
      }
      setDonations([...donations, newDonation])
    }
    setIsEditing(false)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this donation?')) {
      setDonations(donations.filter(don => don.id !== id))
    }
  }

  const totalDonations = donations.reduce((sum, don) => sum + don.amount, 0)

  return (
    <div className="min-h-screen bg-light-200">
      <Sidebar />

      <div style={{ marginLeft: '256px' }} className="hidden lg:block">
        <Header />

        <main className="p-4 md:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-light-900 mb-2 flex items-center gap-2">
                <Heart className="w-8 h-8 text-primary-500" />
                Donations
              </h1>
              <p className="text-light-500">Track and manage all donations</p>
            </div>
            <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Donation
            </button>
          </div>

          {/* Total Donations Card */}
          <div className="card bg-accent-pink/5 border border-accent-pink/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-light-500 mb-2">Total Donations This Month</p>
                <p className="text-4xl font-bold text-accent-pink">${totalDonations.toLocaleString()}</p>
              </div>
              <DollarSign className="w-16 h-16 text-accent-pink/20" />
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="card">
              <h3 className="text-lg font-semibold text-light-900 mb-4">
                {editingId ? 'Edit Donation' : 'Add New Donation'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-2">Donor Name</label>
                  <input
                    type="text"
                    value={formData.donor_name}
                    onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                    className="w-full px-4 py-2 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter donor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-2">Amount</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Monetary">Monetary</option>
                    <option value="In-Kind">In-Kind</option>
                    <option value="Stock">Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="General Fund">General Fund</option>
                    <option value="Building Fund">Building Fund</option>
                    <option value="Mission Fund">Mission Fund</option>
                    <option value="Special Project">Special Project</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-2">Notes</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Optional notes"
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

          {/* Donations Table */}
          <div className="card">
            <h3 className="text-lg font-semibold text-light-900 mb-4">Donation Records</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-light-200">
                    <th className="text-left py-3 px-4 text-light-500 font-medium text-sm">Date</th>
                    <th className="text-left py-3 px-4 text-light-500 font-medium text-sm">Donor</th>
                    <th className="text-right py-3 px-4 text-light-500 font-medium text-sm">Amount</th>
                    <th className="text-left py-3 px-4 text-light-500 font-medium text-sm">Type</th>
                    <th className="text-left py-3 px-4 text-light-500 font-medium text-sm">Category</th>
                    <th className="text-left py-3 px-4 text-light-500 font-medium text-sm">Notes</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((don) => (
                    <tr key={don.id} className="table-row">
                      <td className="py-4 px-4 text-light-900">{new Date(don.date).toLocaleDateString()}</td>
                      <td className="py-4 px-4 font-medium text-light-900">{don.donor_name}</td>
                      <td className="py-4 px-4 text-right font-semibold text-primary-600">${don.amount.toLocaleString()}</td>
                      <td className="py-4 px-4"><span className="badge bg-light-100 text-light-700">{don.type}</span></td>
                      <td className="py-4 px-4 text-light-600">{don.category}</td>
                      <td className="py-4 px-4 text-light-500 text-sm">{don.notes}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(don)}
                            className="p-2 rounded-lg hover:bg-light-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-primary-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(don.id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
