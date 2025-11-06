-- Hey Farmer Database Schema for North Texas Farming Marketplace
-- Run this in Supabase SQL Editor (SQL Editor > New Query)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User types enum
CREATE TYPE user_type AS ENUM ('backyard_grower', 'market_gardener', 'production_farmer', 'consumer');

-- Post visibility enum
CREATE TYPE post_visibility AS ENUM ('public', 'farmers_only');

-- Post type enum  
CREATE TYPE post_type AS ENUM ('produce', 'equipment', 'resource', 'discussion');

-- Post status enum
CREATE TYPE post_status AS ENUM ('active', 'sold', 'expired', 'draft');

-- Counties enum for North Texas
CREATE TYPE north_texas_county AS ENUM (
  'wise', 'denton', 'parker', 'tarrant', 'collin', 'jack', 'dallas',
  'grayson', 'hunt', 'kaufman', 'rockwall'
);

-- ========================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- User info
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  farm_name TEXT,
  user_type user_type NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  phone TEXT,
  
  -- Location
  county north_texas_county NOT NULL,
  city TEXT,
  zip_code TEXT,
  
  -- Farm details (for farmers only)
  farm_size_acres DECIMAL,
  organic_certified BOOLEAN DEFAULT false,
  years_farming INTEGER,
  specialties TEXT[], -- array of specialties like ['tomatoes', 'peppers', 'herbs']
  
  -- Settings
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  show_in_directory BOOLEAN DEFAULT true,
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  
  -- Stats
  total_sales INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0
);

-- ========================================
-- POSTS TABLE (marketplace & network posts)
-- ========================================
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Author
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Post details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  post_type post_type NOT NULL,
  visibility post_visibility NOT NULL DEFAULT 'public',
  status post_status NOT NULL DEFAULT 'active',
  
  -- Location
  county north_texas_county NOT NULL,
  city TEXT,
  
  -- For marketplace posts (produce/equipment)
  price DECIMAL(10,2),
  unit TEXT, -- 'per pound', 'per dozen', 'each', etc.
  quantity_available INTEGER,
  available_from DATE,
  available_until DATE,
  
  -- For equipment posts
  condition TEXT, -- 'new', 'excellent', 'good', 'fair'
  brand TEXT,
  model TEXT,
  year INTEGER,
  
  -- Images
  images TEXT[], -- array of image URLs
  thumbnail_url TEXT,
  
  -- Delivery/pickup options
  pickup_available BOOLEAN DEFAULT true,
  delivery_available BOOLEAN DEFAULT false,
  delivery_radius_miles INTEGER,
  
  -- Categories/tags
  category TEXT,
  tags TEXT[],
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  saved_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0
);

-- ========================================
-- MESSAGES TABLE (direct messaging)
-- ========================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Participants
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Message content
  content TEXT NOT NULL,
  
  -- Related to a post (optional)
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ
);

-- ========================================
-- CONVERSATIONS TABLE (group messages by conversation)
-- ========================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Participants (sorted to ensure uniqueness)
  participant1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Last message info for quick display
  last_message_at TIMESTAMPTZ,
  last_message_content TEXT,
  last_message_sender_id UUID REFERENCES profiles(id),
  
  -- Unread counts
  participant1_unread_count INTEGER DEFAULT 0,
  participant2_unread_count INTEGER DEFAULT 0,
  
  -- Related post (if conversation started from a post inquiry)
  initial_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  
  -- Ensure unique conversation between two users
  CONSTRAINT unique_conversation UNIQUE (participant1_id, participant2_id),
  CONSTRAINT ordered_participants CHECK (participant1_id < participant2_id)
);

-- ========================================
-- SAVED POSTS TABLE (users can save posts)
-- ========================================
CREATE TABLE saved_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  
  -- Ensure user can't save same post twice
  CONSTRAINT unique_saved_post UNIQUE (user_id, post_id)
);

-- ========================================
-- REVIEWS TABLE (for completed transactions)
-- ========================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Who is reviewing whom
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Related to a post
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  
  -- Review details
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  -- Prevent duplicate reviews for same transaction
  CONSTRAINT unique_review UNIQUE (reviewer_id, reviewed_id, post_id)
);

