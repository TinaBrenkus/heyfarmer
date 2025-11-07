'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Eye, Database } from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import FarmLogo from '@/components/icons/FarmLogo'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="inline-block p-3 rounded-xl shadow-lg bg-green-600 hover:bg-green-700 transition-colors transform hover:scale-105">
            <FarmLogo size={36} className="text-white" />
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-8">
          Privacy Policy
        </h1>

        {/* Privacy Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <Shield className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Your Data is Safe</h3>
            <p className="text-sm text-gray-600">We never sell your personal information to third parties</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <Lock className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Secure Platform</h3>
            <p className="text-sm text-gray-600">Industry-standard security to protect your information</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <Eye className="w-12 h-12 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">You Control Privacy</h3>
            <p className="text-sm text-gray-600">Choose what information to share with the community</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Effective Date:</strong> January 1, 2024
          </p>

          <p className="text-gray-700 mb-6">
            Hey Farmer is committed to protecting your privacy. This Privacy Policy explains how we collect, 
            use, and safeguard your information when you use our platform.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          
          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Information You Provide:</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
            <li>Account information (name, email, password)</li>
            <li>Profile details (farm name, location, bio, profile photo)</li>
            <li>Listing information (products, prices, descriptions)</li>
            <li>Communications with other users through our platform</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Information Collected Automatically:</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
            <li>Usage data (pages visited, features used)</li>
            <li>Device information (browser type, operating system)</li>
            <li>Location data (with your permission)</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">We use your information to:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
            <li>Provide and improve Hey Farmer services</li>
            <li>Connect farmers with consumers in Texas Triangle</li>
            <li>Facilitate communication between users</li>
            <li>Send important platform updates and notifications</li>
            <li>Ensure platform safety and prevent fraud</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Information Sharing</h2>
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p className="text-gray-700 font-semibold mb-2">🛡️ Our Promise:</p>
            <p className="text-gray-700">
              We will NEVER sell your personal information to third parties. Your data is not for sale.
            </p>
          </div>
          
          <p className="text-gray-700 mb-4">We share information only:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
            <li>With other Hey Farmer users as you choose (public profile, listings)</li>
            <li>With service providers who help operate our platform (hosting, email)</li>
            <li>When required by law or to protect rights and safety</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Your Privacy Controls</h2>
          <p className="text-gray-700 mb-4">You have control over your information:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
            <li>Choose what appears on your public profile</li>
            <li>Control who can contact you through the platform</li>
            <li>Update or delete your information at any time</li>
            <li>Request a copy of your data</li>
            <li>Delete your account and all associated data</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement industry-standard security measures to protect your information, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
            <li>Encrypted data transmission (HTTPS)</li>
            <li>Secure password storage</li>
            <li>Regular security audits</li>
            <li>Limited access to personal information</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Children's Privacy</h2>
          <p className="text-gray-700 mb-4">
            Hey Farmer is not intended for users under 18 years old. We do not knowingly collect 
            information from children under 18.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Cookies</h2>
          <p className="text-gray-700 mb-4">
            We use cookies to improve your experience, remember your preferences, and understand how 
            you use our platform. You can control cookie settings in your browser.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Changes to Privacy Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this Privacy Policy from time to time. We'll notify you of significant changes 
            via email or platform notification.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            Questions about our Privacy Policy? <Link href="/contact" className="text-green-600 hover:text-green-700 underline">Contact us</Link> anytime. 
            We're here to help and take your privacy concerns seriously.
          </p>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Hey Farmer respects your privacy and is committed to protecting the Texas Triangle farming community.
            </p>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="text-center mt-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}