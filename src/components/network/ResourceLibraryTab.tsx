'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Search, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Resource {
  id: string
  title: string
  description: string
  url: string
  category: string
  icon: string | null
  click_count: number
}

interface ResourceLibraryTabProps {
  isAdmin?: boolean
  onAddResource?: () => void
}

export default function ResourceLibraryTab({ isAdmin = false, onAddResource }: ResourceLibraryTabProps) {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { id: 'all', label: 'All', icon: '📚' },
    { id: 'podcasts', label: 'Podcasts', icon: '🎙️' },
    { id: 'government', label: 'Government', icon: '🏛️' },
    { id: 'tools', label: 'Tools', icon: '🛠️' },
    { id: 'education', label: 'Education', icon: '📖' },
    { id: 'organizations', label: 'Organizations', icon: '🤝' }
  ]

  useEffect(() => {
    fetchResources()
  }, [selectedCategory])

  const fetchResources = async () => {
    try {
      let query = supabase
        .from('resources')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('title', { ascending: true })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data, error } = await query

      if (error) throw error
      setResources(data || [])
    } catch (error) {
      console.error('Error fetching resources:', error)
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  const handleResourceClick = async (resourceId: string, url: string) => {
    // Track click
    try {
      await supabase.rpc('increment_resource_clicks', { resource_id: resourceId })
    } catch (error) {
      console.error('Error tracking click:', error)
    }

    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const filteredResources = resources.filter(resource =>
    searchQuery === '' ||
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupedResources = categories.reduce((acc, category) => {
    if (category.id === 'all') return acc

    const categoryResources = filteredResources.filter(r => r.category === category.id)
    if (categoryResources.length > 0 || selectedCategory === category.id) {
      acc[category.id] = {
        ...category,
        resources: categoryResources
      }
    }
    return acc
  }, {} as Record<string, any>)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Resource Library</h2>
          <p className="text-gray-600">Trusted tools and information for Texas farmers</p>
        </div>
        {isAdmin && (
          <button
            onClick={onAddResource}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Plus size={18} />
            Add Resource
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {filteredResources.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No Resources Found' : 'No Resources Yet'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchQuery
              ? `No resources match "${searchQuery}". Try a different search term.`
              : isAdmin
              ? "Start building your resource library! Add helpful links, tools, and information for farmers."
              : "Check back soon for curated resources to help your farming journey."}
          </p>
          {!searchQuery && isAdmin && onAddResource && (
            <button
              onClick={onAddResource}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              Add First Resource
            </button>
          )}
        </div>
      ) : selectedCategory === 'all' ? (
        /* All Categories View */
        <div className="space-y-8">
          {Object.values(groupedResources).map((group: any) => (
            <div key={group.id}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{group.icon}</span>
                <h3 className="text-xl font-semibold text-gray-900">{group.label}</h3>
                <span className="text-sm text-gray-500">({group.resources.length})</span>
              </div>
              <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                {group.resources.map((resource: Resource) => (
                  <button
                    key={resource.id}
                    onClick={() => handleResourceClick(resource.id, resource.url)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors mb-1">
                        {resource.title}
                      </h4>
                      <p className="text-sm text-gray-600">{resource.description}</p>
                      {resource.click_count > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          {resource.click_count} {resource.click_count === 1 ? 'visit' : 'visits'}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-green-600 flex-shrink-0 ml-4" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Single Category View */
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
          {filteredResources.map((resource) => (
            <button
              key={resource.id}
              onClick={() => handleResourceClick(resource.id, resource.url)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left group"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors mb-1">
                  {resource.title}
                </h4>
                <p className="text-sm text-gray-600">{resource.description}</p>
                {resource.click_count > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {resource.click_count} {resource.click_count === 1 ? 'visit' : 'visits'}
                  </p>
                )}
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-green-600 flex-shrink-0 ml-4" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
