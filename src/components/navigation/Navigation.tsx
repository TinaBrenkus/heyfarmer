'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  Plus,
  Bell,
  MessageCircle,
  HelpCircle,
  UserCheck,
  MapPin
} from 'lucide-react'
import FarmLogo from '@/components/icons/FarmLogo'
import { supabase } from '@/lib/supabase'
import { UserType, TexasTriangleCounty } from '@/lib/database'
import FarmerBadge from '@/components/badges/FarmerBadge'
import { getSlugFromCounty, getCountyDisplayName } from '@/lib/countyUtils'

interface Profile {
  id: string
  email: string
  full_name: string
  farm_name?: string
  user_type: UserType
  verified?: boolean
  county?: TexasTriangleCounty
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  farmerOnly?: boolean
  consumerOnly?: boolean
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Market', href: '/marketplace', icon: ShoppingCart },
  { label: 'Farmers', href: '/farmers', icon: UserCheck },
  { label: 'Network', href: '/network', icon: Users },
  { label: 'Posts', href: '/post', icon: FileText, farmerOnly: true },
  { label: 'More', href: '/settings', icon: Settings }
]

const mobileTabItems: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Market', href: '/marketplace', icon: ShoppingCart },
  { label: 'Messages', href: '/messages', icon: MessageCircle },
  { label: 'Network', href: '/network', icon: Users }
]

const fullNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Marketplace', href: '/marketplace', icon: ShoppingCart },
  { label: 'Messages', href: '/messages', icon: MessageCircle },
  { label: 'Network', href: '/network', icon: Users }
]

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(0)

  useEffect(() => {
    checkUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      fetchProfile(user.id)
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      setProfile(profileData)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isFarmer = profile && profile.user_type !== 'consumer'

  const filteredNavItems = fullNavItems.filter(item => {
    if (item.farmerOnly && !isFarmer) return false
    if (item.consumerOnly && isFarmer) return false
    return true
  })

  const filteredMobileTabItems = mobileTabItems.filter(item => {
    if (item.farmerOnly && !isFarmer) return false
    if (item.consumerOnly && isFarmer) return false
    return true
  })

  if (!user) return null

  return (
    <>
      {/* Desktop Navigation */}
      <header className="hidden md:block bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#2E7D32' }}>
                <FarmLogo size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Hey Farmer</h1>
                <p className="text-xs" style={{ color: '#2E7D32' }}>Texas Triangle</p>
              </div>
            </Link>

            {/* Main Navigation */}
            <nav className="flex items-center space-x-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              {/* My County Link */}
              {profile?.county && (
                <Link
                  href={`/${getSlugFromCounty(profile.county)}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    pathname.includes('-county')
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <MapPin size={18} />
                  <span>My County</span>
                </Link>
              )}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {/* Quick Actions */}
              {isFarmer && (
                <Link
                  href="/post"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <Plus size={18} />
                  <span>New Post</span>
                </Link>
              )}

              {/* Messages icon removed - already in main nav */}

              {/* Tour/Help - Hidden for MVP */}
              {/* <button 
                onClick={() => router.push('/dashboard?tour=true')}
                className="relative p-2 text-gray-600 hover:text-gray-900"
                title="Take Tour"
              >
                <HelpCircle size={20} />
              </button> */}

              {/* User Profile */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                {profile && (
                  <>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
                      <p className="text-xs text-gray-500">{profile.farm_name || profile.email}</p>
                    </div>
                    <FarmerBadge 
                      userType={profile.user_type}
                      verified={profile.verified}
                      size="sm"
                      showLabel={false}
                    />
                  </>
                )}
                <button 
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:text-gray-900"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="flex justify-between items-center h-14 px-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#2E7D32' }}>
                <FarmLogo size={20} className="text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Hey Farmer</h1>
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-14 bg-white z-40">
            <div className="p-4">
              {/* User Info */}
              {profile && (
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-200">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{profile.full_name}</p>
                    <p className="text-sm text-gray-500">{profile.farm_name || profile.email}</p>
                  </div>
                  <FarmerBadge 
                    userType={profile.user_type}
                    verified={profile.verified}
                    size="sm"
                  />
                </div>
              )}

              {/* Navigation Items */}
              <nav className="space-y-2">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-colors ${
                        isActive
                          ? 'bg-green-50 text-green-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
                {/* My County Link */}
                {profile?.county && (
                  <Link
                    href={`/${getSlugFromCounty(profile.county)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-colors ${
                      pathname.includes('-county')
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <MapPin size={20} />
                    <span>My County</span>
                  </Link>
                )}
              </nav>

              {/* Quick Actions */}
              {isFarmer && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    href="/post"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium"
                  >
                    <Plus size={20} />
                    <span>Create New Post</span>
                  </Link>
                </div>
              )}

              {/* Take Tour - Hidden for MVP */}
              {/* <button
                onClick={() => {
                  router.push('/dashboard?tour=true')
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-3 w-full px-3 py-3 mt-4 text-green-600 hover:bg-green-50 rounded-lg font-medium"
              >
                <HelpCircle size={20} />
                <span>Take Tour</span>
              </button> */}

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-3 py-3 mt-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Tab Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
          <div className="safe-area-pb">
            <div className="grid grid-cols-5 h-16">
              {filteredMobileTabItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                // Get emoji for each tab
                const getTabEmoji = (href: string) => {
                  switch (href) {
                    case '/dashboard': return '🏠'
                    case '/marketplace': return '🛒'
                    case '/messages': return '💬'
                    case '/network': return '👥'
                    case '/post': return '📝'
                    default: return ''
                  }
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center justify-center gap-1 py-2 transition-colors ${
                      isActive
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <div className="relative">
                      <span className="text-lg">{getTabEmoji(item.href)}</span>
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full"></div>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${
                      isActive ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                )
              })}
              {/* My County Tab */}
              {profile?.county && (
                <Link
                  href={`/${getSlugFromCounty(profile.county)}`}
                  className={`flex flex-col items-center justify-center gap-1 py-2 transition-colors ${
                    pathname.includes('-county')
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <div className="relative">
                    <span className="text-lg">📍</span>
                    {pathname.includes('-county') && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full"></div>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${
                    pathname.includes('-county') ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    Local
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}