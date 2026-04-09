-- Fix missing profiles for existing users
-- Run this in Supabase SQL Editor if users exist but profiles are missing

-- Create profiles for any auth users that don't have one
INSERT INTO public.profiles (id, email, full_name, user_type, county)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', 'User'),
  COALESCE((au.raw_user_meta_data->>'user_type')::user_type, 'consumer'),
  COALESCE((au.raw_user_meta_data->>'county')::north_texas_county, 'dallas')
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Show the results
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.county,
  p.created_at
FROM profiles p
ORDER BY p.created_at DESC;