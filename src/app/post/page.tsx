'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Handshake, MessageCircle, HelpCircle, Search, Plus, Camera, MapPin, DollarSign, Calendar, Users, AlertCircle } from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import FarmerBadge from '@/components/badges/FarmerBadge'
import { supabase } from '@/lib/supabase'
import { UserType, TexasTriangleCounty } from '@/lib/database'
import { ChatCircle, CheckCircle, Egg, Globe, Plant, ShoppingCart, Tractor, UsersThree, Wrench } from '@phosphor-icons/react'

interface PostType {
  id: string
  title: string
  icon: React.ElementType
  emoji: string
  description: string
  visibility: 'public' | 'farmers-only'
  color: string
  bgColor: string
}

interface Template {
  id: string
  title: string
  description: string
  category?: string
  price?: string
}

interface PostFormData {
  title: string
  category: string
  price: string
  priceUnit: string
  description: string
  photos: File[]
  availableNow: boolean
  pickupInfo: string
  visibility: 'public' | 'farmers-only'
  contactMethods: {
    platform: boolean
    phone: boolean
    email: boolean
  }
  // Equipment specific
  equipmentType?: string
  rentalPrice?: string
  rentalPeriod?: string
  // Help specific
  helpType?: string
  timeframe?: string
  compensation?: string
  // Discussion specific
  discussionCategory?: string
}

