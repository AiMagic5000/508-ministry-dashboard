'use client'

import { Bell, Search } from 'lucide-react'
import { UserButton, useUser } from '@clerk/nextjs'

export default function Header() {
  const { user, isLoaded } = useUser()

  return (
    <header className="h-16 bg-white border-b border-light-200 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-400" />
          <input
            type="text"
            placeholder="Search transactions, documents, or members..."
            className="w-full pl-10 pr-4 py-2 bg-light-50 border border-light-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-light-100 transition-colors">
          <Bell className="w-5 h-5 text-light-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-light-200">
          {isLoaded && user && (
            <>
              <div className="text-right">
                <p className="text-sm font-medium text-light-900">{user.fullName || user.primaryEmailAddress?.emailAddress}</p>
                <p className="text-xs text-light-500">Ministry Admin</p>
              </div>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9"
                  }
                }}
              />
            </>
          )}
        </div>
      </div>
    </header>
  )
}
