'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search, Filter, Grid, List, ChevronDown, MapPin, Users
} from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import DirectoryFarmCard from '@/components/directory/DirectoryFarmCard'
import { db, DirectoryFarm, DirectoryFarmType, TexasTriangleCounty } from '@/lib/database'
import { ALL_COUNTY_IDS, COUNTY_DATA } from '@/lib/countyUtils'
import { getFarmTypeOptions } from '@/lib/directoryUtils'

export default function DirectoryPage() {
  const [farms, setFarms] = useState<DirectoryFarm[]>([])
  const [filteredFarms, setFilteredFarms] = useState<DirectoryFarm[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCounty, setSelectedCounty] = useState('')
  const [selectedFarmType, setSelectedFarmType] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchFarms()
  }, [])

  useEffect(() => {
    filterFarms()
  }, [farms, searchQuery, selectedCounty, selectedFarmType])

  const fetchFarms = async () => {
    try {
      const data = await db.directoryFarms.listPublished()
      setFarms(data)
    } catch (error) {
      console.error('Error fetching directory farms:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterFarms = () => {
    let filtered = farms

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(farm =>
        farm.name.toLowerCase().includes(q) ||
        farm.city?.toLowerCase().includes(q) ||
        farm.tagline?.toLowerCase().includes(q) ||
        farm.description?.toLowerCase().includes(q) ||
        farm.products.some(p => p.toLowerCase().includes(q))
      )
    }

    if (selectedCounty) {
      filtered = filtered.filter(farm => farm.county === selectedCounty)
    }

    if (selectedFarmType) {
      filtered = filtered.filter(farm => farm.farm_type === selectedFarmType)
    }

    setFilteredFarms(filtered)
  }

  // Count unique counties
  const uniqueCounties = new Set(farms.map(f => f.county))

  if (loading) {
    return (
      <div className="min-h-screen bg-soil-50">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-farm-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-soil-500">Loading farm directory...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-soil-50 pb-20 md:pb-0">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-soil-800 mb-2">Texas Farm Directory</h1>
          <p className="text-soil-500">
            Discover local farms and growers across the Texas Triangle
          </p>
        </div>

        {/* Stats Banner */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center gap-6">
          <div className="flex items-center gap-2 text-farm-green-800">
            <Users size={20} />
            <span className="font-semibold">{farms.length} farms</span>
          </div>
          <div className="flex items-center gap-2 text-soil-500">
            <MapPin size={20} />
            <span>across <span className="font-semibold">{uniqueCounties.size} counties</span></span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-warm-border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-soil-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search farms, products, locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-warm-border rounded-lg hover:bg-soil-50 transition-colors"
            >
              <Filter size={16} />
              Filters
              <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* View Toggle */}
            <div className="flex rounded-lg border border-warm-border overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid' ? 'bg-farm-green-500 text-white' : 'bg-white text-soil-500 hover:bg-soil-50'}`}
                title="Grid view"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${viewMode === 'list' ? 'bg-farm-green-500 text-white' : 'bg-white text-soil-500 hover:bg-soil-50'}`}
                title="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-warm-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-soil-700 mb-2">County</label>
                  <select
                    value={selectedCounty}
                    onChange={(e) => setSelectedCounty(e.target.value)}
                    className="w-full p-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                  >
                    <option value="">All Counties</option>
                    {ALL_COUNTY_IDS.map(id => (
                      <option key={id} value={id}>{COUNTY_DATA[id].displayName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-soil-700 mb-2">Farm Type</label>
                  <select
                    value={selectedFarmType}
                    onChange={(e) => setSelectedFarmType(e.target.value)}
                    className="w-full p-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {getFarmTypeOptions().map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => {
                    setSelectedCounty('')
                    setSelectedFarmType('')
                    setSearchQuery('')
                  }}
                  className="px-4 py-2 border border-warm-border text-soil-700 rounded-lg hover:bg-soil-50 transition-colors text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-soil-500 text-sm">
            {filteredFarms.length} {filteredFarms.length === 1 ? 'farm' : 'farms'} found
          </p>
        </div>

        {/* Farm Grid/List */}
        {filteredFarms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-soil-800 mb-2">No farms found</h3>
            <p className="text-soil-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-4'
          }>
            {filteredFarms.map(farm => (
              <DirectoryFarmCard
                key={farm.id}
                farm={farm}
                variant={viewMode}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
