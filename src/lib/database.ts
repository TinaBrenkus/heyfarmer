import { supabase } from './supabase'

// Type definitions for our database
export type UserType = 'backyard_grower' | 'market_gardener' | 'production_farmer' | 'consumer'
export type PostVisibility = 'public' | 'farmers_only'
export type PostType = 'produce' | 'equipment' | 'resource' | 'discussion'
export type PostStatus = 'active' | 'sold' | 'expired' | 'draft'
// Texas Triangle Megaregion Counties (organized by metro area)
export type TexasTriangleCounty =
  // Dallas-Fort Worth Metro
  | 'dallas' | 'tarrant' | 'denton' | 'collin' | 'rockwall' | 'kaufman' | 'wise' | 'parker' | 'jack' | 'grayson' | 'hunt'
  // Austin Metro
  | 'travis' | 'williamson' | 'hays' | 'bastrop' | 'caldwell' | 'lee' | 'burnet' | 'blanco'
  // San Antonio Metro
  | 'bexar' | 'comal' | 'guadalupe' | 'wilson' | 'medina' | 'kendall' | 'bandera' | 'atascosa'
  // Houston Metro
  | 'harris' | 'fort-bend' | 'montgomery' | 'brazoria' | 'galveston' | 'liberty' | 'chambers' | 'waller' | 'austin-county'
  // Central Corridor (Waco, Temple, College Station)
  | 'mclennan' | 'bell' | 'brazos' | 'grimes' | 'burleson'

export interface Profile {
  id: string
  created_at: string
  updated_at: string
  email: string
  full_name: string
  farm_name?: string
  user_type: UserType
  bio?: string
  avatar_url?: string
  phone?: string
  county: TexasTriangleCounty
  city?: string
  zip_code?: string
  farm_size_acres?: number
  organic_certified?: boolean
  years_farming?: number
  specialties?: string[]
  email_notifications?: boolean
  sms_notifications?: boolean
  show_in_directory?: boolean
  is_verified?: boolean
  verified_at?: string
  total_sales?: number
  rating?: number
  review_count?: number
}

export interface Product {
  name: string
  price?: number
  unit?: string
  quantity_available?: number
}

export interface Post {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  title: string
  description: string
  post_type: PostType
  visibility: PostVisibility
  status: PostStatus
  county: TexasTriangleCounty
  city?: string
  price?: number
  unit?: string
  quantity_available?: number
  products?: Product[]
  available_from?: string
  available_until?: string
  condition?: string
  brand?: string
  model?: string
  year?: number
  images?: string[]
  thumbnail_url?: string
  pickup_available?: boolean
  delivery_available?: boolean
  delivery_radius_miles?: number
  category?: string
  tags?: string[]
  view_count?: number
  saved_count?: number
  inquiry_count?: number
}

export interface Message {
  id: string
  created_at: string
  sender_id: string
  receiver_id: string
  content: string
  post_id?: string
  is_read?: boolean
  read_at?: string
}

// Database helper functions
export const db = {
  // Profile functions
  profiles: {
    async get(userId: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return data as Profile
    },
    
    async update(userId: string, updates: Partial<Profile>) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data as Profile
    },
    
    async listByCounty(county: TexasTriangleCounty) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('county', county)
        .eq('show_in_directory', true)
      
      if (error) throw error
      return data as Profile[]
    },
    
    async listFarmers() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('user_type', ['backyard_grower', 'market_gardener', 'production_farmer'])
        .eq('show_in_directory', true)
      
      if (error) throw error
      return data as Profile[]
    }
  },
  
  // Post functions
  posts: {
    async create(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()
        .single()
      
      if (error) throw error
      return data as Post
    },
    
    async get(postId: string) {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single()
      
      if (error) throw error
      return data as Post
    },
    
    async update(postId: string, updates: Partial<Post>) {
      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', postId)
        .select()
        .single()
      
      if (error) throw error
      return data as Post
    },
    
    async delete(postId: string) {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
      
      if (error) throw error
    },
    
    async listPublic(filters?: {
      county?: TexasTriangleCounty
      post_type?: PostType
      status?: PostStatus
    }) {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            full_name,
            farm_name,
            avatar_url,
            county,
            city,
            user_type
          )
        `)
        .eq('visibility', 'public')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      if (filters?.county) {
        query = query.eq('county', filters.county)
      }
      if (filters?.post_type) {
        query = query.eq('post_type', filters.post_type)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    },
    
    async listFarmersOnly() {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            full_name,
            farm_name,
            avatar_url,
            county,
            city,
            user_type
          )
        `)
        .eq('visibility', 'farmers_only')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    }
  },
  
  // Message functions
  messages: {
    async send(message: {
      receiver_id: string
      content: string
      post_id?: string
    }) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          ...message
        })
        .select()
        .single()
      
      if (error) throw error
      return data as Message
    },
    
    async getConversation(otherUserId: string) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            id,
            full_name,
            avatar_url
          ),
          receiver:profiles!messages_receiver_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data
    },
    
    async markAsRead(messageId: string) {
      const { data, error } = await supabase
        .from('messages')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .select()
        .single()
      
      if (error) throw error
      return data as Message
    },
    
    async getUnreadCount() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false)
      
      if (error) throw error
      return count || 0
    }
  },
  
  // Saved posts functions
  savedPosts: {
    async save(postId: string) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { data, error } = await supabase
        .from('saved_posts')
        .insert({
          user_id: user.id,
          post_id: postId
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    async unsave(postId: string) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId)
      
      if (error) throw error
    },
    
    async list() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          *,
          post:posts (
            *,
            profiles!posts_user_id_fkey (
              id,
              full_name,
              farm_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    }
  },
  
  // Waitlist functions
  waitlist: {
    async add(email: string, user_type?: UserType, county?: TexasTriangleCounty) {
      const { data, error } = await supabase
        .from('waitlist')
        .insert({
          email,
          user_type,
          county
        })
        .select()
        .single()
      
      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Email already registered on waitlist')
        }
        throw error
      }
      return data
    }
  }
}