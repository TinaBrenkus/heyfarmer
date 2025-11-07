-- Migration: Expand from North Texas to Texas Triangle Megaregion
-- This adds counties from Austin, San Antonio, Houston, and Central Corridor areas

-- Step 1: Create new enum type with all Texas Triangle counties
CREATE TYPE texas_triangle_county AS ENUM (
  -- Dallas-Fort Worth Metro (existing)
  'dallas', 'tarrant', 'denton', 'collin', 'rockwall', 'kaufman', 'wise', 'parker', 'jack', 'grayson', 'hunt',
  -- Austin Metro
  'travis', 'williamson', 'hays', 'bastrop', 'caldwell', 'lee', 'burnet', 'blanco',
  -- San Antonio Metro
  'bexar', 'comal', 'guadalupe', 'wilson', 'medina', 'kendall', 'bandera', 'atascosa',
  -- Houston Metro
  'harris', 'fort-bend', 'montgomery', 'brazoria', 'galveston', 'liberty', 'chambers', 'waller', 'austin-county',
  -- Central Corridor (Waco, Temple, College Station)
  'mclennan', 'bell', 'brazos', 'grimes', 'burleson'
);

-- Step 2: Alter profiles table to use new type
ALTER TABLE profiles 
  ALTER COLUMN county TYPE texas_triangle_county 
  USING county::text::texas_triangle_county;

-- Step 3: Alter posts table to use new type
ALTER TABLE posts 
  ALTER COLUMN county TYPE texas_triangle_county 
  USING county::text::texas_triangle_county;

-- Step 4: Alter waitlist table to use new type
ALTER TABLE waitlist 
  ALTER COLUMN county TYPE texas_triangle_county 
  USING county::text::texas_triangle_county;

-- Step 5: Update the trigger function to use new type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type, county)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'consumer'),
    COALESCE((NEW.raw_user_meta_data->>'county')::texas_triangle_county, 'dallas')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Drop old type (this will fail if any other objects use it, which is good for safety)
DROP TYPE north_texas_county;

-- Step 7: Update comments
COMMENT ON TYPE texas_triangle_county IS 'Counties in the Texas Triangle megaregion (DFW, Austin, San Antonio, Houston, and connecting areas)';
