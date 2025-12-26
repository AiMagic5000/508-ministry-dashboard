'use client'

import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Calendar } from 'lucide-react'

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-light-200">
      <Sidebar />
      <div style={{ marginLeft: '256px' }} className="hidden lg:block">
        <Header />
        <main className="p-4 md:p-6 space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-light-900 mb-2 flex items-center gap-2">
              <Calendar className="w-8 h-8 text-primary-500" />
              Schedule
            </h1>
            <p className="text-light-500">Manage ministry calendar and events</p>
          </div>
          <div className="card">
            <p className="text-light-600">Schedule management coming soon...</p>
          </div>
        </main>
      </div>
    </div>
  )
}
