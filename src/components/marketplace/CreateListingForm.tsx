'use client'

import { useState } from 'react'
import { Calendar, Package, DollarSign, MapPin, Truck, Camera, Tag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { db, PostType, PostVisibility, NorthTexasCounty } from '@/lib/database'

interface CreateListingFormProps {
  onSuccess?: (listing: any) => void
  onCancel?: () => void
}

const counties: { value: NorthTexasCounty; label: string }[] = [
  { value: 'collin', label: 'Collin County' },
  { value: 'dallas', label: 'Dallas County' },
  { value: 'denton', label: 'Denton County' },
  { value: 'tarrant', label: 'Tarrant County' },
  { value: 'wise', label: 'Wise County' },
  { value: 'parker', label: 'Parker County' },
  { value: 'jack', label: 'Jack County' },
  { value: 'grayson', label: 'Grayson County' },
  { value: 'hunt', label: 'Hunt County' },
  { value: 'kaufman', label: 'Kaufman County' },
  { value: 'rockwall', label: 'Rockwall County' }
]

const produceCategories = [
  'Vegetables', 'Fruits', 'Herbs', 'Flowers', 'Seeds & Plants', 'Dairy & Eggs', 'Meat & Poultry', 'Honey & Preserves', 'Other'
]

const equipmentCategories = [
  'Tractors', 'Tools', 'Irrigation', 'Planting Equipment', 'Harvesting Equipment', 'Storage', 'Greenhouse Supplies', 'Other'
]

export default function CreateListingForm({ onSuccess, onCancel }: CreateListingFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    post_type: 'produce' as PostType,
    visibility: 'public' as PostVisibility,
    county: 'dallas' as NorthTexasCounty,
    city: '',
    price: '',
    unit: '',
    quantity_available: '',
    available_from: '',
    available_until: '',
    category: '',
    tags: '',
    pickup_available: true,
    delivery_available: false,
    delivery_radius_miles: '',
    condition: '',
    brand: '',
    model: '',
    year: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Must be logged in to create listings')
      }

      // Prepare post data
      const postData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        post_type: formData.post_type,
        visibility: formData.visibility,
        status: 'active' as const,
        county: formData.county,
        city: formData.city || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        unit: formData.unit || undefined,
        quantity_available: formData.quantity_available ? parseInt(formData.quantity_available) : undefined,
        available_from: formData.available_from || undefined,
        available_until: formData.available_until || undefined,
        category: formData.category || undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
        pickup_available: formData.pickup_available,
        delivery_available: formData.delivery_available,
        delivery_radius_miles: formData.delivery_radius_miles ? parseInt(formData.delivery_radius_miles) : undefined,
        condition: formData.condition || undefined,
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        year: formData.year ? parseInt(formData.year) : undefined
      }

      const newListing = await db.posts.create(postData)
      onSuccess?.(newListing)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        post_type: 'produce',
        visibility: 'public',
        county: 'dallas',
        city: '',
        price: '',
        unit: '',
        quantity_available: '',
        available_from: '',
        available_until: '',
        category: '',
        tags: '',
        pickup_available: true,
        delivery_available: false,
        delivery_radius_miles: '',
        condition: '',
        brand: '',
        model: '',
        year: ''
      })

    } catch (err: any) {
      console.error('Error creating listing:', err)
      setError(err.message || 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  const isEquipment = formData.post_type === 'equipment'
  const categories = isEquipment ? equipmentCategories : produceCategories

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create New Listing</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Fresh organic tomatoes, John Deere tractor, etc."
            />
          </div>

          <div>
            <label htmlFor="post_type" className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              id="post_type"
              name="post_type"
              required
              value={formData.post_type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="produce">Produce</option>
              <option value="equipment">Equipment</option>
              <option value="resource">Resource</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Describe your item, growing methods, condition, etc."
          />
        </div>

        {/* Price and Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price ($)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <input
              id="unit"
              name="unit"
              type="text"
              value={formData.unit}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="lb, bunch, each, etc."
            />
          </div>

          <div>
            <label htmlFor="quantity_available" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity Available
            </label>
            <input
              id="quantity_available"
              name="quantity_available"
              type="number"
              min="0"
              value={formData.quantity_available}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="100"
            />
          </div>
        </div>

        {/* Equipment specific fields */}
        {isEquipment && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select condition</option>
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                id="brand"
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="John Deere, Kubota, etc."
              />
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                id="year"
                name="year"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.year}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="2020"
              />
            </div>
          </div>
        )}

        {/* Availability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="available_from" className="block text-sm font-medium text-gray-700 mb-1">
              Available From
            </label>
            <input
              id="available_from"
              name="available_from"
              type="date"
              value={formData.available_from}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="available_until" className="block text-sm font-medium text-gray-700 mb-1">
              Available Until
            </label>
            <input
              id="available_until"
              name="available_until"
              type="date"
              value={formData.available_until}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-1">
              County *
            </label>
            <select
              id="county"
              name="county"
              required
              value={formData.county}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {counties.map((county) => (
                <option key={county.value} value={county.value}>
                  {county.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Dallas, Plano, etc."
            />
          </div>
        </div>

        {/* Delivery Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Delivery Options</h3>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="pickup_available"
                checked={formData.pickup_available}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Pickup available</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="delivery_available"
                checked={formData.delivery_available}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Delivery available</span>
            </label>
          </div>

          {formData.delivery_available && (
            <div>
              <label htmlFor="delivery_radius_miles" className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Radius (miles)
              </label>
              <input
                id="delivery_radius_miles"
                name="delivery_radius_miles"
                type="number"
                min="1"
                value={formData.delivery_radius_miles}
                onChange={handleInputChange}
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="10"
              />
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            value={formData.tags}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="organic, heirloom, pesticide-free (comma separated)"
          />
          <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
        </div>

        {/* Visibility */}
        <div>
          <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
            Visibility
          </label>
          <select
            id="visibility"
            name="visibility"
            value={formData.visibility}
            onChange={handleInputChange}
            className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="public">Public (visible to everyone)</option>
            <option value="farmers_only">Farmers only</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: loading ? '#94a3b8' : '#2E7D32' }}
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}