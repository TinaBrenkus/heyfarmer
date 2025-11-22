'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus } from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import { supabase } from '@/lib/supabase'

export default function NewResourcePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userId, setUserId] = useState<string>('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: 'podcasts',
    icon: '🎙️',
    isFeatured: false,
    displayOrder: 0
  })

  const categories = [
    { value: 'podcasts', label: 'Podcasts & Media', defaultIcon: '🎙️' },
    { value: 'government', label: 'Government Resources', defaultIcon: '🏛️' },
    { value: 'tools', label: 'Tools & Calculators', defaultIcon: '🛠️' },
    { value: 'education', label: 'Education & Learning', defaultIcon: '📖' },
    { value: 'organizations', label: 'Organizations', defaultIcon: '🤝' }
  ]

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type, is_verified')
      .eq('id', user.id)
      .single()

    const isUserAdmin = profile?.user_type === 'production_farmer' && profile?.is_verified === true

    if (!isUserAdmin) {
      router.push('/network')
      return
    }

    setIsAdmin(true)
    setUserId(user.id)
    setLoading(false)
  }

  const handleCategoryChange = (category: string) => {
    const selectedCategory = categories.find(c => c.value === category)
    setFormData({
      ...formData,
      category,
      icon: selectedCategory?.defaultIcon || '📚'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const resourceData = {
        title: formData.title,
        description: formData.description,
        url: formData.url,
        category: formData.category,
        icon: formData.icon,
        is_featured: formData.isFeatured,
        display_order: formData.displayOrder,
        is_active: true,
        added_by: userId,
        verified: true // Admin-added resources are auto-verified
      }

      const { data, error } = await supabase
        .from('resources')
        .insert([resourceData])
        .select()
        .single()

      if (error) throw error

      alert('Resource added successfully!')
      router.push('/network#resources')
    } catch (error: any) {
      console.error('Error saving resource:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/network#resources')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Resources
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Resource</h1>
          <p className="text-gray-600 mt-2">Share helpful tools and links with the farming community</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resource Title */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Johnny's Seed Calculator"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description (50-100 characters)"
              rows={2}
              maxLength={150}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.length}/150 characters
            </p>
          </div>

          {/* URL */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource URL *
            </label>
            <input
              type="url"
              required
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Category & Icon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon (Emoji)
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🎙️"
                maxLength={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-2xl"
              />
            </div>
          </div>

          {/* Display Order */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Order (optional)
            </label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              min="0"
              placeholder="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first within their category (0 = default order)
            </p>
          </div>

          {/* Featured Option */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <div>
                <span className="font-medium text-gray-900">Featured Resource</span>
                <p className="text-sm text-gray-600">Highlight this resource in the library</p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.push('/network#resources')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2 justify-center"
            >
              <Plus size={20} />
              {saving ? 'Adding...' : 'Add Resource'}
            </button>
          </div>
        </form>

        {/* Example Resources */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Example Resources to Add:</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>🎙️ <strong>Podcasts:</strong> Soil Sisters, No-Till Market Garden, Farm Small Farm Smart</p>
            <p>🏛️ <strong>Government:</strong> USDA Programs, Texas Dept of Agriculture, NRCS Texas</p>
            <p>🛠️ <strong>Tools:</strong> Johnny's Seed Calculator, NOAA Weather, Square Foot Garden Planner</p>
            <p>📖 <strong>Education:</strong> Texas A&M AgriLife Extension, ATTRA, Rodale Institute</p>
          </div>
        </div>
      </main>
    </div>
  )
}
