'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import {
  Leaf, Sun, Droplets, ThermometerSun, Apple, Church, Users,
  Heart, Truck, Calendar, Filter, ArrowDownLeft, ArrowUpRight,
  MoreVertical, Plus, Receipt, FileText, Download, Upload,
  Bell, CheckCircle, ArrowRight, Shield, Mail, Phone, MapPin,
  Clock, ExternalLink, Edit2, Check, X
} from 'lucide-react'

interface FarmLocation {
  city: string
  state: string
  latitude: number
  longitude: number
  hours: string
}

interface DashboardHeader {
  title: string
  subtitle: string
}

interface WeatherData {
  zipCode: string
  city: string
  state: string
  temperature: number
  condition: string
  humidity: number
  highTemp: number
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser()

  const [dashboardHeader, setDashboardHeader] = useState<DashboardHeader>({
    title: 'Welcome to Harvest Hope Farm Demo Dashboard',
    subtitle: 'Growing hope for churches and shelters across Florida'
  })

  const [isEditingHeader, setIsEditingHeader] = useState(false)
  const [tempHeader, setTempHeader] = useState<DashboardHeader>(dashboardHeader)

  const [weatherData, setWeatherData] = useState<WeatherData>({
    zipCode: '33030',
    city: 'Homestead',
    state: 'FL',
    temperature: 78,
    condition: 'Sunny',
    humidity: 65,
    highTemp: 85
  })

