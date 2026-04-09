export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green-800 mx-auto"></div>
        <p className="mt-4 text-soil-500">Loading...</p>
      </div>
    </div>
  )
}
