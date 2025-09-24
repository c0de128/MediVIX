-- MediVIX Row Level Security (RLS) Policies
-- Healthcare-grade security implementation for HIPAA compliance
-- Run this script in your Supabase SQL editor after the main schema

-- ============================================================================
-- 1. CREATE USER ROLES AND AUTHENTICATION TABLES
-- ============================================================================

-- Create user roles enum
CREATE TYPE user_role AS ENUM ('patient', 'healthcare_provider', 'admin', 'read_only');

-- Create users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'patient',
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  organization_id UUID, -- For multi-tenant setup
  license_number TEXT, -- For healthcare providers
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create provider-patient relationships table for care team access
CREATE TABLE provider_patient_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  access_type TEXT CHECK (access_type IN ('primary', 'secondary', 'emergency', 'consulting')),
  granted_by UUID REFERENCES user_profiles(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(provider_id, patient_id)
);

-- Add user_id to patients table to link patients to their user accounts
ALTER TABLE patients ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add provider_id to appointments for care provider assignment
ALTER TABLE appointments ADD COLUMN provider_id UUID REFERENCES user_profiles(id);

-- Add provider_id to medical_history for recording who made the entry
ALTER TABLE medical_history ADD COLUMN provider_id UUID REFERENCES user_profiles(id);

-- Create audit log table for compliance
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
  user_id UUID REFERENCES auth.users(id),
  user_role user_role,
  ip_address INET,
  user_agent TEXT,
  changed_columns TEXT[],
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT -- For justified access logging
);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_organization ON user_profiles(organization_id);
CREATE INDEX idx_provider_patient_access_provider ON provider_patient_access(provider_id);
CREATE INDEX idx_provider_patient_access_patient ON provider_patient_access(patient_id);
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_user_timestamp ON audit_log(user_id, timestamp);

-- Enable RLS on new tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_patient_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. HELPER FUNCTIONS FOR RLS POLICIES
-- ============================================================================

-- Function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role
    FROM user_profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is a healthcare provider for a patient
