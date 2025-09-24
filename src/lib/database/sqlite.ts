/**
 * SQLite database configuration for local development
 * Provides offline development capabilities and testing
 */

import Database from 'better-sqlite3'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

// SQLite database path
const DB_DIR = join(process.cwd(), 'data')
const DB_PATH = join(DB_DIR, 'local.db')

// Ensure data directory exists
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true })
}

// Initialize SQLite database
export const sqlite = new Database(DB_PATH)

// Enable foreign key constraints and WAL mode for better performance
sqlite.pragma('foreign_keys = ON')
sqlite.pragma('journal_mode = WAL')

// Database schema for local development
const SCHEMA_SQL = `
-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dob TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  allergies TEXT DEFAULT '[]', -- JSON array as string
  chronic_conditions TEXT DEFAULT '[]', -- JSON array as string
  insurance_provider TEXT,
  insurance_id TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  medications TEXT DEFAULT '[]', -- JSON array as string
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Create visit templates table
CREATE TABLE IF NOT EXISTS visit_templates (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  default_notes TEXT,
  common_diagnoses TEXT DEFAULT '[]', -- JSON array as string
  procedures TEXT DEFAULT '[]', -- JSON array as string
  required_equipment TEXT DEFAULT '[]', -- JSON array as string
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Create medical history table
CREATE TABLE IF NOT EXISTS medical_history (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id TEXT REFERENCES appointments(id) ON DELETE SET NULL,
  diagnosis TEXT,
  symptoms TEXT DEFAULT '[]', -- JSON array as string
  treatment TEXT,
  follow_up_notes TEXT,
  medications_prescribed TEXT DEFAULT '[]', -- JSON array as string
  date_recorded TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients (first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_patients_dob ON patients (dob);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments (patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments (start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status);
CREATE INDEX IF NOT EXISTS idx_medical_history_patient_id ON medical_history (patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_history_created_at ON medical_history (created_at);

-- Create trigger for updated_at
CREATE TRIGGER IF NOT EXISTS update_patients_updated_at
  AFTER UPDATE ON patients
  FOR EACH ROW
BEGIN
  UPDATE patients SET updated_at = datetime('now') WHERE id = NEW.id;
END;
`

