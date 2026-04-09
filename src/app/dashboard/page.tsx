import { Suspense } from 'react'
import DashboardClient from './DashboardClient'

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green-800 mx-auto"></div>
          <p className="mt-4 text-soil-500">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardClient />
    </Suspense>
  )
}
