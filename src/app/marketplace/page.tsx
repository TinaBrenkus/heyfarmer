'use client'

export const dynamic = 'force-dynamic'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Search, 
  Filter, 
  X
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { db, Post, PostType, NorthTexasCounty } from '@/lib/database'
import Navigation from '@/components/navigation/Navigation'
import Footer from '@/components/layout/Footer'
import ListingsGrid from '@/components/marketplace/ListingsGrid'

interface FilterOptions {
  postType?: PostType | 'all'
  county?: NorthTexasCounty | 'all'
  priceRange?: 'all' | 'under-25' | '25-100' | 'over-100'
  availability?: 'all' | 'pickup' | 'delivery'
}

export default function MarketplacePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<Post[]>([])
  const [filteredListings, setFilteredListings] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({})
  const [popularSearches] = useState(['Fresh Eggs', 'Tomatoes', 'Herbs', 'Seasonal Produce', 'Equipment'])
  const [quickFilters] = useState([
    { id: 'eggs', label: '🥚 Eggs', searchTerm: 'eggs' },
    { id: 'tomatoes', label: '🍅 Tomatoes', searchTerm: 'tomatoes' },
    { id: 'equipment', label: '🔧 Equipment', searchTerm: 'equipment' },
    { id: 'herbs', label: '🌿 Herbs', searchTerm: 'herbs' },
    { id: 'seasonal', label: '🍂 Seasonal', searchTerm: 'seasonal' },
    { id: 'organic', label: '✨ Organic', searchTerm: 'organic' }
  ])
  const [showMessage, setShowMessage] = useState(false)
  
  // Check for farmers-only message
  useEffect(() => {
    if (searchParams.get('message') === 'farmers-only') {
      setShowMessage(true)
      // Clear the URL parameter
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
      // Auto-hide message after 5 seconds
      setTimeout(() => setShowMessage(false), 5000)
    }
  }, [searchParams])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle() // Use maybeSingle to avoid 406 errors
        
        setProfile(profileData)
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }
  }

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true)
      
      // Get public posts
      const publicData = await db.posts.listPublic()
      let allData = publicData || []
      
      // If user is a farmer, also get farmers-only posts
      if (user && profile && ['backyard_grower', 'market_gardener', 'production_farmer'].includes(profile.user_type)) {
        const farmersData = await db.posts.listFarmersOnly()
        allData = [...allData, ...(farmersData || [])]
      }
      
      setListings(allData)
      setFilteredListings(allData)
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }, [user, profile])

  useEffect(() => {
    checkUser()
  }, [])
  
  useEffect(() => {
    fetchListings()
  }, [user, profile, fetchListings])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    applyFiltersAndSearch({ ...activeFilters }, query)
  }

  const applyFiltersAndSearch = (filters: FilterOptions, searchTerm?: string) => {
    const query = searchTerm !== undefined ? searchTerm : searchQuery
    let filtered = [...listings]

    // Apply search query
    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(' ')
      filtered = filtered.filter(listing => {
        const searchableText = [
          listing.title,
          listing.description,
          listing.profiles?.full_name,
          listing.profiles?.farm_name,
          listing.category,
          ...(listing.tags || [])
        ].join(' ').toLowerCase()

        return searchTerms.some(term => searchableText.includes(term))
      })
    }

    // Apply filters
    if (filters.postType && filters.postType !== 'all') {
      filtered = filtered.filter(listing => listing.post_type === filters.postType)
    }

    if (filters.county && filters.county !== 'all') {
      filtered = filtered.filter(listing => listing.county === filters.county)
    }

    if (filters.priceRange && filters.priceRange !== 'all') {
      filtered = filtered.filter(listing => {
        if (!listing.price) return filters.priceRange === 'under-25'
        
        switch (filters.priceRange) {
          case 'under-25':
            return listing.price < 25
          case '25-100':
            return listing.price >= 25 && listing.price <= 100
          case 'over-100':
            return listing.price > 100
          default:
            return true
        }
      })
    }

    if (filters.availability && filters.availability !== 'all') {
      filtered = filtered.filter(listing => {
        switch (filters.availability) {
          case 'pickup':
            return listing.pickup_available
          case 'delivery':
            return listing.delivery_available
          default:
            return true
        }
      })
    }

    setFilteredListings(filtered)
  }

  const handleQuickFilter = (searchTerm: string) => {
    setSearchQuery(searchTerm)
    setShowSuggestions(false)
    applyFiltersAndSearch(activeFilters, searchTerm)
  }

  const handleAdvancedFilter = (filters: FilterOptions) => {
    setActiveFilters(filters)
    setShowAdvancedFilters(false)
    applyFiltersAndSearch(filters)
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setActiveFilters({})
    setFilteredListings(listings)
  }

  const getSuggestions = () => {
    if (!searchQuery.trim()) return popularSearches
    
    const query = searchQuery.toLowerCase()
    const suggestions = new Set<string>()
    
    // Add matching popular searches
    popularSearches.forEach(search => {
      if (search.toLowerCase().includes(query)) {
        suggestions.add(search)
      }
    })
    
    // Add matching items from listings
    listings.forEach(listing => {
      [listing.title, listing.category, ...(listing.tags || [])].forEach(item => {
        if (item && item.toLowerCase().includes(query) && suggestions.size < 8) {
          suggestions.add(item)
        }
      })
    })
    
    return Array.from(suggestions).slice(0, 6)
  }

  const handleContact = async (listing: Post) => {
    if (!user) {
      router.push('/login?redirect=/marketplace')
      return
    }

    if (!listing.profiles?.id) {
      console.error('No farmer profile found for this listing')
      return
    }

    try {
      // Create or get conversation with the farmer
      const { data: conversationId, error } = await supabase.rpc('get_or_create_conversation', {
        p_user1_id: user.id,
        p_user2_id: listing.profiles.id
      })

      if (error) throw error

      // Send initial message about the listing
      const initialMessage = `Hi! I'm interested in your listing: "${listing.title}". Could you tell me more about it?`
      
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: initialMessage
      })

      // Navigate to the conversation
      router.push('/messages')
    } catch (error) {
      console.error('Error starting conversation:', error)
      // Fallback to just opening messages
      router.push('/messages')
    }
  }

  const handleSave = async (listing: Post) => {
    if (!user) {
      router.push('/login?redirect=/marketplace')
      return
    }

    try {
      await db.savedPosts.save(listing.id)
      // You could show a toast notification here
    } catch (error) {
      console.error('Error saving listing:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Farmers Only Message */}
        {showMessage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">ℹ️</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800">Posting is for farmers only</h3>
              <p className="text-sm text-blue-700 mt-1">
                Only registered farmers can create posts. Browse the marketplace below to discover fresh, local products!
              </p>
            </div>
            <button
              onClick={() => setShowMessage(false)}
              className="flex-shrink-0 p-1 hover:bg-blue-100 rounded transition-colors"
            >
              <X className="h-4 w-4 text-blue-600" />
            </button>
          </div>
        )}

        {/* Smart Search Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Smart Search Bar */}
            <div className="flex-1 relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search: fresh eggs, tomatoes, herbs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        handleSearch('')
                      }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleSearch(searchQuery)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Search
                </button>
              </div>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {searchQuery.trim() === '' && (
                    <div className="p-3 border-b border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Searches</h4>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((search) => (
                          <button
                            key={search}
                            onClick={() => handleQuickFilter(search)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {getSuggestions().map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickFilter(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <Search className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Advanced Filters Button */}
            <button
              onClick={() => setShowAdvancedFilters(true)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">Filters</span>
              {Object.keys(activeFilters).length > 0 && (
                <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {Object.keys(activeFilters).length}
                </span>
              )}
            </button>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-600">Quick filters:</span>
            {quickFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleQuickFilter(filter.searchTerm)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-green-100 hover:text-green-700 transition-colors"
              >
                {filter.label}
              </button>
            ))}
            
            {(searchQuery || Object.keys(activeFilters).length > 0) && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Available This Week in Wise County
          </h2>
          <p className="text-gray-600">{listings.length} listings found • Showing fresh, local options</p>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse-gentle text-gray-500">
              Loading listings...
            </div>
          </div>
        ) : (
          <ListingsGrid 
            listings={filteredListings}
            onContact={handleContact}
            onSave={handleSave}
          />
        )}
      </main>

      {/* Advanced Filters Modal */}
      {showAdvancedFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-t-xl md:rounded-xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Advanced Filters</h3>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="p-6 space-y-6">
              {/* Post Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'all', label: 'All Types' },
                    { value: 'fresh_produce', label: 'Fresh Produce' },
                    { value: 'equipment', label: 'Equipment' },
                    { value: 'plants_seeds', label: 'Plants & Seeds' },
                    { value: 'livestock', label: 'Livestock' },
                    { value: 'other', label: 'Other' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setActiveFilters({ ...activeFilters, postType: type.value as any })}
                      className={`p-3 border rounded-lg text-sm transition-colors ${
                        activeFilters.postType === type.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">County</label>
                <select
                  value={activeFilters.county || 'all'}
                  onChange={(e) => setActiveFilters({ ...activeFilters, county: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Counties</option>
                  <option value="wise">Wise County</option>
                  <option value="dallas">Dallas County</option>
                  <option value="denton">Denton County</option>
                  <option value="tarrant">Tarrant County</option>
                  <option value="collin">Collin County</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Price Range</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'all', label: 'Any Price' },
                    { value: 'under-25', label: 'Under $25' },
                    { value: '25-100', label: '$25 - $100' },
                    { value: 'over-100', label: 'Over $100' }
                  ].map((range) => (
                    <button
                      key={range.value}
                      onClick={() => setActiveFilters({ ...activeFilters, priceRange: range.value as any })}
                      className={`p-3 border rounded-lg text-sm transition-colors ${
                        activeFilters.priceRange === range.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Availability</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'all', label: 'Any Method' },
                    { value: 'pickup', label: 'Pickup Available' },
                    { value: 'delivery', label: 'Delivery Available' }
                  ].map((availability) => (
                    <button
                      key={availability.value}
                      onClick={() => setActiveFilters({ ...activeFilters, availability: availability.value as any })}
                      className={`p-3 border rounded-lg text-sm transition-colors ${
                        activeFilters.availability === availability.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {availability.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setActiveFilters({})
                  setSearchQuery('')
                  setFilteredListings(listings)
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => handleAdvancedFilter(activeFilters)}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}