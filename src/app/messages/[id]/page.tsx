'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
  ExternalLink
} from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import FarmerBadge from '@/components/badges/FarmerBadge'
import { supabase } from '@/lib/supabase'
import { UserType } from '@/lib/database'

interface ChatMessage {
  id: string
  sender: {
    id: string
    name: string
    user_type: UserType
    verified: boolean
  }
  content: string
  timestamp: string
  isCurrentUser: boolean
}

interface ConversationInfo {
  id: string
  participant: {
    name: string
    user_type: UserType
    verified: boolean
    location?: string
  }
  context: {
    type: 'post' | 'discussion'
    title: string
    id: string
  }
  lastActivity: string
}

export default function ConversationPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [conversation, setConversation] = useState<ConversationInfo | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    checkAuthAndFetchConversation()
  }, [params.id])

  const checkAuthAndFetchConversation = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    setCurrentUser(profile)
    fetchConversation()
  }

  const fetchConversation = async () => {
    setLoading(false)
    
    // Mock conversation data
    setConversation({
      id: params.id as string,
      participant: {
        name: 'Lisa Martinez',
        user_type: 'consumer',
        verified: false,
        location: 'Dallas County, TX'
      },
      context: {
        type: 'post',
        title: 'Fresh Brown Eggs',
        id: 'post-1'
      },
      lastActivity: '2 hours ago'
    })

    // Mock messages
    setMessages([
      {
        id: '1',
        sender: {
          id: 'other',
          name: 'Lisa Martinez',
          user_type: 'consumer',
          verified: false
        },
        content: 'Hi! I saw your post about fresh brown eggs. Do you still have some available?',
        timestamp: '3 hours ago',
        isCurrentUser: false
      },
      {
        id: '2',
        sender: {
          id: 'current',
          name: currentUser?.full_name || 'You',
          user_type: currentUser?.user_type || 'backyard_grower',
          verified: currentUser?.verified || false
        },
        content: 'Yes! I have plenty available. They\'re $4 per dozen. When would you like to pick them up?',
        timestamp: '2 hours ago',
        isCurrentUser: true
      },
      {
        id: '3',
        sender: {
          id: 'other',
          name: 'Lisa Martinez',
          user_type: 'consumer',
          verified: false
        },
        content: 'Perfect! Would this afternoon work? I can come by around 3 PM if that\'s convenient.',
        timestamp: '2 hours ago',
        isCurrentUser: false
      },
      {
        id: '4',
        sender: {
          id: 'current',
          name: currentUser?.full_name || 'You',
          user_type: currentUser?.user_type || 'backyard_grower',
          verified: currentUser?.verified || false
        },
        content: 'That works great! I\'ll have a dozen ready for you. I\'ll send you the address.',
        timestamp: '1 hour ago',
        isCurrentUser: true
      }
    ])
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: {
        id: 'current',
        name: currentUser?.full_name || 'You',
        user_type: currentUser?.user_type || 'backyard_grower',
        verified: currentUser?.verified || false
      },
      content: newMessage,
      timestamp: 'Just now',
      isCurrentUser: true
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const formatTimestamp = (timestamp: string) => {
    return timestamp
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Conversation not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto bg-white shadow-sm">
        {/* Conversation Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Messages</span>
              </button>
              
              <div className="flex items-center gap-3">
                <FarmerBadge 
                  userType={conversation.participant.user_type}
                  verified={conversation.participant.verified}
                  size="sm"
                  showLabel={false}
                />
                <div>
                  <h2 className="font-semibold text-gray-900 text-lg">{conversation.participant.name}</h2>
                  {conversation.participant.location && (
                    <p className="text-sm text-gray-500">{conversation.participant.location}</p>
                  )}
                </div>
              </div>
            </div>

            <button 
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
              onClick={() => console.log('View profile')}
            >
              <Info size={16} />
              <span>View Profile</span>
            </button>
          </div>

          {/* Subject Line */}
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Re: {conversation.context.title}
            </h3>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              {!message.isCurrentUser ? (
                /* Received Message */
                <div className="flex justify-end">
                  <div className="max-w-md">
                    <div className="flex items-center gap-2 mb-2 justify-end">
                      <span className="text-sm font-medium text-gray-700">{message.sender.name}</span>
                      <span className="text-lg">💬</span>
                    </div>
                    <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg rounded-tr-sm">
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 text-right mt-1">
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </div>
              ) : (
                /* Sent Message */
                <div className="flex justify-start">
                  <div className="max-w-md">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">{message.sender.name} (You)</span>
                      <span className="text-lg">💬</span>
                    </div>
                    <div className="bg-blue-500 text-white px-4 py-3 rounded-lg rounded-tl-sm">
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 text-left mt-1">
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Main Input */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-lg p-3 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Send
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm">
              <Paperclip size={16} />
              <span>Attach</span>
            </button>
            
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm">
              <span className="text-base">📍</span>
              <span>Share Location</span>
            </button>
            
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm">
              <Phone size={16} />
              <span>Call</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}