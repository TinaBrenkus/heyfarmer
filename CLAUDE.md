# Hey Farmer - Development Guide for Claude Code

## Project Overview
Hey Farmer is a Next.js marketplace platform connecting North Texas farmers and consumers.

## Tech Stack
- Next.js 15.5.4 with TypeScript
- Supabase (Authentication & Database)
- Tailwind CSS for styling
- Turbopack for development

## Key Commands
```bash
# Start development server
npm run dev

# Build for production  
npm run build

# Run linting
npm run lint

# Type checking
npm run typecheck
```

## Database Setup
Database is already configured in Supabase with:
- User profiles table with trigger for automatic profile creation
- Posts table with RLS policies
- User types: consumer, backyard_grower, market_gardener, production_farmer
- North Texas counties enum

## Common Development Tasks

### 1. Starting Fresh Development Session
```bash
# Kill any existing processes on port 3000
npx kill-port 3000

# Start dev server
npm run dev
```

### 2. Testing User Flows
- Consumer signup/login → Browse marketplace → Contact farmers
- Farmer signup/login → Create listings → View dashboard

### 3. Key Files Structure
```
src/
├── app/
│   ├── dashboard/      # User dashboard
│   ├── marketplace/    # Browse listings
│   ├── sell/          # Create listings (farmers only)
│   ├── login/         # Authentication
│   └── signup/        # New user registration
├── components/
│   ├── icons/         # Custom SVG components
│   ├── marketplace/   # Listing components
│   └── layout/        # Header/Footer
└── lib/
    ├── supabase.ts    # Supabase client
    └── database.ts    # Database types & helpers
```

## Known Issues & Solutions

### Port Already in Use
If you see "Port 3000 is already in use":
```bash
npx kill-port 3000
npm run dev
```

### Profile Missing After Signup
The trigger should auto-create profiles. If not working, check:
1. Supabase trigger `on_auth_user_created` is enabled
2. Email confirmation is disabled in Supabase Auth settings

### Farmers-Only Listings Not Showing
Marketplace checks user profile to determine if they're a farmer. Ensure:
1. User is logged in
2. Profile exists with correct user_type
3. Header navigation shows user's name

## Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Development Tips
1. Keep only one dev server running at a time
2. Use the Header component for navigation - it's auth-aware
3. Test with different user types for role-based features
4. Check browser console for Supabase auth errors

## Next Features to Implement
- [ ] Messaging between users
- [ ] Image upload for listings
- [ ] Search filters by location
- [ ] User ratings/reviews
- [ ] Email notifications
- [ ] Payment integration