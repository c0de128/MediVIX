-- Add Patient Information Columns
-- This script adds insurance, emergency contact, and medication columns to the patients table
-- Run this in your Supabase SQL editor

-- Add missing columns to patients table
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS insurance_provider TEXT,
ADD COLUMN IF NOT EXISTS insurance_id TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT,
ADD COLUMN IF NOT EXISTS medications TEXT[] DEFAULT '{}';

-- Create indexes for new columns (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_patients_insurance_provider ON patients (insurance_provider);
CREATE INDEX IF NOT EXISTS idx_patients_emergency_contact ON patients (emergency_contact_name);

-- Verify the schema update
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'patients'
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Patient information columns added successfully.' AS result;