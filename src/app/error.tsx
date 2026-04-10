'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import TomatoMark from '@/components/icons/TomatoMark'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-soil-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <TomatoMark size={48} />
        </div>
        <h1 className="text-2xl font-bold text-soil-800 mb-3">
          Something went wrong
        </h1>
        <p className="text-soil-500 mb-6">
          We hit a bump in the road. This has been logged and we&apos;ll look into it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-farm-green-800 text-white rounded-lg font-medium hover:bg-farm-green-900 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-warm-border text-soil-700 rounded-lg font-medium hover:bg-soil-100 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
