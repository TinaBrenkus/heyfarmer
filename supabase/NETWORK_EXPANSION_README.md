# Network Page Expansion - Database Setup

## Quick Setup

### Step 1: Run the Schema
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire contents of `network-expansion-schema.sql`
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

### Step 2: Verify Tables Created
Go to **Table Editor** and verify these new tables exist:
- `articles`
- `resources`
- `newsletters`
- `article_comments` (for future use)

## Admin Permissions

**IMPORTANT:** The current admin policy allows verified production farmers to manage content.

### Current Admin Definition
```sql
user_type = 'production_farmer' AND is_verified = true
```

### To Make Yourself an Admin
Run this in SQL Editor (replace with your user ID):
```sql
UPDATE profiles
SET
  user_type = 'production_farmer',
  is_verified = true
WHERE email = 'your-email@example.com';
```

### Alternative: Create Admin Role
If you want a dedicated admin role, you can:
1. Add an `is_admin` boolean column to profiles
2. Update the RLS policies to check `is_admin = true`

## Table Descriptions

### Articles Table
Stores blog posts for "From the Field" tab
- **Status**: draft, published, archived
- **Category**: seasonal-guides, farmer-spotlights, market-insights, sustainability, business-tips, guest-posts
- **Featured**: One article can be featured at the top
- **Slug**: Auto-generated URL-friendly version of title

### Resources Table
External links for Resource Library
- **Category**: podcasts, government, tools, education, organizations
- **Click Tracking**: Automatically tracks popularity
- **Display Order**: Manual sorting within categories
- **Verified**: Admin-approved resources

### Newsletters Table
Archive of newsletter issues from Beehiiv
- **Issue Number**: Sequential numbering (1, 2, 3...)
- **Preview Bullets**: 3-5 bullet points showing content
- **Full Content**: Complete newsletter HTML/markdown
- **Beehiiv URL**: Link to hosted version
- **Searchable**: Full-text search enabled

### Article Comments Table
For future comment system (optional)
- Requires admin approval before showing
- Users can edit their own comments
- Like functionality built-in

## Initial Data Examples

### Example Article Insert
```sql
INSERT INTO articles (
  author_id,
  author_name,
  title,
  slug,
  excerpt,
  content,
  category,
  status,
  is_featured,
  published_at
) VALUES (
  'your-user-id-here',
  'Your Name',
  '5 Lessons from My First Farmers Market Season',
  '5-lessons-first-farmers-market',
  'Starting at farmers markets can be overwhelming. Here are the key lessons I learned that made my second season much smoother...',
  '# Full article content here in markdown...',
  'market-insights',
  'published',
  true,
  NOW()
);
```

### Example Resource Insert
```sql
INSERT INTO resources (
  title,
  description,
  url,
  category,
  icon,
  is_featured,
  display_order,
  added_by,
  verified
) VALUES
(
  'Soil Sisters Podcast',
  'Weekly soil health discussions',
  'https://soilsisterspodcast.com',
  'podcasts',
  '🎙️',
  true,
  1,
  'your-user-id-here',
  true
),
(
  'Johnny''s Seed Calculator',
  'Plan your planting quantities',
  'https://www.johnnyseeds.com/growers-library/tools-calculators.html',
  'tools',
  '🛠️',
  false,
  1,
  'your-user-id-here',
  true
);
```

### Example Newsletter Insert
```sql
INSERT INTO newsletters (
  issue_number,
  title,
  published_date,
  preview_bullets,
  beehiiv_url,
  tags,
  year,
  searchable_content
) VALUES (
  1,
  'Welcome to Hey Farmer Network',
  '2025-01-15',
  ARRAY[
    'Introducing the new farmer network features',
    'Upcoming grant deadline for Texas farmers',
    'Featured farmer spotlight: Rodriguez Family Farm'
  ],
  'https://heyfarmer.beehiiv.com/p/issue-1',
  ARRAY['community', 'resources'],
  2025,
  'Welcome to Hey Farmer Network. Introducing the new farmer network features. Upcoming grant deadline for Texas farmers. Featured farmer spotlight: Rodriguez Family Farm'
);
```

## Security Notes

- All tables have Row Level Security (RLS) enabled
- Public can view published content only
- Admins can manage all content
- View/click tracking is public (no auth required)
- Comment system requires login to post

## Analytics Functions

Built-in functions for tracking engagement:
```sql
-- Track article views
SELECT increment_article_views('article-id-here');

-- Track resource clicks
SELECT increment_resource_clicks('resource-id-here');

-- Track newsletter views
SELECT increment_newsletter_views('newsletter-id-here');
```

## Next Steps

After running this schema:
1. Make yourself an admin (see above)
2. Add initial resources to the Resource Library
3. Consider adding a few placeholder articles
4. Test the policies by logging in as different user types

## Troubleshooting

**Error: "relation already exists"**
- Tables are already created, you're good to go!

**Error: "permission denied"**
- Make sure you're running as the database owner or using service role key

**Can't manage content**
- Check that your user profile has the right permissions (see Admin Permissions above)
