'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import FarmLogo from '@/components/icons/FarmLogo'

export default function TermsPage() {
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
          Terms of Service
        </h1>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Effective Date:</strong> January 1, 2024
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing and using Hey Farmer ("the Platform"), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our services.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Platform Description</h2>
          <p className="text-gray-700 mb-4">
            Hey Farmer is a free platform that connects farmers, market gardeners, backyard growers, and consumers 
            in North Texas. We provide a marketplace for direct sales and a network for the farming community.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. User Responsibilities</h2>
          <div className="text-gray-700 mb-4 space-y-2">
            <p>As a user of Hey Farmer, you agree to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide accurate and truthful information in your profile and listings</li>
              <li>Conduct all transactions honestly and in good faith</li>
              <li>Comply with all local, state, and federal laws regarding food sales</li>
              <li>Respect other users and maintain professional communication</li>
              <li>Not use the platform for any illegal or unauthorized purpose</li>
            </ul>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Marketplace Transactions</h2>
          <p className="text-gray-700 mb-4">
            Hey Farmer facilitates connections between buyers and sellers but is not a party to transactions. 
            Users are responsible for:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
            <li>Product quality, safety, and legal compliance</li>
            <li>Payment arrangements and fulfillment</li>
            <li>Resolving any disputes directly with other users</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Content Guidelines</h2>
          <p className="text-gray-700 mb-4">
            Users retain ownership of content they post but grant Hey Farmer a license to display it on the platform. 
            Prohibited content includes anything that is:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
            <li>False, misleading, or fraudulent</li>
            <li>Offensive, threatening, or harassing</li>
            <li>Violates any laws or regulations</li>
            <li>Infringes on intellectual property rights</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Privacy</h2>
          <p className="text-gray-700 mb-4">
            Your use of Hey Farmer is also governed by our <Link href="/privacy" className="text-green-600 hover:text-green-700 underline">Privacy Policy</Link>, 
            which describes how we collect, use, and protect your information.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            Hey Farmer is provided "as is" without warranties of any kind. We are not liable for any damages 
            arising from your use of the platform or transactions between users.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Account Termination</h2>
          <p className="text-gray-700 mb-4">
            We reserve the right to suspend or terminate accounts that violate these terms or engage in 
            fraudulent or harmful behavior.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Changes to Terms</h2>
          <p className="text-gray-700 mb-4">
            We may update these Terms of Service from time to time. Continued use of Hey Farmer after 
            changes constitutes acceptance of the new terms.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Contact Information</h2>
          <p className="text-gray-700 mb-4">
            For questions about these Terms of Service, please <Link href="/contact" className="text-green-600 hover:text-green-700 underline">contact us</Link>.
          </p>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Hey Farmer is committed to supporting the North Texas farming community and promoting 
              sustainable, local food systems.
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