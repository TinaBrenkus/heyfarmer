'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { User, Eye, EyeOff } from 'lucide-react'
import FarmLogo from '@/components/icons/FarmLogo'
import { supabase } from '@/lib/supabase'
import { db, UserType, TexasTriangleCounty } from '@/lib/database'
import { WelcomeTour } from '@/components/onboarding/QuickTour'
import { Flower, House, Leaf, Lightbulb, Plant, ShoppingCart, Tractor } from '@phosphor-icons/react'

const counties: { value: TexasTriangleCounty; label: string }[] = [
  // Dallas-Fort Worth Metro
  { value: 'collin', label: 'Collin County' },
  { value: 'dallas', label: 'Dallas County' },
  { value: 'denton', label: 'Denton County' },
  { value: 'grayson', label: 'Grayson County' },
  { value: 'hunt', label: 'Hunt County' },
  { value: 'jack', label: 'Jack County' },
  { value: 'kaufman', label: 'Kaufman County' },
  { value: 'parker', label: 'Parker County' },
  { value: 'rockwall', label: 'Rockwall County' },
  { value: 'tarrant', label: 'Tarrant County' },
  { value: 'wise', label: 'Wise County' },
  // Austin Metro  
  { value: 'bastrop', label: 'Bastrop County' },
  { value: 'blanco', label: 'Blanco County' },
  { value: 'burnet', label: 'Burnet County' },
  { value: 'caldwell', label: 'Caldwell County' },
  { value: 'hays', label: 'Hays County' },
  { value: 'lee', label: 'Lee County' },
  { value: 'travis', label: 'Travis County' },
  { value: 'williamson', label: 'Williamson County' },
  // San Antonio Metro
  { value: 'atascosa', label: 'Atascosa County' },
  { value: 'bandera', label: 'Bandera County' },
  { value: 'bexar', label: 'Bexar County' },
  { value: 'comal', label: 'Comal County' },
  { value: 'guadalupe', label: 'Guadalupe County' },
  { value: 'kendall', label: 'Kendall County' },
  { value: 'medina', label: 'Medina County' },
  { value: 'wilson', label: 'Wilson County' },
  // Houston Metro
  { value: 'austin-county', label: 'Austin County' },
  { value: 'brazoria', label: 'Brazoria County' },
  { value: 'chambers', label: 'Chambers County' },
  { value: 'fort-bend', label: 'Fort Bend County' },
  { value: 'galveston', label: 'Galveston County' },
  { value: 'harris', label: 'Harris County' },
  { value: 'liberty', label: 'Liberty County' },
  { value: 'montgomery', label: 'Montgomery County' },
  { value: 'waller', label: 'Waller County' },
  // Central Corridor
  { value: 'bell', label: 'Bell County (Temple/Killeen)' },
  { value: 'brazos', label: 'Brazos County (College Station)' },
  { value: 'burleson', label: 'Burleson County' },
  { value: 'grimes', label: 'Grimes County' },
  { value: 'mclennan', label: 'McLennan County (Waco)' },
]

