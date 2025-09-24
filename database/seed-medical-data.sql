-- Realistic Medical History and Appointments Data
-- This script adds corresponding medical history and appointments for the realistic patients
-- Run this after inserting the realistic patient data

-- Insert Medical History Records
-- These represent past diagnoses and treatments for patients with chronic conditions

-- Marcus Williams (Diabetes + Hypertension) - Medical History
INSERT INTO medical_history (patient_id, diagnosis, symptoms, treatment, follow_up_notes)
SELECT
  p.id,
  'Type 2 Diabetes Mellitus',
  ARRAY['Polyuria', 'Polydipsia', 'Fatigue', 'Blurred vision'],
  'Initiated on Metformin 500mg BID. Diabetes education provided. Dietary consultation scheduled.',
  'Monitor HbA1c in 3 months. Patient to check blood glucose daily and log results.'
FROM patients p WHERE p.first_name = 'Marcus' AND p.last_name = 'Williams';

INSERT INTO medical_history (patient_id, diagnosis, symptoms, treatment, follow_up_notes)
SELECT
  p.id,
  'Essential Hypertension',
  ARRAY['Elevated blood pressure readings', 'Mild headaches'],
  'Started on Lisinopril 10mg daily. Lifestyle modifications discussed including low-sodium diet.',
  'Blood pressure check in 2 weeks. Target BP <130/80. Consider increasing dose if needed.'
FROM patients p WHERE p.first_name = 'Marcus' AND p.last_name = 'Williams';

-- Emma Rodriguez (Pediatric Asthma) - Medical History
INSERT INTO medical_history (patient_id, diagnosis, symptoms, treatment, follow_up_notes)
SELECT
  p.id,
  'Pediatric Asthma - Mild Persistent',
  ARRAY['Wheezing with exercise', 'Cough at night', 'Chest tightness'],
  'Prescribed Albuterol inhaler PRN and Flovent 44mcg BID. Asthma action plan provided to parents.',
  'Follow-up in 6 weeks. Parents to monitor peak flow readings. School nurse notification sent.'
FROM patients p WHERE p.first_name = 'Emma' AND p.last_name = 'Rodriguez';

-- James O'Connor (Back Pain) - Medical History
INSERT INTO medical_history (patient_id, diagnosis, symptoms, treatment, follow_up_notes)
SELECT
  p.id,
  'Chronic Lumbar Strain with Radiculopathy',
  ARRAY['Lower back pain', 'Right leg numbness', 'Difficulty lifting'],
  'Physical therapy referral. NSAIDs for inflammation. Work restrictions: no lifting >25lbs.',
  'PT evaluation scheduled. Consider MRI if symptoms persist. Return to work evaluation in 4 weeks.'
FROM patients p WHERE p.first_name = 'James' AND p.last_name = 'O''Connor';

-- Robert Thompson (Multiple Conditions) - Medical History
INSERT INTO medical_history (patient_id, diagnosis, symptoms, treatment, follow_up_notes)
SELECT
  p.id,
  'Congestive Heart Failure - Class II',
  ARRAY['Shortness of breath on exertion', 'Ankle swelling', 'Fatigue'],
  'Furosemide 40mg daily, Metoprolol 25mg BID. Daily weights instructed. Low sodium diet.',
  'Echo in 6 months. Monitor daily weights - call if gain >3lbs in 2 days. Next visit in 4 weeks.'
FROM patients p WHERE p.first_name = 'Robert' AND p.last_name = 'Thompson';

INSERT INTO medical_history (patient_id, diagnosis, symptoms, treatment, follow_up_notes)
SELECT
  p.id,
  'COPD - Moderate',
  ARRAY['Chronic cough', 'Sputum production', 'Exertional dyspnea'],
  'Spiriva inhaler daily, Albuterol PRN. Pulmonary rehabilitation referral. Smoking cessation counseling.',
  'Pulmonary function tests in 6 months. Flu vaccine administered. Pneumonia vaccine due next visit.'
