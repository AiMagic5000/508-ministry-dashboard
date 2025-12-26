'use client'

import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Settings as SettingsIcon } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-light-200">
      <Sidebar />
      <div style={{ marginLeft: '256px' }} className="hidden lg:block">
        <Header />
        <main className="p-4 md:p-6 space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-light-900 mb-2 flex items-center gap-2">
              <SettingsIcon className="w-8 h-8 text-primary-500" />
              Settings
            </h1>
            <p className="text-light-500">Configure dashboard preferences</p>
          </div>
          <div className="card">
            <p className="text-light-600">Settings configuration coming soon...</p>
          </div>
        </main>
      </div>
    </div>
  )
}
