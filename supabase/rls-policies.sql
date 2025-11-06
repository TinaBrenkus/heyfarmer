-- Row Level Security (RLS) Policies for Hey Farmer
-- Run this AFTER the schema.sql in Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PROFILES POLICIES
-- ========================================

-- Anyone can view public profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (handled by trigger, but needed for completeness)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ========================================
-- POSTS POLICIES
-- ========================================

-- Public posts are viewable by everyone
CREATE POLICY "Public posts are viewable by everyone"
ON posts FOR SELECT
USING (
  visibility = 'public' 
  OR 
  (visibility = 'farmers_only' AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type IN ('backyard_grower', 'market_gardener', 'production_farmer')
  ))
);

-- Users can create posts
CREATE POLICY "Authenticated users can create posts"
ON posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE
USING (auth.uid() = user_id);

-- ========================================
-- MESSAGES POLICIES
-- ========================================

-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages"
ON messages FOR SELECT
USING (
  auth.uid() = sender_id 
  OR 
  auth.uid() = receiver_id
);

-- Users can send messages
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can mark received messages as read"
ON messages FOR UPDATE
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);

-- ========================================
-- CONVERSATIONS POLICIES
-- ========================================

-- Users can view conversations they're part of
CREATE POLICY "Users can view own conversations"
ON conversations FOR SELECT
USING (
  auth.uid() = participant1_id 
  OR 
  auth.uid() = participant2_id
);

-- Conversations are created automatically via trigger
-- But we need policy for the trigger to work
CREATE POLICY "System can create conversations"
ON conversations FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = participant1_id 
  OR 
  auth.uid() = participant2_id
);

-- Users can update conversations they're part of
CREATE POLICY "Users can update own conversations"
ON conversations FOR UPDATE
USING (
  auth.uid() = participant1_id 
  OR 
  auth.uid() = participant2_id
)
WITH CHECK (
  auth.uid() = participant1_id 
  OR 
  auth.uid() = participant2_id
);

-- ========================================
-- SAVED POSTS POLICIES
-- ========================================

-- Users can view their own saved posts
CREATE POLICY "Users can view own saved posts"
ON saved_posts FOR SELECT
USING (auth.uid() = user_id);

-- Users can save posts
CREATE POLICY "Users can save posts"
ON saved_posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can unsave posts
CREATE POLICY "Users can delete own saved posts"
ON saved_posts FOR DELETE
USING (auth.uid() = user_id);

-- ========================================
-- REVIEWS POLICIES
-- ========================================

-- Anyone can view reviews
CREATE POLICY "Reviews are publicly viewable"
ON reviews FOR SELECT
USING (true);

-- Users can create reviews for others
CREATE POLICY "Users can create reviews"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = reviewer_id 
  AND 
  auth.uid() != reviewed_id
);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
ON reviews FOR UPDATE
USING (auth.uid() = reviewer_id)
WITH CHECK (auth.uid() = reviewer_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
ON reviews FOR DELETE
USING (auth.uid() = reviewer_id);

-- ========================================
-- WAITLIST POLICIES
-- ========================================

-- Only allow inserts to waitlist (public signup)
CREATE POLICY "Anyone can join waitlist"
ON waitlist FOR INSERT
WITH CHECK (true);

-- Only admins can view waitlist (you'll need to create an admin role)
-- For now, no one can select from waitlist except via service role

-- ========================================
-- HELPER FUNCTIONS FOR RLS
-- ========================================

-- Function to check if user is a farmer
CREATE OR REPLACE FUNCTION is_farmer(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = user_id 
    AND profiles.user_type IN ('backyard_grower', 'market_gardener', 'production_farmer')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a post
CREATE OR REPLACE FUNCTION owns_post(user_id UUID, post_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM posts 
    WHERE posts.id = post_id 
    AND posts.user_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- STORAGE POLICIES (for images)
-- ========================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, avif_autodetection, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, false, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('post-images', 'post-images', true, false, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND 
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policies for post images
CREATE POLICY "Post images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-images' 
  AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own post images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'post-images' 
  AND 
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'post-images' 
  AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own post images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-images' 
  AND 
  (storage.foldername(name))[1] = auth.uid()::text
);