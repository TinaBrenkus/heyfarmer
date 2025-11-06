'use client'

import Link from 'next/link'
import { ArrowRight, Heart, Users, Sprout } from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import FarmLogo from '@/components/icons/FarmLogo'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Link href="/" className="inline-block p-4 rounded-xl shadow-lg bg-green-600 hover:bg-green-700 transition-colors transform hover:scale-105">
              <FarmLogo size={48} className="text-white" />
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About Hey Farmer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            The story behind connecting North Texas farmers with their communities
          </p>
        </div>

        {/* Your Story Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-8 h-8 text-red-500" />
            <h2 className="text-3xl font-bold text-gray-900">My Story</h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-lg leading-relaxed">
              Hey y'all, I'm Tina Brenkus and I'm a landowner in Wise County, TX and the founder of Hey Farmer.
            </p>
            
            <p className="text-lg leading-relaxed">
              I'm gardening on generational land, reviving the original garden my grandmother started in 1950. 
              And I'm providing land for my neighbors to grow and raise beautiful and healthy cattle.
            </p>
            
            <p className="text-lg leading-relaxed font-semibold">
              My MAIN MISSION for Hey Farmer is to provide a safe and free place for farmers, market gardeners 
              and backyard growers in North Texas to network with each other. With the added bonus of selling 
              directly to consumers in their local markets.
            </p>
            
            <p className="text-lg leading-relaxed">
              I wanted a community platform like Craigslist that makes it easy and free to promote and sell for farmers.
            </p>
            
            <p className="text-lg leading-relaxed">
              I also wanted a private network, that is NOT Facebook, where farmers can share surplus, advice, 
              loan or rent equipment, help with harvests, trade and teach.
            </p>
            
            <p className="text-lg leading-relaxed">
              Selfishly I wanted to meet more people in my community because I know I'll be a better gardener 
              and business owner. I hope you'll agree.
            </p>
            
            <p className="text-lg leading-relaxed italic">
              The nature of growing food, raising animals and gardening is communal.
            </p>
            
            <p className="text-lg leading-relaxed">
              What starts as a backyard project becomes a half acre food operation, turned market garden and 
              potentially a full grown farm.
            </p>
            
            <p className="text-lg leading-relaxed">
              I want to hear from you. Feel free to send me a message, ask questions or point out pain points 
              with the platform.
            </p>
            
            <p className="text-lg leading-relaxed font-semibold">
              And please tell your friends, family, fellow farmers and customers to join Hey Farmer.
            </p>
          </div>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#2E7D32' }}>
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To strengthen North Texas communities by connecting local farmers directly with food lovers, 
              creating a sustainable ecosystem where farmers thrive and families have access to fresh, 
              locally-grown food.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#1976D2' }}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              A North Texas where every community has direct access to local farmers, where small-scale 
              agriculture flourishes, and where the connection between grower and consumer strengthens 
              our local food system.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">What We Believe In</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 p-4 rounded-full" style={{ backgroundColor: '#FFA726' }}>
                <span className="text-2xl">🤝</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Fair Relationships</h4>
              <p className="text-sm text-gray-600">
                Direct connections that benefit both farmers and consumers
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 p-4 rounded-full" style={{ backgroundColor: '#2E7D32' }}>
                <span className="text-2xl">🌱</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Sustainable Growth</h4>
              <p className="text-sm text-gray-600">
                Supporting practices that nurture our land and communities
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 p-4 rounded-full" style={{ backgroundColor: '#1976D2' }}>
                <span className="text-2xl">🏡</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Local Community</h4>
              <p className="text-sm text-gray-600">
                Strengthening bonds within North Texas neighborhoods
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Join Our Community?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Whether you're a farmer looking to connect with local customers or a food lover seeking fresh, 
            local produce, Hey Farmer is here to bring our community together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Join the Community
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-orange-400 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
            >
              Learn How It Works
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}