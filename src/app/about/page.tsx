import Link from 'next/link'
import { ArrowRight, Heart, MapPin, Users, Sprout, Handshake } from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-soil-50 pb-20 md:pb-0">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-farm-green-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Real food. Real farmers. Real Texas.
          </h1>
          <p className="text-xl md:text-2xl text-farm-green-100 max-w-3xl mx-auto leading-relaxed mb-4">
            HeyFarmer is a free marketplace and private community connecting Texas Triangle farmers, market gardeners, and backyard growers directly with the people who want what they grow.
          </p>
          <p className="text-lg text-farm-green-200 max-w-2xl mx-auto mb-8">
            No middlemen. No commissions. No algorithm deciding who gets seen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-farm-green-800 rounded-lg font-bold text-lg hover:bg-farm-green-50 transition-colors"
            >
              Join as a Farmer
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-farm-green-800 transition-colors"
            >
              Find Local Food
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* What HeyFarmer Is */}
        <section className="bg-white rounded-lg shadow-sm p-8 md:p-10 mb-12">
          <h2 className="text-3xl font-bold text-soil-800 mb-6">
            What HeyFarmer Is
          </h2>
          <p className="text-lg text-farm-green-800 font-semibold mb-6">
            A marketplace built for the way Texas actually farms.
          </p>
          <div className="prose prose-lg max-w-none text-soil-700 space-y-6">
            <p>
              Most local food platforms are built for coasts and cities. HeyFarmer was built for the Texas Triangle — the 39-county region connecting Dallas-Fort Worth, Houston, San Antonio, and Austin — where farming looks like a half-acre market garden behind a ranch house, a backyard flock of hens, a cattle operation on generational land, or a high tunnel full of tomatoes coming in hot in April.
            </p>
            <p>
              We built HeyFarmer because that food deserves to be found. And those farmers deserve a place that works the way they do — simple, direct, and free.
            </p>
          </div>

          {/* Three audience blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="bg-farm-green-50 rounded-lg p-6 border border-warm-border">
              <div className="flex items-center gap-2 mb-3">
                <Sprout className="w-6 h-6 text-farm-green-800" />
                <h3 className="font-bold text-soil-800">For Farmers & Growers</h3>
              </div>
              <p className="text-sm text-soil-700 leading-relaxed">
                List your products, connect with buyers in your county, and join a private network where you can share surplus, swap advice, borrow equipment, trade seeds, and find help at harvest. No fees. No commissions. No corporate platform taking a cut of every transaction.
              </p>
            </div>
            <div className="bg-terra-50 rounded-lg p-6 border border-terra-100">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-6 h-6 text-terra-500" />
                <h3 className="font-bold text-soil-800">For Food Lovers & Families</h3>
              </div>
              <p className="text-sm text-soil-700 leading-relaxed">
                Find farmers, market gardeners, and backyard growers in your area. Buy directly. Know exactly where your food comes from and who grew it. Skip the middleman and keep your food dollars in your community.
              </p>
            </div>
            <div className="bg-terra-50 rounded-lg p-6 border border-terra-100">
              <div className="flex items-center gap-2 mb-3">
                <Handshake className="w-6 h-6 text-terra-600" />
                <h3 className="font-bold text-soil-800">For Partners & Organizations</h3>
              </div>
              <p className="text-sm text-soil-700 leading-relaxed">
                HeyFarmer serves one of the fastest-growing agricultural regions in the country. We&apos;re building the infrastructure that connects local food supply with local demand across 39 Texas counties — and we&apos;re looking for partners who share that mission.
              </p>
            </div>
          </div>
        </section>

        {/* The Numbers */}
        <section className="bg-farm-green-800 text-white rounded-lg shadow-sm p-8 md:p-10 mb-12">
          <h2 className="text-2xl font-bold text-center mb-2">The Texas Triangle by the numbers.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">39</div>
              <div className="text-farm-green-200 text-sm">Counties covered across the Texas Triangle</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">4</div>
              <div className="text-farm-green-200 text-sm">Major metros: DFW, Houston, San Antonio, Austin</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">M+</div>
              <div className="text-farm-green-200 text-sm">Families within driving distance of local farms</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">Free</div>
              <div className="text-farm-green-200 text-sm">Forever — for farmers, gardeners, and growers</div>
            </div>
          </div>
        </section>

        {/* What We Believe */}
        <section className="bg-white rounded-lg shadow-sm p-8 md:p-10 mb-12">
          <h2 className="text-3xl font-bold text-soil-800 mb-2">What We Believe</h2>
          <p className="text-lg text-farm-green-800 font-semibold mb-6">
            What we&apos;re building toward.
          </p>
          <div className="prose prose-lg max-w-none text-soil-700 space-y-6">
            <p>
              The distance between a farmer and the family who wants their food shouldn&apos;t be a logistics problem. It should be a conversation.
            </p>
            <p>
              We believe small-scale agriculture is one of the most important things happening in Texas right now — and that the people doing it deserve better tools, better connections, and a community that understands the work.
            </p>
            <p>
              We believe in direct relationships. Fair exchanges. And the idea that what starts as a backyard garden can become something that feeds a whole neighborhood.
            </p>
            <p className="font-semibold text-soil-800">
              HeyFarmer exists to make that easier.
            </p>
          </div>
        </section>

        {/* Founder Section */}
        <section className="bg-white rounded-lg shadow-sm p-8 md:p-10 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-8 h-8 text-red-500" />
            <h2 className="text-3xl font-bold text-soil-800">Why I built this.</h2>
          </div>
          <div className="prose prose-lg max-w-none text-soil-700 space-y-6">
            <p>
              Hey y&apos;all — I&apos;m Tina Brenkus, founder of HeyFarmer and a landowner in Wise County, Texas.
            </p>
            <p>
              I&apos;m reviving the garden my grandmother started on this land in 1950. I&apos;m working with the NRCS to get high tunnels up for a market garden. I provide land for my neighbors to run cattle. I know firsthand what it&apos;s like to have good food growing and no easy way to get it to the people who want it.
            </p>
            <p>
              I wanted a platform that felt like a community — not a corporation. Somewhere farmers could list what they grow, find buyers nearby, and connect with other growers without paying a fee or fighting an algorithm.
            </p>
            <p>
              I also wanted a private network — not Facebook, not a public forum — where farmers could share surplus, ask real questions, loan equipment, and help each other out the way Texas neighbors actually do.
            </p>
            <p className="font-semibold text-soil-800">
              HeyFarmer is that place. It&apos;s free. It&apos;s built for Texas. And it&apos;s just getting started.
            </p>
            <p className="italic text-soil-500">
              — Tina Brenkus, Wise County TX
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-farm-green-50 border-2 border-warm-border rounded-lg p-8 md:p-10 text-center">
          <h2 className="text-3xl font-bold text-soil-800 mb-4">
            Ready to be part of it?
          </h2>
          <div className="max-w-2xl mx-auto space-y-4 text-soil-700 mb-8">
            <p>
              <strong>Farmers and growers</strong> — join as a founding farmer. We&apos;ll help you build your profile and get your listings live. Free forever.
            </p>
            <p>
              <strong>Food lovers</strong> — sign up for early access and be the first to know when farmers in your county join the platform.
            </p>
            <p>
              <strong>Partners and organizations</strong> — reach out directly. We&apos;d love to talk.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-farm-green-800 text-white rounded-lg font-bold text-lg hover:bg-farm-green-800 transition-colors"
            >
              Join as a Founding Farmer
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-terra-400 text-terra-600 rounded-lg font-semibold hover:bg-terra-50 transition-colors"
            >
              Get Early Access
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-terra-400 text-terra-600 rounded-lg font-semibold hover:bg-terra-50 transition-colors"
            >
              Partner With Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
