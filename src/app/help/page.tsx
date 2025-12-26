'use client'

import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { HelpCircle } from 'lucide-react'

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-light-200">
      <Sidebar />
      <div style={{ marginLeft: '256px' }} className="hidden lg:block">
        <Header />
        <main className="p-4 md:p-6 space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-light-900 mb-2 flex items-center gap-2">
              <HelpCircle className="w-8 h-8 text-primary-500" />
              Help & Support
            </h1>
            <p className="text-light-500">Get help with using the dashboard</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-light-900 mb-4">Quick Start Guide</h3>
            <p className="text-light-600 mb-4">Welcome to the Harvest Hope Farm Ministry Dashboard!</p>
            <p className="text-light-600">This dashboard helps you manage your 508(c)(1)(A) ministry operations including donations, volunteers, food production, and compliance tracking.</p>
          </div>
        </main>
      </div>
    </div>
  )
}
