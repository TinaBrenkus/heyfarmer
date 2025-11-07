'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowRight, 
  Users, 
  ShoppingCart, 
  Leaf,
  MapPin,
  TrendingUp,
  Heart,
  CheckCircle
} from 'lucide-react'
import FarmLogo from '@/components/icons/FarmLogo'
import { supabase } from '@/lib/supabase'

export default function WelcomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkExistingUser()
  }, [])

  const checkExistingUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      router.push('/dashboard')
    } else {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: ShoppingCart,
      title: 'Fresh Local Produce',
      description: 'Buy directly from farmers in your community',
      color: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    },
    {
      icon: Users,
      title: 'Farmer Network',
      description: 'Connect with growers across Texas Triangle',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      icon: Leaf,
      title: 'Sustainable Farming',
      description: 'Support local, sustainable agriculture',
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      icon: MapPin,
      title: 'Hyperlocal Focus',
      description: 'Exclusively for Texas Triangle communities',
      color: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    }
  ]

  const testimonials = [
    {
      quote: "Hey Farmer helped me find customers right in my neighborhood!",
      author: "Sarah M.",
      role: "Backyard Grower, Dallas"
    },
    {
      quote: "Finally, a platform that connects local farmers and food lovers.",
      author: "James T.",
      role: "Market Gardener, Denton"
    },
    {
      quote: "I love buying fresh produce directly from local farms!",
      author: "Maria L.",
      role: "Food Lover, Collin County"
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-25 to-blue-50" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #fef7ed 50%, #f0f9ff 100%)' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/30 via-green-100/30 to-blue-100/30 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative">
          {/* Logo and Title */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-lg mb-6">
              <div className="p-3 rounded-xl" style={{ backgroundColor: '#2E7D32' }}>
                <FarmLogo size={48} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Welcome to <span className="text-green-600">Hey Farmer</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-2">
              Texas Triangle Farming Community
            </p>
            <p className="text-lg text-green-600 font-semibold">
              Connect • Trade • Grow Together
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/signup"
              className="group px-8 py-4 bg-green-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-green-700 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
            >
              Get Started
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              style={{ backgroundColor: '#1976D2' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1565C0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#1976D2'}
            >
              Already a member?
            </Link>
          </div>
          
          {/* Secondary Links */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/how-it-works"
              className="px-6 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              style={{ backgroundColor: '#FFA726' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#FF9800'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#FFA726'}
            >
              How It Works
            </Link>
            <Link
              href="/about"
              className="px-6 py-3 bg-white border-2 border-green-500 text-green-600 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-green-50 transition-all transform hover:scale-105"
            >
              About Hey Farmer
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div 
                  key={index}
                  className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border-2 ${feature.borderColor}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`p-3 ${feature.color} rounded-lg inline-block mb-4`}>
                    <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Growing Our Community
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
                <p className="text-gray-600">Local Farmers</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">11</div>
                <p className="text-gray-600">Texas Triangle Counties</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">2,000+</div>
                <p className="text-gray-600">Active Listings</p>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              What Our Community Says
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-start gap-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Heart key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-xl p-8 text-white">
            <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Sign Up</h3>
                <p className="text-green-100 text-sm">Create your profile as a farmer or food lover</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Connect</h3>
                <p className="text-green-100 text-sm">Browse listings or post your produce</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Trade</h3>
                <p className="text-green-100 text-sm">Buy, sell, or exchange locally</p>
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center mt-8">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Join Our Community
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#2E7D32' }}>
                <FarmLogo size={20} className="text-white" />
              </div>
              <span className="text-gray-600">© 2024 Hey Farmer Texas Triangle</span>
            </div>
            <div className="flex gap-6">
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
              <Link href="/terms" className="text-gray-600 hover:text-gray-900">Terms</Link>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}