-- Migration: Add farm_images column to profiles table
-- This allows farmers to showcase multiple photos of their farm
-- Run this in Supabase SQL Editor

-- Add farm_images column as JSONB array
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS farm_images TEXT[] DEFAULT '{}';

-- Add comment to document the column
COMMENT ON COLUMN profiles.farm_images IS 'Array of image URLs showcasing the farm, barn, garden, homestead, etc. Up to 5 images.';

-- Example data structure:
-- ['https://supabase.co/storage/profile-images/user1/farm1.jpg', 'https://supabase.co/storage/profile-images/user1/barn.jpg']