-- ========================================
-- WAITLIST TABLE (for email signups)
-- ========================================
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  email TEXT UNIQUE NOT NULL,
  user_type user_type,
  county north_texas_county,
  
  -- Track conversion
  converted_to_user_id UUID REFERENCES profiles(id),
  converted_at TIMESTAMPTZ
);

-- ========================================
-- INDEXES for better query performance
-- ========================================

-- Posts indexes
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_county ON posts(county);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_type ON posts(post_type);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_available_dates ON posts(available_from, available_until);

-- Messages indexes
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- Conversations indexes
CREATE INDEX idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX idx_conversations_participant2 ON conversations(participant2_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- Profiles indexes
CREATE INDEX idx_profiles_county ON profiles(county);
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Saved posts indexes
CREATE INDEX idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX idx_saved_posts_post_id ON saved_posts(post_id);

-- Reviews indexes
CREATE INDEX idx_reviews_reviewed_id ON reviews(reviewed_id);
CREATE INDEX idx_reviews_post_id ON reviews(post_id);

-- ========================================
-- TRIGGER FUNCTIONS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type, county)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'consumer'),
    COALESCE((NEW.raw_user_meta_data->>'county')::north_texas_county, 'dallas')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update conversation when message is sent
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
DECLARE
  conv_id UUID;
  p1_id UUID;
  p2_id UUID;
BEGIN
  -- Order participants to match conversation constraint
  IF NEW.sender_id < NEW.receiver_id THEN
    p1_id := NEW.sender_id;
    p2_id := NEW.receiver_id;
  ELSE
    p1_id := NEW.receiver_id;
    p2_id := NEW.sender_id;
  END IF;
  
  -- Find or create conversation
  INSERT INTO conversations (participant1_id, participant2_id, initial_post_id)
  VALUES (p1_id, p2_id, NEW.post_id)
  ON CONFLICT (participant1_id, participant2_id)
  DO NOTHING
  RETURNING id INTO conv_id;
  
  -- If no new conversation was created, get the existing one
  IF conv_id IS NULL THEN
    SELECT id INTO conv_id
    FROM conversations
    WHERE participant1_id = p1_id AND participant2_id = p2_id;
  END IF;
  
  -- Update conversation with latest message info
  UPDATE conversations
  SET 
    last_message_at = NEW.created_at,
    last_message_content = NEW.content,
    last_message_sender_id = NEW.sender_id,
    participant1_unread_count = CASE 
      WHEN NEW.receiver_id = participant1_id 
      THEN participant1_unread_count + 1 
      ELSE participant1_unread_count 
    END,
    participant2_unread_count = CASE 
      WHEN NEW.receiver_id = participant2_id 
      THEN participant2_unread_count + 1 
      ELSE participant2_unread_count 
    END
  WHERE id = conv_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating conversation on new message
CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- Function to reset unread count when messages are read
CREATE OR REPLACE FUNCTION reset_unread_count_on_read()
RETURNS TRIGGER AS $$
DECLARE
  p1_id UUID;
  p2_id UUID;
BEGIN
  -- Only proceed if message is being marked as read
  IF NEW.is_read = true AND OLD.is_read = false THEN
    -- Order participants
    IF NEW.sender_id < NEW.receiver_id THEN
      p1_id := NEW.sender_id;
      p2_id := NEW.receiver_id;
    ELSE
      p1_id := NEW.receiver_id;
      p2_id := NEW.sender_id;
    END IF;
    
    -- Reset unread count for the receiver
    UPDATE conversations
    SET 
      participant1_unread_count = CASE 
        WHEN NEW.receiver_id = participant1_id 
        THEN 0
        ELSE participant1_unread_count 
      END,
      participant2_unread_count = CASE 
        WHEN NEW.receiver_id = participant2_id 
        THEN 0
        ELSE participant2_unread_count 
      END
    WHERE participant1_id = p1_id AND participant2_id = p2_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for resetting unread count
CREATE TRIGGER on_message_read
  AFTER UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION reset_unread_count_on_read();