// Sample data for development
const SAMPLE_DATA_SQL = `
-- Insert sample visit templates
INSERT OR IGNORE INTO visit_templates (id, name, description, duration_minutes, default_notes, common_diagnoses) VALUES
('template-1', 'Annual Physical', 'Comprehensive annual exam', 30, 'Check vitals, bloodwork, general exam. Update vaccinations if needed.', '["Hypertension", "Hyperlipidemia"]'),
('template-2', 'Sick Visit (URI)', 'Upper respiratory infection assessment', 15, 'Assess symptoms: fever, cough, congestion. Rapid strep test if indicated.', '["Upper Respiratory Infection", "Sinusitis", "Strep Throat"]'),
('template-3', 'Vaccination', 'Routine vaccination administration', 10, 'Administer [vaccine name]. Observe for 15 minutes post-injection.', '[]'),
('template-4', 'Follow-up Visit', 'Follow-up for previous diagnosis', 20, 'Review previous treatment, assess progress, adjust medications if needed.', '[]'),
('template-5', 'Wellness Check', 'General wellness and preventive care', 25, 'Preventive screening, lifestyle counseling, health maintenance.', '[]');

-- Insert sample patients
INSERT OR IGNORE INTO patients (id, first_name, last_name, dob, phone, email, allergies, chronic_conditions) VALUES
('patient-1', 'John', 'Doe', '1985-03-15', '555-0101', 'john.doe@email.com', '["Penicillin"]', '["Hypertension"]'),
('patient-2', 'Jane', 'Smith', '1992-07-22', '555-0102', 'jane.smith@email.com', '["Shellfish"]', '[]'),
('patient-3', 'Robert', 'Johnson', '1978-11-08', '555-0103', 'robert.johnson@email.com', '[]', '["Diabetes Type 2", "High Cholesterol"]'),
('patient-4', 'Mary', 'Williams', '1995-01-30', '555-0104', 'mary.williams@email.com', '["Latex"]', '["Asthma"]'),
('patient-5', 'Michael', 'Brown', '1980-09-12', '555-0105', 'michael.brown@email.com', '[]', '[]');

-- Insert sample appointments (future dates)
INSERT OR IGNORE INTO appointments (id, patient_id, start_time, end_time, reason, status, notes, timezone) VALUES
('appt-1', 'patient-1', datetime('now', '+1 day'), datetime('now', '+1 day', '+30 minutes'), 'Annual Physical', 'scheduled', 'Patient due for annual physical exam', 'America/New_York'),
('appt-2', 'patient-2', datetime('now', '+2 days'), datetime('now', '+2 days', '+15 minutes'), 'Sick Visit', 'scheduled', 'Patient reports cold symptoms', 'America/New_York'),
('appt-3', 'patient-3', datetime('now', '+3 days'), datetime('now', '+3 days', '+20 minutes'), 'Diabetes Follow-up', 'scheduled', 'Check glucose levels and adjust medication', 'America/New_York');

-- Insert sample medical history
INSERT OR IGNORE INTO medical_history (id, patient_id, diagnosis, symptoms, treatment, follow_up_notes) VALUES
('history-1', 'patient-1', 'Hypertension', '["Elevated blood pressure", "Headaches"]', 'Prescribed Lisinopril 10mg daily', 'Follow up in 3 months to check blood pressure'),
('history-2', 'patient-3', 'Diabetes Type 2', '["Elevated glucose", "Increased thirst", "Frequent urination"]', 'Prescribed Metformin 500mg twice daily. Dietary counseling provided.', 'Follow up in 6 weeks for glucose monitoring'),
('history-3', 'patient-4', 'Asthma Exacerbation', '["Shortness of breath", "Wheezing", "Cough"]', 'Albuterol inhaler prescribed. Prednisone 5-day course.', 'Follow up in 1 week if symptoms persist');
`

// Initialize database schema and sample data
export function initializeDatabase() {
  try {
    // Execute schema creation
    sqlite.exec(SCHEMA_SQL)

    // Add sample data for development
    sqlite.exec(SAMPLE_DATA_SQL)

    console.log('SQLite database initialized successfully')
    console.log(`Database location: ${DB_PATH}`)

    return true
  } catch (error) {
    console.error('Failed to initialize SQLite database:', error)
    return false
  }
}

