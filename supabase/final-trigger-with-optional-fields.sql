-- Final trigger with proper handling of optional fields
-- This will work with all the metadata fields from signup

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_farm_name text;
  v_city text;
  v_phone text;
  v_bio text;
BEGIN
  -- Get optional values and handle empty strings
  v_farm_name := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'farm_name', '')), '');
  v_city := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'city', '')), '');
  v_phone := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), '');
  v_bio := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'bio', '')), '');

  -- Insert profile with required and optional fields
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
    COALESCE(NEW.email, 'unknown@email.com'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'consumer'::user_type),
    COALESCE((NEW.raw_user_meta_data->>'county')::texas_triangle_county, 'dallas'::texas_triangle_county),
    v_farm_name,
    v_city,
    v_phone,
    v_bio
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify
SELECT 'Trigger with optional fields created successfully!' as status;
