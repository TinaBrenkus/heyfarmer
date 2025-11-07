'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  MessageCircle, 
  Heart, 
  Share2, 
  Camera,
  MapPin,
  Clock,
  ThumbsUp,
  Reply,
  ChevronDown,
  ChevronUp,
  Pin
} from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import FarmerBadge from '@/components/badges/FarmerBadge'
import { supabase } from '@/lib/supabase'
import { UserType } from '@/lib/database'

interface Reply {
  id: string
  content: string
  author: {
    name: string
    user_type: UserType
    verified: boolean
    location: string
  }
  created_at: string
  likes: number
  has_liked: boolean
  photos?: string[]
  replies?: Reply[]
  is_collapsed?: boolean
}

interface Discussion {
  id: string
  title: string
  content: string
  category: string
  author: {
    name: string
    user_type: UserType
    verified: boolean
    location: string
  }
  created_at: string
  replies: number
  views: number
  likes: number
  has_liked: boolean
  is_pinned: boolean
  photos?: string[]
}

export default function DiscussionThreadPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [discussion, setDiscussion] = useState<Discussion | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [newReply, setNewReply] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  useEffect(() => {
    checkAuthAndFetch()
  }, [params.id])

  const checkAuthAndFetch = async () => {
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

    fetchDiscussion()
  }

  const fetchDiscussion = async () => {
    setLoading(false)
    
    // Mock data for now
    setDiscussion({
      id: '1',
      title: 'Best practices for fall tomato planting in Texas Triangle?',
      content: `I'm planning to start my fall tomato crop next week and wanted to get advice from other growers. I've been having issues with blossom end rot in my summer tomatoes and want to make sure I avoid that problem.

Here's what I'm planning:
• Cherokee Purple and Early Girl varieties
• 4x8 raised beds with drip irrigation
• Organic compost and bone meal amendments

Has anyone had success with these varieties in fall? Any specific timing recommendations for Texas Triangle?

Photos attached show my current setup and the blossom end rot issues I've been dealing with.`,
      category: 'growing-tips',
      author: {
        name: 'Mike Johnson',
        user_type: 'production_farmer',
        verified: true,
        location: 'Wise County, TX'
      },
      created_at: '2024-01-15T10:30:00Z',
      replies: 23,
      views: 156,
      likes: 12,
      has_liked: false,
      is_pinned: false,
      photos: ['/api/placeholder/400/300', '/api/placeholder/400/300']
    })

    setReplies([
      {
        id: 'r1',
        content: "I've had great success with fall tomatoes! The key is getting them started early enough. For Texas Triangle, I usually plant my transplants around mid-August. Cherokee Purple is an excellent choice - very heat tolerant.",
        author: {
          name: 'Sarah Chen',
          user_type: 'market_gardener',
          verified: false,
          location: 'Denton County, TX'
        },
        created_at: '2024-01-15T11:15:00Z',
        likes: 8,
        has_liked: true,
        replies: [
          {
            id: 'r1-1',
            content: 'Thanks Sarah! Did you do anything special for soil prep? I\'m wondering if my calcium levels might be off.',
            author: {
              name: 'Mike Johnson',
              user_type: 'production_farmer',
              verified: true,
              location: 'Wise County, TX'
            },
            created_at: '2024-01-15T11:45:00Z',
            likes: 2,
            has_liked: false
          },
          {
            id: 'r1-2',
            content: 'Definitely get a soil test done! I use gypsum for calcium and it really helps with blossom end rot. Also make sure your watering is consistent.',
            author: {
              name: 'Sarah Chen',
              user_type: 'market_gardener',
              verified: false,
              location: 'Denton County, TX'
            },
            created_at: '2024-01-15T12:00:00Z',
            likes: 5,
            has_liked: false
          }
        ]
      },
      {
        id: 'r2',
        content: 'Blossom end rot is usually a watering issue more than nutrition. Make sure you\'re watering deeply but less frequently. Mulch heavily to retain moisture.',
        author: {
          name: 'Tom Wilson',
          user_type: 'backyard_grower',
          verified: false,
          location: 'Dallas County, TX'
        },
        created_at: '2024-01-15T12:30:00Z',
        likes: 6,
        has_liked: false
      },
      {
        id: 'r3',
        content: 'I second the gypsum recommendation! Also, try adding some crushed eggshells to your compost - the slow-release calcium really helps. Here\'s a photo of my fall tomato setup:',
        author: {
          name: 'Lisa Rodriguez',
          user_type: 'market_gardener',
          verified: true,
          location: 'Tarrant County, TX'
        },
        created_at: '2024-01-15T13:00:00Z',
        likes: 4,
        has_liked: false,
        photos: ['/api/placeholder/400/250']
      }
    ])
  }

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const toggleCollapse = (replyId: string) => {
    setReplies(replies.map(reply => 
      reply.id === replyId 
        ? { ...reply, is_collapsed: !reply.is_collapsed }
        : reply
    ))
  }

  const handleLike = (id: string, isReply: boolean = false) => {
    if (isReply) {
      setReplies(replies.map(reply => 
        reply.id === id 
          ? { 
              ...reply, 
              likes: reply.has_liked ? reply.likes - 1 : reply.likes + 1,
              has_liked: !reply.has_liked 
            }
          : reply
      ))
    } else if (discussion) {
      setDiscussion({
        ...discussion,
        likes: discussion.has_liked ? discussion.likes - 1 : discussion.likes + 1,
        has_liked: !discussion.has_liked
      })
    }
  }

  const handleReply = (replyId?: string) => {
    if (replyId) {
      setReplyingTo(replyId)
    } else {
      // Add main reply logic here
      if (newReply.trim()) {
        // This would typically make an API call
        setNewReply('')
      }
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'growing-tips': return '🌱'
      case 'equipment': return '🔧'
      case 'pest-control': return '🐛'
      case 'marketing': return '💰'
      case 'weather': return '🌦️'
      case 'resource-sharing': return '🤝'
      default: return '💬'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading discussion...</p>
        </div>
      </div>
    )
  }

  if (!discussion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Discussion not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Network
        </button>

        {/* Main Discussion */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <span className="text-2xl">{getCategoryIcon(discussion.category)}</span>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    {discussion.is_pinned && <Pin className="h-4 w-4 text-green-600" />}
                    {discussion.title}
                  </h1>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
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
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{discussion.author.location}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{formatTimeAgo(discussion.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{discussion.views} views</span>
                  <span>{discussion.replies} replies</span>
                  <span>{discussion.likes} likes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-line">{discussion.content}</p>
            </div>

            {/* Photos */}
            {discussion.photos && discussion.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {discussion.photos.map((photo, index) => (
                  <div key={index} className="rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={photo} 
                      alt={`Photo ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleLike(discussion.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  discussion.has_liked 
                    ? 'bg-red-50 text-red-600' 
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                <Heart size={16} className={discussion.has_liked ? 'fill-current' : ''} />
                <span>{discussion.likes}</span>
              </button>
              
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
                <Reply size={16} />
                <span>Reply</span>
              </button>
              
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
                <Share2 size={16} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reply Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Add Your Reply</h3>
          <textarea
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Share your thoughts, experiences, or ask follow-up questions..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
          <div className="flex items-center justify-between mt-4">
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors">
              <Camera size={16} />
              <span>Add Photo</span>
            </button>
            <button
              onClick={() => handleReply()}
              disabled={!newReply.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Post Reply
            </button>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle size={18} />
            {discussion.replies} Replies
          </h3>

          {replies.map((reply) => (
            <div key={reply.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                {/* Reply Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FarmerBadge 
                        userType={reply.author.user_type}
                        verified={reply.author.verified}
                        size="xs"
                        showLabel={false}
                      />
                      <span className="font-medium text-gray-900">{reply.author.name}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin size={12} />
                      <span>{reply.author.location}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{formatTimeAgo(reply.created_at)}</span>
                  </div>
                  
                  {reply.replies && reply.replies.length > 0 && (
                    <button
                      onClick={() => toggleCollapse(reply.id)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {reply.is_collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                      {reply.replies.length} replies
                    </button>
                  )}
                </div>

                {/* Reply Content */}
                <div className="mb-4">
                  <p className="text-gray-700">{reply.content}</p>
                </div>

                {/* Reply Photos */}
                {reply.photos && reply.photos.length > 0 && (
                  <div className="mb-4">
                    <img 
                      src={reply.photos[0]} 
                      alt="Reply photo"
                      className="rounded-lg max-w-md h-48 object-cover"
                    />
                  </div>
                )}

                {/* Reply Actions */}
                <div className="flex items-center gap-4 text-sm">
                  <button
                    onClick={() => handleLike(reply.id, true)}
                    className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${
                      reply.has_liked 
                        ? 'text-red-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <ThumbsUp size={14} className={reply.has_liked ? 'fill-current' : ''} />
                    <span>{reply.likes}</span>
                  </button>
                  
                  <button
                    onClick={() => handleReply(reply.id)}
                    className="flex items-center gap-2 px-2 py-1 rounded text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Reply size={14} />
                    <span>Reply</span>
                  </button>
                </div>

                {/* Nested Replies */}
                {reply.replies && reply.replies.length > 0 && !reply.is_collapsed && (
                  <div className="mt-4 pl-6 border-l-2 border-gray-100 space-y-4">
                    {reply.replies.map((nestedReply) => (
                      <div key={nestedReply.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 text-sm mb-2">
                          <div className="flex items-center gap-2">
                            <FarmerBadge 
                              userType={nestedReply.author.user_type}
                              verified={nestedReply.author.verified}
                              size="xs"
                              showLabel={false}
                            />
                            <span className="font-medium text-gray-900">{nestedReply.author.name}</span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">{formatTimeAgo(nestedReply.created_at)}</span>
                        </div>
                        <p className="text-gray-700 mb-3">{nestedReply.content}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <button
                            onClick={() => handleLike(nestedReply.id, true)}
                            className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${
                              nestedReply.has_liked 
                                ? 'text-red-600' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <ThumbsUp size={14} className={nestedReply.has_liked ? 'fill-current' : ''} />
                            <span>{nestedReply.likes}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}