export default function CreatePostPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [selectedPostType, setSelectedPostType] = useState<string>('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    category: '',
    price: '',
    priceUnit: 'each',
    description: '',
    photos: [],
    availableNow: true,
    pickupInfo: '',
    visibility: 'public',
    contactMethods: {
      platform: true,
      phone: false,
      email: false
    }
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

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
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (!profile) {
      router.push('/dashboard')
      return
    }

    // Check if user is a farmer (can create posts)
    const farmerTypes = ['backyard_grower', 'market_gardener', 'production_farmer']
    if (!farmerTypes.includes(profile.user_type)) {
      // Redirect consumers to marketplace with a message
      router.push('/marketplace?message=farmers-only')
      return
    }

    setUserProfile(profile)
    setLoading(false)

    // Check if redirected from specific action
    const type = searchParams.get('type')
    if (type && postTypes.find(pt => pt.id === type)) {
      setSelectedPostType(type)
      setCurrentStep(2)
    }
  }

  const postTypes: PostType[] = [
    {
      id: 'for-sale',
      title: 'For Sale',
      icon: ShoppingCart,
      iconName: 'ShoppingCart',
      description: 'Sell produce, products, or goods',
      visibility: 'public',
      color: '#4A5E35',
      bgColor: '#E8E4D8'
    },
    {
      id: 'help-needed',
      title: 'Need Help',
      icon: HelpCircle,
      emoji: '🙋',
      description: 'Request assistance or advice',
      visibility: 'farmers-only',
      color: '#DC2626',
      bgColor: '#FEE2E2'
    },
    {
      id: 'equipment',
      title: 'Equipment',
      icon: Wrench,
      iconName: 'Wrench',
      description: 'Rent or lend farming tools',
      visibility: 'public',
      color: '#EA580C',
      bgColor: '#FED7AA'
    },
    {
      id: 'discussion',
      title: 'Discussion',
      icon: MessageCircle,
      iconName: 'ChatCircle',
      description: 'Start a conversation',
      visibility: 'farmers-only',
      color: '#7C3AED',
      bgColor: '#EDE9FE'
    }
  ]

  const templates: Record<string, Template[]> = {
    'for-sale': [
      { id: 'fresh-eggs', title: 'Fresh eggs available', description: 'Free-range chicken eggs from healthy hens', category: 'Poultry', price: '$4/dozen' },
      { id: 'seasonal-produce', title: 'Seasonal produce for sale', description: 'Fresh, locally grown seasonal vegetables', category: 'Produce' },
      { id: 'honey-products', title: 'Raw honey and bee products', description: 'Pure, unfiltered honey from local hives', category: 'Pantry', price: '$12/jar' },
      { id: 'herb-plants', title: 'Herb plants and seedlings', description: 'Organic herb starts ready for transplanting', category: 'Plants', price: '$3 each' }
    ],
    'equipment': [
      { id: 'tractor-rental', title: 'Compact tractor available for rent', description: 'John Deere compact tractor with implements' },
      { id: 'rototiller-share', title: 'Rototiller available this weekend', description: 'Troy-Bilt rototiller for garden preparation' },
      { id: 'greenhouse-space', title: 'Greenhouse space available', description: 'Climate-controlled growing space for rent' },
      { id: 'irrigation-system', title: 'Drip irrigation system for lease', description: 'Complete drip irrigation setup for gardens' }
    ],
    'resource-sharing': [
      { id: 'seed-swap', title: 'Surplus seeds to share', description: 'Extra vegetable and flower seeds from this season' },
      { id: 'compost-share', title: 'Mature compost available', description: 'Well-aged compost ready for gardens' },
      { id: 'knowledge-exchange', title: 'Organic growing workshop', description: 'Teaching sustainable farming practices' },
      { id: 'bulk-purchasing', title: 'Group buy - organic fertilizer', description: 'Splitting bulk order of organic amendments' }
    ],
    'help-needed': [
      { id: 'harvest-help', title: 'Need help with harvest', description: 'Looking for assistance during peak harvest time' },
      { id: 'farm-maintenance', title: 'Farm maintenance assistance', description: 'Help needed with fence repair and general upkeep' },
      { id: 'animal-care', title: 'Livestock care while traveling', description: 'Reliable person to care for animals during absence' },
      { id: 'market-help', title: 'Farmers market assistance', description: 'Help needed for weekend farmers market booth' }
    ],
    'looking-for': [
      { id: 'land-lease', title: 'Seeking land to lease', description: 'Looking for farmable land for organic vegetables' },
      { id: 'farm-partnership', title: 'Farm partnership opportunity', description: 'Seeking experienced partner for market garden' },
      { id: 'specific-equipment', title: 'Looking for used equipment', description: 'Searching for specific farming tools or machinery' },
      { id: 'market-vendor', title: 'Farmers market vendor spot', description: 'Seeking vendor space at local farmers markets' }
    ],
    'discussion': [
      { id: 'growing-tips', title: 'Best practices discussion', description: 'Share growing techniques and seasonal advice' },
      { id: 'pest-management', title: 'Organic pest control methods', description: 'Natural solutions for common farm pests' },
      { id: 'market-strategies', title: 'Marketing and sales strategies', description: 'Effective ways to sell farm products' },
      { id: 'weather-concerns', title: 'Weather and seasonal planning', description: 'Dealing with weather challenges and planning' }
    ]
  }

  const handlePostTypeSelect = (typeId: string) => {
    setSelectedPostType(typeId)
    // Skip template selection for mobile, go directly to quick details
    if (window.innerWidth < 768) {
      setSelectedTemplate('mobile-quick')
      setCurrentStep(3)
    } else {
      setCurrentStep(2)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    
    // Populate form data based on template
    const template = templates[selectedPostType]?.find(t => t.id === templateId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        title: template.title,
        description: template.description,
        category: template.category || '',
        price: template.price?.replace(/[^0-9.]/g, '') || '',
        priceUnit: template.price?.includes('/') ? template.price.split('/')[1] || 'each' : 'each',
        visibility: getSelectedPostType()?.visibility || 'public'
      }))
    }
    
    setCurrentStep(3)
  }

  const handleCreateCustom = () => {
    setSelectedTemplate('custom')
    // Set defaults for custom post
    setFormData(prev => ({
      ...prev,
      visibility: getSelectedPostType()?.visibility || 'public'
    }))
    setCurrentStep(3)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + formData.photos.length > 5) {
      setErrors({ photos: 'Maximum 5 photos allowed' })
      return
    }

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }))
    setErrors(prev => ({ ...prev, photos: '' }))
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    // For now, just redirect back to dashboard
    router.push('/dashboard?newPost=true')
  }

  const getSelectedPostType = () => {
    return postTypes.find(pt => pt.id === selectedPostType)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-farm-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-soil-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-soil-50 pb-20 md:pb-0">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-3 mb-6">
          <button
            onClick={() => currentStep === 1 ? router.back() : setCurrentStep(currentStep - 1)}
            className="flex items-center gap-2 text-soil-500 hover:text-soil-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>{currentStep === 1 ? 'Back' : 'Previous'}</span>
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-soil-800">
              {currentStep === 1 && 'What to post?'}
              {currentStep === 2 && 'Choose template'}
              {currentStep === 3 && 'Quick Details'}
            </h1>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center gap-4 mb-8">
          <button
            onClick={() => currentStep === 1 ? router.back() : setCurrentStep(currentStep - 1)}
            className="flex items-center gap-2 text-soil-500 hover:text-soil-800 transition-colors"
          >
            <ArrowLeft size={20} />
            {currentStep === 1 ? 'Back' : 'Previous'}
          </button>
          <div>
            <h1 className="text-3xl font-bold text-soil-800 flex items-center gap-3">
              <span className="text-4xl">➕</span>
              Create New Post
            </h1>
            <p className="text-soil-500">
              {currentStep === 1 && 'Choose what type of post you want to create'}
              {currentStep === 2 && 'Select a template or start from scratch'}
              {currentStep === 3 && 'Fill in your post details'}
            </p>
          </div>
        </div>

        {/* Mobile Progress Dots */}
        <div className="md:hidden flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className={`w-2 h-2 rounded-full ${
              step <= currentStep ? 'bg-farm-green-800' : 'bg-gray-300'
            }`} />
          ))}
        </div>

        {/* Desktop Progress Steps */}
        <div className="hidden md:flex items-center gap-4 mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-farm-green-800 text-white'
                  : 'bg-soil-200 text-soil-400'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-farm-green-800' : 'bg-soil-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Post Type Selection */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-warm-border p-4 md:p-6">
            {/* Mobile Header */}
            <div className="text-center mb-6 md:text-left">
              <h2 className="text-lg md:text-xl font-semibold text-soil-800 mb-2">What to post?</h2>
              <p className="text-sm text-soil-500">Choose the type of post you want to create</p>
            </div>
            
            {/* Mobile-First Radio List */}
            <div className="space-y-3 mb-6">
              {postTypes.map((type) => (
                <label
                  key={type.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-warm-border hover:border-farm-green-300 hover:bg-farm-green-50 transition-colors cursor-pointer"
                >
                  <input
                    type="radio"
                    name="postType"
                    value={type.id}
                    checked={selectedPostType === type.id}
                    onChange={(e) => setSelectedPostType(e.target.value)}
                    className="w-5 h-5 text-farm-green-800 border-warm-border focus:ring-farm-green-500"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xl">{type.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-soil-800">{type.title}</span>
                        {type.visibility === 'farmers-only' && (
                          <span className="text-xs bg-terra-100 text-terra-700 px-2 py-1 rounded-full">
                            Farmers
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-soil-500 hidden md:block">{type.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Continue Button */}
            <button
              onClick={() => selectedPostType && handlePostTypeSelect(selectedPostType)}
              disabled={!selectedPostType}
              className="w-full py-3 px-4 bg-farm-green-800 text-white rounded-lg font-medium hover:bg-farm-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </button>

            {/* Popular Templates (Hidden on Mobile) */}
            <div className="hidden md:block border-t border-warm-border pt-6 mt-6">
              <h3 className="font-medium text-soil-800 mb-4">Popular templates:</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-soil-500">
                  <Egg size={24} weight="regular" />
                  <span>Fresh eggs available</span>
                </div>
                <div className="flex items-center gap-2 text-soil-500">
                  <Plant size={24} weight="regular" />
                  <span>Seasonal produce for sale</span>
                </div>
                <div className="flex items-center gap-2 text-soil-500">
                  <Tractor size={24} weight="regular" />
                  <span>Equipment rental</span>
                </div>
                <div className="flex items-center gap-2 text-soil-500">
                  <Plant size={24} weight="regular" />
                  <span>Surplus to share</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Template Selection */}
        {currentStep === 2 && selectedPostType && (
          <div className="bg-white rounded-lg shadow-sm border border-warm-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{getSelectedPostType()?.emoji}</span>
              <h2 className="text-xl font-semibold text-soil-800">{getSelectedPostType()?.title}</h2>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-soil-800 mb-4">Choose a template to get started faster:</h3>
              <div className="space-y-3">
                {templates[selectedPostType]?.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className="w-full p-4 rounded-lg border border-warm-border hover:border-warm-border text-left transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-soil-800 group-hover:text-farm-green-800 transition-colors">
                          {template.title}
                        </h4>
                        <p className="text-sm text-soil-500 mt-1">{template.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          {template.category && (
                            <span className="text-xs bg-soil-100 text-soil-500 px-2 py-1 rounded">
                              {template.category}
                            </span>
                          )}
                          {template.price && (
                            <span className="text-xs bg-farm-green-100 text-farm-green-800 px-2 py-1 rounded">
                              {template.price}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-soil-400 group-hover:text-soil-500 transition-colors">
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-warm-border pt-6">
              <button
                onClick={handleCreateCustom}
                className="w-full p-4 rounded-lg border-2 border-dashed border-warm-border hover:border-farm-green-500 text-center transition-colors group"
              >
                <div className="flex items-center justify-center gap-2 text-soil-500 group-hover:text-farm-green-800">
                  <Plus size={20} />
                  <span className="font-medium">Start from scratch</span>
                </div>
                <p className="text-sm text-soil-400 mt-1">Create a custom post with your own content</p>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Quick Details Form */}
        {currentStep === 3 && selectedPostType && (
          <div className="space-y-4 md:space-y-6">
            {/* Mobile Quick Form */}
            <div className="md:hidden bg-white rounded-lg shadow-sm border border-warm-border p-4">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">{getSelectedPostType()?.emoji}</span>
                  <h2 className="text-lg font-semibold text-soil-800">Quick Details</h2>
                </div>
                <p className="text-sm text-soil-500">Add the basics to get started</p>
              </div>

              <div className="space-y-4">
                {/* Item Name */}
                <div>
                  <label className="block text-sm font-medium text-soil-700 mb-2">
                    Item <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Fresh Eggs, Tomatoes, Tractor"
                    className="w-full p-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent text-lg"
                  />
                </div>

                {/* Price (only for for-sale and equipment) */}
                {(selectedPostType === 'for-sale' || selectedPostType === 'equipment') && (
                  <div>
                    <label className="block text-sm font-medium text-soil-700 mb-2">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-1">
                        <span className="inline-flex items-center px-3 border border-r-0 border-warm-border bg-soil-50 text-soil-400 rounded-l-lg text-lg">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="4.00"
                          className="flex-1 p-3 border border-warm-border rounded-r-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent text-lg"
                        />
                      </div>
                      <select
                        value={formData.priceUnit}
                        onChange={(e) => setFormData(prev => ({ ...prev, priceUnit: e.target.value }))}
                        className="p-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent text-soil-500"
                      >
                        <option value="each">each</option>
                        <option value="dozen">dozen</option>
                        <option value="lb">per lb</option>
                        <option value="day">per day</option>
                        <option value="hour">per hour</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-soil-700 mb-2">
                    📷 Add Photo
                  </label>
                  <div className="border-2 border-dashed border-warm-border rounded-lg p-6 text-center hover:border-farm-green-500 transition-colors">
                    {formData.photos.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center">
                          <img
                            src={URL.createObjectURL(formData.photos[0])}
                            alt="Upload preview"
                            className="h-20 w-20 object-cover rounded-lg"
                          />
                        </div>
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, photos: [] }))}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove photo
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center">
                          <Camera className="h-8 w-8 text-soil-400 mb-2" />
                          <span className="text-sm font-medium text-soil-500">Add Photo</span>
                          <span className="text-xs text-soil-400">Tap to upload</span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentStep(4)}
                  disabled={!formData.title.trim() || (selectedPostType === 'for-sale' && !formData.price)}
                  className="w-full py-3 px-4 bg-farm-green-800 text-white rounded-lg font-medium hover:bg-farm-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <span>Next</span>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </button>
              </div>
            </div>

            {/* Desktop Form Header */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm border border-warm-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{getSelectedPostType()?.emoji}</span>
                <h2 className="text-xl font-semibold text-soil-800">{getSelectedPostType()?.title}</h2>
              </div>
              
              {selectedTemplate !== 'custom' && selectedTemplate !== 'mobile-quick' && (
                <div className="bg-terra-50 border border-terra-200 rounded-lg p-4">
                  <p className="text-sm text-terra-700">
                    <strong>Template:</strong> {templates[selectedPostType]?.find(t => t.id === selectedTemplate)?.title}
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Main Form */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm border border-warm-border p-6">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-soil-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Give your post a clear, descriptive title"
                    className="w-full p-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                  />
                </div>

                {/* Category & Price Row */}
                {(selectedPostType === 'for-sale' || selectedPostType === 'equipment') && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-soil-700 mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                      >
                        <option value="">Select category</option>
                        {selectedPostType === 'for-sale' ? (
                          <>
                            <option value="produce">Fresh Produce</option>
                            <option value="livestock">Livestock Products</option>
                            <option value="plants">Plants & Seeds</option>
                            <option value="pantry">Pantry Items</option>
                            <option value="crafts">Farm Crafts</option>
                          </>
                        ) : (
                          <>
                            <option value="tractors">Tractors</option>
                            <option value="tools">Hand Tools</option>
                            <option value="irrigation">Irrigation</option>
                            <option value="storage">Storage</option>
                            <option value="processing">Processing Equipment</option>
                          </>
                        )}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-soil-700 mb-2">Price</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 border border-r-0 border-warm-border bg-soil-50 text-soil-400 rounded-l-lg">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                          className="flex-1 p-3 border border-warm-border focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-soil-700 mb-2">Per</label>
                      <select
                        value={formData.priceUnit}
                        onChange={(e) => setFormData(prev => ({ ...prev, priceUnit: e.target.value }))}
                        className="w-full p-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                      >
                        <option value="each">each</option>
                        <option value="dozen">dozen</option>
                        <option value="lb">lb</option>
                        <option value="bag">bag</option>
                        <option value="hour">hour</option>
                        <option value="day">day</option>
                        <option value="week">week</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-soil-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    placeholder="Provide details about your post. Include important information like condition, availability, location, etc."
                    className="w-full p-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Photos */}
                <div>
                  <label className="block text-sm font-medium text-soil-700 mb-2">
                    📷 Add Photos ({formData.photos.length}/5 photos)
                  </label>
                  
                  {formData.photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {formData.photos.length < 5 && (
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-warm-border border-dashed rounded-lg cursor-pointer hover:bg-soil-50 transition-colors">
                      <div className="flex items-center gap-2 text-soil-500">
                        <Camera size={20} />
                        <span className="text-sm">Click to upload photos</span>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Availability */}
                {(selectedPostType === 'for-sale' || selectedPostType === 'equipment') && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="availableNow"
                        checked={formData.availableNow}
                        onChange={(e) => setFormData(prev => ({ ...prev, availableNow: e.target.checked }))}
                        className="w-4 h-4 text-farm-green-800 border-warm-border rounded focus:ring-farm-green-500"
                      />
                      <label htmlFor="availableNow" className="text-sm font-medium text-soil-700">
                        Available now
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-soil-700 mb-2">Pickup Information</label>
                      <input
                        type="text"
                        value={formData.pickupInfo}
                        onChange={(e) => setFormData(prev => ({ ...prev, pickupInfo: e.target.value }))}
                        placeholder="e.g., Tuesday & Friday 8am-6pm, or by appointment"
                        className="w-full p-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Visibility */}
                <div>
                  <label className="block text-sm font-medium text-soil-700 mb-3">Who can see this?</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border border-warm-border rounded-lg cursor-pointer hover:bg-soil-50">
                      <input
                        type="radio"
                        name="visibility"
                        value="public"
                        checked={formData.visibility === 'public'}
                        onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as 'public' | 'farmers-only' }))}
                        className="w-4 h-4 text-farm-green-800 border-warm-border focus:ring-farm-green-500"
                      />
                      <div>
                        <div className="font-medium text-soil-800">Everyone (Public marketplace)</div>
                        <div className="text-sm text-soil-500">Visible to all users including consumers</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 p-3 border border-warm-border rounded-lg cursor-pointer hover:bg-soil-50">
                      <input
                        type="radio"
                        name="visibility"
                        value="farmers-only"
                        checked={formData.visibility === 'farmers-only'}
                        onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as 'public' | 'farmers-only' }))}
                        className="w-4 h-4 text-farm-green-800 border-warm-border focus:ring-farm-green-500"
                      />
                      <div>
                        <div className="font-medium text-soil-800">Farmers only (Private network)</div>
                        <div className="text-sm text-soil-500">Only visible to other farmers</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Contact Methods */}
                <div>
                  <label className="block text-sm font-medium text-soil-700 mb-3">Contact method:</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.contactMethods.platform}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactMethods: { ...prev.contactMethods, platform: e.target.checked }
                        }))}
                        className="w-4 h-4 text-farm-green-800 border-warm-border rounded focus:ring-farm-green-500"
                      />
                      <span className="text-sm text-soil-700">Platform messages</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.contactMethods.phone}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactMethods: { ...prev.contactMethods, phone: e.target.checked }
                        }))}
                        className="w-4 h-4 text-farm-green-800 border-warm-border rounded focus:ring-farm-green-500"
                      />
                      <span className="text-sm text-soil-700">Phone</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.contactMethods.email}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactMethods: { ...prev.contactMethods, email: e.target.checked }
                        }))}
                        className="w-4 h-4 text-farm-green-800 border-warm-border rounded focus:ring-farm-green-500"
                      />
                      <span className="text-sm text-soil-700">Email</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-warm-border p-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 border border-warm-border text-soil-700 rounded-lg hover:bg-soil-50 transition-colors"
                >
                  Back to Templates
                </button>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {}}
                    className="px-6 py-2 border border-warm-border text-soil-700 rounded-lg hover:bg-soil-50 transition-colors"
                  >
                    Preview Post
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-farm-green-800 text-white rounded-lg font-medium hover:bg-farm-green-800 transition-colors"
                  >
                    Publish Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}