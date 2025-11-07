'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { UserType, TexasTriangleCounty } from '@/lib/database'
import { Loader2, User, Tractor, ShoppingCart } from 'lucide-react'
import FarmLogo from '@/components/icons/FarmLogo'

const counties: { value: TexasTriangleCounty; label: string; region: string }[] = [
  // Dallas-Fort Worth Metro
  { value: 'collin', label: 'Collin County', region: 'DFW Metro' },
  { value: 'dallas', label: 'Dallas County', region: 'DFW Metro' },
  { value: 'denton', label: 'Denton County', region: 'DFW Metro' },
  { value: 'grayson', label: 'Grayson County', region: 'DFW Metro' },
  { value: 'hunt', label: 'Hunt County', region: 'DFW Metro' },
  { value: 'jack', label: 'Jack County', region: 'DFW Metro' },
  { value: 'kaufman', label: 'Kaufman County', region: 'DFW Metro' },
  { value: 'parker', label: 'Parker County', region: 'DFW Metro' },
  { value: 'rockwall', label: 'Rockwall County', region: 'DFW Metro' },
  { value: 'tarrant', label: 'Tarrant County', region: 'DFW Metro' },
  { value: 'wise', label: 'Wise County', region: 'DFW Metro' },
  // Austin Metro
  { value: 'bastrop', label: 'Bastrop County', region: 'Austin Metro' },
  { value: 'blanco', label: 'Blanco County', region: 'Austin Metro' },
  { value: 'burnet', label: 'Burnet County', region: 'Austin Metro' },
  { value: 'caldwell', label: 'Caldwell County', region: 'Austin Metro' },
  { value: 'hays', label: 'Hays County', region: 'Austin Metro' },
  { value: 'lee', label: 'Lee County', region: 'Austin Metro' },
  { value: 'travis', label: 'Travis County', region: 'Austin Metro' },
  { value: 'williamson', label: 'Williamson County', region: 'Austin Metro' },
  // San Antonio Metro
  { value: 'atascosa', label: 'Atascosa County', region: 'San Antonio Metro' },
  { value: 'bandera', label: 'Bandera County', region: 'San Antonio Metro' },
  { value: 'bexar', label: 'Bexar County', region: 'San Antonio Metro' },
  { value: 'comal', label: 'Comal County', region: 'San Antonio Metro' },
  { value: 'guadalupe', label: 'Guadalupe County', region: 'San Antonio Metro' },
  { value: 'kendall', label: 'Kendall County', region: 'San Antonio Metro' },
  { value: 'medina', label: 'Medina County', region: 'San Antonio Metro' },
  { value: 'wilson', label: 'Wilson County', region: 'San Antonio Metro' },
  // Houston Metro
  { value: 'austin-county', label: 'Austin County', region: 'Houston Metro' },
  { value: 'brazoria', label: 'Brazoria County', region: 'Houston Metro' },
  { value: 'chambers', label: 'Chambers County', region: 'Houston Metro' },
  { value: 'fort-bend', label: 'Fort Bend County', region: 'Houston Metro' },
  { value: 'galveston', label: 'Galveston County', region: 'Houston Metro' },
  { value: 'harris', label: 'Harris County', region: 'Houston Metro' },
  { value: 'liberty', label: 'Liberty County', region: 'Houston Metro' },
  { value: 'montgomery', label: 'Montgomery County', region: 'Houston Metro' },
  { value: 'waller', label: 'Waller County', region: 'Houston Metro' },
  // Central Corridor
  { value: 'bell', label: 'Bell County (Temple/Killeen)', region: 'Central' },
  { value: 'brazos', label: 'Brazos County (College Station)', region: 'Central' },
  { value: 'burleson', label: 'Burleson County', region: 'Central' },
  { value: 'grimes', label: 'Grimes County', region: 'Central' },
  { value: 'mclennan', label: 'McLennan County (Waco)', region: 'Central' },
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

export default function SignupForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    user_type: 'consumer' as UserType,
    county: 'dallas' as TexasTriangleCounty,
    farm_name: '',
    phone: ''
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            user_type: formData.user_type,
            county: formData.county,
            farm_name: formData.farm_name,
            phone: formData.phone
          }
        }
      })
      
      if (signUpError) throw signUpError
      
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const isFarmer = formData.user_type !== 'consumer'
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full mb-4" style={{ backgroundColor: '#E8F5E8' }}>
            <FarmLogo className="h-8 w-8" style={{ color: '#2E7D32' }} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Hey Farmer</h2>
          <p className="text-gray-600">Connect with Texas Triangle farmers and fresh food</p>
        </div>
        
        {success ? (
          <div className="text-center py-8">
            <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: '#E8F5E8' }}>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#2E7D32' }}>
                Welcome to Hey Farmer!
              </h3>
              <p className="text-gray-700">
                Please check your email to verify your account.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, user_type: type.value })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.user_type === type.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${
                          formData.user_type === type.value ? 'text-green-600' : 'text-gray-400'
                        }`} />
                        <div>
                          <div className="font-medium text-gray-900">{type.label}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  id="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-1">
                  County *
                </label>
                <select
                  id="county"
                  required
                  value={formData.county}
                  onChange={(e) => setFormData({ ...formData, county: e.target.value as TexasTriangleCounty })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {counties.map((county) => (
                    <option key={county.value} value={county.value}>
                      {county.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Farm Name (for farmers only) */}
            {isFarmer && (
              <div>
                <label htmlFor="farm_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Farm/Business Name
                </label>
                <input
                  id="farm_name"
                  type="text"
                  value={formData.farm_name}
                  onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>
            )}
            
            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>
            </div>
            
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: loading ? '#94a3b8' : '#1976D2' }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
            
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="font-medium" style={{ color: '#1976D2' }}>
                Log in
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}