'use client'

import Link from 'next/link'
import { Heart, ArrowRight } from 'lucide-react'

interface ClaimCTAProps {
  farmName: string
  farmSlug: string
}

export default function ClaimCTA({ farmName, farmSlug }: ClaimCTAProps) {
  return (
    <div className="bg-gradient-to-r from-farm-green-50 to-orange-50 border-2 border-warm-border rounded-xl p-6 md:p-8">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-farm-green-100 rounded-full flex-shrink-0">
          <Heart className="h-6 w-6 text-farm-green-800" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-soil-800 mb-2">
            Is this your farm?
          </h3>
          <p className="text-soil-500 mb-4">
            We featured <span className="font-medium text-farm-green-800">{farmName}</span> because
            we think you&apos;re doing great work for the Texas farming community. Claim your listing
            to manage your page, connect with local buyers, and join our growing network.
          </p>
          <Link
            href={`/claim/${farmSlug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-farm-green-800 text-white rounded-lg font-medium hover:bg-farm-green-800 transition-colors"
          >
            Claim This Farm
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
