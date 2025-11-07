'use client'

import Link from 'next/link'
import { ArrowLeft, Mail, MessageCircle, Users, MapPin, Clock, Phone } from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import FarmLogo from '@/components/icons/FarmLogo'

export default function ContactPage() {
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
          Contact Us
        </h1>

        {/* Contact Overview */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="text-center mb-8">
            <p className="text-lg text-gray-700 mb-4">
              Have questions about Hey Farmer? Need help getting started? We're here to support the Texas Triangle farming community.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
              <p className="text-green-800 font-semibold">
                📧 We typically respond within 24 hours
              </p>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
              <Mail className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 mb-3">Get help with your account, listings, or general questions</p>
              <a 
                href="mailto:admin@heyfarmer.farm" 
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                admin@heyfarmer.farm
              </a>
            </div>

            <div className="text-center p-6 bg-orange-50 rounded-lg border border-orange-200">
              <Users className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Farmer Support</h3>
              <p className="text-gray-600 mb-3">Dedicated assistance for farmers joining our platform</p>
              <a 
                href="mailto:admin@heyfarmer.farm" 
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
              >
                admin@heyfarmer.farm
              </a>
            </div>
          </div>

          {/* Office Hours */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-gray-600 mb-2">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Response Hours</span>
            </div>
            <p className="text-gray-700">
              Monday - Friday: 8:00 AM - 6:00 PM CST<br />
              Saturday: 9:00 AM - 3:00 PM CST<br />
              Sunday: Closed
            </p>
          </div>
        </div>

        {/* Common Questions */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">How do I get started selling on Hey Farmer?</h3>
              <p className="text-gray-700">
                <Link href="/signup" className="text-green-600 hover:text-green-700 underline">Sign up</Link> for 
                a farmer account, complete your profile, and start posting your products. We'll send you a welcome 
                guide with tips for success.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Is Hey Farmer really free to use?</h3>
              <p className="text-gray-700">
                Yes! Hey Farmer is completely free for farmers and consumers. We don't charge listing fees, 
                transaction fees, or subscription costs. Our mission is to support the local food community.
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Which areas does Hey Farmer serve?</h3>
              <p className="text-gray-700">
                We currently serve all of Texas Triangle, including Dallas, Tarrant, Collin, Denton, and surrounding 
                counties. If you're outside this area but interested, 
                <a href="mailto:weareheyfarmer@gmail.com" className="text-orange-600 hover:text-orange-700 underline"> contact us</a> 
                about future expansion.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">How do payments work?</h3>
              <p className="text-gray-700">
                Farmers and customers arrange payment directly - whether cash, check, Venmo, or other methods. 
                Hey Farmer facilitates the connection but doesn't process payments.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Can backyard growers sell on Hey Farmer?</h3>
              <p className="text-gray-700">
                Absolutely! We welcome everyone from large production farms to backyard gardeners with surplus 
                produce. All types of growers are part of our community.
              </p>
            </div>
          </div>
        </div>

        {/* Office Location */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Hey Farmer Headquarters
          </h2>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-gray-600 mb-4">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">Based in Texas Triangle</span>
            </div>
            <p className="text-gray-700 mb-4">
              Wise County, Texas<br />
              Serving the greater Texas Triangle region
            </p>
            <p className="text-sm text-gray-600">
              Founded by local farmers, for the farming community
            </p>
          </div>
        </div>

        {/* Contact Form Alternative */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-8 text-white text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Join Hey Farmer?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Don't wait - start connecting with the Texas Triangle farming community today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Today
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </Link>
            <Link 
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Learn How It Works
              <MessageCircle className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="text-center">
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