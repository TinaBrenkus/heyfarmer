'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, Search, Filter, Edit2, Trash2, Eye, X, Save,
  ChevronDown, ArrowLeft, ExternalLink, CheckCircle, XCircle, Clock
} from 'lucide-react'
import FarmLogo from '@/components/icons/FarmLogo'
import ImageUpload from '@/components/common/ImageUpload'
import MultiImageUpload from '@/components/common/MultiImageUpload'
import { supabase } from '@/lib/supabase'
import { db, DirectoryFarm, DirectoryFarmStatus, DirectoryFarmType, TexasTriangleCounty } from '@/lib/database'
import { ALL_COUNTY_IDS, COUNTY_DATA } from '@/lib/countyUtils'
import { generateSlug, getFarmTypeOptions, getDataSourceOptions, getStatusInfo } from '@/lib/directoryUtils'

type ViewMode = 'list' | 'form' | 'claims'

interface ClaimRequestRow {
  id: string
  directory_farm_id: string
  user_id: string
  status: string
  message?: string
  admin_notes?: string
  created_at: string
  directory_farms: { id: string; name: string; slug: string; county: string }
  profiles: { id: string; full_name: string; email: string; farm_name?: string }
}

export default function AdminDirectoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('list')
  const [farms, setFarms] = useState<DirectoryFarm[]>([])
  const [claimRequests, setClaimRequests] = useState<ClaimRequestRow[]>([])
  const [editingFarm, setEditingFarm] = useState<DirectoryFarm | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [countyFilter, setCountyFilter] = useState<string>('all')

  // Form state
  const [formData, setFormData] = useState<Partial<DirectoryFarm>>({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    county: 'wise' as TexasTriangleCounty,
    city: '',
    zip_code: '',
    address: '',
    products: [],
    farm_type: 'other' as DirectoryFarmType,
    specialties: [],
    website_url: '',
    facebook_url: '',
    instagram_url: '',
    phone: '',
    email: '',
    cover_image_url: '',
    additional_images: [],
    data_source: '',
    source_url: '',
    admin_notes: '',
    meta_title: '',
    meta_description: '',
    status: 'draft' as DirectoryFarmStatus,
  })

  // Tag inputs
  const [productInput, setProductInput] = useState('')
  const [specialtyInput, setSpecialtyInput] = useState('')

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const isAdmin = user.email?.includes('admin') || user.email === 'admin@heyfarmer.farm'
    if (!isAdmin) {
      router.push('/dashboard')
      return
    }

    await fetchData()
    setLoading(false)
  }

  const fetchData = async () => {
    try {
      const farmsData = await db.directoryFarms.list()
      setFarms(farmsData)

      const claimsData = await db.directoryFarms.listClaimRequests()
      setClaimRequests(claimsData as unknown as ClaimRequestRow[])
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // Filter farms
  const filteredFarms = farms.filter(farm => {
    if (statusFilter !== 'all' && farm.status !== statusFilter) return false
    if (countyFilter !== 'all' && farm.county !== countyFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        farm.name.toLowerCase().includes(q) ||
        farm.city?.toLowerCase().includes(q) ||
        farm.products.some(p => p.toLowerCase().includes(q))
      )
    }
    return true
  })

  // Stats
  const totalFarms = farms.length
  const publishedCount = farms.filter(f => f.status === 'published').length
  const claimedCount = farms.filter(f => f.status === 'claimed').length
  const pendingClaims = claimRequests.filter(c => c.status === 'pending').length

  // Form handlers
  const handleNewFarm = () => {
    setEditingFarm(null)
    setFormData({
      name: '',
      slug: '',
      tagline: '',
      description: '',
      county: 'wise' as TexasTriangleCounty,
      city: '',
      zip_code: '',
      address: '',
      products: [],
      farm_type: 'other' as DirectoryFarmType,
      specialties: [],
      website_url: '',
      facebook_url: '',
      instagram_url: '',
      phone: '',
      email: '',
      cover_image_url: '',
      additional_images: [],
      data_source: '',
      source_url: '',
      admin_notes: '',
      meta_title: '',
      meta_description: '',
      status: 'draft' as DirectoryFarmStatus,
    })
    setProductInput('')
    setSpecialtyInput('')
    setView('form')
  }

  const handleEditFarm = (farm: DirectoryFarm) => {
    setEditingFarm(farm)
    setFormData({ ...farm })
    setProductInput('')
    setSpecialtyInput('')
    setView('form')
  }

  const handleDeleteFarm = async (id: string) => {
    if (!confirm('Are you sure you want to delete this farm?')) return

    try {
      await db.directoryFarms.delete(id)
      setFarms(farms.filter(f => f.id !== id))
      showSuccess('Farm deleted')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev?.slug || generateSlug(name),
      meta_title: prev?.meta_title || `${name} - Hey Farmer Directory`,
    }))
  }

  const addProduct = () => {
    const val = productInput.trim()
    if (val && !formData.products?.includes(val)) {
      setFormData(prev => ({ ...prev, products: [...(prev.products || []), val] }))
      setProductInput('')
    }
  }

  const removeProduct = (product: string) => {
    setFormData(prev => ({ ...prev, products: (prev.products || []).filter(p => p !== product) }))
  }

  const addSpecialty = () => {
    const val = specialtyInput.trim()
    if (val && !formData.specialties?.includes(val)) {
      setFormData(prev => ({ ...prev, specialties: [...(prev.specialties || []), val] }))
      setSpecialtyInput('')
    }
  }

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({ ...prev, specialties: (prev.specialties || []).filter(s => s !== specialty) }))
  }

  const handleSave = async () => {
    setError(null)
    setSaving(true)

    try {
      if (!formData.name?.trim()) throw new Error('Farm name is required')
      if (!formData.slug?.trim()) throw new Error('Slug is required')
      if (!formData.county) throw new Error('County is required')

      // Auto-fill meta_description from description if empty
      const saveData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name!),
        meta_description: formData.meta_description || formData.description?.substring(0, 160),
      }

      if (editingFarm) {
        await db.directoryFarms.update(editingFarm.id, saveData)
        showSuccess('Farm updated successfully')
      } else {
        await db.directoryFarms.create(saveData as any)
        showSuccess('Farm created successfully')
      }

      await fetchData()
      setView('list')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleApproveClaim = async (request: ClaimRequestRow) => {
    try {
      await db.directoryFarms.approveClaim(request.id, request.directory_farm_id, request.user_id)
      showSuccess(`Claim approved for ${request.directory_farms.name}`)
      await fetchData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleRejectClaim = async (request: ClaimRequestRow) => {
    const notes = prompt('Reason for rejection (optional):')
    try {
      await db.directoryFarms.rejectClaim(request.id, notes || undefined)
      showSuccess('Claim rejected')
      await fetchData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading directory admin...</p>
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
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#2E7D32' }}>
                <FarmLogo size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Farm Directory Admin</h1>
                <p className="text-xs text-gray-500">Manage directory listings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors text-sm"
              >
                Waitlist Admin
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors text-sm"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
            <CheckCircle size={16} />
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <XCircle size={16} />
            {error}
            <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-500">Total Farms</p>
            <p className="text-2xl font-bold text-gray-900">{totalFarms}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-500">Published</p>
            <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-500">Claimed</p>
            <p className="text-2xl font-bold text-blue-600">{claimedCount}</p>
          </div>
          <button
            onClick={() => setView('claims')}
            className="bg-white rounded-lg shadow-sm p-4 text-left hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-gray-500">Pending Claims</p>
            <p className="text-2xl font-bold text-orange-600">{pendingClaims}</p>
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              view === 'list' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Farm List
          </button>
          <button
            onClick={() => setView('claims')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              view === 'claims' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Claim Requests {pendingClaims > 0 && `(${pendingClaims})`}
          </button>
        </div>

        {/* ============== LIST VIEW ============== */}
        {view === 'list' && (
          <>
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search farms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="claimed">Claimed</option>
                  <option value="removed">Removed</option>
                </select>

                <select
                  value={countyFilter}
                  onChange={(e) => setCountyFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Counties</option>
                  {ALL_COUNTY_IDS.map(id => (
                    <option key={id} value={id}>{COUNTY_DATA[id].displayName}</option>
                  ))}
                </select>

                <button
                  onClick={handleNewFarm}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
                >
                  <Plus size={16} />
                  Add New Farm
                </button>
              </div>
            </div>

            {/* Farm Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">County</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredFarms.map((farm) => {
                      const statusInfo = getStatusInfo(farm.status)
                      return (
                        <tr key={farm.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{farm.name}</p>
                              {farm.city && (
                                <p className="text-sm text-gray-500">{farm.city}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {COUNTY_DATA[farm.county]?.displayName || farm.county}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                            {farm.farm_type.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {farm.products.slice(0, 3).map((p, i) => (
                                <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                  {p}
                                </span>
                              ))}
                              {farm.products.length > 3 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                  +{farm.products.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {farm.view_count}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {farm.status === 'published' && (
                                <Link
                                  href={`/farm/${farm.slug}`}
                                  target="_blank"
                                  className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Preview"
                                >
                                  <Eye size={16} />
                                </Link>
                              )}
                              <button
                                onClick={() => handleEditFarm(farm)}
                                className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteFarm(farm.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {filteredFarms.length === 0 && (
                <div className="text-center py-12">
                  <FarmLogo size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No farms found</p>
                  <button
                    onClick={handleNewFarm}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700"
                  >
                    Add Your First Farm
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ============== FORM VIEW ============== */}
        {view === 'form' && (
          <div className="max-w-4xl">
            <button
              onClick={() => setView('list')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
            >
              <ArrowLeft size={16} />
              Back to List
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingFarm ? `Edit: ${editingFarm.name}` : 'Add New Farm'}
            </h2>

            <div className="space-y-8">
              {/* Section 1: Farm Identity */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Identity</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Smith Family Farm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL Slug *
                      <span className="font-normal text-gray-400 ml-2">heyfarmer.farm/farm/{formData.slug || '...'}</span>
                    </label>
                    <input
                      type="text"
                      value={formData.slug || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                    <input
                      type="text"
                      value={formData.tagline || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Fresh produce from our family to yours"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: The Story */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">The Story</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Write a mini feature story about this farm. What makes them special? Their history? What they grow and why?
                </p>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
                  placeholder="Tell the farm's story here..."
                />
              </div>

              {/* Section 3: Location */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">County *</label>
                    <select
                      value={formData.county || 'wise'}
                      onChange={(e) => setFormData(prev => ({ ...prev, county: e.target.value as TexasTriangleCounty }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {ALL_COUNTY_IDS.map(id => (
                        <option key={id} value={id}>{COUNTY_DATA[id].displayName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Decatur"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={formData.zip_code || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="76234"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="123 Farm Road"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: What They Offer */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What They Offer</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Farm Type</label>
                    <select
                      value={formData.farm_type || 'other'}
                      onChange={(e) => setFormData(prev => ({ ...prev, farm_type: e.target.value as DirectoryFarmType }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {getFarmTypeOptions().map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Products</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={productInput}
                        onChange={(e) => setProductInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addProduct() } }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Type a product and press Enter"
                      />
                      <button
                        type="button"
                        onClick={addProduct}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.products?.map((product, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                        >
                          {product}
                          <button type="button" onClick={() => removeProduct(product)} className="hover:text-red-600">
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={specialtyInput}
                        onChange={(e) => setSpecialtyInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSpecialty() } }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., Organic, Heirloom varieties, U-Pick"
                      />
                      <button
                        type="button"
                        onClick={addSpecialty}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.specialties?.map((s, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                        >
                          {s}
                          <button type="button" onClick={() => removeSpecialty(s)} className="hover:text-red-600">
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Contact */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                    <input
                      type="url"
                      value={formData.website_url || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                    <input
                      type="url"
                      value={formData.facebook_url || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, facebook_url: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                    <input
                      type="url"
                      value={formData.instagram_url || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="(940) 555-1234"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="farm@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Section 6: Media */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Media</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                    <ImageUpload
                      currentImage={formData.cover_image_url}
                      onImageUploaded={(url) => setFormData(prev => ({ ...prev, cover_image_url: url }))}
                      bucket="directory-farm-images"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images</label>
                    <MultiImageUpload
                      currentImages={formData.additional_images || []}
                      onImagesUpdated={(urls) => setFormData(prev => ({ ...prev, additional_images: urls }))}
                      bucket="directory-farm-images"
                      maxImages={8}
                    />
                  </div>
                </div>
              </div>

              {/* Section 7: Data Source */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Source</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <select
                      value={formData.data_source || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_source: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select a source...</option>
                      {getDataSourceOptions().map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source URL</label>
                    <input
                      type="url"
                      value={formData.source_url || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, source_url: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                    <textarea
                      value={formData.admin_notes || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
                      placeholder="Internal notes about this listing..."
                    />
                  </div>
                </div>
              </div>

              {/* Section 8: SEO */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={formData.meta_title || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Auto-filled from name"
                    />
                    <p className="text-xs text-gray-400 mt-1">{(formData.meta_title || '').length}/60 characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                    <textarea
                      value={formData.meta_description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
                      placeholder="Auto-filled from description"
                    />
                    <p className="text-xs text-gray-400 mt-1">{(formData.meta_description || '').length}/160 characters</p>
                  </div>
                </div>
              </div>

              {/* Section 9: Status */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                <div className="flex gap-3">
                  {(['draft', 'published', 'removed'] as DirectoryFarmStatus[]).map(status => {
                    const info = getStatusInfo(status)
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, status }))}
                        className={`px-4 py-2 rounded-lg font-medium text-sm border-2 transition-colors ${
                          formData.status === status
                            ? `${info.bgColor} ${info.color} border-current`
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {info.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {editingFarm ? 'Update Farm' : 'Create Farm'}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setView('list')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============== CLAIMS VIEW ============== */}
        {view === 'claims' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Claim Requests ({claimRequests.length})
              </h3>
            </div>

            {claimRequests.length === 0 ? (
              <div className="text-center py-12">
                <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No claim requests yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {claimRequests.map((request) => (
                  <div key={request.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.profiles?.full_name || 'Unknown User'}
                          <span className="text-gray-500 font-normal ml-2">
                            ({request.profiles?.email})
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Wants to claim: <span className="font-medium">{request.directory_farms?.name}</span>
                          <span className="text-gray-400 ml-2">({request.directory_farms?.county})</span>
                        </p>
                        {request.message && (
                          <p className="text-sm text-gray-500 mt-2 italic">"{request.message}"</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Submitted {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {request.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApproveClaim(request)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                            >
                              <CheckCircle size={14} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectClaim(request)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            request.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {request.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
