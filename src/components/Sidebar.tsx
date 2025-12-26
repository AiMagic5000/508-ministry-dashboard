'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, Scale, Leaf, Heart, Church,
  Truck, Users, Calendar, Sparkles, Mic, FileText, Download,
  Shield, Settings, HelpCircle, LogOut, ChevronLeft
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/trust-data', label: 'Trust Data', icon: Building2 },
  { href: '/food-production', label: '1000lbs of Food', icon: Scale },
  { href: '/production', label: 'Farm Production', icon: Leaf },
  { href: '/donations', label: 'Donations', icon: Heart },
  { href: '/partners', label: 'Partner Churches', icon: Church },
  { href: '/distribution', label: 'Distribution', icon: Truck },
  { href: '/volunteers', label: 'Volunteers', icon: Users },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/activity-log', label: 'AI Activity Log', icon: Sparkles, badge: 'NEW' },
  { href: '/meetings', label: 'Meeting Recorder', icon: Mic, badge: 'NEW' },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/tax-documents', label: 'Tax Documents', icon: Download },
  { href: '/compliance', label: 'Compliance', icon: Shield },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help', icon: HelpCircle },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:block fixed left-0 top-0 h-full bg-white border-r border-light-200 z-50 shadow-sm overflow-hidden" style={{ width: '256px' }}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-light-200 relative">
        <div className="flex items-center gap-3">
          <a href="https://www.startmybusiness.us/create-a-508-c1a-you-can-put-your-llc-or-corp-into" target="_blank" rel="noopener noreferrer">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 cursor-pointer">
              <img
                alt="Start My Business"
                width={40}
                height={40}
                className="object-contain"
                src="https://cdn.prod.website-files.com/6784053e7b7422e48efa5a84/6833a36f90c60fba010cee72_start_my_business_logo-removebg-preview.png"
              />
            </div>
          </a>
          <div>
            <h1 className="text-sm font-bold text-light-900">Harvest Hope</h1>
            <p className="text-[10px] text-light-500">Florida Farm Ministry</p>
          </div>
        </div>
        <button className="p-2 rounded-lg hover:bg-light-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-light-500" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-50 text-primary-600 shadow-sm'
                  : 'text-light-600 hover:bg-light-100 hover:text-light-900'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-primary-100' : 'group-hover:bg-light-200'}`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
              </div>
              <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'} flex items-center gap-2`}>
                {item.label}
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-light-200 bg-white">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary-50 to-green-50 border border-primary-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-semibold text-sm">A</span>
            </div>
            <div>
              <p className="text-sm font-medium text-light-900">Admin User</p>
              <p className="text-xs text-light-500">outreach@508ministry.com</p>
            </div>
          </div>
          <a
            className="flex items-center justify-center gap-2 w-full py-2 text-sm text-light-600 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
            href="/login"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </a>
        </div>
      </div>
    </aside>
  )
}
