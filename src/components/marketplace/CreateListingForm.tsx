'use client'

import { useState } from 'react'
import { Calendar, Package, DollarSign, MapPin, Truck, Camera, Tag, Plus, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { db, PostType, PostVisibility, TexasTriangleCounty, Product } from '@/lib/database'
import MultiImageUpload from '@/components/common/MultiImageUpload'

interface CreateListingFormProps {
  existingListing?: any
  onSuccess?: (listing: any) => void
  onCancel?: () => void
}

const counties: { value: TexasTriangleCounty; label: string }[] = [
  // DFW Metro
  { value: 'collin', label: 'Collin County' }, { value: 'dallas', label: 'Dallas County' }, { value: 'denton', label: 'Denton County' },
  { value: 'grayson', label: 'Grayson County' }, { value: 'hunt', label: 'Hunt County' }, { value: 'jack', label: 'Jack County' },
  { value: 'kaufman', label: 'Kaufman County' }, { value: 'parker', label: 'Parker County' }, { value: 'rockwall', label: 'Rockwall County' },
  { value: 'tarrant', label: 'Tarrant County' }, { value: 'wise', label: 'Wise County' },
  // Austin Metro
  { value: 'bastrop', label: 'Bastrop County' }, { value: 'blanco', label: 'Blanco County' }, { value: 'burnet', label: 'Burnet County' },
  { value: 'caldwell', label: 'Caldwell County' }, { value: 'hays', label: 'Hays County' }, { value: 'lee', label: 'Lee County' },
  { value: 'travis', label: 'Travis County' }, { value: 'williamson', label: 'Williamson County' },
  // San Antonio Metro
  { value: 'atascosa', label: 'Atascosa County' }, { value: 'bandera', label: 'Bandera County' }, { value: 'bexar', label: 'Bexar County' },
  { value: 'comal', label: 'Comal County' }, { value: 'guadalupe', label: 'Guadalupe County' }, { value: 'kendall', label: 'Kendall County' },
  { value: 'medina', label: 'Medina County' }, { value: 'wilson', label: 'Wilson County' },
  // Houston Metro
  { value: 'austin-county', label: 'Austin County' }, { value: 'brazoria', label: 'Brazoria County' }, { value: 'chambers', label: 'Chambers County' },
  { value: 'fort-bend', label: 'Fort Bend County' }, { value: 'galveston', label: 'Galveston County' }, { value: 'harris', label: 'Harris County' },
  { value: 'liberty', label: 'Liberty County' }, { value: 'montgomery', label: 'Montgomery County' }, { value: 'waller', label: 'Waller County' },
  // Central
  { value: 'bell', label: 'Bell County (Temple)' }, { value: 'brazos', label: 'Brazos County (College Station)' },
  { value: 'burleson', label: 'Burleson County' }, { value: 'grimes', label: 'Grimes County' }, { value: 'mclennan', label: 'McLennan County (Waco)' },
]

const produceCategories = [
  'Vegetables', 'Fruits', 'Herbs', 'Flowers', 'Seeds & Plants', 'Dairy & Eggs', 'Meat & Poultry', 'Honey & Preserves', 'Other'
]

const equipmentCategories = [
  'Tractors', 'Tools', 'Irrigation', 'Planting Equipment', 'Harvesting Equipment', 'Storage', 'Greenhouse Supplies', 'Other'
]

export default function CreateListingForm({ existingListing, onSuccess, onCancel }: CreateListingFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEditMode = !!existingListing

  const [formData, setFormData] = useState({
    title: existingListing?.title || '',
    description: existingListing?.description || '',
    post_type: (existingListing?.post_type || 'produce') as PostType,
    visibility: (existingListing?.visibility || 'public') as PostVisibility,
    county: (existingListing?.county || 'dallas') as TexasTriangleCounty,
    city: existingListing?.city || '',
    price: existingListing?.price?.toString() || '',
    unit: existingListing?.unit || '',
    quantity_available: existingListing?.quantity_available?.toString() || '',
    available_from: existingListing?.available_from || '',
    available_until: existingListing?.available_until || '',
    category: existingListing?.category || '',
    tags: existingListing?.tags?.join(', ') || '',
    pickup_available: existingListing?.pickup_available ?? true,
    delivery_available: existingListing?.delivery_available ?? false,
    delivery_radius_miles: existingListing?.delivery_radius_miles?.toString() || '',
    condition: existingListing?.condition || '',
    brand: existingListing?.brand || '',
    model: existingListing?.model || '',
    year: existingListing?.year?.toString() || ''
  })

  const [isMultiProduct, setIsMultiProduct] = useState(
    existingListing?.products && existingListing.products.length > 0
  )
  const [products, setProducts] = useState<Product[]>(
    existingListing?.products || [{ name: '', price: undefined, unit: '', quantity_available: undefined }]
  )
  const [images, setImages] = useState<string[]>(existingListing?.images || [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const addProduct = () => {
    setProducts([...products, { name: '', price: undefined, unit: '', quantity_available: undefined }])
  }

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index))
    }
  }

  const updateProduct = (index: number, field: keyof Product, value: any) => {
    const updatedProducts = [...products]
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: field === 'price' || field === 'quantity_available'
        ? (value === '' ? undefined : parseFloat(value))
        : value
    }
    setProducts(updatedProducts)
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
        price: !isMultiProduct && formData.price ? parseFloat(formData.price) : undefined,
        unit: !isMultiProduct ? (formData.unit || undefined) : undefined,
        quantity_available: !isMultiProduct && formData.quantity_available ? parseInt(formData.quantity_available) : undefined,
        products: isMultiProduct ? products.filter(p => p.name.trim() !== '') : undefined,
        images: images.length > 0 ? images : undefined,
        thumbnail_url: images.length > 0 ? images[0] : undefined,
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

      let listing
      if (isEditMode) {
        // Update existing listing
        const { data, error: updateError } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', existingListing.id)
          .select()
          .single()

        if (updateError) throw updateError
        listing = data
      } else {
        // Create new listing
        listing = await db.posts.create(postData)
      }

      onSuccess?.(listing)

      // Reset form (only for create mode)
      if (!isEditMode) {
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
      }

    } catch (err: any) {
      console.error(isEditMode ? 'Error updating listing:' : 'Error creating listing:', err)
      setError(err.message || (isEditMode ? 'Failed to update listing' : 'Failed to create listing'))
    } finally {
      setLoading(false)
    }
  }

  const isEquipment = formData.post_type === 'equipment'
  const categories = isEquipment ? equipmentCategories : produceCategories

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Listing' : 'Create New Listing'}</h2>
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

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Listing Images (up to 5)
          </label>
          <MultiImageUpload
            currentImages={images}
            onImagesUpdated={setImages}
            bucket="listing-images"
            maxImages={5}
            maxSizeMB={5}
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload photos of your products, farm, or growing areas. The first image will be the main photo.
          </p>
        </div>

        {/* Multi-Product Toggle */}
        {formData.post_type === 'produce' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isMultiProduct}
                onChange={(e) => {
                  setIsMultiProduct(e.target.checked)
                  if (e.target.checked && products.length === 0) {
                    setProducts([{ name: '', price: undefined, unit: '', quantity_available: undefined }])
                  }
                }}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-3"
              />
              <div>
                <span className="font-medium text-gray-900">Multiple Products</span>
                <p className="text-sm text-gray-600 mt-1">
                  List multiple items in one listing (e.g., tomatoes, kale, and flowers)
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Multi-Product List */}
        {isMultiProduct ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Products</h3>
              <button
                type="button"
                onClick={addProduct}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={16} />
                Add Product
              </button>
            </div>

            {products.map((product, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Product {index + 1}</h4>
                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required={isMultiProduct}
                      value={product.name}
                      onChange={(e) => updateProduct(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Tomatoes, Kale, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={product.price ?? ''}
                      onChange={(e) => updateProduct(index, 'price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={product.unit ?? ''}
                      onChange={(e) => updateProduct(index, 'unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="lb, bunch"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity Available
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={product.quantity_available ?? ''}
                      onChange={(e) => updateProduct(index, 'quantity_available', e.target.value)}
                      className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Single Product - Price and Quantity */
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
        )}

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
            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Listing' : 'Create Listing')}
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