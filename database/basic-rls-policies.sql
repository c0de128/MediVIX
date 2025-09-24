-- Basic RLS Policies for MediVIX Development Environment
-- This provides security while maintaining compatibility with current app structure

-- ============================================================================
-- 1. DROP EXISTING PERMISSIVE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Allow all operations on patients" ON patients;
DROP POLICY IF EXISTS "Allow all operations on appointments" ON appointments;
DROP POLICY IF EXISTS "Allow all operations on visit_templates" ON visit_templates;
DROP POLICY IF EXISTS "Allow all operations on medical_history" ON medical_history;

-- ============================================================================
-- 2. BASIC HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user is authenticated (for development)
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if request comes from server (using service key)
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.role() = 'service_role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. PATIENTS TABLE POLICIES
-- ============================================================================

-- Allow service role (API server) full access
CREATE POLICY "service_role_patients_all" ON patients
  FOR ALL USING (is_service_role());

-- Allow authenticated users to view patients (for development)
CREATE POLICY "authenticated_users_patients_select" ON patients
  FOR SELECT USING (is_authenticated());

-- Only service role can modify patients
CREATE POLICY "service_role_patients_modify" ON patients
  FOR INSERT WITH CHECK (is_service_role());

CREATE POLICY "service_role_patients_update" ON patients
  FOR UPDATE USING (is_service_role())
  WITH CHECK (is_service_role());

CREATE POLICY "service_role_patients_delete" ON patients
  FOR DELETE USING (is_service_role());

-- ============================================================================
-- 4. APPOINTMENTS TABLE POLICIES
-- ============================================================================

-- Allow service role full access
CREATE POLICY "service_role_appointments_all" ON appointments
  FOR ALL USING (is_service_role());

-- Allow authenticated users to view appointments
CREATE POLICY "authenticated_users_appointments_select" ON appointments
  FOR SELECT USING (is_authenticated());

-- Only service role can modify appointments
CREATE POLICY "service_role_appointments_modify" ON appointments
  FOR INSERT WITH CHECK (is_service_role());

CREATE POLICY "service_role_appointments_update" ON appointments
  FOR UPDATE USING (is_service_role())
  WITH CHECK (is_service_role());

CREATE POLICY "service_role_appointments_delete" ON appointments
  FOR DELETE USING (is_service_role());

-- ============================================================================
-- 5. VISIT TEMPLATES TABLE POLICIES
-- ============================================================================

-- Allow all authenticated users to view visit templates
CREATE POLICY "authenticated_users_templates_select" ON visit_templates
  FOR SELECT USING (is_authenticated());

-- Allow service role full access
CREATE POLICY "service_role_templates_all" ON visit_templates
  FOR ALL USING (is_service_role());

-- ============================================================================
-- 6. MEDICAL HISTORY TABLE POLICIES
-- ============================================================================

-- Allow service role full access
CREATE POLICY "service_role_history_all" ON medical_history
  FOR ALL USING (is_service_role());

-- Allow authenticated users to view medical history
CREATE POLICY "authenticated_users_history_select" ON medical_history
  FOR SELECT USING (is_authenticated());

-- Only service role can modify medical history
CREATE POLICY "service_role_history_modify" ON medical_history
  FOR INSERT WITH CHECK (is_service_role());

CREATE POLICY "service_role_history_update" ON medical_history
  FOR UPDATE USING (is_service_role())
  WITH CHECK (is_service_role());

CREATE POLICY "service_role_history_delete" ON medical_history
  FOR DELETE USING (is_service_role());

-- ============================================================================
-- 7. ENABLE BASIC AUDIT LOGGING
-- ============================================================================

-- Create simple audit log table
CREATE TABLE IF NOT EXISTS simple_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  action TEXT NOT NULL,
  user_role TEXT,
  ip_address TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE simple_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access audit log
CREATE POLICY "service_role_audit_all" ON simple_audit_log
  FOR ALL USING (is_service_role());

-- Simple audit function
CREATE OR REPLACE FUNCTION simple_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO simple_audit_log (table_name, action, user_role, timestamp)
  VALUES (TG_TABLE_NAME, TG_OP, auth.role()::TEXT, NOW());

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
DROP TRIGGER IF EXISTS simple_audit_patients_trigger ON patients;
CREATE TRIGGER simple_audit_patients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION simple_audit_trigger();

DROP TRIGGER IF EXISTS simple_audit_appointments_trigger ON appointments;
CREATE TRIGGER simple_audit_appointments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW EXECUTE FUNCTION simple_audit_trigger();

DROP TRIGGER IF EXISTS simple_audit_medical_history_trigger ON medical_history;
CREATE TRIGGER simple_audit_medical_history_trigger
  AFTER INSERT OR UPDATE OR DELETE ON medical_history
  FOR EACH ROW EXECUTE FUNCTION simple_audit_trigger();

-- ============================================================================
-- 8. SECURITY NOTES
-- ============================================================================

/*
SECURITY IMPLEMENTATION NOTES:

Current Configuration:
- Service role (API server) has full access to all tables
- Authenticated users can view data but not modify it directly
- All modifications must go through the API server
- Basic audit logging is enabled

This configuration provides:
1. Data protection through server-side API validation
2. Controlled access through authentication
3. Audit trail for compliance
4. Foundation for more granular permissions

For Production Enhancement:
1. Implement user roles (healthcare_provider, patient, admin)
2. Add provider-patient relationship tables
3. Implement break-glass emergency access
4. Add more detailed audit logging
5. Implement data encryption at rest
6. Add IP address restrictions
7. Implement session timeout policies

The comprehensive RLS policies in rls-policies.sql can be applied
when user authentication and role management are implemented.
*/