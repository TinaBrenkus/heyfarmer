'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar, User, ArrowRight, BookOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image_url: string | null
  author_name: string
  published_at: string
  category: string
  view_count: number
}

interface FromTheFieldTabProps {
  isAdmin?: boolean
  onCreateArticle?: () => void
}

export default function FromTheFieldTab({ isAdmin = false, onCreateArticle }: FromTheFieldTabProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'seasonal-guides', label: 'Seasonal Guides' },
    { id: 'farmer-spotlights', label: 'Farmer Spotlights' },
    { id: 'market-insights', label: 'Market Insights' },
    { id: 'sustainability', label: 'Sustainability' },
    { id: 'business-tips', label: 'Business Tips' },
    { id: 'guest-posts', label: 'Guest Posts' }
  ]

  useEffect(() => {
    fetchArticles()
  }, [selectedCategory])

  const fetchArticles = async () => {
    try {
      let query = supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data, error } = await query.limit(10)

      if (error) throw error
      setArticles(data || [])
    } catch (error) {
      console.error('Error fetching articles:', error)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const featuredArticle = articles.find(a => a.featured_image_url) || articles[0]
  const recentArticles = articles.filter(a => a.id !== featuredArticle?.id).slice(0, 6)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading articles...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">From the Field</h2>
          <p className="text-gray-600">Fresh insights and stories from Texas farmers</p>
        </div>
        {isAdmin && (
          <button
            onClick={onCreateArticle}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Plus size={18} />
            Submit Your Story
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {articles.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            No Articles Yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {isAdmin
              ? "Start sharing your farming wisdom! Create your first article to inspire the community."
              : "Check back soon for inspiring stories and practical insights from Texas farmers."}
          </p>
          {isAdmin && onCreateArticle && (
            <button
              onClick={onCreateArticle}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              Write First Article
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Featured Article */}
          {featuredArticle && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8 hover:shadow-md transition-shadow cursor-pointer">
              <div className="md:flex">
                {featuredArticle.featured_image_url && (
                  <div className="md:w-1/2 h-64 md:h-auto bg-gray-200">
                    <img
                      src={featuredArticle.featured_image_url}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className={`p-8 ${featuredArticle.featured_image_url ? 'md:w-1/2' : 'w-full'}`}>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium mb-3">
                    <BookOpen size={16} />
                    <span className="uppercase tracking-wide">Featured Article</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 hover:text-green-600 transition-colors">
                    {featuredArticle.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{featuredArticle.author_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(featuredArticle.published_at)}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>
                  <button className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium">
                    Read More
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recent Articles Grid */}
          {recentArticles.length > 0 && (
            <>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {recentArticles.map((article) => (
                  <div
                    key={article.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    {article.featured_image_url ? (
                      <div className="h-48 bg-gray-200 overflow-hidden">
                        <img
                          src={article.featured_image_url}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                        <BookOpen size={48} className="text-green-300" />
                      </div>
                    )}
                    <div className="p-5">
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <Calendar size={12} />
                        <span>{formatDate(article.published_at)}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          By {article.author_name}
                        </span>
                        <ArrowRight size={14} className="text-green-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              {articles.length >= 10 && (
                <div className="text-center">
                  <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                    Load More Articles
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
