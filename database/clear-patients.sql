-- Clear All Patient Data Script
-- This script safely deletes all existing patient data and related records
-- Run this in your Supabase SQL editor before adding new patient data

-- Disable foreign key checks temporarily (if needed)
-- Note: Supabase handles cascading deletes automatically with ON DELETE CASCADE

-- Clear medical history first (though CASCADE should handle this)
DELETE FROM medical_history;

-- Clear appointments (though CASCADE should handle this)
DELETE FROM appointments;

-- Clear all patients (this will cascade to related tables)
DELETE FROM patients;

-- Reset any sequences if needed (Supabase uses UUID so this may not be necessary)
-- No AUTO_INCREMENT sequences to reset since we use UUIDs

-- Verify deletion
SELECT
  (SELECT COUNT(*) FROM patients) AS patients_count,
  (SELECT COUNT(*) FROM appointments) AS appointments_count,
  (SELECT COUNT(*) FROM medical_history) AS medical_history_count;

-- Data deletion completed. All patient-related data has been removed.
-- Ready for new patient data insertion.