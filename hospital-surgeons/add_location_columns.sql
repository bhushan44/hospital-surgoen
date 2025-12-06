-- Add location detail columns to doctors table
-- This allows storing parsed location components for better accuracy

-- Add the new columns
ALTER TABLE doctors
ADD COLUMN IF NOT EXISTS full_address TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS pincode VARCHAR(10);

-- Add index on city and state for faster location-based queries
CREATE INDEX IF NOT EXISTS idx_doctors_city ON doctors(city);
CREATE INDEX IF NOT EXISTS idx_doctors_state ON doctors(state);
CREATE INDEX IF NOT EXISTS idx_doctors_pincode ON doctors(pincode);

-- Optional: Add a composite index for location searches
CREATE INDEX IF NOT EXISTS idx_doctors_location_details ON doctors(city, state, pincode);

-- Comments for documentation
COMMENT ON COLUMN doctors.full_address IS 'Complete address including street, city, state, pincode, and country';
COMMENT ON COLUMN doctors.state IS 'State or province name';
COMMENT ON COLUMN doctors.city IS 'City name';
COMMENT ON COLUMN doctors.pincode IS 'Postal code or ZIP code (max 10 characters)';
COMMENT ON COLUMN doctors.primary_location IS 'Original location string entered by user (kept for backward compatibility)';

