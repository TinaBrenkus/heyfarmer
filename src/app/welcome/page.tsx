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
import TomatoMark from '@/components/icons/TomatoMark'
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
      color: 'bg-terra-50',
      iconColor: 'text-terra-600',
      borderColor: 'border-terra-200'
    },
    {
      icon: Users,
      title: 'Farmer Network',
      description: 'Connect with growers across Texas Triangle',
      color: 'bg-terra-50',
      iconColor: 'text-terra-600',
      borderColor: 'border-terra-200'
    },
    {
      icon: Leaf,
      title: 'Sustainable Farming',
      description: 'Support local, sustainable agriculture',
      color: 'bg-farm-green-50',
      iconColor: 'text-farm-green-800',
      borderColor: 'border-warm-border'
    },
    {
      icon: MapPin,
      title: 'Hyperlocal Focus',
      description: 'Exclusively for Texas Triangle communities',
      color: 'bg-terra-50',
      iconColor: 'text-terra-600',
      borderColor: 'border-terra-200'
    }
  ]

  const benefits = [
    {
      icon: Heart,
      title: "Support Local",
      description: "Build relationships with farmers in your community and support the local economy"
    },
    {
      icon: Leaf,
      title: "Fresh & Sustainable",
      description: "Access the freshest produce while supporting sustainable farming practices"
    },
    {
      icon: Users,
      title: "Direct Connection",
      description: "Connect directly with growers to learn about your food and where it comes from"
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-farm-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-soil-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-farm-green-50 via-orange-25 to-blue-50" style={{ background: 'linear-gradient(135deg, #FAF7F0 0%, #F5F2EA 50%, #FAF7F0 100%)' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/30 via-green-100/30 to-blue-100/30 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative">
          {/* Logo and Title */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-lg mb-6">
              <FarmLogo size={220} />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-soil-800 mb-4">
              Welcome to <span className="text-farm-green-800">Hey Farmer</span>
            </h1>
            <p className="text-xl md:text-2xl text-soil-500 mb-2">
              Texas Triangle Farming Community
            </p>
            <p className="text-lg text-farm-green-800 font-semibold">
              Connect • Trade • Grow Together
            </p>
            <p className="text-base text-soil-400 mt-2">
              Free for Texas farmers, market gardeners, and the families who want their food.
            </p>
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link
              href="/farmers"
              className="px-8 py-4 bg-white border-2 border-farm-green-800 text-farm-green-800 rounded-xl font-semibold text-lg shadow-lg hover:bg-farm-green-50 transition-all transform hover:scale-105 flex items-center justify-center"
            >
              Browse Farmers
            </Link>
            <Link
              href="/signup"
              className="group px-8 py-4 bg-farm-green-800 text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-farm-green-800 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
            >
              Get Started
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Secondary Links */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Link
              href="/founding-farmers"
              className="px-5 py-2.5 bg-white border border-farm-green-400 text-farm-green-800 rounded-lg font-medium text-sm hover:bg-farm-green-50 transition-all"
            >
              Founding Farmers
            </Link>
            <Link
              href="/about"
              className="px-5 py-2.5 bg-white border border-farm-green-400 text-farm-green-800 rounded-lg font-medium text-sm hover:bg-farm-green-50 transition-all"
            >
              About Hey Farmer
            </Link>
          </div>

          {/* Sign in text link */}
          <div className="text-center mb-16">
            <Link
              href="/login"
              className="text-sm text-soil-400 hover:text-farm-green-800 transition-colors"
            >
              Already a member? <span className="underline">Sign in</span>
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
                  <h3 className="font-semibold text-soil-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-soil-500">{feature.description}</p>
                </div>
              )
            })}
          </div>

          {/* Community Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <h2 className="text-2xl font-bold text-center text-soil-800 mb-8">
              Our Texas Triangle Community
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-farm-green-800 mb-2">
                  <Users className="h-12 w-12 mx-auto mb-2" />
                </div>
                <p className="text-soil-500 font-semibold">Join Our Growing Network</p>
                <p className="text-sm text-soil-400 mt-2">Connect with farmers and food lovers</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-farm-green-800 mb-2">40+</div>
                <p className="text-soil-500 font-semibold">Texas Triangle Counties</p>
                <p className="text-sm text-soil-400 mt-2">DFW, Austin, San Antonio, Houston</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-farm-green-800 mb-2">
                  <Leaf className="h-12 w-12 mx-auto mb-2" />
                </div>
                <p className="text-soil-500 font-semibold">Hyperlocal Marketplace</p>
                <p className="text-sm text-soil-400 mt-2">Buy and sell locally grown</p>
              </div>
            </div>
          </div>

          {/* Why Join Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center text-soil-800 mb-8">
              Why Join Hey Farmer?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-sm border-2 border-warm-border hover:border-farm-green-300 transition-colors">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-farm-green-50 rounded-full">
                        <Icon className="h-8 w-8 text-farm-green-800" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-soil-800 text-center mb-2">{benefit.title}</h3>
                    <p className="text-soil-500 text-center text-sm">{benefit.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-r from-farm-green-800 to-farm-green-900 rounded-2xl shadow-xl p-8 text-white">
            <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Sign Up</h3>
                <p className="text-farm-green-100 text-sm">Create your profile as a farmer or food lover</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Connect</h3>
                <p className="text-farm-green-100 text-sm">Browse listings or post your produce</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Trade</h3>
                <p className="text-farm-green-100 text-sm">Buy, sell, or exchange locally</p>
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center mt-8">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-farm-green-800 rounded-lg font-semibold hover:bg-farm-green-50 transition-colors"
              >
                Join Our Community
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-soil-50 border-t border-warm-border py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <TomatoMark size={24} />
              <span className="text-soil-500">© 2024 Hey Farmer Texas Triangle</span>
            </div>
            <div className="flex gap-6">
              <Link href="/contact" className="text-soil-500 hover:text-soil-800">Contact</Link>
              <Link href="/terms" className="text-soil-500 hover:text-soil-800">Terms</Link>
              <Link href="/privacy" className="text-soil-500 hover:text-soil-800">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}