const userTypes: { value: UserType; label: string; description: string; icon: any }[] = [
  { 
    value: 'consumer', 
    label: 'Food Lover', 
    description: 'I want to buy fresh, local produce',
    icon: ShoppingCart
  },
  { 
    value: 'backyard_grower', 
    label: 'Backyard Grower', 
    description: 'I grow food in my home garden',
    icon: FarmLogo
  },
  { 
    value: 'market_gardener', 
    label: 'Market Gardener', 
    description: 'I run a small commercial farm',
    icon: User
  },
  { 
    value: 'production_farmer', 
    label: 'Production Farmer', 
    description: 'I operate a large commercial farm',
    icon: Tractor
  }
]

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-farm-green-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <SignupContent />
    </Suspense>
  )
}

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const claimSlug = searchParams.get('claim')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    farmName: '',
    userType: 'consumer' as UserType,
    county: 'dallas' as TexasTriangleCounty,
    city: '',
    zip: '',
    phone: '',
    bio: '',
    growTypes: [] as string[],
    profilePhoto: null as File | null
  })
  const [step, setStep] = useState(1) // 1: User Type, 2: Account, 3: Profile
  const [showTour, setShowTour] = useState(false)

  // Pre-fill from claim context
  useEffect(() => {
    if (claimSlug) {
      db.directoryFarms.get(claimSlug).then(farm => {
        if (farm) {
          setFormData(prev => ({
            ...prev,
            farmName: farm.name || prev.farmName,
            county: farm.county || prev.county,
            city: farm.city || prev.city,
            userType: (farm.farm_type === 'backyard_grower' || farm.farm_type === 'market_gardener' || farm.farm_type === 'production_farmer')
              ? farm.farm_type as UserType
              : 'production_farmer',
          }))
        }
      }).catch(() => {})
    }
  }, [claimSlug])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGrowTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      growTypes: prev.growTypes.includes(type)
        ? prev.growTypes.filter(t => t !== type)
        : [...prev.growTypes, type]
    }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        profilePhoto: e.target.files![0]
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      // Helper function to sanitize string values for HTTP headers and JWT encoding
      // Removes problematic characters that cause "Invalid value" errors in Supabase metadata
      const sanitize = (str: string | null | undefined): string => {
        if (!str) return ''
        // Remove control characters, newlines, tabs, and problematic chars
        return str
          .replace(/[\r\n\t\x00-\x1F\x7F-\x9F]/g, ' ')  // Remove control chars
          .replace(/["\u201C\u201D]/g, "'")  // Replace double quotes with single quotes
          .replace(/\s+/g, ' ')  // Collapse multiple spaces
          .trim()
          .substring(0, 500)  // Limit length to prevent JWT size issues
      }

      // Note: Avatar upload is disabled during signup to avoid RLS policy issues
      // Users can upload their profile photo after signup in their profile settings
      // This is because uploads require authentication, which doesn't exist yet during signup
      let avatarUrl: string | null = null

      // Sign up with Supabase Auth
      // Clean email - remove any control characters but preserve the actual email value
      const cleanEmail = formData.email.trim().replace(/[\r\n\t\x00-\x1F\x7F-\x9F]/g, '')

      // Only include defined, non-empty values in metadata
      const metadata: Record<string, string> = {}

      // Add required fields
      const fullName = sanitize(formData.fullName)
      if (fullName) metadata.full_name = fullName

      metadata.user_type = formData.userType
      metadata.county = formData.county

      // Add optional fields only if they have values
      const farmName = sanitize(formData.farmName)
      if (farmName) metadata.farm_name = farmName

      const city = sanitize(formData.city)
      if (city) metadata.city = city

      const zip = sanitize(formData.zip)
      if (zip) metadata.zip = zip

      const phone = sanitize(formData.phone)
      if (phone) metadata.phone = phone

      const bio = sanitize(formData.bio)
      if (bio) metadata.bio = bio

      // Only add avatar URL if it exists and is valid
      if (avatarUrl && avatarUrl.startsWith('http')) {
        metadata.avatar_url = avatarUrl
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: formData.password,
        options: {
          data: metadata
        }
      })

      if (authError) {
        console.error('Auth error details:', {
          message: authError.message,
          status: authError.status,
          name: authError.name,
          metadata: metadata
        })
        throw new Error(authError.message)
      }

      if (authData.user) {
        // If claiming a farm, redirect to claim page instead
        if (claimSlug) {
          router.push(`/claim/${claimSlug}`)
          return
        }
        // Success - show tour then redirect to dashboard
        setShowTour(true)
      }

    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isFarmer = formData.userType !== 'consumer'

  const growTypes = [
    { id: 'vegetables', label: 'Vegetables', iconName: 'Plant' },
    { id: 'fruits', label: 'Fruits', emoji: '🍎' },
    { id: 'herbs', label: 'Herbs', iconName: 'Leaf' },
    { id: 'flowers', label: 'Flowers', iconName: 'Flower' },
    { id: 'livestock', label: 'Livestock', emoji: '🐄' },
    { id: 'other', label: 'Other', emoji: '🌾' }
  ]

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step < 3) {
      nextStep()
    } else {
      await handleSubmit(e)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #F0EDE4, #FAF7F0, #F0EDE4)' }}>
      <div className="w-full max-w-2xl mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Claim Context Banner */}
          {claimSlug && (
            <div className="mb-4 p-3 bg-farm-green-50 border border-warm-border rounded-lg text-sm text-farm-green-800 text-center">
              Sign up to claim your farm listing on Hey Farmer
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <FarmLogo size={80} />
            </div>
            <h1 className="text-3xl font-bold text-soil-800 mb-2">
              {step === 1 ? 'What describes you?' : step === 2 ? 'Create Account' : 'Set Up Your Profile'}
            </h1>
            <p className="text-soil-500">
              {step === 1 ? 'Choose your role in the community' : step === 2 ? 'Account credentials' : 'Tell us about yourself'}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      stepNum <= step 
                        ? 'bg-farm-green-800 text-white' 
                        : 'bg-soil-200 text-soil-500'
                    }`}
                  >
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div 
                      className={`w-8 h-1 ${
                        stepNum < step ? 'bg-farm-green-800' : 'bg-soil-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleStepSubmit} className="space-y-6">
            {/* Step 1: User Type Selection */}
            {step === 1 && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {userTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, userType: type.value }))}
                        className={`p-6 rounded-lg border-2 text-left transition-all ${
                          formData.userType === type.value
                            ? 'border-farm-green-500 bg-farm-green-50'
                            : 'border-warm-border hover:border-warm-border'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{type.value === 'backyard_grower' ? '' : type.value === 'market_gardener' ? '' : type.value === 'production_farmer' ? '' : ''}</div>
                          <div>
                            <div className="font-medium text-soil-800 text-lg">{type.label}</div>
                            <div className="text-sm text-soil-400 mt-1">{type.description}</div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Account Details */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-soil-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-soil-700 mb-1">
                      Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-soil-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 pr-12 py-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-soil-400 hover:text-soil-500 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-soil-700 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 pr-12 py-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-soil-400 hover:text-soil-500 transition-colors"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Profile Setup */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Farm/Garden Name */}
                {isFarmer && (
                  <div>
                    <label htmlFor="farmName" className="block text-sm font-medium text-soil-700 mb-1">
                      Farm/Garden Name
                    </label>
                    <input
                      id="farmName"
                      name="farmName"
                      type="text"
                      value={formData.farmName}
                      onChange={handleInputChange}
                      placeholder="Smith Family Farm"
                      className="w-full px-4 py-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="county" className="block text-sm font-medium text-soil-700 mb-1">
                      County *
                    </label>
                    <select
                      id="county"
                      name="county"
                      value={formData.county}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                      required
                    >
                      {counties.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-soil-700 mb-1">
                      City/Town {isFarmer && '*'}
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Decatur"
                      className="w-full px-4 py-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                      required={isFarmer}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="zip" className="block text-sm font-medium text-soil-700 mb-1">
                      ZIP Code {isFarmer && '*'}
                    </label>
                    <input
                      id="zip"
                      name="zip"
                      type="text"
                      value={formData.zip}
                      onChange={handleInputChange}
                      placeholder="76234"
                      pattern="[0-9]{5}"
                      maxLength={5}
                      className="w-full px-4 py-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                      required={isFarmer}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-soil-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(940) 555-1234"
                      className="w-full px-4 py-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* What do you grow? */}
                {isFarmer && (
                  <div>
                    <label className="block text-sm font-medium text-soil-700 mb-3">
                      What do you grow? (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {growTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handleGrowTypeToggle(type.id)}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            formData.growTypes.includes(type.id)
                              ? 'border-farm-green-500 bg-farm-green-50'
                              : 'border-warm-border hover:border-warm-border'
                          }`}
                        >
                          <div className="text-2xl mb-1">{type.emoji}</div>
                          <div className="text-sm font-medium">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-soil-700 mb-1">
                    Tell us about yourself
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder={isFarmer ? "Describe your farm, growing practices, or what makes your operation special..." : "Tell us about your interest in local farming and what you're looking for..."}
                    className="w-full px-4 py-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Note about profile photo */}
                <div className="p-3 rounded-lg bg-terra-50 border border-terra-200">
                  <p className="text-sm text-terra-700">
                    You can add a profile photo after creating your account in your profile settings.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3 px-4 border border-warm-border rounded-lg font-semibold text-soil-700 hover:bg-soil-50 transition-colors"
                >
                  Previous
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: loading ? '#A09E90' : '#4A5E35' }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </>
                ) : step === 3 ? (
                  'Create Profile'
                ) : (
                  'Continue →'
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-soil-500">
                Already have an account?{' '}
                <Link href="/login" className="font-medium hover:underline" style={{ color: '#4A5E35' }}>
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Quick Tour Modal */}
      {showTour && (
        <WelcomeTour
          userType={formData.userType}
          onComplete={() => {
            setShowTour(false)
            router.push('/dashboard')
          }}
          onSkip={() => {
            setShowTour(false)
            router.push('/dashboard')
          }}
        />
      )}
    </div>
  )
}