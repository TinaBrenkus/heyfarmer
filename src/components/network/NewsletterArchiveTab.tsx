'use client'

import { useState, useEffect } from 'react'
import { Search, Calendar, Mail, ChevronRight, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Newsletter {
  id: string
  issue_number: number
  title: string
  published_date: string
  preview_bullets: string[]
  beehiiv_url: string | null
  tags: string[]
  view_count: number
}

export default function NewsletterArchiveTab() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const filters = [
    { id: 'all', label: 'All' },
    { id: '2025', label: '2025' },
    { id: '2024', label: '2024' },
    { id: 'market-intel', label: 'Market Intel' },
    { id: 'resources', label: 'Resources' },
    { id: 'community', label: 'Community' }
  ]

  useEffect(() => {
    fetchNewsletters()
  }, [])

  const fetchNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .eq('is_published', true)
        .order('issue_number', { ascending: false })

      if (error) throw error
      setNewsletters(data || [])
    } catch (error) {
      console.error('Error fetching newsletters:', error)
      setNewsletters([])
    } finally {
      setLoading(false)
    }
  }

  const handleNewsletterClick = async (newsletter: Newsletter) => {
    // Track view
    try {
      await supabase.rpc('increment_newsletter_views', { newsletter_id: newsletter.id })
    } catch (error) {
      console.error('Error tracking view:', error)
    }

    // Open Beehiiv URL if available, otherwise navigate to detail page
    if (newsletter.beehiiv_url) {
      window.open(newsletter.beehiiv_url, '_blank', 'noopener,noreferrer')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const filteredNewsletters = newsletters.filter(newsletter => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      newsletter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      newsletter.preview_bullets.some(bullet =>
        bullet.toLowerCase().includes(searchQuery.toLowerCase())
      )

    // Category/year filter
    if (selectedFilter === 'all') return matchesSearch

    if (selectedFilter === '2025' || selectedFilter === '2024') {
      const year = new Date(newsletter.published_date).getFullYear().toString()
      return matchesSearch && year === selectedFilter
    }

    // Tag filter
    return matchesSearch && newsletter.tags?.includes(selectedFilter)
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading newsletters...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Newsletter Archive</h2>
          <p className="text-gray-600">Weekly insights delivered to your inbox</p>
        </div>
        <a
          href="https://heyfarmer.beehiiv.com/subscribe"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors whitespace-nowrap w-fit"
        >
          <Mail size={18} />
          Subscribe to Newsletter
        </a>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search newsletters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedFilter === filter.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {filteredNewsletters.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📧</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No Newsletters Found' : 'No Newsletters Yet'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchQuery
              ? `No newsletters match "${searchQuery}". Try a different search term.`
              : "Be the first to know! Subscribe to our newsletter for weekly farming insights, resources, and community updates."}
          </p>
          <a
            href="https://heyfarmer.beehiiv.com/subscribe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Mail size={20} />
            Subscribe Now
          </a>
        </div>
      ) : (
        /* Newsletter List */
        <div className="space-y-4">
          {filteredNewsletters.map((newsletter) => (
            <button
              key={newsletter.id}
              onClick={() => handleNewsletterClick(newsletter)}
              className="w-full bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 text-green-700 rounded-lg font-bold text-sm">
                      #{newsletter.issue_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                        {newsletter.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Calendar size={14} />
                        <span>{formatDate(newsletter.published_date)}</span>
                        {newsletter.view_count > 0 && (
                          <>
                            <span>•</span>
                            <span>{newsletter.view_count} {newsletter.view_count === 1 ? 'view' : 'views'}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preview Bullets */}
                  <ul className="space-y-2 mb-4">
                    {newsletter.preview_bullets.map((bullet, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Tags */}
                  {newsletter.tags && newsletter.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newsletter.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Arrow/External Link */}
                <div className="flex-shrink-0">
                  {newsletter.beehiiv_url ? (
                    <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  )}
                </div>
              </div>
            </button>
          ))}

          {/* Load More (if needed) */}
          {filteredNewsletters.length >= 20 && (
            <div className="text-center pt-4">
              <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Load More Newsletters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
