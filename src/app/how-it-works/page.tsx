'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Users, ShoppingCart, MessageCircle, MapPin, Sprout } from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import FarmLogo from '@/components/icons/FarmLogo'
import { ChatCircle, Clock, CurrencyDollar, DeviceMobile, Globe, Handshake, Heart, MagnifyingGlass, Person, Plant, Target, TrendUp } from '@phosphor-icons/react'

const steps = [
  {
    step: 1,
    title: "Create Your Profile",
    description: "Tell Texas Triangle about your farm, what you grow, and your farming practices",
    icon: 'Person',
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
    icon: 'Plant',
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
    icon: 'Handshake',
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
    icon: 'Plant',
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
    icon: 'TrendUp',
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
    icon: 'CurrencyDollar',
    title: "Higher Profits",
    description: "Sell directly to consumers and keep 100% of your sale price"
  },
  {
    icon: 'Target',
    title: "Target Local Market",
    description: "Reach customers within 30 miles who want fresh, local food"
  },
  {
    icon: 'Clock',
    title: "Flexible Selling",
    description: "List products when ready, update inventory anytime"
  },
  {
    icon: 'Handshake',
    title: "Build Relationships",
    description: "Create lasting connections with customers who value your work"
  },
  {
    icon: 'DeviceMobile',
    title: "Easy to Use",
    description: "Simple platform designed specifically for farmers"
  },
  {
    icon: 'Globe',
    title: "Support Local Food",
    description: "Be part of the growing local food movement in Texas Triangle"
  }
]


export default function AboutPage() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-soil-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="inline-block p-3 rounded-xl shadow-lg bg-farm-green-800 hover:bg-farm-green-800 transition-colors transform hover:scale-105">
            <FarmLogo size={36} className="text-white" />
          </Link>
        </div>

        {/* How It Works for Farmers */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-soil-800 mb-4">
              How Farmers Use Hey Farmer
            </h2>
            <p className="text-lg text-soil-500 max-w-2xl mx-auto">
              Follow these simple steps to start selling directly to local customers and growing your farming business.
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.step} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div 
                  className="p-6 cursor-pointer hover:bg-soil-50 transition-colors"
                  onClick={() => setExpandedStep(expandedStep === step.step ? null : step.step)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-farm-green-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl">{step.icon}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-semibold text-farm-green-800 bg-farm-green-100 px-3 py-1 rounded-full">
                            Step {step.step}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-soil-800 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-soil-500">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight 
                      className={`w-6 h-6 text-soil-400 transition-transform ${
                        expandedStep === step.step ? 'rotate-90' : ''
                      }`} 
                    />
                  </div>
                </div>
                
                {expandedStep === step.step && (
                  <div className="px-6 pb-6">
                    <div className="ml-22 border-l-2 border-warm-border pl-6">
                      <ul className="space-y-3">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-farm-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-soil-700">{detail}</span>
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

        {/* How Food Lovers Use Hey Farmer */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-soil-800 mb-4">
              How Food Lovers Use Hey Farmer
            </h2>
            <p className="text-lg text-soil-500 max-w-2xl mx-auto">
              Find real food from real farmers in your community — it starts with a simple browse.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-terra-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MagnifyingGlass size={24} weight="regular" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-terra-600 bg-terra-100 px-3 py-1 rounded-full">
                    Step 1
                  </span>
                  <h3 className="text-xl font-semibold text-soil-800 mt-2">Browse Local Farms</h3>
                </div>
              </div>
              <p className="text-soil-500">
                Find farmers, market gardeners, and growers in your county — no sign up required.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-terra-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Plant size={24} weight="regular" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-terra-600 bg-terra-100 px-3 py-1 rounded-full">
                    Step 2
                  </span>
                  <h3 className="text-xl font-semibold text-soil-800 mt-2">See What&apos;s Available</h3>
                </div>
              </div>
              <p className="text-soil-500">
                Browse listings updated directly by farmers when they have product ready.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-terra-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ChatCircle size={24} weight="regular" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-terra-600 bg-terra-100 px-3 py-1 rounded-full">
                    Step 3
                  </span>
                  <h3 className="text-xl font-semibold text-soil-800 mt-2">Connect Directly</h3>
                </div>
              </div>
              <p className="text-soil-500">
                Create a free account to reach out to farmers and arrange pickup, delivery, or farm visits.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-terra-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart size={24} weight="regular" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-terra-600 bg-terra-100 px-3 py-1 rounded-full">
                    Step 4
                  </span>
                  <h3 className="text-xl font-semibold text-soil-800 mt-2">Build a Relationship</h3>
                </div>
              </div>
              <p className="text-soil-500">
                Become a regular customer and know exactly where your food comes from and who grew it.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-soil-800 mb-4">
              Why Farmers Choose Hey Farmer
            </h2>
            <p className="text-lg text-soil-500 max-w-2xl mx-auto">
              Built for the full spectrum of Texas growers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="text-3xl mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-semibold text-soil-800 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-soil-500">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-12">
          <div className="text-center py-10 bg-farm-green-50 rounded-lg border border-warm-border">
            <Sprout className="w-10 h-10 text-farm-green-800 mx-auto mb-4" />
            <p className="text-xl text-soil-800 max-w-2xl mx-auto mb-6 px-4">
              HeyFarmer is just getting started. Be one of the first farmers to build your profile and help shape what this becomes.
            </p>
            <Link
              href="/founding-farmers"
              className="inline-flex items-center gap-2 px-8 py-3 bg-farm-green-800 text-white rounded-lg font-semibold hover:bg-farm-green-800 transition-colors"
            >
              Become a Founding Farmer
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-farm-green-800 to-farm-green-900 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to be part of what&apos;s growing?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Founding farmers join free and help shape the platform from day one.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/farmers"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-farm-green-800 transition-colors"
            >
              Browse Farmers
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-farm-green-800 rounded-lg font-semibold hover:bg-soil-100 transition-colors"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/founding-farmers"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-farm-green-800 transition-colors"
            >
              Become a Founding Farmer
            </Link>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-soil-800 mb-4">
            Questions? We're Here to Help
          </h3>
          <p className="text-soil-500 mb-6">
            Our team is dedicated to supporting Texas Triangle farmers succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:admin@heyfarmer.farm" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-soil-100 text-soil-700 rounded-lg hover:bg-soil-200 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </a>
            <Link 
              href="/network"
              className="inline-flex items-center gap-2 px-6 py-3 bg-soil-100 text-soil-700 rounded-lg hover:bg-soil-200 transition-colors"
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