-- Migration: Add products column to posts table
-- This allows listings to have multiple products with individual prices/quantities
-- Run this in Supabase SQL Editor

-- Add products column as JSONB array
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS products JSONB DEFAULT NULL;

-- Add comment to document the column
COMMENT ON COLUMN posts.products IS 'Array of products for multi-product listings. Each product has: name, price, unit, quantity_available';

-- Example data structure:
-- [
--   {"name": "Tomatoes", "price": 5.00, "unit": "lb", "quantity_available": 50},
--   {"name": "Kale", "price": 3.00, "unit": "bunch", "quantity_available": 30}
-- ]