  const [isEditingWeather, setIsEditingWeather] = useState(false)
  const [tempZipCode, setTempZipCode] = useState(weatherData.zipCode)
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)
  const [weatherError, setWeatherError] = useState('')

  const [farmLocation, setFarmLocation] = useState<FarmLocation>({
    city: 'Homestead',
    state: 'FL',
    latitude: 25.4687,
    longitude: -80.5045,
    hours: 'Mon-Sat: 7:00 AM - 6:00 PM'
  })

  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [tempLocation, setTempLocation] = useState<FarmLocation>(farmLocation)

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedHeader = localStorage.getItem('dashboardHeader')
    const savedWeather = localStorage.getItem('dashboardWeather')
    const savedLocation = localStorage.getItem('farmLocation')

    if (savedHeader) {
      const parsed = JSON.parse(savedHeader)
      setDashboardHeader(parsed)
      setTempHeader(parsed)
    }

    if (savedWeather) {
      const parsed = JSON.parse(savedWeather)
      setWeatherData(parsed)
      setTempZipCode(parsed.zipCode)
    }

    if (savedLocation) {
      const parsed = JSON.parse(savedLocation)
      setFarmLocation(parsed)
      setTempLocation(parsed)
    }
  }, [])

  const handleSaveHeader = () => {
    setDashboardHeader(tempHeader)
    localStorage.setItem('dashboardHeader', JSON.stringify(tempHeader))
    setIsEditingHeader(false)
  }

  const handleCancelHeader = () => {
    setTempHeader(dashboardHeader)
    setIsEditingHeader(false)
  }

  const fetchWeatherByZip = async (zipCode: string) => {
    setIsLoadingWeather(true)
    setWeatherError('')

    try {
      // Using open-meteo.com - a free weather API
      // First, get coordinates from zip code using zippopotam.us
      const zipResponse = await fetch(`https://api.zippopotam.us/us/${zipCode}`)

      if (!zipResponse.ok) {
        throw new Error('Invalid zip code')
      }

      const zipData = await zipResponse.json()
      const place = zipData.places[0]
      const latitude = parseFloat(place.latitude)
      const longitude = parseFloat(place.longitude)
      const city = place['place name']
      const state = place['state abbreviation']

      // Get weather data from open-meteo.com
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max&temperature_unit=fahrenheit&timezone=auto`
      )

      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data')
      }

      const weatherData = await weatherResponse.json()

      // Map weather codes to conditions
      const getWeatherCondition = (code: number): string => {
        if (code === 0) return 'Clear'
        if (code >= 1 && code <= 3) return 'Partly Cloudy'
        if (code >= 45 && code <= 48) return 'Foggy'
        if (code >= 51 && code <= 67) return 'Rainy'
        if (code >= 71 && code <= 77) return 'Snowy'
        if (code >= 80 && code <= 82) return 'Rain Showers'
        if (code >= 85 && code <= 86) return 'Snow Showers'
        if (code >= 95 && code <= 99) return 'Thunderstorm'
        return 'Cloudy'
      }

      const newWeatherData: WeatherData = {
        zipCode: zipCode,
        city: city,
        state: state,
        temperature: Math.round(weatherData.current.temperature_2m),
        condition: getWeatherCondition(weatherData.current.weather_code),
        humidity: weatherData.current.relative_humidity_2m,
        highTemp: Math.round(weatherData.daily.temperature_2m_max[0])
      }

      setWeatherData(newWeatherData)
      // Save to localStorage for persistence
      localStorage.setItem('dashboardWeather', JSON.stringify(newWeatherData))
      setIsEditingWeather(false)
      setWeatherError('')
    } catch (error) {
      setWeatherError('Unable to fetch weather data. Please check the zip code and try again.')
      console.error('Weather fetch error:', error)
    } finally {
      setIsLoadingWeather(false)
    }
  }

  const handleSaveWeather = () => {
    // Validate US zip code format (5 digits)
    const zipRegex = /^\d{5}$/

    if (!tempZipCode) {
      setWeatherError('Please enter a zip code')
      return
    }

    if (!zipRegex.test(tempZipCode)) {
      setWeatherError('Please enter a valid 5-digit US zip code')
      return
    }

    fetchWeatherByZip(tempZipCode)
  }

  const handleCancelWeather = () => {
    setTempZipCode(weatherData.zipCode)
    setWeatherError('')
    setIsEditingWeather(false)
  }

  const handleSaveLocation = () => {
    setFarmLocation(tempLocation)
    localStorage.setItem('farmLocation', JSON.stringify(tempLocation))
    setIsEditingLocation(false)
  }

  const handleCancelLocation = () => {
    setTempLocation(farmLocation)
    setIsEditingLocation(false)
  }

  const getMapEmbedUrl = (lat: number, lon: number, city: string, state: string) => {
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114964.53925916665!2d${lon}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s${encodeURIComponent(city)}%2C%20${state}!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus`
  }

  const getMapSearchUrl = (lat: number, lon: number) => {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
  }
  return (
    <div className="min-h-screen bg-light-200">
      <Sidebar />

      <div style={{ marginLeft: '256px' }} className="hidden lg:block">
        <Header />

        <main className="p-4 md:p-6 space-y-6">
          {/* Welcome Section with Weather */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Welcome Header */}
            <div className="flex-1">
              {isEditingHeader ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="w-8 h-8 text-primary-500" />
                    <input
                      type="text"
                      value={tempHeader.title}
                      onChange={(e) => setTempHeader({ ...tempHeader, title: e.target.value })}
                      className="flex-1 text-2xl md:text-3xl font-bold text-light-900 px-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Dashboard title"
                    />
                  </div>
                  <input
                    type="text"
                    value={tempHeader.subtitle}
                    onChange={(e) => setTempHeader({ ...tempHeader, subtitle: e.target.value })}
                    className="w-full text-light-500 px-4 py-2 border border-light-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Dashboard subtitle"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveHeader}
                      className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelHeader}
                      className="px-4 py-2 rounded-lg hover:bg-light-100 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-light-900 mb-2 flex items-center gap-2">
                        <Leaf className="w-8 h-8 text-primary-500" />
                        {dashboardHeader.title}
                      </h1>
                      <p className="text-light-500">{dashboardHeader.subtitle}</p>
                    </div>
                    <button
                      onClick={() => {
                        setTempHeader(dashboardHeader)
                        setIsEditingHeader(true)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-light-100"
                      title="Edit header"
                    >
                      <Edit2 className="w-4 h-4 text-light-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Weather Widget */}
            <div className="relative group">
              {isEditingWeather ? (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 space-y-3 min-w-[280px]">
                  <h4 className="font-semibold text-light-900 text-sm mb-2">Change Weather Location</h4>
                  <div>
                    <label className="block text-xs font-medium text-light-700 mb-1">US Zip Code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={tempZipCode}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, '')
                        setTempZipCode(value)
                      }}
                      className="w-full px-3 py-2 text-sm border border-light-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter 5-digit US zip code"
                      maxLength={5}
                      disabled={isLoadingWeather}
                    />
                    {weatherError && (
                      <p className="mt-1 text-xs text-red-600">{weatherError}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleSaveWeather}
                      disabled={isLoadingWeather}
                      className="px-3 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors flex items-center gap-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-3 h-3" />
                      {isLoadingWeather ? 'Loading...' : 'Update'}
                    </button>
                    <button
                      onClick={handleCancelWeather}
                      disabled={isLoadingWeather}
                      className="px-3 py-2 rounded-lg hover:bg-light-100 transition-colors flex items-center gap-1 text-sm disabled:opacity-50"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                  <Sun className="w-10 h-10 text-amber-500" />
                  <div>
                    <p className="text-2xl font-bold text-light-900">{weatherData.temperature}°F</p>
                    <p className="text-xs text-light-500">{weatherData.city}, {weatherData.state} - {weatherData.condition}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-amber-200">
                    <div className="text-center">
                      <Droplets className="w-4 h-4 text-blue-500 mx-auto" />
                      <p className="text-xs text-light-500">{weatherData.humidity}%</p>
                    </div>
                    <div className="text-center">
                      <ThermometerSun className="w-4 h-4 text-red-500 mx-auto" />
                      <p className="text-xs text-light-500">{weatherData.highTemp}°</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setTempZipCode(weatherData.zipCode)
                      setWeatherError('')
                      setIsEditingWeather(true)
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/80 backdrop-blur-sm"
                    title="Change weather location"
                  >
                    <Edit2 className="w-3 h-3 text-amber-700" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Key Metrics Cards - 6 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Card 1: Produce Harvested */}
            <div className="card bg-primary-50 border border-primary-100 h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-primary-100">
                  <Apple className="w-5 h-5 text-primary-500" />
                </div>
                <span className="badge-success text-xs">+18.2%</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-light-900">0 lbs</p>
                <p className="text-sm font-medium text-light-700">Produce Harvested</p>
                <p className="text-xs text-light-500">This month</p>
              </div>
            </div>

            {/* Card 2: Churches Served */}
            <div className="card bg-secondary-50 border border-secondary-100 h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-secondary-100">
                  <Church className="w-5 h-5 text-secondary-500" />
                </div>
                <span className="badge-success text-xs">+3 new</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-light-900">0</p>
                <p className="text-sm font-medium text-light-700">Churches Served</p>
                <p className="text-xs text-light-500">Active partners</p>
              </div>
            </div>

            {/* Card 3: Families Fed */}
            <div className="card bg-accent-purple/5 border border-accent-purple/20 h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-accent-purple/10">
                  <Users className="w-5 h-5 text-accent-purple" />
                </div>
                <span className="badge-success text-xs">+12.5%</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-light-900">0</p>
                <p className="text-sm font-medium text-light-700">Families Fed</p>
                <p className="text-xs text-light-500">This month</p>
              </div>
            </div>

            {/* Card 4: Donations Received */}
            <div className="card bg-accent-pink/5 border border-accent-pink/20 h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-accent-pink/10">
                  <Heart className="w-5 h-5 text-accent-pink" />
                </div>
                <span className="badge-success text-xs">+22.1%</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-light-900">$0</p>
                <p className="text-sm font-medium text-light-700">Donations Received</p>
                <p className="text-xs text-light-500">Year to date</p>
              </div>
            </div>

            {/* Card 5: Deliveries Made */}
            <div className="card bg-accent-teal/5 border border-accent-teal/20 h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-accent-teal/10">
                  <Truck className="w-5 h-5 text-accent-teal" />
                </div>
                <span className="badge-success text-xs">+8 this week</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-light-900">0</p>
                <p className="text-sm font-medium text-light-700">Deliveries Made</p>
                <p className="text-xs text-light-500">This month</p>
              </div>
            </div>

            {/* Card 6: Volunteer Hours */}
            <div className="card bg-accent-orange/5 border border-accent-orange/20 h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-accent-orange/10">
                  <Calendar className="w-5 h-5 text-accent-orange" />
                </div>
                <span className="badge-success text-xs">+15.3%</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-light-900">0 hrs</p>
                <p className="text-sm font-medium text-light-700">Volunteer Hours</p>
                <p className="text-xs text-light-500">This quarter</p>
              </div>
            </div>
          </div>

          {/* Farm Production & Farm Location Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Farm Production Chart - Spans 2 columns */}
            <div className="card lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-light-900">Farm Production & Impact</h3>
                  <p className="text-sm text-light-500">Harvest, donations, and community distribution</p>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="h-72 sm:h-80 bg-light-50 rounded-xl flex items-center justify-center border border-light-200">
                <p className="text-light-400">Chart will display here (Recharts integration needed)</p>
              </div>

              {/* Summary Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-light-200">
                <div className="text-center">
                  <p className="text-light-500 text-xs sm:text-sm">Total Harvested</p>
                  <p className="text-lg sm:text-xl font-bold text-primary-600">0 lbs</p>
                </div>
                <div className="text-center">
                  <p className="text-light-500 text-xs sm:text-sm">Distributed</p>
                  <p className="text-lg sm:text-xl font-bold text-accent-orange">0 lbs</p>
                </div>
                <div className="text-center">
                  <p className="text-light-500 text-xs sm:text-sm">Donations</p>
                  <p className="text-lg sm:text-xl font-bold text-secondary-500">$0</p>
                </div>
                <div className="text-center">
                  <p className="text-light-500 text-xs sm:text-sm">Growth</p>
                  <p className="text-lg sm:text-xl font-bold text-primary-600">+0%</p>
                </div>
              </div>
            </div>

            {/* Farm Location */}
            <div className="card h-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-light-900">Farm Location</h3>
                  <p className="text-sm text-light-500">Visit us in {farmLocation.city}, {farmLocation.state}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditingLocation ? (
                    <>
                      <a
                        href={getMapSearchUrl(farmLocation.latitude, farmLocation.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                      >
                        Open Map
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => {
                          setTempLocation(farmLocation)
                          setIsEditingLocation(true)
                        }}
                        className="p-2 rounded-lg hover:bg-light-100 transition-colors"
                        title="Edit location"
                      >
                        <Edit2 className="w-4 h-4 text-light-500" />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveLocation}
                        className="p-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                        title="Save changes"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelLocation}
                        className="p-2 rounded-lg hover:bg-light-100 transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4 text-light-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {isEditingLocation ? (
                <div className="space-y-4 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-light-700 mb-1">City</label>
                      <input
                        type="text"
                        value={tempLocation.city}
                        onChange={(e) => setTempLocation({ ...tempLocation, city: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-light-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-light-700 mb-1">State</label>
                      <input
                        type="text"
                        value={tempLocation.state}
                        onChange={(e) => setTempLocation({ ...tempLocation, state: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-light-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-light-700 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={tempLocation.latitude}
                        onChange={(e) => setTempLocation({ ...tempLocation, latitude: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 text-sm border border-light-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-light-700 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={tempLocation.longitude}
                        onChange={(e) => setTempLocation({ ...tempLocation, longitude: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 text-sm border border-light-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-light-700 mb-1">Hours</label>
                    <input
                      type="text"
                      value={tempLocation.hours}
                      onChange={(e) => setTempLocation({ ...tempLocation, hours: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-light-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Mon-Sat: 7:00 AM - 6:00 PM"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Map Embed */}
                  <div className="relative rounded-xl overflow-hidden h-48 mb-4 bg-light-100">
                    <iframe
                      src={getMapEmbedUrl(farmLocation.latitude, farmLocation.longitude, farmLocation.city, farmLocation.state)}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="absolute inset-0"
                    />
                  </div>

                  {/* Location Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-light-600">
                      <MapPin className="w-4 h-4 text-primary-500" />
                      <span>{farmLocation.city}, {farmLocation.state}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-light-600">
                      <Clock className="w-4 h-4 text-primary-500" />
                      <span>{farmLocation.hours}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Recent Transactions & Quick Actions/Compliance Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Transactions - Spans 2 columns */}
            <div className="card lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-light-900">Recent Transactions</h3>
                  <p className="text-sm text-light-500">Your latest donations and expenses</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-ghost flex items-center gap-2 text-sm">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <button className="btn-outline text-sm">View All</button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-light-200">
                      <th className="text-left py-3 px-4 text-light-500 font-medium text-sm">Transaction</th>
                      <th className="text-left py-3 px-4 text-light-500 font-medium text-sm">Category</th>
                      <th className="text-left py-3 px-4 text-light-500 font-medium text-sm">Date</th>
                      <th className="text-right py-3 px-4 text-light-500 font-medium text-sm">Amount</th>
                      <th className="text-center py-3 px-4 text-light-500 font-medium text-sm">Status</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="table-row">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary-50">
                            <ArrowDownLeft className="w-4 h-4 text-primary-500" />
                          </div>
                          <div>
                            <p className="font-medium text-light-900">Monthly Donation</p>
                            <p className="text-sm text-light-500">John Smith</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4"><span className="badge bg-light-100 text-light-700">General Fund</span></td>
                      <td className="py-4 px-4 text-light-600">Jan 14, 2024</td>
                      <td className="py-4 px-4 text-right font-medium text-primary-600">+$500</td>
                      <td className="py-4 px-4 text-center"><span className="badge-success">Completed</span></td>
                      <td className="py-4 px-4">
                        <button className="p-2 rounded-lg hover:bg-light-100 transition-colors">
                          <MoreVertical className="w-4 h-4 text-light-400" />
                        </button>
                      </td>
                    </tr>

                    <tr className="table-row">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-secondary-50">
                            <ArrowUpRight className="w-4 h-4 text-secondary-500" />
                          </div>
                          <div>
                            <p className="font-medium text-light-900">Office Supplies</p>
                            <p className="text-sm text-light-500">Staples</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4"><span className="badge bg-light-100 text-light-700">Operations</span></td>
                      <td className="py-4 px-4 text-light-600">Jan 13, 2024</td>
                      <td className="py-4 px-4 text-right font-medium text-light-600">-$85</td>
                      <td className="py-4 px-4 text-center"><span className="badge-success">Completed</span></td>
                      <td className="py-4 px-4">
                        <button className="p-2 rounded-lg hover:bg-light-100 transition-colors">
                          <MoreVertical className="w-4 h-4 text-light-400" />
                        </button>
                      </td>
                    </tr>

                    <tr className="table-row">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary-50">
                            <ArrowDownLeft className="w-4 h-4 text-primary-500" />
                          </div>
                          <div>
                            <p className="font-medium text-light-900">Charity Event</p>
                            <p className="text-sm text-light-500">Community Fundraiser</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4"><span className="badge bg-light-100 text-light-700">Events</span></td>
                      <td className="py-4 px-4 text-light-600">Jan 12, 2024</td>
                      <td className="py-4 px-4 text-right font-medium text-primary-600">+$1,200</td>
                      <td className="py-4 px-4 text-center"><span className="badge-success">Completed</span></td>
                      <td className="py-4 px-4">
                        <button className="p-2 rounded-lg hover:bg-light-100 transition-colors">
                          <MoreVertical className="w-4 h-4 text-light-400" />
                        </button>
                      </td>
                    </tr>

                    <tr className="table-row">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-secondary-50">
                            <ArrowUpRight className="w-4 h-4 text-secondary-500" />
                          </div>
                          <div>
                            <p className="font-medium text-light-900">Community Outreach</p>
                            <p className="text-sm text-light-500">Food Bank Donation</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4"><span className="badge bg-light-100 text-light-700">Ministry</span></td>
                      <td className="py-4 px-4 text-light-600">Jan 11, 2024</td>
                      <td className="py-4 px-4 text-right font-medium text-light-600">-$300</td>
                      <td className="py-4 px-4 text-center"><span className="badge-success">Completed</span></td>
                      <td className="py-4 px-4">
                        <button className="p-2 rounded-lg hover:bg-light-100 transition-colors">
                          <MoreVertical className="w-4 h-4 text-light-400" />
                        </button>
                      </td>
                    </tr>

                    <tr className="table-row">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary-50">
                            <ArrowDownLeft className="w-4 h-4 text-primary-500" />
                          </div>
                          <div>
                            <p className="font-medium text-light-900">Anonymous Donation</p>
                            <p className="text-sm text-light-500">Online Gift</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4"><span className="badge bg-light-100 text-light-700">General Fund</span></td>
                      <td className="py-4 px-4 text-light-600">Jan 10, 2024</td>
                      <td className="py-4 px-4 text-right font-medium text-primary-600">+$750</td>
                      <td className="py-4 px-4 text-center"><span className="badge-success">Completed</span></td>
                      <td className="py-4 px-4">
                        <button className="p-2 rounded-lg hover:bg-light-100 transition-colors">
                          <MoreVertical className="w-4 h-4 text-light-400" />
                        </button>
                      </td>
                    </tr>

                    <tr className="table-row">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-secondary-50">
                            <ArrowUpRight className="w-4 h-4 text-secondary-500" />
                          </div>
                          <div>
                            <p className="font-medium text-light-900">Utility Bill</p>
                            <p className="text-sm text-light-500">Electric Company</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4"><span className="badge bg-light-100 text-light-700">Operations</span></td>
                      <td className="py-4 px-4 text-light-600">Jan 9, 2024</td>
                      <td className="py-4 px-4 text-right font-medium text-light-600">-$145</td>
                      <td className="py-4 px-4 text-center"><span className="badge-success">Completed</span></td>
                      <td className="py-4 px-4">
                        <button className="p-2 rounded-lg hover:bg-light-100 transition-colors">
                          <MoreVertical className="w-4 h-4 text-light-400" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-light-200">
                <p className="text-sm text-light-500">Showing 6 of 156 transactions</p>
                <div className="flex items-center gap-2">
                  <button className="btn-ghost text-sm">Previous</button>
                  <button className="btn-outline text-sm">Next</button>
                </div>
              </div>
            </div>

            {/* Right Column - Quick Actions & Compliance */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="card">
                <h3 className="text-lg font-semibold text-light-900 mb-4">Quick Actions</h3>
                <p className="text-sm text-light-500 mb-6">Common tasks at your fingertips</p>

                <div className="space-y-3">
                  <a href="/donations/new" className="flex items-center gap-4 p-3 rounded-xl bg-primary-50 hover:bg-primary-100 transition-all group cursor-pointer">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <Plus className="w-5 h-5 text-primary-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-light-900 group-hover:text-primary-600 transition-colors">Add Donation</p>
                      <p className="text-xs text-light-500">Record a new donation</p>
                    </div>
                  </a>

                  <a href="/expenses/new" className="flex items-center gap-4 p-3 rounded-xl bg-secondary-50 hover:bg-secondary-100 transition-all group cursor-pointer">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <Receipt className="w-5 h-5 text-secondary-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-light-900 group-hover:text-primary-600 transition-colors">Record Expense</p>
                      <p className="text-xs text-light-500">Log ministry expenses</p>
                    </div>
                  </a>

                  <a href="/receipts/new" className="flex items-center gap-4 p-3 rounded-xl bg-accent-purple/10 hover:bg-accent-purple/20 transition-all group cursor-pointer">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <FileText className="w-5 h-5 text-accent-purple" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-light-900 group-hover:text-primary-600 transition-colors">Generate Receipt</p>
                      <p className="text-xs text-light-500">Create donor receipt</p>
                    </div>
                  </a>

                  <a href="/trustees" className="flex items-center gap-4 p-3 rounded-xl bg-accent-pink/10 hover:bg-accent-pink/20 transition-all group cursor-pointer">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <Users className="w-5 h-5 text-accent-pink" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-light-900 group-hover:text-primary-600 transition-colors">Manage Trustees</p>
                      <p className="text-xs text-light-500">Add or update trustees</p>
                    </div>
                  </a>

                  <a href="/reports/export" className="flex items-center gap-4 p-3 rounded-xl bg-accent-teal/10 hover:bg-accent-teal/20 transition-all group cursor-pointer">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <Download className="w-5 h-5 text-accent-teal" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-light-900 group-hover:text-primary-600 transition-colors">Export Report</p>
                      <p className="text-xs text-light-500">Download financial report</p>
                    </div>
                  </a>

                  <a href="/documents/upload" className="flex items-center gap-4 p-3 rounded-xl bg-accent-orange/10 hover:bg-accent-orange/20 transition-all group cursor-pointer">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <Upload className="w-5 h-5 text-accent-orange" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-light-900 group-hover:text-primary-600 transition-colors">Upload Document</p>
                      <p className="text-xs text-light-500">Add trust documents</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Compliance Status */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-light-900 flex items-center gap-2">
                      Compliance Status
                      <Bell className="w-4 h-4 text-amber-500" />
                    </h3>
                    <p className="text-sm text-light-500">Stay on track with your duties</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-500">40%</p>
                    <p className="text-xs text-light-500">Complete</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-light-200 rounded-full mb-6 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full" style={{ width: '40%' }}></div>
                </div>

                {/* Compliance Items */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 transition-all cursor-pointer">
                    <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-light-900 text-sm truncate">Q4 Meeting Held</p>
                      <p className="text-xs text-light-500 truncate">Trust compliance audit</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 transition-all cursor-pointer">
                    <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-light-900 text-sm truncate">Tax Documents Filed</p>
                      <p className="text-xs text-light-500 truncate">IRS Form 990</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-light-50 transition-all cursor-pointer">
                    <div className="w-5 h-5 rounded-full border-2 border-light-300 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-light-900 text-sm truncate">Board Meeting Minutes</p>
                      <p className="text-xs text-light-500 truncate">Document quarterly meetings</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-light-50 transition-all cursor-pointer">
                    <div className="w-5 h-5 rounded-full border-2 border-light-300 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-light-900 text-sm truncate">Financial Reports</p>
                      <p className="text-xs text-light-500 truncate">Annual financial review</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-light-50 transition-all cursor-pointer">
                    <div className="w-5 h-5 rounded-full border-2 border-light-300 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-light-900 text-sm truncate">Insurance Documents</p>
                      <p className="text-xs text-light-500 truncate">Liability coverage proof</p>
                    </div>
                  </div>
                </div>

                {/* View More Link */}
                <a href="/compliance" className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-light-200 text-primary-500 hover:text-primary-600 transition-colors">
                  View Full Compliance Report
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Trustees */}
              <div className="card">
                <h3 className="text-lg font-semibold text-light-900 mb-4">Trustees</h3>
                <p className="text-sm text-light-500 mb-6">Your board members</p>

                <div className="space-y-4">
                  {/* Trustee Card 1 */}
                  <div className="card hover:border-primary-300 cursor-pointer transition-all hover:shadow-md">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-200">
                          <img
                            alt="Michael Anderson"
                            src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-light-900">Michael Anderson</h4>
                          <div className="flex items-center gap-1 text-light-500 text-sm">
                            <Shield className="w-3 h-3" />
                            Lead Trustee
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-light-600">
                        <Mail className="w-4 h-4 text-light-400" />
                        <span className="text-sm">michael@ministry.org</span>
                      </div>
                      <div className="flex items-center gap-3 text-light-600">
                        <Phone className="w-4 h-4 text-light-400" />
                        <span className="text-sm">(555) 123-4567</span>
                      </div>
                      <div className="flex items-center gap-3 text-light-600">
                        <Calendar className="w-4 h-4 text-light-400" />
                        <span className="text-sm">Joined May 2022</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-light-200">
                      <span className="badge-success">Active</span>
                    </div>
                  </div>

                  {/* Trustee Card 2 */}
                  <div className="card hover:border-primary-300 cursor-pointer transition-all hover:shadow-md">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-200">
                          <img
                            alt="David Chen"
                            src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-light-900">David Chen</h4>
                          <div className="flex items-center gap-1 text-light-500 text-sm">
                            <Shield className="w-3 h-3" />
                            Treasurer
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-light-600">
                        <Mail className="w-4 h-4 text-light-400" />
                        <span className="text-sm">david@ministry.org</span>
                      </div>
                      <div className="flex items-center gap-3 text-light-600">
                        <Phone className="w-4 h-4 text-light-400" />
                        <span className="text-sm">(555) 987-6543</span>
                      </div>
                      <div className="flex items-center gap-3 text-light-600">
                        <Calendar className="w-4 h-4 text-light-400" />
                        <span className="text-sm">Joined March 2023</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-light-200">
                      <span className="badge-success">Active</span>
                    </div>
                  </div>

                  {/* Add New Trustee Button */}
                  <div className="card border-dashed border-2 border-light-300 flex items-center justify-center min-h-[200px] cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-light-100 flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl text-light-400">+</span>
                      </div>
                      <p className="font-medium text-light-600">Add New Trustee</p>
                      <p className="text-sm text-light-400">Expand your board</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
