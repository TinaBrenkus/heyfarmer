'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowRight,
  CheckCircle,
  Users,
  ShoppingCart,
  MessageCircle,
  MapPin,
  Sprout,
  Heart,
  Star,
  Handshake
} from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import FarmLogo from '@/components/icons/FarmLogo'

const steps = [
  {
    step: 1,
    title: "Create Your Profile",
    description: "Tell Texas Triangle about your farm, what you grow, and your farming practices",
    icon: "👨‍🌾",
    details: [
      "Share your story and farming philosophy",
      "List what you grow (vegetables, fruits, herbs, livestock)",
      "Add photos of your farm and products",
      "Set your location to connect with nearby customers"
    ]
  },
  {
    step: 2,
    title: "List Your Products",
    description: "Post what you have available for sale directly to local food lovers",
    icon: "🥕",
    details: [
      "Create listings for fresh produce, eggs, meat, or value-added products",
      "Set your own prices and quantities",
      "Include harvest dates and growing methods",
      "Update availability in real-time"
    ]
  },
  {
    step: 3,
    title: "Connect with Customers",
    description: "Build direct relationships with people who value fresh, local food",
    icon: "🤝",
    details: [
      "Receive messages from interested buyers",
      "Answer questions about your products and practices",
      "Build a loyal customer base who knows your story",
      "Get reviews and build your reputation"
    ]
  },
  {
    step: 4,
    title: "Network with Other Farmers",
    description: "Share knowledge, resources, and support with the farming community",
    icon: "🌱",
    details: [
      "Connect with other growers in Texas Triangle",
      "Share equipment, seeds, and resources",
      "Ask for advice on growing challenges",
      "Collaborate on farmers markets and events"
    ]
  },
  {
    step: 5,
    title: "Grow Your Business",
    description: "Build a sustainable, profitable farming operation with direct sales",
    icon: "📈",
    details: [
      "Eliminate middleman fees - keep more profit",
      "Build relationships that lead to repeat customers",
      "Get feedback to improve your products",
      "Expand your reach beyond traditional markets"
    ]
  }
]

const benefits = [
  {
    icon: "💰",
    title: "Higher Profits",
    description: "Sell directly to consumers and keep 100% of your sale price"
  },
  {
    icon: "🎯",
    title: "Target Local Market",
    description: "Reach customers within 30 miles who want fresh, local food"
  },
  {
    icon: "⏰",
    title: "Flexible Selling",
    description: "List products when ready, update inventory anytime"
  },
  {
    icon: "🤝",
    title: "Build Relationships",
    description: "Create lasting connections with customers who value your work"
  },
  {
    icon: "📱",
    title: "Easy to Use",
    description: "Simple platform designed specifically for farmers"
  },
  {
    icon: "🌍",
    title: "Support Local Food",
    description: "Be part of the growing local food movement in Texas Triangle"
  }
]

const testimonials = [
  {
    name: "Sarah Johnson",
    farm: "Sunshine Acres",
    userType: "Market Gardener",
    quote: "Hey Farmer helped me connect with 50+ local families who now buy my vegetables weekly. I've doubled my income from direct sales!",
    location: "Denton County"
  },
  {
    name: "Mike Thompson", 
    farm: "Thompson Family Farm",
    userType: "Production Farmer",
    quote: "The platform made it so easy to sell our pastured eggs and meat directly to customers. No more worrying about farmers market setup!",
    location: "Collin County"
  },
  {
    name: "Lisa Chen",
    farm: "Green Thumb Gardens",
    userType: "Backyard Grower",
    quote: "I never thought my backyard garden could generate income. Now I sell my extra herbs and tomatoes to neighbors through Hey Farmer!",
    location: "Dallas County"
  }
]

export default function AboutPage() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="inline-block p-3 rounded-xl shadow-lg bg-green-600 hover:bg-green-700 transition-colors transform hover:scale-105">
            <FarmLogo size={36} className="text-white" />
          </Link>
        </div>

        {/* How It Works for Farmers */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Farmers Use Hey Farmer
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Follow these simple steps to start selling directly to local customers and growing your farming business.
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.step} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedStep(expandedStep === step.step ? null : step.step)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl">{step.icon}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                            Step {step.step}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-gray-600">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight 
                      className={`w-6 h-6 text-gray-400 transition-transform ${
                        expandedStep === step.step ? 'rotate-90' : ''
                      }`} 
                    />
                  </div>
                </div>
                
                {expandedStep === step.step && (
                  <div className="px-6 pb-6">
                    <div className="ml-22 border-l-2 border-green-100 pl-6">
                      <ul className="space-y-3">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Farmers Choose Hey Farmer
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join hundreds of Texas Triangle farmers who are building stronger, more profitable farming businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="text-3xl mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from local farmers who are thriving with Hey Farmer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">👨‍🌾</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.farm}</p>
                      <p className="text-xs text-gray-500">{testimonial.location} • {testimonial.userType}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Grow Your Farming Business?
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Join the Hey Farmer community and start selling directly to local customers today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started as a Farmer
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/marketplace"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Browse the Marketplace
              <ShoppingCart className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Questions? We're Here to Help
          </h3>
          <p className="text-gray-600 mb-6">
            Our team is dedicated to supporting Texas Triangle farmers succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:admin@heyfarmer.farm" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </a>
            <Link 
              href="/network"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Users className="w-5 h-5" />
              Join Farmer Network
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}