FROM patients p WHERE p.first_name = 'Robert' AND p.last_name = 'Thompson';

-- Grace Johnson (Early Alzheimer's) - Medical History
INSERT INTO medical_history (patient_id, diagnosis, symptoms, treatment, follow_up_notes)
SELECT
  p.id,
  'Mild Cognitive Impairment due to Alzheimer''s Disease',
  ARRAY['Memory loss', 'Difficulty with complex tasks', 'Confusion about time/place'],
  'Started on Donepezil 5mg daily. Neuropsychological testing completed. Family counseling provided.',
  'Neurology follow-up in 3 months. Caregiver support group referral. Safety assessment scheduled.'
FROM patients p WHERE p.first_name = 'Grace' AND p.last_name = 'Johnson';

-- Alex Taylor (Mental Health) - Medical History
INSERT INTO medical_history (patient_id, diagnosis, symptoms, treatment, follow_up_notes)
SELECT
  p.id,
  'Generalized Anxiety Disorder with Major Depressive Episode',
  ARRAY['Persistent worry', 'Sleep disturbance', 'Loss of interest in activities', 'Fatigue'],
  'Initiated Sertraline 50mg daily. Cognitive behavioral therapy referral. Crisis plan discussed.',
  'Therapy appointment scheduled. Medication follow-up in 2 weeks. PHQ-9 and GAD-7 to be repeated.'
FROM patients p WHERE p.first_name = 'Alex' AND p.last_name = 'Taylor';

-- Linda Foster (Cancer Survivor) - Medical History
INSERT INTO medical_history (patient_id, diagnosis, symptoms, treatment, follow_up_notes)
SELECT
  p.id,
  'Breast Cancer Surveillance - Post Lumpectomy',
  ARRAY[]::TEXT[],
  'Annual mammography completed. Clinical breast exam normal. Continuing tamoxifen therapy.',
  'Next mammogram in 12 months. Oncology follow-up in 6 months. Continue current medications.'
FROM patients p WHERE p.first_name = 'Linda' AND p.last_name = 'Foster';

-- Patricia Wong (Rheumatoid Arthritis) - Medical History
INSERT INTO medical_history (patient_id, diagnosis, symptoms, treatment, follow_up_notes)
SELECT
  p.id,
  'Rheumatoid Arthritis - Well Controlled',
  ARRAY['Morning joint stiffness', 'Hand pain and swelling'],
  'Continuing methotrexate 15mg weekly with folic acid. Adalimumab injection every 2 weeks.',
  'Lab work normal. Disease activity low. Continue current regimen. Rheumatology in 3 months.'
FROM patients p WHERE p.first_name = 'Patricia' AND p.last_name = 'Wong';

-- Carlos Mendoza (Diabetes) - Medical History
INSERT INTO medical_history (patient_id, diagnosis, symptoms, treatment, follow_up_notes)
SELECT
  p.id,
  'Type 2 Diabetes with Sleep Apnea',
  ARRAY['Snoring', 'Daytime fatigue', 'Morning headaches'],
  'CPAP therapy initiated. Diabetes management with Metformin and lifestyle modifications.',
  'CPAP compliance check in 1 month. HbA1c goal <7%. Weight loss program enrollment discussed.'
FROM patients p WHERE p.first_name = 'Carlos' AND p.last_name = 'Mendoza';

-- Insert Sample Appointments
-- Create realistic appointment patterns for various patients

-- Upcoming appointments for chronic disease management
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT
  p.id,
  CURRENT_TIMESTAMP + INTERVAL '3 days',
  CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '30 minutes',
  'Diabetes Follow-up',
  'scheduled',
  'Quarterly diabetes check. Review glucose logs and adjust medications if needed.'
FROM patients p WHERE p.first_name = 'Marcus' AND p.last_name = 'Williams';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT
  p.id,
  CURRENT_TIMESTAMP + INTERVAL '1 week',
  CURRENT_TIMESTAMP + INTERVAL '1 week' + INTERVAL '20 minutes',
  'Asthma Check',
  'scheduled',
  'Pediatric asthma follow-up. Check inhaler technique and peak flow measurements.'
FROM patients p WHERE p.first_name = 'Emma' AND p.last_name = 'Rodriguez';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT
  p.id,
  CURRENT_TIMESTAMP + INTERVAL '5 days',
  CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '25 minutes',
  'Physical Therapy Follow-up',
  'scheduled',
  'Assess progress with physical therapy for lower back pain. Review work restrictions.'
FROM patients p WHERE p.first_name = 'James' AND p.last_name = 'O''Connor';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT
  p.id,
  CURRENT_TIMESTAMP + INTERVAL '2 weeks',
  CURRENT_TIMESTAMP + INTERVAL '2 weeks' + INTERVAL '45 minutes',
  'Heart Failure Management',
  'scheduled',
  'CHF follow-up. Review daily weights, medication compliance, and symptoms.'
FROM patients p WHERE p.first_name = 'Robert' AND p.last_name = 'Thompson';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT
  p.id,
  CURRENT_TIMESTAMP + INTERVAL '10 days',
  CURRENT_TIMESTAMP + INTERVAL '10 days' + INTERVAL '30 minutes',
  'Annual Physical',
  'scheduled',
  'Comprehensive annual exam for healthy 34-year-old. Preventive care and screening.'
FROM patients p WHERE p.first_name = 'Sarah' AND p.last_name = 'Chen';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT
  p.id,
  CURRENT_TIMESTAMP + INTERVAL '4 days',
  CURRENT_TIMESTAMP + INTERVAL '4 days' + INTERVAL '20 minutes',
  'Mental Health Follow-up',
  'scheduled',
  'Anxiety and depression management. Assess medication response and therapy progress.'
FROM patients p WHERE p.first_name = 'Alex' AND p.last_name = 'Taylor';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT
  p.id,
  CURRENT_TIMESTAMP + INTERVAL '1 week',
  CURRENT_TIMESTAMP + INTERVAL '1 week' + INTERVAL '35 minutes',
  'Memory Assessment',
  'scheduled',
  'Cognitive assessment and medication review for early-stage Alzheimer''s disease.'
FROM patients p WHERE p.first_name = 'Grace' AND p.last_name = 'Johnson';

-- Some completed appointments (past history)
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT
  p.id,
  CURRENT_TIMESTAMP - INTERVAL '2 months',
  CURRENT_TIMESTAMP - INTERVAL '2 months' + INTERVAL '15 minutes',
  'Sick Visit',
  'completed',
  'Upper respiratory infection. Prescribed rest, fluids, and symptomatic treatment.'
FROM patients p WHERE p.first_name = 'David' AND p.last_name = 'Kim';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT
  p.id,
  CURRENT_TIMESTAMP - INTERVAL '6 months',
  CURRENT_TIMESTAMP - INTERVAL '6 months' + INTERVAL '30 minutes',
  'Annual Physical',
  'completed',
  'Annual exam completed. All preventive care up to date. Continue current health maintenance.'
FROM patients p WHERE p.first_name = 'Dr. Anita' AND p.last_name = 'Patel';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT
  p.id,
  CURRENT_TIMESTAMP - INTERVAL '3 weeks',
  CURRENT_TIMESTAMP - INTERVAL '3 weeks' + INTERVAL '25 minutes',
  'Sports Physical',
  'completed',
  'Sports physical for high school athlete. Cleared for all sports activities.'
FROM patients p WHERE p.first_name = 'Tyler' AND p.last_name = 'Brooks';

-- Verify the inserts
SELECT
  (SELECT COUNT(*) FROM medical_history) AS medical_history_count,
  (SELECT COUNT(*) FROM appointments) AS appointments_count,
  (SELECT COUNT(*) FROM appointments WHERE status = 'scheduled') AS scheduled_appointments,
  (SELECT COUNT(*) FROM appointments WHERE status = 'completed') AS completed_appointments;

SELECT 'Medical history and appointments data inserted successfully.' AS result;