-- Migration: Add max_assignments_per_month column to doctor_plan_features table
-- Date: 2025-01-12
-- Description: Adds the max_assignments_per_month field to doctor plan features to track maximum assignments per month

ALTER TABLE doctor_plan_features 
ADD COLUMN IF NOT EXISTS max_assignments_per_month INTEGER;

-- Add comment to the column
COMMENT ON COLUMN doctor_plan_features.max_assignments_per_month IS 'Maximum number of assignments per month. Use -1 for unlimited, NULL for not set.';

