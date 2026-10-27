-- ==============================================================================
-- Supabase Migration: Add filterPanels column to settings table
-- File: db/schema/add-filter-panels-to-settings.sql
--
-- Apply this file in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).
-- Adds the filterPanels JSONB column to persist admin-configured colors, age groups,
-- price ranges, and categories directly in the Supabase database.
-- ==============================================================================

ALTER TABLE IF EXISTS public.settings 
ADD COLUMN IF NOT EXISTS "filterPanels" JSONB DEFAULT '{
  "colors": [
    {"id": "col-white", "name": "White", "colorCode": "#FFFFFF"},
    {"id": "col-black", "name": "Black", "colorCode": "#000000"},
    {"id": "col-navy", "name": "Navy Blue", "colorCode": "#0A192F"},
    {"id": "col-red", "name": "Red", "colorCode": "#EF4444"},
    {"id": "col-yellow", "name": "Yellow", "colorCode": "#F59E0B"},
    {"id": "col-pink", "name": "Pink", "colorCode": "#EC4899"},
    {"id": "col-green", "name": "Green", "colorCode": "#10B981"}
  ],
  "ageGroups": [
    "0-2 Years",
    "3-5 Years",
    "6-8 Years",
    "9-12 Years",
    "13-16 Years"
  ],
  "priceRanges": [
    {"id": "pr-under-499", "label": "Under ₹499", "min": 0, "max": 499},
    {"id": "pr-500-999", "label": "₹500 - ₹999", "min": 500, "max": 999},
    {"id": "pr-1000-1499", "label": "₹1,000 - ₹1,499", "min": 1000, "max": 1499},
    {"id": "pr-above-1500", "label": "Above ₹1,500", "min": 1500, "max": 999999}
  ],
  "categories": ["Co-ord Set", "Payjama Suit", "Boys Shorts", "Track Pant", "KIDS Pajama Suit"]
}'::jsonb;

-- Also update existing settings rows if filterPanels is NULL
UPDATE public.settings
SET "filterPanels" = '{
  "colors": [
    {"id": "col-white", "name": "White", "colorCode": "#FFFFFF"},
    {"id": "col-black", "name": "Black", "colorCode": "#000000"},
    {"id": "col-navy", "name": "Navy Blue", "colorCode": "#0A192F"},
    {"id": "col-red", "name": "Red", "colorCode": "#EF4444"},
    {"id": "col-yellow", "name": "Yellow", "colorCode": "#F59E0B"},
    {"id": "col-pink", "name": "Pink", "colorCode": "#EC4899"},
    {"id": "col-green", "name": "Green", "colorCode": "#10B981"}
  ],
  "ageGroups": [
    "0-2 Years",
    "3-5 Years",
    "6-8 Years",
    "9-12 Years",
    "13-16 Years"
  ],
  "priceRanges": [
    {"id": "pr-under-499", "label": "Under ₹499", "min": 0, "max": 499},
    {"id": "pr-500-999", "label": "₹500 - ₹999", "min": 500, "max": 999},
    {"id": "pr-1000-1499", "label": "₹1,000 - ₹1,499", "min": 1000, "max": 1499},
    {"id": "pr-above-1500", "label": "Above ₹1,500", "min": 1500, "max": 999999}
  ],
  "categories": ["Co-ord Set", "Payjama Suit", "Boys Shorts", "Track Pant", "KIDS Pajama Suit"]
}'::jsonb
WHERE "filterPanels" IS NULL;
