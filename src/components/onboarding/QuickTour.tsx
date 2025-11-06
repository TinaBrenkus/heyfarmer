'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  X, 
  ArrowRight, 
  ShoppingCart, 
  Users, 
  Wrench, 
  MessageCircle,
  Plus,
  Search,
  MapPin,
  Calendar
} from 'lucide-react'
import { UserType } from '@/lib/database'

interface QuickTourProps {
  userType: UserType
  onComplete: () => void
  onSkip: () => void
}

interface TourStep {
  title: string
  description: string
  icon: React.ElementType
  action?: string
  highlight?: string
}

const tourSteps: Record<UserType, TourStep[]> = {
  consumer: [
    {
      title: 'Browse Fresh Produce',
      description: 'Discover seasonal fruits, vegetables, and artisanal products from local farmers',
      icon: ShoppingCart,
      action: 'Visit Marketplace',
      highlight: 'marketplace'
    },
    {
      title: 'Find Local Farmers',
      description: 'Connect directly with growers in your area and learn about their practices',
      icon: MapPin,
      action: 'Explore Map',
      highlight: 'farmers'
    },
    {
      title: 'Join the Community',
      description: 'Ask questions, share recipes, and get advice from experienced farmers',
      icon: MessageCircle,
      action: 'Start Chatting',
      highlight: 'community'
    }
  ],
  backyard_grower: [
    {
      title: 'Share Your Surplus',
      description: 'Got extra tomatoes or herbs? List them in the marketplace to share with neighbors',
      icon: ShoppingCart,
      action: 'Create Listing',
      highlight: 'sell'
    },
    {
      title: 'Connect with Growers',
      description: 'Network with other backyard gardeners and market farmers in North Texas',
      icon: Users,
      action: 'Join Network',
      highlight: 'network'
    },
    {
      title: 'Share & Borrow Tools',
      description: 'Need a rototiller? Have extra seeds? Connect with others to share resources',
      icon: Wrench,
      action: 'Browse Equipment',
      highlight: 'equipment'
    },
    {
      title: 'Get Expert Advice',
      description: 'Ask questions about growing, soil health, pest control, and more',
      icon: MessageCircle,
      action: 'Ask Community',
      highlight: 'advice'
    }
  ],
  market_gardener: [
    {
      title: 'List Your Products',
      description: 'Showcase your produce, set prices, and manage inventory for direct sales',
      icon: Plus,
      action: 'Create Listing',
      highlight: 'sell'
    },
    {
      title: 'Build Customer Base',
      description: 'Connect with local food lovers and restaurants looking for fresh ingredients',
      icon: Users,
      action: 'Find Customers',
      highlight: 'marketplace'
    },
    {
      title: 'Network with Farmers',
      description: 'Share knowledge, collaborate on events, and learn from other commercial growers',
      icon: MessageCircle,
      action: 'Join Network',
      highlight: 'network'
    },
    {
      title: 'Manage Your Business',
      description: 'Track sales, manage orders, and grow your local farming business',
      icon: Calendar,
      action: 'View Dashboard',
      highlight: 'dashboard'
    }
  ],
  production_farmer: [
    {
      title: 'Showcase Your Operation',
      description: 'Display your products, farming practices, and wholesale opportunities',
      icon: Plus,
      action: 'Create Profile',
      highlight: 'profile'
    },
    {
      title: 'Connect B2B & B2C',
      description: 'Reach both individual customers and restaurant/retail buyers',
      icon: Users,
      action: 'Find Buyers',
      highlight: 'marketplace'
    },
    {
      title: 'Share Equipment & Knowledge',
      description: 'Collaborate with other producers on equipment sharing and best practices',
      icon: Wrench,
      action: 'Network',
      highlight: 'network'
    },
    {
      title: 'Lead the Community',
      description: 'Mentor new farmers and share your expertise with the next generation',
      icon: MessageCircle,
      action: 'Mentor Others',
      highlight: 'community'
    }
  ]
}

export default function QuickTour({ userType, onComplete, onSkip }: QuickTourProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  
  const steps = tourSteps[userType]
  const currentStepData = steps[currentStep]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const completeTour = () => {
    setIsVisible(false)
    setTimeout(() => {
      onComplete()
      router.push('/dashboard')
    }, 300)
  }

  const skipTour = () => {
    setIsVisible(false)
    setTimeout(() => {
      onSkip()
      router.push('/dashboard')
    }, 300)
  }

  const handleAction = () => {
    // Close the tour modal without navigating
    setIsVisible(false)
    
    // Navigate to specific page based on action after a short delay
    setTimeout(() => {
      onComplete()
      switch (currentStepData.highlight) {
      case 'marketplace':
        router.push('/marketplace')
        break
      case 'farmers':
        router.push('/network')  // Take them to network page to find farmers
        break
      case 'community':
        router.push('/network')  // Community discussions are in network
        break
      case 'sell':
        router.push('/sell')
        break
      case 'network':
        router.push('/network')
        break
      case 'equipment':
        router.push('/marketplace?category=equipment')  // Equipment in marketplace
        break
      case 'advice':
        router.push('/network')  // Advice through network discussions
        break
      case 'dashboard':
        router.push('/dashboard')
        break
      case 'profile':
        router.push('/settings')  // Profile settings
        break
      default:
        router.push('/dashboard')
      }
    }, 300)
  }

  if (!isVisible) return null

  const Icon = currentStepData.icon

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div 
        className={`bg-white rounded-lg shadow-2xl max-w-md w-full transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="relative p-6 text-center border-b border-gray-100">
          <button
            onClick={skipTour}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            You're In!
          </h2>
          <p className="text-gray-600">
            Here's what you can do:
          </p>
        </div>

        {/* Current Step */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-green-50">
              <Icon className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {currentStepData.description}
              </p>
            </div>
          </div>

          {/* Action Button */}
          {currentStepData.action && (
            <button
              onClick={handleAction}
              className="w-full mb-4 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              {currentStepData.action}
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="px-6 pb-6">
          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-green-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={skipTour}
              className="flex-1 py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip Tour
            </button>
            <button
              onClick={nextStep}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Step Counter */}
          <div className="text-center mt-4 text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length} • ~2 min
          </div>
        </div>
      </div>
    </div>
  )
}

// Welcome Tour for showing all features at once
export function WelcomeTour({ userType, onComplete, onSkip }: QuickTourProps) {
  const steps = tourSteps[userType]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="relative p-6 text-center border-b border-gray-100">
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            You're In!
          </h2>
          <p className="text-gray-600">
            Here's what you can do:
          </p>
        </div>

        {/* All Features */}
        <div className="p-6 space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="flex items-start gap-3">
                <div className="text-xl">{
                  step.icon === ShoppingCart ? '🛒' :
                  step.icon === Users ? '👥' :
                  step.icon === Wrench ? '🔧' :
                  step.icon === MessageCircle ? '💬' :
                  step.icon === Plus ? '➕' :
                  step.icon === Search ? '🔍' :
                  step.icon === MapPin ? '📍' :
                  step.icon === Calendar ? '📅' : '✨'
                }</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{step.title}</h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6">
          <button
            onClick={onComplete}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            Get Started
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}