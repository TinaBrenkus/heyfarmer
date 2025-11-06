'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Send, Search, ArrowLeft, MoreVertical, Phone, Video, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/navigation/Navigation'
import FarmLogo from '@/components/icons/FarmLogo'
import FarmerBadge from '@/components/badges/FarmerBadge'

interface Profile {
  id: string
  full_name: string
  farm_name?: string
  avatar_url?: string
  user_type: string
  verified?: boolean
}

interface Conversation {
  id: string
  last_message?: string
  last_message_at: string
  updated_at: string
  profiles: Profile
  unread_count: number
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  profiles?: Profile
}

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  useEffect(() => {
    // Handle contact parameters from marketplace
    const contactUserId = searchParams.get('contact')
    const postId = searchParams.get('post')
    
    if (user && contactUserId && postId) {
      handleContactFromMarketplace(contactUserId, postId)
    }
  }, [user, searchParams])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
      markAsRead(selectedConversation.id)
      subscribeToMessages()
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/messages')
        return
      }
      setUser(user)
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/login?redirect=/messages')
    } finally {
      setLoading(false)
    }
  }

  const handleContactFromMarketplace = async (contactUserId: string, postId: string) => {
    try {
      // Get or create conversation
      const { data: conversationId, error } = await supabase.rpc('get_or_create_conversation', {
        p_user1_id: user.id,
        p_user2_id: contactUserId
      })

      if (error) throw error

      // Get post details for initial message
      const { data: post } = await supabase
        .from('posts')
        .select('title')
        .eq('id', postId)
        .single()

      // Send initial message if post exists
      if (post) {
        const initialMessage = `Hi! I'm interested in your listing: "${post.title}". Could you tell me more about it?`
        
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: initialMessage
        })
      }

      // Reload conversations and select the new one
      await loadConversations()
      
      // Find and select the conversation
      const conversations = await getConversations()
      const conversation = conversations.find(c => c.id === conversationId)
      if (conversation) {
        setSelectedConversation(conversation)
      }

      // Clear URL parameters
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    } catch (error) {
      console.error('Error handling contact from marketplace:', error)
    }
  }

  const getConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          unread_count,
          conversations!inner (
            id,
            last_message,
            last_message_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .order('conversations(updated_at)', { ascending: false })

      if (error) {
        // Handle missing tables gracefully
        if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          return []
        }
        throw error
      }
      return data || []
    } catch (error) {
      // Return empty array if messaging tables don't exist
      return []
    }
  }

  const loadConversations = async () => {
    if (!user) return

    try {
      const conversationData = await getConversations()
      
      // Get other participants for each conversation
      const conversationIds = conversationData.map(c => c.conversations.id)
      
      if (conversationIds.length === 0) {
        setConversations([])
        return
      }

      const { data: participants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          profiles!inner (
            id,
            full_name,
            farm_name,
            avatar_url,
            user_type,
            verified
          )
        `)
        .in('conversation_id', conversationIds)
        .neq('user_id', user.id)

      if (participantsError) throw participantsError

      // Combine conversation data with participant profiles
      const conversationsWithProfiles = conversationData.map(conv => {
        const participant = participants?.find(p => p.conversation_id === conv.conversations.id)
        return {
          id: conv.conversations.id,
          last_message: conv.conversations.last_message,
          last_message_at: conv.conversations.last_message_at,
          updated_at: conv.conversations.updated_at,
          unread_count: conv.unread_count || 0,
          profiles: participant?.profiles || {
            id: '',
            full_name: 'Unknown User',
            user_type: 'consumer'
          }
        }
      })

      setConversations(conversationsWithProfiles)
    } catch (error) {
      // Silently handle the case where messaging tables don't exist yet
      if (error?.code === '42P01' || error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
        setConversations([])
        return
      }
      console.error('Error loading conversations:', error)
      setConversations([])
    }
  }

  const loadMessages = async (conversationId: string) => {
    setLoadingMessages(true)
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_sender_id_fkey (
            id,
            full_name,
            farm_name,
            avatar_url,
            user_type,
            verified
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        content: newMessage.trim()
      })

      if (error) throw error

      setNewMessage('')
      // Messages will be updated via real-time subscription
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const markAsRead = async (conversationId: string) => {
    if (!user) return

    try {
      await supabase.rpc('mark_messages_as_read', {
        p_conversation_id: conversationId,
        p_user_id: user.id
      })

      // Update local unread count
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unread_count: 0 }
          : conv
      ))
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          if (selectedConversation && payload.new.conversation_id === selectedConversation.id) {
            setMessages(prev => [...prev, payload.new as Message])
          }
          loadConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const filteredConversations = conversations.filter(conv =>
    conv.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.profiles.farm_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex h-[600px]">
            {/* Conversations List */}
            <div className={`w-full md:w-1/3 border-r border-gray-200 ${selectedConversation ? 'hidden md:block' : ''}`}>
              <div className="p-4 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900 mb-4">Messages</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="overflow-y-auto h-full">
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="text-4xl mb-2">💬</div>
                    <p>No conversations yet</p>
                    <p className="text-sm">Start messaging from the marketplace!</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-green-50 border-green-200' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {conversation.profiles.avatar_url ? (
                            <img
                              src={conversation.profiles.avatar_url}
                              alt={conversation.profiles.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <FarmLogo size={20} className="text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/profile/${conversation.profiles.id}`}
                                className="font-medium text-gray-900 hover:text-green-600 transition-colors truncate"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {conversation.profiles.farm_name || conversation.profiles.full_name}
                              </Link>
                              <FarmerBadge
                                userType={conversation.profiles.user_type}
                                verified={conversation.profiles.verified}
                                size="xs"
                                showLabel={false}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.last_message_at)}
                              </span>
                              {conversation.unread_count > 0 && (
                                <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                  {conversation.unread_count}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conversation.last_message || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : ''}`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedConversation(null)}
                          className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <ArrowLeft size={20} />
                        </button>
                        
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {selectedConversation.profiles.avatar_url ? (
                            <img
                              src={selectedConversation.profiles.avatar_url}
                              alt={selectedConversation.profiles.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <FarmLogo size={20} className="text-gray-400" />
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/profile/${selectedConversation.profiles.id}`}
                              className="font-semibold text-gray-900 hover:text-green-600 transition-colors"
                            >
                              {selectedConversation.profiles.farm_name || selectedConversation.profiles.full_name}
                            </Link>
                            <FarmerBadge
                              userType={selectedConversation.profiles.user_type}
                              verified={selectedConversation.profiles.verified}
                              size="sm"
                              showLabel={false}
                            />
                          </div>
                          <p className="text-sm text-gray-500">
                            {selectedConversation.profiles.user_type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${selectedConversation.profiles.id}`}
                          className="p-2 hover:bg-gray-100 rounded-lg flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                          title="View Profile"
                        >
                          <ExternalLink size={16} />
                          <span className="hidden sm:inline">Profile</span>
                        </Link>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Phone size={18} className="text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Video size={18} className="text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <MoreVertical size={18} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loadingMessages ? (
                      <div className="flex justify-center">
                        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <div className="text-4xl mb-2">👋</div>
                        <p>Start your conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_id === user?.id
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender_id === user?.id ? 'text-green-100' : 'text-gray-500'
                            }`}>
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                    <p>Choose a conversation from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}