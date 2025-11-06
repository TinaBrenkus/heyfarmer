'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Mail, MapPin, Filter, Download, Calendar, User, Tractor, ShoppingCart } from 'lucide-react'
import FarmLogo from '@/components/icons/FarmLogo'
import { supabase } from '@/lib/supabase'
import { UserType, NorthTexasCounty } from '@/lib/database'

interface WaitlistEntry {
  id: string
  email: string
  user_type: UserType
  county: NorthTexasCounty
  created_at: string
}

interface WaitlistStats {
  total: number
  consumers: number
  backyard_growers: number
  market_gardeners: number
  production_farmers: number
  by_county: Record<string, number>
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<WaitlistEntry[]>([])
  const [stats, setStats] = useState<WaitlistStats | null>(null)
  const [filters, setFilters] = useState({
    userType: 'all',
    county: 'all',
    dateRange: 'all'
  })

  useEffect(() => {
    checkAdminAccess()
    fetchWaitlistData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [waitlistEntries, filters])

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    // For now, check if user email contains 'admin' or is the project owner
    // In production, you'd want proper admin role management
    const isAdmin = user.email?.includes('admin') || user.email === 'tina@example.com'
    
    if (!isAdmin) {
      router.push('/dashboard')
      return
    }
  }

  const fetchWaitlistData = async () => {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching waitlist:', error)
        return
      }

      setWaitlistEntries(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (entries: WaitlistEntry[]) => {
    const stats: WaitlistStats = {
      total: entries.length,
      consumers: 0,
      backyard_growers: 0,
      market_gardeners: 0,
      production_farmers: 0,
      by_county: {}
    }

    entries.forEach(entry => {
      // Count by user type
      stats[entry.user_type as keyof typeof stats]++

      // Count by county
      const countyLabel = entry.county.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      stats.by_county[countyLabel] = (stats.by_county[countyLabel] || 0) + 1
    })

    setStats(stats)
  }

  const applyFilters = () => {
    let filtered = [...waitlistEntries]

    // Filter by user type
    if (filters.userType !== 'all') {
      filtered = filtered.filter(entry => entry.user_type === filters.userType)
    }

    // Filter by county
    if (filters.county !== 'all') {
      filtered = filtered.filter(entry => entry.county === filters.county)
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const days = filters.dateRange === '7' ? 7 : filters.dateRange === '30' ? 30 : 0
      if (days > 0) {
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(entry => new Date(entry.created_at) >= cutoff)
      }
    }

    setFilteredEntries(filtered)
  }

  const exportToCSV = () => {
    const headers = ['Email', 'User Type', 'County', 'Date Joined']
    const csvContent = [
      headers.join(','),
      ...filteredEntries.map(entry => [
        entry.email,
        entry.user_type.replace('_', ' '),
        entry.county.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        new Date(entry.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `heyfarmer-waitlist-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getUserTypeIcon = (userType: UserType) => {
    switch (userType) {
      case 'consumer': return ShoppingCart
      case 'backyard_grower': return FarmLogo
      case 'market_gardener': return User
      case 'production_farmer': return Tractor
      default: return User
    }
  }

  const getUserTypeLabel = (userType: UserType) => {
    return userType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#2E7D32' }}>
                <FarmLogo size={24} className="text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">
                Hey <span style={{ color: '#2E7D32' }}>Farmer</span> Admin
              </h1>
            </div>
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8" style={{ color: '#2E7D32' }} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Signups</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8" style={{ color: '#1976D2' }} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Consumers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.consumers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <FarmLogo className="h-8 w-8" style={{ color: '#FFA726' }} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Backyard Growers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.backyard_growers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Tractor className="h-8 w-8" style={{ color: '#E65100' }} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Farmers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.market_gardeners + stats.production_farmers}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Export */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              <select
                value={filters.userType}
                onChange={(e) => setFilters(prev => ({ ...prev, userType: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="consumer">Consumers</option>
                <option value="backyard_grower">Backyard Growers</option>
                <option value="market_gardener">Market Gardeners</option>
                <option value="production_farmer">Production Farmers</option>
              </select>

              <select
                value={filters.county}
                onChange={(e) => setFilters(prev => ({ ...prev, county: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Counties</option>
                <option value="dallas">Dallas County</option>
                <option value="tarrant">Tarrant County</option>
                <option value="collin">Collin County</option>
                <option value="denton">Denton County</option>
                <option value="wise">Wise County</option>
                <option value="parker">Parker County</option>
                <option value="jack">Jack County</option>
                <option value="grayson">Grayson County</option>
                <option value="hunt">Hunt County</option>
                <option value="kaufman">Kaufman County</option>
                <option value="rockwall">Rockwall County</option>
              </select>

              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Time</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
              </select>
            </div>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors"
              style={{ backgroundColor: '#1976D2' }}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* County Breakdown */}
        {stats && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Signups by County</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(stats.by_county).map(([county, count]) => (
                <div key={county} className="text-center p-3 rounded-lg" style={{ backgroundColor: '#E8F5E8' }}>
                  <p className="text-sm font-medium text-gray-700">{county}</p>
                  <p className="text-lg font-bold" style={{ color: '#2E7D32' }}>{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Waitlist Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Waitlist Entries ({filteredEntries.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.map((entry) => {
                  const UserTypeIcon = getUserTypeIcon(entry.user_type)
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{entry.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserTypeIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{getUserTypeLabel(entry.user_type)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {entry.county.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} County
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredEntries.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No waitlist entries found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}