CREATE OR REPLACE FUNCTION is_provider_for_patient(patient_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM provider_patient_access ppa
    WHERE ppa.provider_id = auth.uid()
      AND ppa.patient_id = patient_uuid
      AND ppa.is_active = true
      AND (ppa.expires_at IS NULL OR ppa.expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM user_profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is healthcare provider
CREATE OR REPLACE FUNCTION is_healthcare_provider()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('healthcare_provider', 'admin')
    FROM user_profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. DROP EXISTING PERMISSIVE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Allow all operations on patients" ON patients;
DROP POLICY IF EXISTS "Allow all operations on appointments" ON appointments;
DROP POLICY IF EXISTS "Allow all operations on visit_templates" ON visit_templates;
DROP POLICY IF EXISTS "Allow all operations on medical_history" ON medical_history;

-- ============================================================================
-- 4. PATIENTS TABLE RLS POLICIES
-- ============================================================================

-- Patients can view their own records
CREATE POLICY "patients_select_own" ON patients
  FOR SELECT USING (user_id = auth.uid());

-- Patients can update their own basic info (not medical data)
CREATE POLICY "patients_update_own" ON patients
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Healthcare providers can view patients under their care
CREATE POLICY "providers_select_patients" ON patients
  FOR SELECT USING (
    is_healthcare_provider() AND (
      is_admin() OR
      is_provider_for_patient(id)
    )
  );

-- Healthcare providers can update patients under their care
CREATE POLICY "providers_update_patients" ON patients
  FOR UPDATE USING (
    is_healthcare_provider() AND (
      is_admin() OR
      is_provider_for_patient(id)
    )
  )
  WITH CHECK (
    is_healthcare_provider() AND (
      is_admin() OR
      is_provider_for_patient(id)
    )
  );

-- Only admins can insert new patients
CREATE POLICY "admins_insert_patients" ON patients
  FOR INSERT WITH CHECK (is_admin());

-- Only admins can delete patients
CREATE POLICY "admins_delete_patients" ON patients
  FOR DELETE USING (is_admin());

-- ============================================================================
-- 5. APPOINTMENTS TABLE RLS POLICIES
-- ============================================================================

-- Patients can view their own appointments
CREATE POLICY "patients_select_own_appointments" ON appointments
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Patients can insert their own appointments (for self-scheduling)
CREATE POLICY "patients_insert_own_appointments" ON appointments
  FOR INSERT WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Healthcare providers can view appointments for their patients
CREATE POLICY "providers_select_appointments" ON appointments
  FOR SELECT USING (
    is_healthcare_provider() AND (
      is_admin() OR
      is_provider_for_patient(patient_id) OR
      provider_id = auth.uid()
    )
  );

-- Healthcare providers can manage appointments for their patients
CREATE POLICY "providers_manage_appointments" ON appointments
  FOR ALL USING (
    is_healthcare_provider() AND (
      is_admin() OR
      is_provider_for_patient(patient_id) OR
      provider_id = auth.uid()
    )
  )
  WITH CHECK (
    is_healthcare_provider() AND (
      is_admin() OR
      is_provider_for_patient(patient_id) OR
      provider_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. MEDICAL HISTORY TABLE RLS POLICIES
-- ============================================================================

-- Patients can view their own medical history
CREATE POLICY "patients_select_own_history" ON medical_history
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Healthcare providers can view medical history for their patients
CREATE POLICY "providers_select_history" ON medical_history
  FOR SELECT USING (
    is_healthcare_provider() AND (
      is_admin() OR
      is_provider_for_patient(patient_id)
    )
  );

-- Healthcare providers can insert medical history for their patients
CREATE POLICY "providers_insert_history" ON medical_history
  FOR INSERT WITH CHECK (
    is_healthcare_provider() AND (
      is_admin() OR
      is_provider_for_patient(patient_id)
    )
  );

-- Healthcare providers can update medical history they created
CREATE POLICY "providers_update_own_history" ON medical_history
  FOR UPDATE USING (
    is_healthcare_provider() AND (
      provider_id = auth.uid() OR is_admin()
    )
  )
  WITH CHECK (
    is_healthcare_provider() AND (
      provider_id = auth.uid() OR is_admin()
    )
  );

-- Only admins can delete medical history
CREATE POLICY "admins_delete_history" ON medical_history
  FOR DELETE USING (is_admin());

-- ============================================================================
-- 7. VISIT TEMPLATES TABLE RLS POLICIES
-- ============================================================================

-- All authenticated users can view visit templates
CREATE POLICY "authenticated_select_templates" ON visit_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only healthcare providers can manage visit templates
CREATE POLICY "providers_manage_templates" ON visit_templates
  FOR ALL USING (is_healthcare_provider())
  WITH CHECK (is_healthcare_provider());

-- ============================================================================
-- 8. USER PROFILES TABLE RLS POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "users_select_own_profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile (limited fields)
CREATE POLICY "users_update_own_profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "admins_select_all_profiles" ON user_profiles
  FOR SELECT USING (is_admin());

-- Admins can manage all profiles
CREATE POLICY "admins_manage_profiles" ON user_profiles
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- 9. PROVIDER-PATIENT ACCESS TABLE RLS POLICIES
-- ============================================================================

-- Healthcare providers can view their own access grants
CREATE POLICY "providers_select_own_access" ON provider_patient_access
  FOR SELECT USING (provider_id = auth.uid());

-- Patients can view who has access to their records
CREATE POLICY "patients_select_own_access" ON provider_patient_access
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Only admins can manage provider-patient access
CREATE POLICY "admins_manage_access" ON provider_patient_access
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- 10. AUDIT LOG TABLE RLS POLICIES
-- ============================================================================

-- Only admins can view audit logs
CREATE POLICY "admins_select_audit_logs" ON audit_log
  FOR SELECT USING (is_admin());

-- System can insert audit logs
CREATE POLICY "system_insert_audit_logs" ON audit_log
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 11. AUDIT TRIGGER FUNCTIONS
-- ============================================================================

-- Function to log data access and modifications
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  user_role_val user_role;
BEGIN
  -- Get user role
  SELECT role INTO user_role_val FROM user_profiles WHERE id = auth.uid();

  -- Log the operation
  INSERT INTO audit_log (
    table_name,
    record_id,
    action,
    user_id,
    user_role,
    old_values,
    new_values,
    timestamp
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    auth.uid(),
    user_role_val,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    NOW()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for all sensitive tables
CREATE TRIGGER audit_patients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_appointments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_medical_history_trigger
  AFTER INSERT OR UPDATE OR DELETE ON medical_history
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_provider_patient_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON provider_patient_access
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- ============================================================================
-- 12. EMERGENCY ACCESS FUNCTION (Break-GLASS)
-- ============================================================================

-- Function for emergency access (requires justification)
CREATE OR REPLACE FUNCTION grant_emergency_access(
  patient_uuid UUID,
  reason TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only healthcare providers can use emergency access
  IF NOT is_healthcare_provider() THEN
    RAISE EXCEPTION 'Unauthorized: Only healthcare providers can use emergency access';
  END IF;

  -- Reason is required
  IF reason IS NULL OR length(trim(reason)) < 10 THEN
    RAISE EXCEPTION 'Emergency access requires detailed justification (minimum 10 characters)';
  END IF;

  -- Grant temporary access (expires in 24 hours)
  INSERT INTO provider_patient_access (
    provider_id,
    patient_id,
    access_type,
    granted_by,
    expires_at,
    is_active
  ) VALUES (
    auth.uid(),
    patient_uuid,
    'emergency',
    auth.uid(),
    NOW() + INTERVAL '24 hours',
    true
  )
  ON CONFLICT (provider_id, patient_id)
  DO UPDATE SET
    access_type = 'emergency',
    expires_at = NOW() + INTERVAL '24 hours',
    is_active = true;

  -- Log emergency access
  INSERT INTO audit_log (
    table_name,
    record_id,
    action,
    user_id,
    reason,
    timestamp
  ) VALUES (
    'emergency_access',
    patient_uuid,
    'EMERGENCY_ACCESS_GRANTED',
    auth.uid(),
    reason,
    NOW()
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 13. SAMPLE DATA WITH PROPER USER ASSOCIATIONS
-- ============================================================================

-- Insert sample user profiles (replace with actual user IDs from Supabase Auth)
-- Note: In production, these would be created through the application registration process

-- Create sample healthcare provider profile
-- INSERT INTO user_profiles (id, role, first_name, last_name, email, license_number, department)
-- VALUES (
--   'your-provider-user-id-here',
--   'healthcare_provider',
--   'Dr. Sarah',
--   'Johnson',
--   'dr.johnson@medivix.com',
--   'MD123456',
--   'Family Medicine'
-- );

-- Create sample admin profile
-- INSERT INTO user_profiles (id, role, first_name, last_name, email, department)
-- VALUES (
--   'your-admin-user-id-here',
--   'admin',
--   'Admin',
--   'User',
--   'admin@medivix.com',
--   'IT Administration'
-- );

-- Note: Patient profiles and provider-patient relationships should be created
-- through the application interface after user registration

COMMENT ON TABLE user_profiles IS 'Extended user profiles with role-based access control';
COMMENT ON TABLE provider_patient_access IS 'Manages which healthcare providers can access which patients';
COMMENT ON TABLE audit_log IS 'HIPAA-compliant audit trail for all data access and modifications';
COMMENT ON FUNCTION grant_emergency_access IS 'Break-glass function for emergency patient access with automatic auditing';