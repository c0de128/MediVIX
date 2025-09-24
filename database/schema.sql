-- MediVIX Database Schema Setup
-- Run this script in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dob DATE NOT NULL,
  phone TEXT,
  email TEXT,
  allergies TEXT[] DEFAULT '{}',
  chronic_conditions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visit templates table
CREATE TABLE visit_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  default_notes TEXT,
  common_diagnoses TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medical history table
CREATE TABLE medical_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  diagnosis TEXT,
  symptoms TEXT[] DEFAULT '{}',
  treatment TEXT,
  follow_up_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_patients_name ON patients (first_name, last_name);
CREATE INDEX idx_patients_dob ON patients (dob);
CREATE INDEX idx_appointments_patient_id ON appointments (patient_id);
CREATE INDEX idx_appointments_start_time ON appointments (start_time);
CREATE INDEX idx_appointments_status ON appointments (status);
CREATE INDEX idx_medical_history_patient_id ON medical_history (patient_id);
CREATE INDEX idx_medical_history_created_at ON medical_history (created_at);

-- Create updated_at trigger for patients table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now - tighten in production)
CREATE POLICY "Allow all operations on patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow all operations on appointments" ON appointments FOR ALL USING (true);
CREATE POLICY "Allow all operations on visit_templates" ON visit_templates FOR ALL USING (true);
CREATE POLICY "Allow all operations on medical_history" ON medical_history FOR ALL USING (true);

-- Insert example visit templates
INSERT INTO visit_templates (name, description, duration_minutes, default_notes, common_diagnoses) VALUES
('Annual Physical', 'Comprehensive annual exam', 30, 'Check vitals, bloodwork, general exam. Update vaccinations if needed.', ARRAY['Hypertension', 'Hyperlipidemia']),
('Sick Visit (URI)', 'Upper respiratory infection assessment', 15, 'Assess symptoms: fever, cough, congestion. Rapid strep test if indicated.', ARRAY['Upper Respiratory Infection', 'Sinusitis', 'Strep Throat']),
('Vaccination', 'Routine vaccination administration', 10, 'Administer [vaccine name]. Observe for 15 minutes post-injection.', ARRAY[]::TEXT[]),
('Follow-up Visit', 'Follow-up for previous diagnosis', 20, 'Review previous treatment, assess progress, adjust medications if needed.', ARRAY[]::TEXT[]),
('Wellness Check', 'General wellness and preventive care', 25, 'Preventive screening, lifestyle counseling, health maintenance.', ARRAY[]::TEXT[]);

-- Insert sample patients for testing
INSERT INTO patients (first_name, last_name, dob, phone, email, allergies, chronic_conditions) VALUES
('John', 'Doe', '1985-03-15', '555-0101', 'john.doe@email.com', ARRAY['Penicillin'], ARRAY['Hypertension']),
('Jane', 'Smith', '1992-07-22', '555-0102', 'jane.smith@email.com', ARRAY['Shellfish'], ARRAY[]::TEXT[]),
('Robert', 'Johnson', '1978-11-08', '555-0103', 'robert.johnson@email.com', ARRAY[]::TEXT[], ARRAY['Diabetes Type 2', 'High Cholesterol']),
('Mary', 'Williams', '1995-01-30', '555-0104', 'mary.williams@email.com', ARRAY['Latex'], ARRAY['Asthma']),
('Michael', 'Brown', '1980-09-12', '555-0105', 'michael.brown@email.com', ARRAY[]::TEXT[], ARRAY[]::TEXT[]);

-- Insert sample appointments
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT
  p.id,
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day' + INTERVAL '30 minutes',
  'Annual Physical',
  'scheduled',
  'Patient due for annual physical exam'
FROM patients p
WHERE p.first_name = 'John' AND p.last_name = 'Doe';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT
  p.id,
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '2 days' + INTERVAL '15 minutes',
  'Sick Visit',
  'scheduled',
  'Patient reports cold symptoms'
FROM patients p
WHERE p.first_name = 'Jane' AND p.last_name = 'Smith';

-- Insert sample medical history
INSERT INTO medical_history (patient_id, diagnosis, symptoms, treatment, follow_up_notes)
SELECT
  p.id,
  'Hypertension',
  ARRAY['Elevated blood pressure', 'Headaches'],
  'Prescribed Lisinopril 10mg daily',
  'Follow up in 3 months to check blood pressure'
FROM patients p
WHERE p.first_name = 'John' AND p.last_name = 'Doe';

INSERT INTO medical_history (patient_id, diagnosis, symptoms, treatment, follow_up_notes)
SELECT
  p.id,
  'Diabetes Type 2',
  ARRAY['Elevated glucose', 'Increased thirst', 'Frequent urination'],
  'Prescribed Metformin 500mg twice daily. Dietary counseling provided.',
  'Follow up in 6 weeks for glucose monitoring'
FROM patients p
WHERE p.first_name = 'Robert' AND p.last_name = 'Johnson';