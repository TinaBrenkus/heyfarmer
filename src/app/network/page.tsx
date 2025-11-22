'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus } from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import TabNavigation from '@/components/ui/TabNavigation'
import DiscussionsTab from '@/components/network/DiscussionsTab'
import FromTheFieldTab from '@/components/network/FromTheFieldTab'
import ResourceLibraryTab from '@/components/network/ResourceLibraryTab'
import NewsletterArchiveTab from '@/components/network/NewsletterArchiveTab'
import { supabase } from '@/lib/supabase'

export default function FarmerNetworkPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('discussions')
  const [isAdmin, setIsAdmin] = useState(false)

  // Demo mode for showing placeholder content to potential partners
  const isDemoMode = searchParams.get('demo') === 'true'

  useEffect(() => {
    checkAuth()
    initializeTabFromHash()
  }, [])

  useEffect(() => {
    // Listen for hash changes to update active tab
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash && tabs.some(tab => tab.hash === hash)) {
        setActiveTab(hash)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const initializeTabFromHash = () => {
    const hash = window.location.hash.replace('#', '')
    if (hash) {
      const validHashes = ['discussions', 'from-the-field', 'resources', 'newsletter']
      if (validHashes.includes(hash)) {
        setActiveTab(hash)
      }
    }
  }

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // Check if user is a farmer and if they're an admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type, is_verified')
      .eq('id', user.id)
      .single()

    if (profile?.user_type === 'consumer') {
      router.push('/dashboard')
      return
    }

    // Check if user is admin (verified production farmer)
    const isUserAdmin = profile?.user_type === 'production_farmer' && profile?.is_verified === true
    setIsAdmin(isUserAdmin)

    setLoading(false)
  }

  const tabs = [
    { id: 'discussions', label: 'Discussions', hash: 'discussions' },
    { id: 'from-the-field', label: 'From the Field', hash: 'from-the-field' },
    { id: 'resources', label: 'Resource Library', hash: 'resources' },
    { id: 'newsletter', label: 'Newsletter Archive', hash: 'newsletter' }
  ]

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    // Update URL hash without page reload
    window.history.pushState(null, '', `#${tabId}`)
  }

  const handleCreateArticle = () => {
    // TODO: Navigate to article creation page or open modal
    router.push('/network/new-article')
  }

  const handleAddResource = () => {
    // TODO: Navigate to resource creation page or open modal
    router.push('/network/new-resource')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading network...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <span className="text-4xl">👥</span>
              Farmer Network
            </h1>
            <p className="text-gray-600">Connect, share knowledge, and grow together</p>
          </div>
          {activeTab === 'discussions' && (
            <button
              onClick={() => router.push('/network/new-discussion')}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              New Discussion
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onChange={handleTabChange}
        />

        {/* Tab Content */}
        <div>
          {activeTab === 'discussions' && (
            <DiscussionsTab isDemoMode={isDemoMode} />
          )}
          {activeTab === 'from-the-field' && (
            <FromTheFieldTab
              isAdmin={isAdmin}
              onCreateArticle={handleCreateArticle}
            />
          )}
          {activeTab === 'resources' && (
            <ResourceLibraryTab
              isAdmin={isAdmin}
              onAddResource={handleAddResource}
            />
          )}
          {activeTab === 'newsletter' && (
            <NewsletterArchiveTab />
          )}
        </div>
      </main>
    </div>
  )
}
