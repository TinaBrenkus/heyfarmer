# Hey Farmer - Supabase Database Setup Guide

## 🚀 Quick Setup Instructions

### Step 1: Get Your Supabase Credentials
1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon) → **API**
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with: `eyJ...`)
   - **Service Role Key** (keep this secret!)

### Step 2: Add Credentials to Your Project
1. Open the `.env.local` file in your project
2. Replace the placeholder values with your actual credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 3: Run the Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the ENTIRE contents of `supabase/schema.sql`
4. Click **Run** (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

### Step 4: Enable Row Level Security (RLS)
1. Still in SQL Editor, click **New Query**
2. Copy and paste the ENTIRE contents of `supabase/rls-policies.sql`
3. Click **Run**
4. You should see "Success. No rows returned"

### Step 5: Verify Everything Works
1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - profiles
   - posts
   - messages
   - conversations
   - saved_posts
   - reviews
   - waitlist

### Step 6: Enable Email Authentication
1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Configure email templates if desired (optional)

## 📊 Database Structure Overview

### User Types
- **Consumer**: People who want to buy produce
- **Backyard Grower**: Home gardeners with surplus
- **Market Gardener**: Small commercial farms
- **Production Farmer**: Large commercial operations

### Key Features
- **Public Marketplace**: Anyone can browse, consumers can buy
- **Farmers-Only Network**: Private discussions and resource sharing
- **County-Based**: Organized by North Texas counties
- **Messaging System**: Direct communication between users
- **Post Visibility**: Posts can be public or farmers-only

### Tables Created
1. **profiles**: User information and farm details
2. **posts**: Marketplace listings and network posts
3. **messages**: Direct messages between users
4. **conversations**: Groups messages by conversation
5. **saved_posts**: Users can save posts for later
6. **reviews**: Transaction feedback system
7. **waitlist**: Email signup for launch

## 🔒 Security Features
- Row Level Security (RLS) enabled on all tables
- Users can only edit their own data
- Farmers-only posts are hidden from consumers
- Secure message system with read receipts
- Image upload restrictions by user

## 🛠️ Troubleshooting

### Error: "relation already exists"
This means the tables are already created. You can:
1. Drop all tables and start fresh (WARNING: deletes all data)
2. Skip the schema.sql and just run rls-policies.sql

### Error: "permission denied"
Make sure you're using the Service Role Key in SQL Editor, or running as the database owner.

### Error: Missing environment variables
Double-check that your `.env.local` file has all three required values and no typos.

## 📱 Test the Authentication
1. Start your dev server: `npm run dev`
2. Navigate to `/signup` to create an account
3. Check your email for verification (if email confirmations are enabled)
4. Log in at `/login`

## 🎉 You're Ready!
Your database is now set up for the Hey Farmer marketplace. The platform supports:
- User registration with farmer type selection
- Public marketplace posts
- Private farmer networking
- Direct messaging
- County-based organization
- Review system

Need help? Check the Supabase docs or reach out to the Hey Farmer team!