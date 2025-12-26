'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Scale, Waves, Sprout, TreePine, Droplets, Home, Fish, Edit2 } from 'lucide-react'

interface SystemConfig {
  pageTitle: string
  pageSubtitle: string
  fishPerMonth: number
  verticalGardens: number
  foodForest: number
  daysGrowing: number
}

interface WaterQuality {
  parameter: string
  currentValue: string
  optimalRange: string
  status: 'optimal' | 'warning' | 'critical'
}

export default function FoodProductionPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditingConfig, setIsEditingConfig] = useState(false)

  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    pageTitle: '1,000+ lbs of Food Production',
    pageSubtitle: 'Florida Outdoor Vertical Farming & Aquaponics System',
    fishPerMonth: 0,
    verticalGardens: 0,
    foodForest: 0,
    daysGrowing: 0
  })

  const [waterQuality] = useState<WaterQuality[]>([
    { parameter: 'Temperature', currentValue: '82°F', optimalRange: '75-85°F', status: 'optimal' },
    { parameter: 'pH Level', currentValue: '7.0', optimalRange: '6.8-7.2', status: 'optimal' },
    { parameter: 'Ammonia', currentValue: '0.2 ppm', optimalRange: '< 0.5 ppm', status: 'optimal' },
    { parameter: 'Nitrite', currentValue: '0.1 ppm', optimalRange: '< 0.5 ppm', status: 'optimal' },
    { parameter: 'Nitrate', currentValue: '45 ppm', optimalRange: '5-150 ppm', status: 'optimal' },
    { parameter: 'Dissolved O2', currentValue: '6.2 ppm', optimalRange: '> 5 ppm', status: 'optimal' }
  ])

  const handleSaveConfig = () => {
    setIsEditingConfig(false)
    // In production, save to database here
  }

  return (
    <div className="min-h-screen bg-light-200">
      <Sidebar />

      <div style={{ marginLeft: '256px' }} className="hidden lg:block">
        <Header />

        <main className="p-4 md:p-6 space-y-6">
          {/* Editable Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {isEditingConfig ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={systemConfig.pageTitle}
                    onChange={(e) => setSystemConfig({ ...systemConfig, pageTitle: e.target.value })}
                    className="w-full text-2xl md:text-3xl font-bold text-light-900 px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    value={systemConfig.pageSubtitle}
                    onChange={(e) => setSystemConfig({ ...systemConfig, pageSubtitle: e.target.value })}
                    className="w-full text-light-500 px-4 py-2 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-light-900 mb-2 flex items-center gap-2">
                    <Scale className="w-8 h-8 text-primary-500" />
                    {systemConfig.pageTitle}
                  </h1>
                  <p className="text-light-500">{systemConfig.pageSubtitle}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => isEditingConfig ? handleSaveConfig() : setIsEditingConfig(true)}
              className={isEditingConfig ? "btn-primary flex items-center gap-2" : "p-2 rounded-lg hover:bg-light-100 transition-colors"}
            >
              <Edit2 className="w-4 h-4" />
              {isEditingConfig ? 'Save' : ''}
            </button>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-white/20">
                  <Fish className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{systemConfig.fishPerMonth} lbs</p>
                <p className="text-sm font-medium text-blue-100">Fish per Month</p>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-white/20">
                  <Sprout className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{systemConfig.verticalGardens} lbs</p>
                <p className="text-sm font-medium text-green-100">Vertical Gardens</p>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-amber-500 to-amber-600 border-0 text-white">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-white/20">
                  <TreePine className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{systemConfig.foodForest} lbs</p>
                <p className="text-sm font-medium text-amber-100">Food Forest (avg)</p>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-primary-500 to-primary-600 border-0 text-white">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-white/20">
                  <Scale className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{systemConfig.daysGrowing}</p>
                <p className="text-sm font-medium text-primary-100">Days Growing</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white text-light-600 hover:bg-light-100'
              }`}
            >
              System Overview
            </button>
            <button
              onClick={() => setActiveTab('fish')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'fish'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-light-600 hover:bg-light-100'
              }`}
            >
              Fish Production
            </button>
            <button
              onClick={() => setActiveTab('vertical')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'vertical'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white text-light-600 hover:bg-light-100'
              }`}
            >
              Vertical Towers
            </button>
            <button
              onClick={() => setActiveTab('forest')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'forest'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white text-light-600 hover:bg-light-100'
              }`}
            >
              Food Forest
            </button>
            <button
              onClick={() => setActiveTab('sops')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'sops'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white text-light-600 hover:bg-light-100'
              }`}
            >
              Daily SOPs
            </button>
          </div>

          {/* System Components (Overview Tab) */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Aquaponics System */}
                <div className="card hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                      <Waves className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-light-900">Aquaponics System</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-light-600">
                    <li>• 1,100+ gallon fish tank system (4 IBC totes)</li>
                    <li>• Tilapia primary - 100 lbs/month harvest</li>
                    <li>• 4 grow beds (4x8 ft) for bio-filtration</li>
                    <li>• Backup generator for hurricane season</li>
                  </ul>
                </div>

                {/* Vertical Gardens */}
                <div className="card hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                      <Sprout className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-light-900">Vertical Gardens</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-light-600">
                    <li>• 25 vertical towers (5 ft each)</li>
                    <li>• 200+ active plant sites</li>
                    <li>• Leafy greens & herbs primary crops</li>
                    <li>• 50% shade cloth for Florida sun</li>
                  </ul>
                </div>

                {/* Food Forest */}
                <div className="card hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
                      <TreePine className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-light-900">Food Forest</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-light-600">
                    <li>• Mango, avocado, citrus, banana, papaya</li>
                    <li>• Moringa, katuk, longevity spinach</li>
                    <li>• Sweet potato, perennial peanut ground cover</li>
                    <li>• 40 lbs average monthly (seasonal variation)</li>
                  </ul>
                </div>
              </div>

              {/* Water Quality & Space Allocation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Water Quality Parameters */}
                <div className="card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-blue-50">
                      <Droplets className="w-5 h-5 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-light-900">Water Quality Parameters</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-light-200">
                          <th className="text-left py-2 px-3 text-xs font-semibold text-light-500">Parameter</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-light-500">Current</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-light-500">Optimal</th>
                          <th className="text-center py-2 px-3 text-xs font-semibold text-light-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {waterQuality.map((item, index) => (
                          <tr key={index} className="border-b border-light-100">
                            <td className="py-3 px-3 text-sm font-medium text-light-900">{item.parameter}</td>
                            <td className="py-3 px-3 text-sm text-light-600">{item.currentValue}</td>
                            <td className="py-3 px-3 text-sm text-light-500">{item.optimalRange}</td>
                            <td className="py-3 px-3 text-center">
                              <span className="text-xs font-semibold text-green-600">✓ Optimal</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Space Allocation */}
                <div className="card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-primary-50">
                      <Home className="w-5 h-5 text-primary-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-light-900">Space Allocation</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-light-50 rounded-lg">
                      <span className="text-sm font-medium text-light-700">Fish Tanks</span>
                      <span className="text-sm font-bold text-blue-600">200 sq ft</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-light-50 rounded-lg">
                      <span className="text-sm font-medium text-light-700">Vertical Towers</span>
                      <span className="text-sm font-bold text-green-600">400 sq ft</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-light-50 rounded-lg">
                      <span className="text-sm font-medium text-light-700">Food Forest</span>
                      <span className="text-sm font-bold text-amber-600">800+ sq ft</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border-2 border-primary-200">
                      <span className="text-sm font-bold text-light-900">TOTAL</span>
                      <span className="text-lg font-bold text-primary-600">2,500 sq ft</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Daily SOPs Tab */}
          {activeTab === 'sops' && (
            <div className="card">
              <h3 className="text-xl font-bold text-light-900 mb-6">Standard Operating Procedures (Daily Tasks)</h3>
              <div className="space-y-6">
                <div className="pb-6 border-b border-light-200">
                  <h4 className="font-semibold text-light-900 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">1</span>
                    Morning Fish System Check (7:00 AM)
                  </h4>
                  <ul className="ml-8 space-y-2 text-sm text-light-600">
                    <li>• Check water temperature and pH levels</li>
                    <li>• Inspect fish for health and behavior</li>
                    <li>• Feed tilapia (2% body weight)</li>
                    <li>• Clean mechanical filters if needed</li>
                    <li>• Test ammonia, nitrite, and nitrate levels</li>
                  </ul>
                </div>

                <div className="pb-6 border-b border-light-200">
                  <h4 className="font-semibold text-light-900 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">2</span>
                    Vertical Tower Inspection (8:00 AM)
                  </h4>
                  <ul className="ml-8 space-y-2 text-sm text-light-600">
                    <li>• Check irrigation timers and drip lines</li>
                    <li>• Inspect plants for pests or disease</li>
                    <li>• Harvest mature crops</li>
                    <li>• Plant new seedlings in empty sites</li>
                    <li>• Test nutrient solution EC and pH</li>
                  </ul>
                </div>

                <div className="pb-6 border-b border-light-200">
                  <h4 className="font-semibold text-light-900 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">3</span>
                    Food Forest Maintenance (9:00 AM)
                  </h4>
                  <ul className="ml-8 space-y-2 text-sm text-light-600">
                    <li>• Water young trees and perennials</li>
                    <li>• Harvest ripe fruits and vegetables</li>
                    <li>• Mulch around tree bases</li>
                    <li>• Prune dead or diseased branches</li>
                    <li>• Monitor ground cover growth</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-light-900 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs">4</span>
                    Evening System Check (5:00 PM)
                  </h4>
                  <ul className="ml-8 space-y-2 text-sm text-light-600">
                    <li>• Final water quality check</li>
                    <li>• Ensure all systems operational</li>
                    <li>• Log daily production and observations</li>
                    <li>• Prepare for next day&apos;s tasks</li>
                    <li>• Secure equipment for overnight</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
