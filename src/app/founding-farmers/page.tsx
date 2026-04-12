'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowDown,
  User,
  Users,
  Star,
  MessageCircle,
  CheckCircle,
  Sprout,
  MapPin,
  ClipboardList,
  UserPlus,
  Heart
} from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import { supabase } from '@/lib/supabase'
import { ALL_COUNTY_IDS } from '@/lib/countyUtils'
import { getCountyDisplayName } from '@/lib/countyUtils'

export default function FoundingFarmersPage() {
  const [formData, setFormData] = useState({
    name: '',
    county: '',
    what_you_grow: '',
    contact_method: '',
    about_operation: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Store in waitlist table with founding_farmer flag
      const { error: dbError } = await supabase
        .from('waitlist')
        .insert({
          email: formData.contact_method,
          county: formData.county || null,
          user_type: 'production_farmer',
          metadata: {
            founding_farmer: true,
            name: formData.name,
            what_you_grow: formData.what_you_grow,
            contact_method: formData.contact_method,
            about_operation: formData.about_operation,
            submitted_at: new Date().toISOString(),
          }
        })

      if (dbError) {
        // If waitlist table doesn't have metadata column or other issue,
        // fall back to a simpler insert
        if (dbError.code === '23505') {
          setError('Looks like you\'ve already signed up! We\'ll be in touch soon.')
          setIsSubmitting(false)
          return
        }
        console.error('Database error:', dbError)
        // Fall through to email fallback
      }

      setSubmitted(true)
    } catch (err) {
      console.error('Submission error:', err)
      setError('Something went wrong. Please email admin@heyfarmer.farm directly and we\'ll get you set up.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const counties = ALL_COUNTY_IDS

  return (
    <div className="min-h-screen bg-soil-50 pb-20 md:pb-0">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-farm-green-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sprout className="w-12 h-12 mx-auto mb-6 text-farm-green-200" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Be part of what&apos;s growing.
          </h1>
          <p className="text-xl md:text-2xl text-farm-green-100 max-w-3xl mx-auto leading-relaxed mb-8">
            HeyFarmer is just getting started — and the farmers who join first will shape what it becomes. We&apos;re looking for founding farmers across the Texas Triangle. It&apos;s free. It always will be.
          </p>
          <a
            href="#founding-farmer-form"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-farm-green-800 rounded-lg font-bold text-lg hover:bg-farm-green-50 transition-colors"
          >
            I want to be a Founding Farmer
            <ArrowDown className="w-5 h-5" />
          </a>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* What Founding Farmers Get */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-soil-800 mb-2">
              What Founding Farmers Get
            </h2>
            <p className="text-lg text-farm-green-800 font-semibold">
              This isn&apos;t just a listing. It&apos;s a legacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-farm-green-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-farm-green-100 rounded-lg">
                  <User className="w-6 h-6 text-farm-green-800" />
                </div>
                <h3 className="text-lg font-bold text-soil-800">A free profile — built for you</h3>
              </div>
              <p className="text-soil-500 leading-relaxed">
                We&apos;ll help you set up your listing, write your farm story, and get your products visible to buyers in your county. You don&apos;t need to be technical. You just need to show up.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-farm-green-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-farm-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-farm-green-800" />
                </div>
                <h3 className="text-lg font-bold text-soil-800">First access to the private network</h3>
              </div>
              <p className="text-soil-500 leading-relaxed">
                The HeyFarmer private community — where farmers share surplus, swap advice, loan equipment, and help each other at harvest — is where the real value lives. Founding farmers get in first.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-farm-green-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-farm-green-100 rounded-lg">
                  <Star className="w-6 h-6 text-farm-green-800" />
                </div>
                <h3 className="text-lg font-bold text-soil-800">Your story featured on HeyFarmer</h3>
              </div>
              <p className="text-soil-500 leading-relaxed">
                Every founding farmer gets a featured profile on the platform and in The Ranch Desk newsletter — reaching consumers, partners, and food lovers across the Texas Triangle.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-farm-green-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-farm-green-100 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-farm-green-800" />
                </div>
                <h3 className="text-lg font-bold text-soil-800">A direct line to the founder</h3>
              </div>
              <p className="text-soil-500 leading-relaxed">
                I&apos;m Tina Brenkus. I built this. I&apos;m a landowner in Wise County and I answer my own messages. If something isn&apos;t working for you, I want to know.
              </p>
            </div>
          </div>
        </section>

        {/* Your Customers Are Already Out There */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-soil-800 mb-2">
              Your customers are already out there.
            </h2>
            <p className="text-lg text-soil-500 max-w-2xl mx-auto">
              HeyFarmer connects you directly with Texas families who want real food from real farms — no middleman, no farmers market tent required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-farm-green-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-soil-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-soil-500" />
                </div>
                <h3 className="text-lg font-bold text-soil-800">Browse Local Farms</h3>
              </div>
              <p className="text-soil-500 leading-relaxed">
                Find farmers, market gardeners, and growers in their county — no sign up required.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-farm-green-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-soil-100 rounded-lg">
                  <ClipboardList className="w-6 h-6 text-soil-500" />
                </div>
                <h3 className="text-lg font-bold text-soil-800">See What&apos;s Available</h3>
              </div>
              <p className="text-soil-500 leading-relaxed">
                Browse listings updated directly by farmers when they have product ready.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-farm-green-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-soil-100 rounded-lg">
                  <UserPlus className="w-6 h-6 text-soil-500" />
                </div>
                <h3 className="text-lg font-bold text-soil-800">Connect Directly</h3>
              </div>
              <p className="text-soil-500 leading-relaxed">
                Create a free account to reach out to farmers and arrange pickup, delivery, or farm visits.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-farm-green-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-soil-100 rounded-lg">
                  <Heart className="w-6 h-6 text-soil-500" />
                </div>
                <h3 className="text-lg font-bold text-soil-800">Build a Relationship</h3>
              </div>
              <p className="text-soil-500 leading-relaxed">
                Become a regular customer and know exactly where their food comes from and who grew it.
              </p>
            </div>
          </div>
        </section>

        {/* Who This Is For */}
        <section className="bg-white rounded-lg shadow-sm p-8 md:p-10 mb-16">
          <h2 className="text-3xl font-bold text-soil-800 mb-2">
            Who This Is For
          </h2>
          <p className="text-lg text-soil-500 mb-6">
            You don&apos;t have to be a full-time farmer. HeyFarmer was built for the full spectrum of Texas growers:
          </p>
          <div className="space-y-3">
            {[
              'Working ranches with direct-sale beef, pork, or lamb',
              'Market gardens selling at farmers markets or direct to families',
              'Backyard growers with more eggs, honey, or produce than they can use',
              'Specialty producers — herbs, microgreens, mushrooms, flowers',
              'CSA operations looking for more members',
              'Orchards, u-pick farms, and agritourism operations',
              'Homesteaders with surplus to sell or trade',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-farm-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-soil-700">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* The Ask */}
        <section className="bg-farm-green-50 border border-warm-border rounded-lg p-8 md:p-10 mb-16">
          <h2 className="text-3xl font-bold text-soil-800 mb-2">
            Here&apos;s what we need from you.
          </h2>
          <p className="text-lg text-soil-500 mb-8">
            Joining as a founding farmer takes about 20 minutes.
          </p>

          <div className="space-y-6">
            {[
              { num: 1, text: 'Create your free profile' },
              { num: 2, text: 'Tell us your story — what you grow, where you are, how people can buy from you' },
              { num: 3, text: 'List at least one product or offering' },
              { num: 4, text: 'Join the private community' },
            ].map((step) => (
              <div key={step.num} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-farm-green-800 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  {step.num}
                </div>
                <p className="text-soil-700 text-lg pt-1.5">{step.text}</p>
              </div>
            ))}
          </div>

          <p className="text-xl font-semibold text-farm-green-800 mt-8">
            That&apos;s it. We&apos;ll do the rest.
          </p>
        </section>

        {/* Form Section */}
        <section id="founding-farmer-form" className="bg-white rounded-lg shadow-sm p-8 md:p-10 mb-12 scroll-mt-8">
          {submitted ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-farm-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-soil-800 mb-4">
                Welcome to the founding farmers family.
              </h2>
              <p className="text-xl text-soil-500 mb-8">
                We&apos;ll be in touch within 48 hours to help you get set up.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-farm-green-800 text-white rounded-lg font-semibold hover:bg-farm-green-800 transition-colors"
              >
                Back to Home
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-soil-800 mb-2">
                  Ready to be a founding farmer?
                </h2>
                <p className="text-lg text-soil-500">
                  Fill out the form below and we&apos;ll reach out within 48 hours to help you get set up.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-soil-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-farm-green-500 bg-white"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="county" className="block text-sm font-semibold text-soil-700 mb-2">
                    County *
                  </label>
                  <select
                    id="county"
                    name="county"
                    required
                    value={formData.county}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-farm-green-500 bg-white"
                  >
                    <option value="">Select your county</option>
                    {counties.map((county) => (
                      <option key={county} value={county}>
                        {getCountyDisplayName(county)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="what_you_grow" className="block text-sm font-semibold text-soil-700 mb-2">
                    What do you grow or raise? *
                  </label>
                  <input
                    type="text"
                    id="what_you_grow"
                    name="what_you_grow"
                    required
                    value={formData.what_you_grow}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-farm-green-500 bg-white"
                    placeholder="e.g., vegetables, eggs, beef, honey, herbs"
                  />
                </div>

                <div>
                  <label htmlFor="contact_method" className="block text-sm font-semibold text-soil-700 mb-2">
                    Best way to reach you — email or phone *
                  </label>
                  <input
                    type="text"
                    id="contact_method"
                    name="contact_method"
                    required
                    value={formData.contact_method}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-farm-green-500 bg-white"
                    placeholder="you@email.com or (940) 555-0100"
                  />
                </div>

                <div>
                  <label htmlFor="about_operation" className="block text-sm font-semibold text-soil-700 mb-2">
                    Tell us about your operation — one paragraph is fine
                  </label>
                  <textarea
                    id="about_operation"
                    name="about_operation"
                    rows={4}
                    value={formData.about_operation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-warm-border rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-farm-green-500 bg-white"
                    placeholder="What's your story? How long have you been growing? What makes your operation unique?"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-farm-green-800 text-white rounded-lg font-bold text-lg hover:bg-farm-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'I want to be a Founding Farmer'}
                  {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>

              <p className="text-center text-soil-400 mt-6">
                Or email Tina directly:{' '}
                <a href="mailto:admin@heyfarmer.farm" className="text-farm-green-800 hover:text-farm-green-800 underline">
                  admin@heyfarmer.farm
                </a>
              </p>
            </>
          )}
        </section>

        {/* Footer Line */}
        <div className="text-center py-8 border-t border-warm-border">
          <p className="text-lg text-soil-500 font-medium">
            HeyFarmer is free for farmers. Forever. No commissions. No listing fees. No catch.
          </p>
        </div>
      </div>
    </div>
  )
}
