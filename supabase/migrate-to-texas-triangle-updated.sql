-- Migration: Expand from North Texas to Texas Triangle Megaregion
-- This adds counties from Austin, San Antonio, Houston, and Central Corridor areas
-- UPDATED to handle optional profile fields

-- Step 1: Create new enum type with all Texas Triangle counties
DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Step 2: Alter profiles table to use new type (if not already done)
DO $$ BEGIN
  ALTER TABLE profiles
    ALTER COLUMN county TYPE texas_triangle_county
    USING county::text::texas_triangle_county;
EXCEPTION
  WHEN invalid_text_representation THEN
    RAISE NOTICE 'Some county values could not be converted. Please check your data.';
  WHEN undefined_object THEN
    RAISE NOTICE 'Table or column does not exist yet.';
END $$;

-- Step 3: Alter posts table to use new type
DO $$ BEGIN
  ALTER TABLE posts
    ALTER COLUMN county TYPE texas_triangle_county
    USING county::text::texas_triangle_county;
EXCEPTION
  WHEN invalid_text_representation THEN
    RAISE NOTICE 'Some county values could not be converted. Please check your data.';
  WHEN undefined_object THEN
    RAISE NOTICE 'Table or column does not exist yet.';
END $$;

-- Step 4: Alter waitlist table to use new type
DO $$ BEGIN
  ALTER TABLE waitlist
    ALTER COLUMN county TYPE texas_triangle_county
    USING county::text::texas_triangle_county;
EXCEPTION
  WHEN invalid_text_representation THEN
    RAISE NOTICE 'Some county values could not be converted. Please check your data.';
  WHEN undefined_object THEN
    RAISE NOTICE 'Table or column does not exist yet.';
END $$;

-- Step 5: Update the trigger function to use new type and handle optional fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    user_type,
    county,
    farm_name,
    city,
    phone,
    bio
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'consumer'),
    COALESCE((NEW.raw_user_meta_data->>'county')::texas_triangle_county, 'dallas'),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'farm_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'city'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'bio'), '')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error details for debugging
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    -- Re-raise to prevent user creation if profile fails
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Drop old type if it exists
DO $$ BEGIN
  DROP TYPE IF EXISTS north_texas_county CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not drop north_texas_county type: %', SQLERRM;
END $$;

-- Step 7: Update comments
COMMENT ON TYPE texas_triangle_county IS 'Counties in the Texas Triangle megaregion (DFW, Austin, San Antonio, Houston, and connecting areas)';