// Database utility functions
export const sqliteUtils = {
  // Get all patients
  getPatients: () => {
    const stmt = sqlite.prepare(`
      SELECT *,
        json_extract(allergies, '$') as allergies_parsed,
        json_extract(chronic_conditions, '$') as chronic_conditions_parsed
      FROM patients
      ORDER BY created_at DESC
    `)
    return stmt.all().map(formatPatient)
  },

  // Get patient by ID
  getPatient: (id: string) => {
    const stmt = sqlite.prepare(`
      SELECT *,
        json_extract(allergies, '$') as allergies_parsed,
        json_extract(chronic_conditions, '$') as chronic_conditions_parsed
      FROM patients
      WHERE id = ?
    `)
    const result = stmt.get(id)
    return result ? formatPatient(result) : null
  },

  // Create patient
  createPatient: (data: any) => {
    const stmt = sqlite.prepare(`
      INSERT INTO patients (
        first_name, last_name, dob, phone, email, allergies, chronic_conditions,
        insurance_provider, insurance_id, emergency_contact_name,
        emergency_contact_phone, emergency_contact_relationship, medications
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      data.first_name,
      data.last_name,
      data.dob,
      data.phone || null,
      data.email || null,
      JSON.stringify(data.allergies || []),
      JSON.stringify(data.chronic_conditions || []),
      data.insurance_provider || null,
      data.insurance_id || null,
      data.emergency_contact_name || null,
      data.emergency_contact_phone || null,
      data.emergency_contact_relationship || null,
      JSON.stringify(data.medications || [])
    )

    return sqliteUtils.getPatient(result.lastInsertRowid as string)
  },

  // Get appointments
  getAppointments: (filters?: any) => {
    let query = `
      SELECT a.*,
        p.first_name, p.last_name, p.dob
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
    `
    const params: any[] = []
    const conditions: string[] = []

    if (filters?.patient_id) {
      conditions.push('a.patient_id = ?')
      params.push(filters.patient_id)
    }

    if (filters?.status) {
      conditions.push('a.status = ?')
      params.push(filters.status)
    }

    if (filters?.date) {
      conditions.push('date(a.start_time) = date(?)')
      params.push(filters.date)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY a.start_time ASC'

    const stmt = sqlite.prepare(query)
    return stmt.all(...params)
  },

  // Create appointment
  createAppointment: (data: any) => {
    const stmt = sqlite.prepare(`
      INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes, timezone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    return stmt.run(
      data.patient_id,
      data.start_time,
      data.end_time,
      data.reason || null,
      data.status || 'scheduled',
      data.notes || null,
      data.timezone || 'America/New_York'
    )
  },

  // Get visit templates
  getVisitTemplates: () => {
    const stmt = sqlite.prepare(`
      SELECT *,
        json_extract(common_diagnoses, '$') as common_diagnoses_parsed,
        json_extract(procedures, '$') as procedures_parsed,
        json_extract(required_equipment, '$') as required_equipment_parsed
      FROM visit_templates
      WHERE is_active = 1
      ORDER BY name ASC
    `)
    return stmt.all().map(formatTemplate)
  },

  // Get medical history for patient
  getMedicalHistory: (patientId: string) => {
    const stmt = sqlite.prepare(`
      SELECT h.*,
        json_extract(symptoms, '$') as symptoms_parsed,
        json_extract(medications_prescribed, '$') as medications_prescribed_parsed,
        a.start_time as appointment_time,
        a.reason as appointment_reason
      FROM medical_history h
      LEFT JOIN appointments a ON h.appointment_id = a.id
      WHERE h.patient_id = ?
      ORDER BY h.created_at DESC
    `)
    return stmt.all(patientId).map(formatMedicalHistory)
  },

  // Database stats
  getStats: () => {
    const patientsCount = sqlite.prepare('SELECT COUNT(*) as count FROM patients').get()
    const appointmentsCount = sqlite.prepare('SELECT COUNT(*) as count FROM appointments').get()
    const templatesCount = sqlite.prepare('SELECT COUNT(*) as count FROM visit_templates WHERE is_active = 1').get()

    return {
      patients: patientsCount.count,
      appointments: appointmentsCount.count,
      templates: templatesCount.count,
      database_size: `${(sqlite.exec('PRAGMA page_count') * sqlite.exec('PRAGMA page_size') / 1024 / 1024).toFixed(2)} MB`
    }
  }
}

// Helper functions to format data
function formatPatient(row: any) {
  return {
    ...row,
    allergies: JSON.parse(row.allergies || '[]'),
    chronic_conditions: JSON.parse(row.chronic_conditions || '[]'),
    medications: JSON.parse(row.medications || '[]')
  }
}

function formatTemplate(row: any) {
  return {
    ...row,
    common_diagnoses: JSON.parse(row.common_diagnoses || '[]'),
    procedures: JSON.parse(row.procedures || '[]'),
    required_equipment: JSON.parse(row.required_equipment || '[]'),
    is_active: Boolean(row.is_active)
  }
}

function formatMedicalHistory(row: any) {
  return {
    ...row,
    symptoms: JSON.parse(row.symptoms || '[]'),
    medications_prescribed: JSON.parse(row.medications_prescribed || '[]')
  }
}

// Initialize on module load
initializeDatabase()