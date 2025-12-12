-- Migration: Add missing profile settings columns
-- These columns are needed for the settings page functionality
-- Run this in Supabase SQL Editor

-- Add grow_tags column (replaces/complements specialties for "What I Grow" feature)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS grow_tags TEXT[] DEFAULT '{}';

-- Add exact_address for private pickup location
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS exact_address TEXT;

-- Add contact preferences columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS platform_messages BOOLEAN DEFAULT true;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT false;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT false;

-- Add privacy settings columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS show_in_marketplace BOOLEAN DEFAULT true;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS allow_reviews BOOLEAN DEFAULT true;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS include_in_search BOOLEAN DEFAULT true;

-- Add comments to document the columns
COMMENT ON COLUMN profiles.grow_tags IS 'Array of items the farmer grows, displayed on their public profile';
COMMENT ON COLUMN profiles.exact_address IS 'Private full address for customer pickups, only shared with buyers';
COMMENT ON COLUMN profiles.platform_messages IS 'Allow contact via platform messaging';
COMMENT ON COLUMN profiles.show_phone IS 'Show phone number on public profile';
COMMENT ON COLUMN profiles.show_email IS 'Show email on public profile';
COMMENT ON COLUMN profiles.show_in_marketplace IS 'Show profile in public marketplace listings';
COMMENT ON COLUMN profiles.allow_reviews IS 'Allow customers to leave reviews';
COMMENT ON COLUMN profiles.include_in_search IS 'Include profile in search results';
