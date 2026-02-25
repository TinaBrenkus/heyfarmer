-- ============================================================
-- HeyFarmer Farm Directory Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- 0. Extend texas_triangle_county enum with all 39 counties
-- Each statement must run outside a transaction/DO block
-- IF NOT EXISTS makes these safe to re-run

-- Austin Metro
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'travis';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'williamson';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'hays';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'bastrop';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'caldwell';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'lee';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'burnet';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'blanco';
-- San Antonio Metro
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'bexar';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'comal';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'guadalupe';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'wilson';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'medina';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'kendall';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'bandera';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'atascosa';
-- Houston Metro
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'harris';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'fort-bend';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'montgomery';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'brazoria';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'galveston';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'liberty';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'chambers';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'waller';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'austin-county';
-- Central Corridor
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'mclennan';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'bell';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'brazos';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'grimes';
ALTER TYPE texas_triangle_county ADD VALUE IF NOT EXISTS 'burleson';

-- 1. Create directory_farms table
CREATE TABLE IF NOT EXISTS directory_farms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT,
  description TEXT,  -- the mini feature story

  -- Location
  county texas_triangle_county NOT NULL,
  city TEXT,
  zip_code TEXT,
  address TEXT,

  -- Products
  products TEXT[] DEFAULT '{}',
  farm_type TEXT DEFAULT 'other' CHECK (farm_type IN (
    'backyard_grower', 'market_gardener', 'production_farmer',
    'ranch', 'orchard', 'vineyard', 'apiary', 'nursery', 'other'
  )),
  specialties TEXT[] DEFAULT '{}',

  -- Contact
  website_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  phone TEXT,
  email TEXT,

  -- Media
  cover_image_url TEXT,
  additional_images TEXT[] DEFAULT '{}',

  -- Provenance
  data_source TEXT,
  source_url TEXT,
  admin_notes TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'claimed', 'removed')),
  claimed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  -- Engagement
  view_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create directory_claim_requests table
CREATE TABLE IF NOT EXISTS directory_claim_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  directory_farm_id UUID NOT NULL REFERENCES directory_farms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT,
  admin_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_directory_farms_slug ON directory_farms(slug);
CREATE INDEX IF NOT EXISTS idx_directory_farms_county ON directory_farms(county);
CREATE INDEX IF NOT EXISTS idx_directory_farms_status ON directory_farms(status);
CREATE INDEX IF NOT EXISTS idx_directory_farms_products ON directory_farms USING GIN(products);
CREATE INDEX IF NOT EXISTS idx_directory_farms_farm_type ON directory_farms(farm_type);

-- Full-text search index on name, description, city
CREATE INDEX IF NOT EXISTS idx_directory_farms_search ON directory_farms
  USING GIN(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(city, '')));

CREATE INDEX IF NOT EXISTS idx_directory_claim_requests_farm ON directory_claim_requests(directory_farm_id);
CREATE INDEX IF NOT EXISTS idx_directory_claim_requests_user ON directory_claim_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_directory_claim_requests_status ON directory_claim_requests(status);

-- 4. Updated_at trigger
CREATE OR REPLACE FUNCTION update_directory_farms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_directory_farms_updated_at ON directory_farms;
CREATE TRIGGER set_directory_farms_updated_at
  BEFORE UPDATE ON directory_farms
  FOR EACH ROW
  EXECUTE FUNCTION update_directory_farms_updated_at();

-- 5. RPC function to increment view count
CREATE OR REPLACE FUNCTION increment_directory_farm_views(farm_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE directory_farms
  SET view_count = view_count + 1
  WHERE id = farm_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Admin check helper
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ) IN ('admin@heyfarmer.farm');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Enable RLS
ALTER TABLE directory_farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_claim_requests ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for directory_farms

-- Public can read published/claimed entries
CREATE POLICY "Public can view published directory farms"
  ON directory_farms FOR SELECT
  USING (status IN ('published', 'claimed'));

-- Admins can view all entries (including drafts)
CREATE POLICY "Admins can view all directory farms"
  ON directory_farms FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can insert
CREATE POLICY "Admins can insert directory farms"
  ON directory_farms FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Admins can update any entry
CREATE POLICY "Admins can update directory farms"
  ON directory_farms FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Claimed users can update their own entry
CREATE POLICY "Claimed users can update their directory farm"
  ON directory_farms FOR UPDATE
  TO authenticated
  USING (claimed_by = auth.uid() AND status = 'claimed');

-- Admins can delete
CREATE POLICY "Admins can delete directory farms"
  ON directory_farms FOR DELETE
  TO authenticated
  USING (is_admin());

-- 9. RLS Policies for directory_claim_requests

-- Users can view their own claim requests
CREATE POLICY "Users can view own claim requests"
  ON directory_claim_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all claim requests
CREATE POLICY "Admins can view all claim requests"
  ON directory_claim_requests FOR SELECT
  TO authenticated
  USING (is_admin());

-- Authenticated users can create claim requests
CREATE POLICY "Authenticated users can create claim requests"
  ON directory_claim_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can update claim requests (approve/reject)
CREATE POLICY "Admins can update claim requests"
  ON directory_claim_requests FOR UPDATE
  TO authenticated
  USING (is_admin());

-- 10. Storage bucket for directory farm images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'directory-farm-images',
  'directory-farm-images',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view directory farm images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'directory-farm-images');

CREATE POLICY "Admins can upload directory farm images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'directory-farm-images' AND is_admin());

CREATE POLICY "Admins can update directory farm images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'directory-farm-images' AND is_admin());

CREATE POLICY "Admins can delete directory farm images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'directory-farm-images' AND is_admin());
