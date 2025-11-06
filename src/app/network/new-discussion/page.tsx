'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Camera, 
  X,
  AlertCircle,
  FileText,
  Tag
} from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import { supabase } from '@/lib/supabase'
import { UserType } from '@/lib/database'

interface FormData {
  title: string
  category: string
  content: string
  photos: File[]
}

export default function NewDiscussionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    content: '',
    photos: []
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

    // Check if user is a farmer
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profile?.user_type === 'consumer') {
      router.push('/dashboard')
      return
    }

    setUserProfile(profile)
    setLoading(false)
  }

  const categories = [
    { id: 'growing-tips', name: 'Growing Tips', icon: '🌱', description: 'Share gardening and farming techniques' },
    { id: 'equipment', name: 'Equipment', icon: '🔧', description: 'Tools, machinery, and equipment discussions' },
    { id: 'pest-control', name: 'Pest Control', icon: '🐛', description: 'Natural and organic pest management' },
    { id: 'marketing', name: 'Marketing', icon: '💰', description: 'Selling strategies and business advice' },
    { id: 'weather', name: 'Weather', icon: '🌦️', description: 'Weather concerns and seasonal planning' },
    { id: 'resource-sharing', name: 'Resource Sharing', icon: '🤝', description: 'Share tools, seeds, and resources' }
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters'
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    } else if (formData.content.length < 20) {
      newErrors.content = 'Content must be at least 20 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      // Here you would typically save to the database
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect back to network with success message
      router.push('/network?newPost=true')
    } catch (error) {
      console.error('Error creating discussion:', error)
      setErrors({ submit: 'Failed to create discussion. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + formData.photos.length > 4) {
      setErrors({ photos: 'Maximum 4 photos allowed' })
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

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.icon || '💬'
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
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-4xl">💬</span>
              Start a Discussion
            </h1>
            <p className="text-gray-600">Share knowledge and connect with fellow farmers</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Discussion Title</h2>
            </div>
            
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="What would you like to discuss? (e.g., 'Best practices for fall tomato planting in North Texas?')"
              className={`w-full p-4 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                <span>{errors.title}</span>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Choose a clear, descriptive title that explains what you want to discuss
            </p>
          </div>

          {/* Category */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Category</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    formData.category === category.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{category.icon}</span>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </button>
              ))}
            </div>
            
            {errors.category && (
              <div className="flex items-center gap-2 mt-3 text-red-600 text-sm">
                <AlertCircle size={16} />
                <span>{errors.category}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{getCategoryIcon(formData.category)}</span>
              <h2 className="text-lg font-semibold text-gray-900">Your Message</h2>
            </div>
            
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Share your experience, ask questions, or provide detailed information. The more context you provide, the better responses you'll get from the community."
              rows={8}
              className={`w-full p-4 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                errors.content ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.content && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                <span>{errors.content}</span>
              </div>
            )}
            <div className="flex justify-between items-center mt-3">
              <p className="text-xs text-gray-500">
                Be specific and helpful. Include details about your location, growing conditions, and what you've already tried.
              </p>
              <span className="text-xs text-gray-400">
                {formData.content.length} characters
              </span>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Photos (Optional)</h2>
            </div>
            
            {formData.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {formData.photos.length < 4 && (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center">
                  <Camera className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Click to upload photos</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB (max 4 photos)</p>
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
            
            {errors.photos && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                <span>{errors.photos}</span>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Ready to post?</h3>
                <p className="text-sm text-gray-600">Your discussion will be visible to all farmers in the network</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Posting...</span>
                    </>
                  ) : (
                    'Post Discussion'
                  )}
                </button>
              </div>
            </div>
            
            {errors.submit && (
              <div className="flex items-center gap-2 mt-3 text-red-600 text-sm">
                <AlertCircle size={16} />
                <span>{errors.submit}</span>
              </div>
            )}
          </div>
        </form>
      </main>
    </div>
  )
}