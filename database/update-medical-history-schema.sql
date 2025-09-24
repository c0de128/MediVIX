-- Update Medical History Table Schema
-- This script adds missing columns to support comprehensive medical history timeline
-- Run this in your Supabase SQL editor

-- Add missing columns to medical_history table
ALTER TABLE medical_history
ADD COLUMN IF NOT EXISTS entry_type TEXT DEFAULT 'note' CHECK (entry_type IN ('diagnosis', 'treatment', 'medication', 'lab_result', 'procedure', 'note')),
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'chronic', 'inactive')),
ADD COLUMN IF NOT EXISTS severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS date_recorded TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS provider_name TEXT,
ADD COLUMN IF NOT EXISTS medications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS lab_values JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}';

-- Update existing records to have proper values for new columns
UPDATE medical_history
SET
  entry_type = 'diagnosis',
  title = diagnosis,
  description = COALESCE(treatment, '') || ' ' || COALESCE(follow_up_notes, ''),
  status = 'chronic',
  date_recorded = created_at,
  provider_name = 'Dr. Sarah Mitchell'
WHERE title IS NULL;

-- Create additional indexes for new columns
CREATE INDEX IF NOT EXISTS idx_medical_history_entry_type ON medical_history (entry_type);
CREATE INDEX IF NOT EXISTS idx_medical_history_status ON medical_history (status);
CREATE INDEX IF NOT EXISTS idx_medical_history_date_recorded ON medical_history (date_recorded);
CREATE INDEX IF NOT EXISTS idx_medical_history_provider ON medical_history (provider_name);

-- Verify the schema update
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'medical_history'
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Medical history schema updated successfully.' AS result;