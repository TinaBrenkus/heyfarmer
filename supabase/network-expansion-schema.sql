-- Hey Farmer Network Expansion Schema
-- New tables for Articles, Resources, and Newsletter Archive
-- Run this in Supabase SQL Editor after main schema.sql

-- ========================================
-- ARTICLES TABLE (From the Field blog posts)
-- ========================================
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ,

  -- Author (admin only)
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,

  -- Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly version of title
  featured_image_url TEXT,
  excerpt TEXT NOT NULL, -- Preview text (150 chars)
  content TEXT NOT NULL, -- Full article content (markdown or rich text)

  -- Categorization
  category TEXT NOT NULL, -- 'seasonal-guides', 'farmer-spotlights', 'market-insights', etc.
  tags TEXT[], -- Array of tags for searching

  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
  is_featured BOOLEAN DEFAULT false, -- Show in featured section

  -- Engagement
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,

  -- SEO
  meta_description TEXT,
  meta_keywords TEXT[]
);

-- Index for faster queries
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_slug ON articles(slug);

-- ========================================
-- RESOURCES TABLE (Resource Library links)
-- ========================================
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Resource details
  title TEXT NOT NULL,
  description TEXT NOT NULL, -- 50-100 character description
  url TEXT NOT NULL,
  category TEXT NOT NULL, -- 'podcasts', 'government', 'tools', 'education', 'organizations'

  -- Organization
  icon TEXT, -- Emoji or icon identifier
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0, -- Manual ordering within category

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Analytics
  click_count INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,

  -- Management
  added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verified BOOLEAN DEFAULT false -- Admin-verified resource
);

-- Indexes
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_active ON resources(is_active);
CREATE INDEX idx_resources_display_order ON resources(display_order);

-- ========================================
-- NEWSLETTERS TABLE (Newsletter Archive)
-- ========================================
CREATE TABLE newsletters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Issue details
  issue_number INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  published_date DATE NOT NULL,

  -- Content
  preview_bullets TEXT[] NOT NULL, -- Array of 3-5 bullet points
  full_content TEXT, -- Full newsletter HTML or markdown
  beehiiv_url TEXT, -- Link to Beehiiv hosted version

  -- Categorization
  tags TEXT[], -- 'market-intel', 'resources', 'community', etc.
  year INTEGER NOT NULL,

  -- Status
  is_published BOOLEAN DEFAULT true,

  -- Engagement
  view_count INTEGER DEFAULT 0,

  -- Search optimization
  searchable_content TEXT -- Concatenated content for full-text search
);

-- Indexes
CREATE INDEX idx_newsletters_issue_number ON newsletters(issue_number DESC);
CREATE INDEX idx_newsletters_published_date ON newsletters(published_date DESC);
CREATE INDEX idx_newsletters_year ON newsletters(year);
CREATE INDEX idx_newsletters_searchable ON newsletters USING gin(to_tsvector('english', searchable_content));

-- ========================================
-- ARTICLE COMMENTS TABLE (Optional - for future)
-- ========================================
CREATE TABLE article_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Reference
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Content
  content TEXT NOT NULL,

  -- Status
  is_approved BOOLEAN DEFAULT false, -- Admin moderation
  is_edited BOOLEAN DEFAULT false,

  -- Engagement
  like_count INTEGER DEFAULT 0
);

CREATE INDEX idx_article_comments_article ON article_comments(article_id);
CREATE INDEX idx_article_comments_approved ON article_comments(is_approved);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;

-- Articles Policies
-- Anyone can view published articles
CREATE POLICY "Anyone can view published articles"
  ON articles FOR SELECT
  USING (status = 'published');

-- Only admins can insert/update/delete articles
-- Note: You'll need to add an is_admin field to profiles or use a specific admin user_id
CREATE POLICY "Admins can manage articles"
  ON articles FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE user_type = 'production_farmer' AND is_verified = true
      -- Adjust this condition based on how you want to define admins
    )
  );

-- Resources Policies
-- Anyone can view active resources
CREATE POLICY "Anyone can view active resources"
  ON resources FOR SELECT
  USING (is_active = true);

-- Admins can manage resources
CREATE POLICY "Admins can manage resources"
  ON resources FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE user_type = 'production_farmer' AND is_verified = true
    )
  );

-- Newsletters Policies
-- Anyone can view published newsletters
CREATE POLICY "Anyone can view published newsletters"
  ON newsletters FOR SELECT
  USING (is_published = true);

-- Admins can manage newsletters
CREATE POLICY "Admins can manage newsletters"
  ON newsletters FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE user_type = 'production_farmer' AND is_verified = true
    )
  );

-- Article Comments Policies (for future use)
-- Anyone can view approved comments
CREATE POLICY "Anyone can view approved comments"
  ON article_comments FOR SELECT
  USING (is_approved = true);

-- Users can insert their own comments
CREATE POLICY "Users can create comments"
  ON article_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON article_comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can manage all comments
CREATE POLICY "Admins can manage comments"
  ON article_comments FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE user_type = 'production_farmer' AND is_verified = true
    )
  );

-- ========================================
-- FUNCTIONS FOR ANALYTICS
-- ========================================

-- Function to increment article views
CREATE OR REPLACE FUNCTION increment_article_views(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE articles
  SET view_count = view_count + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment resource clicks
CREATE OR REPLACE FUNCTION increment_resource_clicks(resource_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE resources
  SET
    click_count = click_count + 1,
    last_clicked_at = NOW()
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment newsletter views
CREATE OR REPLACE FUNCTION increment_newsletter_views(newsletter_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE newsletters
  SET view_count = view_count + 1
  WHERE id = newsletter_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletters_updated_at BEFORE UPDATE ON newsletters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_article_comments_updated_at BEFORE UPDATE ON article_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
