'use client'

import { Suspense, ReactNode } from 'react'

export default function SearchParamsWrapper({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      {children}
    </Suspense>
  )
}
