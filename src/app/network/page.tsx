'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Plus, 
  MessageCircle, 
  TrendingUp, 
  Clock,
  Users,
  ArrowRight,
  Pin,
  Camera
} from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import FarmerBadge from '@/components/badges/FarmerBadge'
import { supabase } from '@/lib/supabase'
import { UserType } from '@/lib/database'

interface Discussion {
  id: string
  title: string
  category: string
  author: {
    name: string
    user_type: UserType
    verified: boolean
  }
  replies: number
  views: number
  last_activity: string
  is_pinned?: boolean
  is_hot?: boolean
  has_photos?: boolean
}

export default function FarmerNetworkPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    // Check if user is a farmer
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()
    
    if (profile?.user_type === 'consumer') {
      router.push('/dashboard')
      return
    }

    setLoading(false)
  }

  const categories = [
    { id: 'all', name: 'All Discussions', icon: '💬', count: 47 },
    { id: 'growing-tips', name: 'Growing Tips', icon: '🌱', count: 12 },
    { id: 'equipment', name: 'Equipment', icon: '🔧', count: 8 },
    { id: 'pest-control', name: 'Pest Control', icon: '🐛', count: 6 },
    { id: 'marketing', name: 'Marketing', icon: '💰', count: 9 },
    { id: 'weather', name: 'Weather', icon: '🌦️', count: 5 },
    { id: 'resource-sharing', name: 'Resource Sharing', icon: '🤝', count: 7 }
  ]

  const hotTopics = [
    {
      id: '1',
      title: 'Best practices for fall tomato planting in Texas Triangle?',
      category: 'growing-tips',
      author: { name: 'Mike Johnson', user_type: 'production_farmer' as UserType, verified: true },
      replies: 23,
      views: 156,
      last_activity: '2 hours ago',
      is_hot: true,
      has_photos: true
    },
    {
      id: '2',
      title: 'Anyone have a rototiller available in Denton County this weekend?',
      category: 'resource-sharing',
      author: { name: 'Sarah Chen', user_type: 'market_gardener' as UserType, verified: false },
      replies: 8,
      views: 67,
      last_activity: '45 minutes ago',
      is_hot: true
    },
    {
      id: '3',
      title: 'Organic solutions for aphids on leafy greens',
      category: 'pest-control',
      author: { name: 'Tom Wilson', user_type: 'backyard_grower' as UserType, verified: false },
      replies: 15,
      views: 89,
      last_activity: '3 hours ago'
    }
  ]

  const recentDiscussions = [
    {
      id: '4',
      title: 'Setting up a CSA program - need advice on pricing',
      category: 'marketing',
      author: { name: 'Lisa Rodriguez', user_type: 'market_gardener' as UserType, verified: true },
      replies: 12,
      views: 78,
      last_activity: '1 hour ago',
      is_pinned: true
    },
    {
      id: '5',
      title: 'Rain forecast this week - anyone else concerned about flooding?',
      category: 'weather',
      author: { name: 'David Kim', user_type: 'production_farmer' as UserType, verified: true },
      replies: 19,
      views: 134,
      last_activity: '2 hours ago'
    },
    {
      id: '6',
      title: 'Sharing seeds for winter cover crops',
      category: 'resource-sharing',
      author: { name: 'Emma Davis', user_type: 'backyard_grower' as UserType, verified: false },
      replies: 7,
      views: 45,
      last_activity: '4 hours ago'
    },
    {
      id: '7',
      title: 'Best soil amendments for clay soil in Dallas area?',
      category: 'growing-tips',
      author: { name: 'James Parker', user_type: 'market_gardener' as UserType, verified: false },
      replies: 16,
      views: 92,
      last_activity: '5 hours ago'
    },
    {
      id: '8',
      title: 'Recommendations for compact tractors under $15k',
      category: 'equipment',
      author: { name: 'Maria Gonzalez', user_type: 'production_farmer' as UserType, verified: true },
      replies: 11,
      views: 67,
      last_activity: '6 hours ago'
    }
  ]

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.icon || '💬'
  }

  const formatLastActivity = (timeStr: string) => {
    return timeStr
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
          <button 
            onClick={() => router.push('/network/new-discussion')}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Plus size={20} />
            New Discussion
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Hot Topics */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-gray-900">Hot Topics</h2>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Trending</span>
              </div>
              <div className="space-y-3">
                {hotTopics.map((discussion) => (
                  <div
                    key={discussion.id}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => router.push(`/network/discussion/${discussion.id}`)}
                  >
                    <span className="text-lg">{getCategoryIcon(discussion.category)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 line-clamp-2 flex-1">
                          {discussion.title}
                        </h4>
                        {discussion.has_photos && (
                          <Camera className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FarmerBadge 
                          userType={discussion.author.user_type}
                          verified={discussion.author.verified}
                          size="xs"
                          showLabel={false}
                        />
                        <span>{discussion.author.name}</span>
                        <span>•</span>
                        <span>{discussion.replies} replies</span>
                        <span>•</span>
                        <span>{discussion.views} views</span>
                        <span>•</span>
                        <span>{formatLastActivity(discussion.last_activity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Discussions */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Recent Discussions</h2>
                </div>
                <select 
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  defaultValue="recent"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="replies">Most Replies</option>
                </select>
              </div>
              
              <div className="divide-y divide-gray-100">
                {recentDiscussions.map((discussion) => (
                  <div
                    key={discussion.id}
                    className="flex items-start gap-4 p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/network/discussion/${discussion.id}`)}
                  >
                    <span className="text-xl">{getCategoryIcon(discussion.category)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        {discussion.is_pinned && (
                          <Pin className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                        )}
                        <h3 className="font-medium text-gray-900 line-clamp-2 flex-1 hover:text-green-600 transition-colors">
                          {discussion.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-2">
                          <FarmerBadge 
                            userType={discussion.author.user_type}
                            verified={discussion.author.verified}
                            size="xs"
                            showLabel={false}
                          />
                          <span className="font-medium">{discussion.author.name}</span>
                        </div>
                        <span>•</span>
                        <span>Last reply {formatLastActivity(discussion.last_activity)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          <span>{discussion.replies} replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={12} />
                          <span>{discussion.views} views</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                ))}
              </div>

              {/* Load More */}
              <div className="p-6 border-t border-gray-100 text-center">
                <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                  Load More Discussions
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}