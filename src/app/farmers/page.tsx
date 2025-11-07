'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Search, 
  MapPin, 
  Filter, 
  Grid, 
  List,
  Users,
  MessageCircle,
  ChevronDown,
  ExternalLink
} from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import FarmLogo from '@/components/icons/FarmLogo'
import FarmerBadge from '@/components/badges/FarmerBadge'
import { supabase } from '@/lib/supabase'
import { UserType } from '@/lib/database'

interface FarmerProfile {
  id: string
  full_name: string
  farm_name?: string
  bio?: string
  county: string
  city?: string
  user_type: UserType
  grow_tags?: string[]
  avatar_url?: string
  verified?: boolean
  platform_messages?: boolean
  show_phone?: boolean
  show_email?: boolean
  phone?: string
  email?: string
  created_at: string
  listing_count?: number
}

export default function FarmersPage() {
  const router = useRouter()
  const [farmers, setFarmers] = useState<FarmerProfile[]>([])
  const [filteredFarmers, setFilteredFarmers] = useState<FarmerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCounty, setSelectedCounty] = useState('')
  const [selectedUserType, setSelectedUserType] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const counties = [
    'collin', 'dallas', 'denton', 'tarrant', 'wise', 'parker', 
    'jack', 'grayson', 'hunt', 'kaufman', 'rockwall'
  ]

  const userTypes = [
    { key: 'backyard_grower', label: 'Backyard Grower' },
    { key: 'market_gardener', label: 'Market Gardener' },
    { key: 'production_farmer', label: 'Production Farm' }
  ]

  useEffect(() => {
    checkCurrentUser()
    fetchFarmers()
  }, [])

  useEffect(() => {
    filterFarmers()
  }, [farmers, searchQuery, selectedCounty, selectedUserType])

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchFarmers = async () => {
    try {
      // Get farmers with listing counts
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          posts(count)
        `)
        .in('user_type', ['backyard_grower', 'market_gardener', 'production_farmer'])
        .eq('show_in_marketplace', true)
        .eq('include_in_search', true)
        .order('created_at', { ascending: false })

      if (error) {
        // Handle missing posts table gracefully - try without posts relation
        if (error.message?.includes('posts') || error.message?.includes('relation')) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('user_type', ['backyard_grower', 'market_gardener', 'production_farmer'])
            .eq('show_in_marketplace', true)
            .eq('include_in_search', true)
            .order('created_at', { ascending: false })

          if (profilesError) throw profilesError

          const farmersWithCounts = profilesData?.map(farmer => ({
            ...farmer,
            listing_count: 0
          })) || []

          setFarmers(farmersWithCounts)
          return
        }
        throw error
      }

      const farmersWithCounts = data?.map(farmer => ({
        ...farmer,
        listing_count: farmer.posts?.[0]?.count || 0
      })) || []

      setFarmers(farmersWithCounts)
    } catch (error) {
      console.error('Error fetching farmers:', error)
      setFarmers([])
    } finally {
      setLoading(false)
    }
  }

  const filterFarmers = () => {
    let filtered = farmers

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(farmer =>
        farmer.full_name.toLowerCase().includes(query) ||
        farmer.farm_name?.toLowerCase().includes(query) ||
        farmer.bio?.toLowerCase().includes(query) ||
        farmer.grow_tags?.some(tag => tag.toLowerCase().includes(query)) ||
        farmer.city?.toLowerCase().includes(query)
      )
    }

    if (selectedCounty) {
      filtered = filtered.filter(farmer => farmer.county === selectedCounty)
    }

    if (selectedUserType) {
      filtered = filtered.filter(farmer => farmer.user_type === selectedUserType)
    }

    setFilteredFarmers(filtered)
  }

  const handleSearch = () => {
    filterFarmers()
  }

  const handleContact = async (farmer: FarmerProfile) => {
    if (!currentUser) {
      router.push('/login?redirect=' + encodeURIComponent('/farmers'))
      return
    }

    try {
      const { data: conversationId, error } = await supabase.rpc('get_or_create_conversation', {
        p_user1_id: currentUser.id,
        p_user2_id: farmer.id
      })

      if (error) throw error

      const initialMessage = `Hi ${farmer.farm_name || farmer.full_name}! I found your profile on Hey Farmer and would love to learn more about what you grow.`
      
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content: initialMessage
      })

      router.push('/messages')
    } catch (error) {
      console.error('Error starting conversation:', error)
      router.push('/messages')
    }
  }

  const getCountyDisplayName = (county: string) => {
    const counties = {
      'collin': 'Collin County',
      'dallas': 'Dallas County', 
      'denton': 'Denton County',
      'tarrant': 'Tarrant County',
      'wise': 'Wise County',
      'parker': 'Parker County',
      'jack': 'Jack County',
      'grayson': 'Grayson County',
      'hunt': 'Hunt County',
      'kaufman': 'Kaufman County',
      'rockwall': 'Rockwall County'
    }
    return counties[county as keyof typeof counties] || county.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' County'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading farmers...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🧑‍🌾</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Texas Triangle Farmers</h1>
              <p className="text-gray-600">Discover local farmers and growers in your area</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by name, farm, location, or crops..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={16} />
              Filters
              <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                title="Grid view"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${viewMode === 'list' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                title="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">County</label>
                  <select
                    value={selectedCounty}
                    onChange={(e) => setSelectedCounty(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Counties</option>
                    {counties.map(county => (
                      <option key={county} value={county}>
                        {getCountyDisplayName(county)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Farmer Type</label>
                  <select
                    value={selectedUserType}
                    onChange={(e) => setSelectedUserType(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {userTypes.map(type => (
                      <option key={type.key} value={type.key}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedCounty('')
                    setSelectedUserType('')
                    setSearchQuery('')
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <Users size={16} className="inline mr-2" />
            {filteredFarmers.length} {filteredFarmers.length === 1 ? 'farmer' : 'farmers'} found
          </p>
        </div>

        {/* Farmers Grid/List */}
        {filteredFarmers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No farmers found</h3>
            <p className="text-gray-600">Try adjusting your search or filters above</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredFarmers.map((farmer) => (
              <div key={farmer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {viewMode === 'grid' ? (
                  // Grid Card View
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {farmer.avatar_url ? (
                          <img
                            src={farmer.avatar_url}
                            alt={farmer.full_name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <FarmLogo size={24} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/profile/${farmer.id}`}
                            className="font-semibold text-gray-900 hover:text-green-600 transition-colors truncate"
                          >
                            {farmer.farm_name || farmer.full_name}
                          </Link>
                          <FarmerBadge 
                            userType={farmer.user_type}
                            verified={farmer.verified}
                            size="sm"
                            showLabel={false}
                          />
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                          <MapPin size={12} />
                          <span>
                            {farmer.city ? `${farmer.city}, ` : ''}{getCountyDisplayName(farmer.county)}, TX
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {farmer.bio || 'No bio provided yet.'}
                        </p>
                      </div>
                    </div>

                    {/* Grow Tags */}
                    {farmer.grow_tags && farmer.grow_tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {farmer.grow_tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                          {farmer.grow_tags.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              +{farmer.grow_tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Link
                        href={`/profile/${farmer.id}`}
                        className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center text-sm font-medium"
                      >
                        View Profile
                      </Link>
                      {farmer.platform_messages && (
                        <button
                          onClick={() => handleContact(farmer)}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Message
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  // List View
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {farmer.avatar_url ? (
                          <img
                            src={farmer.avatar_url}
                            alt={farmer.full_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <FarmLogo size={20} className="text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/profile/${farmer.id}`}
                            className="font-semibold text-gray-900 hover:text-green-600 transition-colors"
                          >
                            {farmer.farm_name || farmer.full_name}
                          </Link>
                          <FarmerBadge 
                            userType={farmer.user_type}
                            verified={farmer.verified}
                            size="sm"
                            showLabel={false}
                          />
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                          <MapPin size={12} />
                          <span>
                            {farmer.city ? `${farmer.city}, ` : ''}{getCountyDisplayName(farmer.county)}, TX
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {farmer.bio || 'No bio provided yet.'}
                        </p>
                        
                        {/* Grow Tags - inline for list view */}
                        {farmer.grow_tags && farmer.grow_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {farmer.grow_tags.slice(0, 5).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          href={`/profile/${farmer.id}`}
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          View Profile
                        </Link>
                        {farmer.platform_messages && (
                          <button
                            onClick={() => handleContact(farmer)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <MessageCircle size={14} />
                            Message
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}