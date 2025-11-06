'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  ArrowLeft,
  Send,
  Search,
  User,
  AlertCircle
} from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import FarmerBadge from '@/components/badges/FarmerBadge'
import { supabase } from '@/lib/supabase'
import { UserType } from '@/lib/database'

interface UserOption {
  id: string
  name: string
  farm_name?: string
  user_type: UserType
  verified: boolean
  location: string
}

export default function NewMessagePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserOption[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserOption[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    checkAuth()
    
    // Check if we have a pre-selected contact
    const contactId = searchParams.get('contact')
    const postId = searchParams.get('post')
    
    if (contactId) {
      // Pre-select user and set subject based on post
      // This would typically fetch the user and post details
    }
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.farm_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users.slice(0, 10)) // Show first 10 users
    }
  }, [searchQuery, users])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    fetchUsers()
  }

  const fetchUsers = async () => {
    setLoading(false)
    
    // Mock users data
    const mockUsers: UserOption[] = [
      {
        id: '1',
        name: 'Lisa Martinez',
        user_type: 'consumer',
        verified: false,
        location: 'Dallas County, TX'
      },
      {
        id: '2',
        name: 'Mike Johnson',
        farm_name: 'Johnson Family Farm',
        user_type: 'production_farmer',
        verified: true,
        location: 'Wise County, TX'
      },
      {
        id: '3',
        name: 'Sarah Chen',
        farm_name: 'Green Valley Garden',
        user_type: 'market_gardener',
        verified: false,
        location: 'Denton County, TX'
      },
      {
        id: '4',
        name: 'Tom Wilson',
        user_type: 'backyard_grower',
        verified: false,
        location: 'Dallas County, TX'
      },
      {
        id: '5',
        name: 'Jennifer Adams',
        user_type: 'consumer',
        verified: false,
        location: 'Tarrant County, TX'
      }
    ]

    setUsers(mockUsers)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!selectedUser) {
      newErrors.recipient = 'Please select a recipient'
    }

    if (!subject.trim()) {
      newErrors.subject = 'Subject is required'
    }

    if (!message.trim()) {
      newErrors.message = 'Message content is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSendMessage = async () => {
    if (!validateForm()) {
      return
    }

    // Here you would typically send the message to the database
    console.log('Sending message:', {
      recipient: selectedUser,
      subject,
      message
    })

    // For now, just redirect to messages
    router.push('/messages')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-4xl">✉️</span>
              New Message
            </h1>
            <p className="text-gray-600">Send a message to another farmer or customer</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Recipient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To <span className="text-red-500">*</span>
              </label>
              
              {selectedUser ? (
                <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FarmerBadge 
                      userType={selectedUser.user_type}
                      verified={selectedUser.verified}
                      size="sm"
                      showLabel={false}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{selectedUser.name}</p>
                      {selectedUser.farm_name && (
                        <p className="text-sm text-gray-500">{selectedUser.farm_name}</p>
                      )}
                      <p className="text-xs text-gray-500">{selectedUser.location}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for farmers and customers..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {filteredUsers.length > 0 && (
                    <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                      {filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => setSelectedUser(user)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                        >
                          <FarmerBadge 
                            userType={user.user_type}
                            verified={user.verified}
                            size="sm"
                            showLabel={false}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{user.name}</p>
                            {user.farm_name && (
                              <p className="text-sm text-gray-500">{user.farm_name}</p>
                            )}
                            <p className="text-xs text-gray-500">{user.location}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {errors.recipient && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  <span>{errors.recipient}</span>
                </div>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What's this message about?"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.subject ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.subject && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  <span>{errors.subject}</span>
                </div>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Type your message here..."
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                  errors.message ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.message && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  <span>{errors.message}</span>
                </div>
              )}
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Be respectful and clear in your communication
                </p>
                <span className="text-xs text-gray-400">
                  {message.length} characters
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSendMessage}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <Send size={18} />
              Send Message
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}