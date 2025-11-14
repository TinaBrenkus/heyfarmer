-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view profile photos (bucket is public)
CREATE POLICY "Public Access for Profile Photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

-- Policy: Users can upload their own profile photos
CREATE POLICY "Users can upload their own profile photo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own profile photos
CREATE POLICY "Users can update their own profile photo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own profile photos
CREATE POLICY "Users can delete their own profile photo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
