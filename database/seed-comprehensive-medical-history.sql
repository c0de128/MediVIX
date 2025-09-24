-- Comprehensive Medical History Data
-- This script adds detailed medical histories for all 18 patients
-- Run this after updating the medical_history schema

-- First, clear existing medical history to avoid duplicates
DELETE FROM medical_history;

-- 1. Sarah Chen (34F, Software Engineer) - Healthy adult with preventive care
INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications, lab_values)
SELECT p.id, 'lab_result', 'Annual Lab Work', 'Comprehensive metabolic panel and lipid screening for annual physical', 'resolved', 'low', CURRENT_TIMESTAMP - INTERVAL '2 months', 'Dr. Sarah Mitchell',
ARRAY[]::TEXT[], '{"total_cholesterol": "185 mg/dL", "HDL": "58 mg/dL", "LDL": "102 mg/dL", "glucose": "92 mg/dL", "creatinine": "0.9 mg/dL"}'::JSONB
FROM patients p WHERE p.first_name = 'Sarah' AND p.last_name = 'Chen';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'procedure', 'Cervical Cancer Screening', 'Routine Pap smear and HPV testing. Results normal.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '14 months', 'Dr. Lisa Wong'
FROM patients p WHERE p.first_name = 'Sarah' AND p.last_name = 'Chen';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name, medications)
SELECT p.id, 'medication', 'Vitamin D Supplementation', 'Started vitamin D3 1000 IU daily for mild deficiency detected in labs.', 'active', CURRENT_TIMESTAMP - INTERVAL '3 months', 'Dr. Sarah Mitchell',
ARRAY['Vitamin D3 1000 IU daily']
FROM patients p WHERE p.first_name = 'Sarah' AND p.last_name = 'Chen';

-- 2. Marcus Williams (67M, Diabetes + Hypertension) - Enhanced records
INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications, lab_values)
SELECT p.id, 'diagnosis', 'Type 2 Diabetes Mellitus', 'Initial diagnosis following elevated fasting glucose and HbA1c. Patient presented with classic symptoms.', 'chronic', 'medium', CURRENT_TIMESTAMP - INTERVAL '3 years', 'Dr. Robert Chen',
ARRAY['Metformin 500mg BID'], '{"hba1c": "8.2%", "fasting_glucose": "165 mg/dL", "random_glucose": "240 mg/dL"}'::JSONB
FROM patients p WHERE p.first_name = 'Marcus' AND p.last_name = 'Williams';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications, lab_values)
SELECT p.id, 'lab_result', 'Diabetes Follow-up Labs', 'Quarterly diabetes monitoring. HbA1c improved with medication compliance.', 'resolved', 'medium', CURRENT_TIMESTAMP - INTERVAL '1 month', 'Dr. Robert Chen',
ARRAY['Metformin 500mg BID', 'Lisinopril 10mg daily'], '{"hba1c": "7.1%", "fasting_glucose": "128 mg/dL", "creatinine": "1.1 mg/dL", "microalbumin": "22 mg/g"}'::JSONB
FROM patients p WHERE p.first_name = 'Marcus' AND p.last_name = 'Williams';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications)
SELECT p.id, 'diagnosis', 'Essential Hypertension', 'Diagnosed during routine screening. Multiple elevated readings confirmed.', 'chronic', 'medium', CURRENT_TIMESTAMP - INTERVAL '2.5 years', 'Dr. Robert Chen',
ARRAY['Lisinopril 10mg daily']
FROM patients p WHERE p.first_name = 'Marcus' AND p.last_name = 'Williams';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'procedure', 'Diabetic Eye Exam', 'Annual ophthalmologic examination. No diabetic retinopathy detected.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '4 months', 'Dr. Jennifer Adams'
FROM patients p WHERE p.first_name = 'Marcus' AND p.last_name = 'Williams';

-- 3. Emma Rodriguez (8F, Pediatric Asthma) - Pediatric care
INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications)
SELECT p.id, 'diagnosis', 'Mild Persistent Asthma', 'Diagnosed after recurrent wheezing episodes. Peak flow monitoring initiated.', 'chronic', 'medium', CURRENT_TIMESTAMP - INTERVAL '10 months', 'Dr. Michael Patel',
ARRAY['Albuterol inhaler PRN', 'Flovent 44mcg BID']
FROM patients p WHERE p.first_name = 'Emma' AND p.last_name = 'Rodriguez';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name, medications)
SELECT p.id, 'treatment', 'Asthma Action Plan Update', 'Reviewed and updated asthma action plan with parents. School nurse notified.', 'active', CURRENT_TIMESTAMP - INTERVAL '2 months', 'Dr. Michael Patel',
ARRAY['Albuterol inhaler PRN', 'Flovent 44mcg BID']
FROM patients p WHERE p.first_name = 'Emma' AND p.last_name = 'Rodriguez';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'note', 'Allergy Testing Consultation', 'Referred to allergist for comprehensive testing. Positive for dust mites and pollen.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '6 months', 'Dr. Rachel Green'
FROM patients p WHERE p.first_name = 'Emma' AND p.last_name = 'Rodriguez';

-- 4. James O'Connor (45M, Construction Worker, Back Issues)
INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications)
SELECT p.id, 'diagnosis', 'Chronic Lumbar Strain', 'Work-related back injury. MRI shows disc bulging at L4-L5.', 'chronic', 'medium', CURRENT_TIMESTAMP - INTERVAL '8 months', 'Dr. Sarah Mitchell',
ARRAY['Ibuprofen 600mg TID PRN', 'Cyclobenzaprine 10mg HS PRN']
FROM patients p WHERE p.first_name = 'James' AND p.last_name = 'O''Connor';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'procedure', 'Lumbar MRI', 'MRI lumbar spine without contrast. Shows mild disc bulging L4-L5, no herniation.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '7 months', 'Seattle Imaging Center'
FROM patients p WHERE p.first_name = 'James' AND p.last_name = 'O''Connor';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'treatment', 'Physical Therapy Evaluation', 'Initial PT evaluation. Started 3x/week therapy program focusing on core strengthening.', 'active', CURRENT_TIMESTAMP - INTERVAL '6 months', 'Maria Santos, PT'
FROM patients p WHERE p.first_name = 'James' AND p.last_name = 'O''Connor';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'note', 'Work Restrictions Update', 'Updated work restrictions: No lifting >25lbs, frequent position changes allowed.', 'active', CURRENT_TIMESTAMP - INTERVAL '1 month', 'Dr. Sarah Mitchell'
FROM patients p WHERE p.first_name = 'James' AND p.last_name = 'O''Connor';

-- 5. Dr. Anita Patel (52F, Physician Colleague) - Professional preventive care
INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name, lab_values)
SELECT p.id, 'lab_result', 'Executive Physical Labs', 'Comprehensive executive physical with cardiac screening.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '6 months', 'Dr. Sarah Mitchell',
'{"total_cholesterol": "195 mg/dL", "HDL": "65 mg/dL", "LDL": "108 mg/dL", "triglycerides": "110 mg/dL", "TSH": "2.1 mIU/L", "vitamin_d": "35 ng/mL"}'::JSONB
FROM patients p WHERE p.first_name = 'Anita' AND p.last_name = 'Patel';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'procedure', 'Mammography Screening', 'Annual mammography screening. BI-RADS 1 - negative.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '8 months', 'Dr. Lisa Wong'
FROM patients p WHERE p.first_name = 'Anita' AND p.last_name = 'Patel';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'procedure', 'Colonoscopy Screening', 'Routine colonoscopy screening. No polyps detected.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '18 months', 'Dr. Kevin Park'
FROM patients p WHERE p.first_name = 'Anita' AND p.last_name = 'Patel';

-- 6. Robert Thompson (78M, Multiple Chronic Conditions)
INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications, lab_values)
SELECT p.id, 'diagnosis', 'Congestive Heart Failure', 'CHF Class II. Echo shows EF 45%. Started on standard heart failure regimen.', 'chronic', 'high', CURRENT_TIMESTAMP - INTERVAL '2 years', 'Dr. Robert Chen',
ARRAY['Furosemide 40mg daily', 'Metoprolol 25mg BID', 'Lisinopril 10mg daily'], '{"bnp": "450 pg/mL", "creatinine": "1.3 mg/dL", "potassium": "4.2 mEq/L"}'::JSONB
FROM patients p WHERE p.first_name = 'Robert' AND p.last_name = 'Thompson';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications)
SELECT p.id, 'diagnosis', 'COPD - Moderate', 'Pulmonary function tests confirm moderate COPD. Long smoking history.', 'chronic', 'medium', CURRENT_TIMESTAMP - INTERVAL '3 years', 'Dr. Patricia Williams',
ARRAY['Spiriva 18mcg daily', 'Albuterol inhaler PRN']
FROM patients p WHERE p.first_name = 'Robert' AND p.last_name = 'Thompson';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications)
SELECT p.id, 'treatment', 'Heart Failure Optimization', 'Medication adjustment following recent hospitalization. Daily weight monitoring reinforced.', 'active', 'high', CURRENT_TIMESTAMP - INTERVAL '3 weeks', 'Dr. Robert Chen',
ARRAY['Furosemide 40mg daily', 'Metoprolol 50mg BID', 'Lisinopril 10mg daily', 'Spironolactone 25mg daily']
FROM patients p WHERE p.first_name = 'Robert' AND p.last_name = 'Thompson';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'procedure', 'Echocardiogram', 'Follow-up echo shows stable EF at 45%. No significant change from prior study.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '1 month', 'Seattle Cardiology'
FROM patients p WHERE p.first_name = 'Robert' AND p.last_name = 'Thompson';

-- 7. Isabella Martinez (29F, Nurse) - Occupational health
INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'procedure', 'Annual TB Screening', 'Employee health screening. Chest X-ray and tuberculin skin test negative.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '3 months', 'Employee Health Services'
FROM patients p WHERE p.first_name = 'Isabella' AND p.last_name = 'Martinez';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name, medications)
SELECT p.id, 'treatment', 'Hepatitis B Vaccination', 'Completed 3-dose hepatitis B vaccine series for healthcare worker protection.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '8 months', 'Employee Health Services',
ARRAY['Hepatitis B vaccine series (completed)']
FROM patients p WHERE p.first_name = 'Isabella' AND p.last_name = 'Martinez';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'treatment', 'Needlestick Injury Follow-up', 'Post-exposure prophylaxis protocol following needlestick. Source patient tested negative.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '14 months', 'Dr. Sarah Mitchell'
FROM patients p WHERE p.first_name = 'Isabella' AND p.last_name = 'Martinez';

-- 8. David Kim (31M, Seasonal Allergies)
INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications)
SELECT p.id, 'diagnosis', 'Allergic Rhinitis', 'Seasonal allergies confirmed by skin testing. Positive for grass and tree pollens.', 'chronic', 'low', CURRENT_TIMESTAMP - INTERVAL '18 months', 'Dr. Rachel Green',
ARRAY['Claritin 10mg daily PRN', 'Flonase nasal spray daily during season']
FROM patients p WHERE p.first_name = 'David' AND p.last_name = 'Kim';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'treatment', 'Allergy Management Plan', 'Seasonal allergy management plan updated. Environmental control measures discussed.', 'active', CURRENT_TIMESTAMP - INTERVAL '2 months', 'Dr. Rachel Green'
FROM patients p WHERE p.first_name = 'David' AND p.last_name = 'Kim';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'note', 'Upper Respiratory Infection', 'Viral URI symptoms. Advised symptomatic treatment and rest.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '2 months', 'Dr. Sarah Mitchell'
FROM patients p WHERE p.first_name = 'David' AND p.last_name = 'Kim';

-- 9. Grace Johnson (72F, Early Alzheimer's)
INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications)
SELECT p.id, 'diagnosis', 'Mild Cognitive Impairment', 'Initial diagnosis following neuropsychological testing. MMSE score 24/30.', 'chronic', 'medium', CURRENT_TIMESTAMP - INTERVAL '14 months', 'Dr. Steven Liu',
ARRAY['Donepezil 5mg daily']
FROM patients p WHERE p.first_name = 'Grace' AND p.last_name = 'Johnson';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications)
SELECT p.id, 'treatment', 'Alzheimer''s Disease Diagnosis', 'Progression to early-stage Alzheimer''s disease. Medication increased.', 'chronic', 'medium', CURRENT_TIMESTAMP - INTERVAL '6 months', 'Dr. Steven Liu',
ARRAY['Donepezil 10mg daily', 'Memantine 5mg BID']
FROM patients p WHERE p.first_name = 'Grace' AND p.last_name = 'Johnson';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'procedure', 'Brain MRI', 'MRI brain shows mild cortical atrophy consistent with Alzheimer''s disease.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '8 months', 'Seattle Imaging Center'
FROM patients p WHERE p.first_name = 'Grace' AND p.last_name = 'Johnson';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'note', 'Caregiver Support Referral', 'Daughter provided with caregiver resources. Support group information given.', 'active', CURRENT_TIMESTAMP - INTERVAL '3 months', 'Dr. Steven Liu'
FROM patients p WHERE p.first_name = 'Grace' AND p.last_name = 'Johnson';

-- 10. Alex Taylor (26, Mental Health)
INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications)
SELECT p.id, 'diagnosis', 'Generalized Anxiety Disorder', 'GAD-7 score 14. Started on SSRI therapy with CBT referral.', 'chronic', 'medium', CURRENT_TIMESTAMP - INTERVAL '10 months', 'Dr. Sarah Mitchell',
ARRAY['Sertraline 50mg daily']
FROM patients p WHERE p.first_name = 'Alex' AND p.last_name = 'Taylor';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications)
SELECT p.id, 'diagnosis', 'Major Depressive Episode', 'PHQ-9 score 16. Added to existing anxiety treatment. Therapy ongoing.', 'chronic', 'medium', CURRENT_TIMESTAMP - INTERVAL '8 months', 'Dr. Sarah Mitchell',
ARRAY['Sertraline 75mg daily']
FROM patients p WHERE p.first_name = 'Alex' AND p.last_name = 'Taylor';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'treatment', 'Cognitive Behavioral Therapy', 'Weekly CBT sessions with licensed therapist. Good progress noted.', 'active', CURRENT_TIMESTAMP - INTERVAL '2 weeks', 'Dr. Jennifer Adams, LCSW'
FROM patients p WHERE p.first_name = 'Alex' AND p.last_name = 'Taylor';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name, medications)
SELECT p.id, 'treatment', 'Medication Response Evaluation', 'Good response to increased sertraline dose. Side effects minimal.', 'active', CURRENT_TIMESTAMP - INTERVAL '1 month', 'Dr. Sarah Mitchell',
ARRAY['Sertraline 75mg daily']
FROM patients p WHERE p.first_name = 'Alex' AND p.last_name = 'Taylor';

-- Continue with remaining patients...
-- 11. Mohammed Al-Hassan (41M, Recent Immigrant)
INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'procedure', 'Immigration Medical Exam', 'Complete immigration physical examination. Tuberculosis screening negative.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '6 months', 'Dr. Sarah Mitchell'
FROM patients p WHERE p.first_name = 'Mohammed' AND p.last_name = 'Al-Hassan';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name, medications)
SELECT p.id, 'treatment', 'Immunization Update', 'Updated immunizations per CDC guidelines. MMR and Tdap administered.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '5 months', 'Dr. Sarah Mitchell',
ARRAY['MMR vaccine', 'Tdap vaccine']
FROM patients p WHERE p.first_name = 'Mohammed' AND p.last_name = 'Al-Hassan';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name, lab_values)
SELECT p.id, 'lab_result', 'Comprehensive Health Screening', 'Complete health screening for new patient. All values within normal limits.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '4 months', 'Dr. Sarah Mitchell',
'{"glucose": "88 mg/dL", "cholesterol": "175 mg/dL", "hemoglobin": "14.5 g/dL", "vitamin_d": "28 ng/mL"}'::JSONB
FROM patients p WHERE p.first_name = 'Mohammed' AND p.last_name = 'Al-Hassan';

-- 12. Linda Foster (58F, Cancer Survivor)
INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications)
SELECT p.id, 'diagnosis', 'Breast Cancer - Stage II', 'Invasive ductal carcinoma, ER+/PR+/HER2-. Completed lumpectomy and adjuvant therapy.', 'resolved', 'high', CURRENT_TIMESTAMP - INTERVAL '3 years', 'Dr. Maria Santos',
ARRAY['Tamoxifen 20mg daily']
FROM patients p WHERE p.first_name = 'Linda' AND p.last_name = 'Foster';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'procedure', 'Annual Mammography', 'Surveillance mammography. No evidence of recurrence. BI-RADS 2.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '2 months', 'Dr. Lisa Wong'
FROM patients p WHERE p.first_name = 'Linda' AND p.last_name = 'Foster';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name)
SELECT p.id, 'diagnosis', 'Lymphedema - Left Arm', 'Post-surgical lymphedema following axillary node dissection. Managed with compression.', 'chronic', 'low', CURRENT_TIMESTAMP - INTERVAL '2.5 years', 'Dr. Patricia Williams'
FROM patients p WHERE p.first_name = 'Linda' AND p.last_name = 'Foster';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name, medications)
SELECT p.id, 'treatment', 'Oncology Follow-up', 'Routine oncology follow-up. Continue tamoxifen therapy. Next visit in 6 months.', 'active', CURRENT_TIMESTAMP - INTERVAL '1 month', 'Dr. Maria Santos',
ARRAY['Tamoxifen 20mg daily']
FROM patients p WHERE p.first_name = 'Linda' AND p.last_name = 'Foster';

-- 13. Tyler Brooks (16M, Athletic Student)
INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'procedure', 'Sports Physical', 'Pre-participation sports physical for football and track. Cleared for all activities.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '3 months', 'Dr. Michael Patel'
FROM patients p WHERE p.first_name = 'Tyler' AND p.last_name = 'Brooks';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'treatment', 'Ankle Sprain Treatment', 'Grade 1 ankle sprain during football practice. RICE protocol initiated.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '4 months', 'Dr. Kevin Park'
FROM patients p WHERE p.first_name = 'Tyler' AND p.last_name = 'Brooks';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name, medications)
SELECT p.id, 'treatment', 'Routine Immunizations', 'Updated routine adolescent vaccines including meningococcal and HPV.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '8 months', 'Dr. Michael Patel',
ARRAY['Meningococcal vaccine', 'HPV vaccine (2nd dose)']
FROM patients p WHERE p.first_name = 'Tyler' AND p.last_name = 'Brooks';

-- 14. Patricia Wong (63F, Rheumatoid Arthritis)
INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications, lab_values)
SELECT p.id, 'diagnosis', 'Rheumatoid Arthritis', 'Seropositive RA with joint erosions. Started on DMARD therapy.', 'chronic', 'medium', CURRENT_TIMESTAMP - INTERVAL '4 years', 'Dr. Rachel Green',
ARRAY['Methotrexate 15mg weekly', 'Folic acid 5mg weekly'], '{"rheumatoid_factor": "45 IU/mL", "anti_ccp": "120 units", "esr": "35 mm/hr", "crp": "8.2 mg/L"}'::JSONB
FROM patients p WHERE p.first_name = 'Patricia' AND p.last_name = 'Wong';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name, medications)
SELECT p.id, 'treatment', 'Biologic Therapy Initiation', 'Added adalimumab for inadequate response to methotrexate. Good clinical improvement.', 'active', CURRENT_TIMESTAMP - INTERVAL '18 months', 'Dr. Rachel Green',
ARRAY['Methotrexate 15mg weekly', 'Folic acid 5mg weekly', 'Adalimumab 40mg every 2 weeks']
FROM patients p WHERE p.first_name = 'Patricia' AND p.last_name = 'Wong';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name, lab_values)
SELECT p.id, 'lab_result', 'Disease Activity Monitoring', 'Excellent response to combination therapy. Disease activity in remission.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '1 month', 'Dr. Rachel Green',
'{"esr": "12 mm/hr", "crp": "2.1 mg/L", "alt": "25 U/L", "ast": "22 U/L", "wbc": "6800/μL"}'::JSONB
FROM patients p WHERE p.first_name = 'Patricia' AND p.last_name = 'Wong';

-- 15. Carlos Mendoza (55M, Diabetes + Sleep Apnea)
INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications, lab_values)
SELECT p.id, 'diagnosis', 'Type 2 Diabetes', 'Newly diagnosed diabetes with elevated HbA1c. Started on metformin.', 'chronic', 'medium', CURRENT_TIMESTAMP - INTERVAL '2 years', 'Dr. Robert Chen',
ARRAY['Metformin 500mg BID'], '{"hba1c": "8.9%", "fasting_glucose": "178 mg/dL", "creatinine": "0.9 mg/dL"}'::JSONB
FROM patients p WHERE p.first_name = 'Carlos' AND p.last_name = 'Mendoza';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name)
SELECT p.id, 'diagnosis', 'Obstructive Sleep Apnea', 'Sleep study confirms severe OSA with AHI 35. CPAP therapy recommended.', 'chronic', 'medium', CURRENT_TIMESTAMP - INTERVAL '15 months', 'Dr. Patricia Williams'
FROM patients p WHERE p.first_name = 'Carlos' AND p.last_name = 'Mendoza';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'treatment', 'CPAP Therapy Initiation', 'CPAP machine set up. Initial pressure 10 cmH2O. Follow-up scheduled.', 'active', CURRENT_TIMESTAMP - INTERVAL '14 months', 'Sleep Medicine Center'
FROM patients p WHERE p.first_name = 'Carlos' AND p.last_name = 'Mendoza';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name, medications, lab_values)
SELECT p.id, 'treatment', 'Diabetes Management Update', 'HbA1c improved with CPAP therapy and weight loss. Continue current regimen.', 'active', CURRENT_TIMESTAMP - INTERVAL '2 months', 'Dr. Robert Chen',
ARRAY['Metformin 500mg BID'], '{"hba1c": "7.2%", "fasting_glucose": "135 mg/dL", "weight": "185 lbs"}'::JSONB
FROM patients p WHERE p.first_name = 'Carlos' AND p.last_name = 'Mendoza';

-- 16. Janet Miller (84F, Multiple Medications)
INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications)
SELECT p.id, 'diagnosis', 'Atrial Fibrillation', 'Paroxysmal atrial fibrillation. Started on anticoagulation and rate control.', 'chronic', 'medium', CURRENT_TIMESTAMP - INTERVAL '18 months', 'Dr. Robert Chen',
ARRAY['Warfarin 5mg daily', 'Metoprolol 50mg BID']
FROM patients p WHERE p.first_name = 'Janet' AND p.last_name = 'Miller';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications, lab_values)
SELECT p.id, 'diagnosis', 'Chronic Kidney Disease', 'CKD Stage 3a. Regular monitoring of kidney function and medications.', 'chronic', 'medium', CURRENT_TIMESTAMP - INTERVAL '2 years', 'Dr. Steven Liu',
ARRAY['Lisinopril 5mg daily'], '{"creatinine": "1.4 mg/dL", "egfr": "42 mL/min/1.73m²", "bun": "28 mg/dL", "potassium": "4.5 mEq/L"}'::JSONB
FROM patients p WHERE p.first_name = 'Janet' AND p.last_name = 'Miller';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name, lab_values)
SELECT p.id, 'lab_result', 'Medication Level Monitoring', 'INR monitoring for warfarin therapy. Dose adjustment made.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '1 week', 'Dr. Robert Chen',
'{"inr": "2.8", "pt": "28.5 seconds", "creatinine": "1.3 mg/dL"}'::JSONB
FROM patients p WHERE p.first_name = 'Janet' AND p.last_name = 'Miller';

-- 17. Brandon Lewis (22M, College Student, ADHD)
INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications)
SELECT p.id, 'diagnosis', 'ADHD - Combined Type', 'Comprehensive ADHD evaluation. Started on stimulant medication.', 'chronic', 'medium', CURRENT_TIMESTAMP - INTERVAL '14 months', 'Dr. Jennifer Adams',
ARRAY['Adderall XR 20mg daily']
FROM patients p WHERE p.first_name = 'Brandon' AND p.last_name = 'Lewis';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name, medications)
SELECT p.id, 'treatment', 'ADHD Medication Adjustment', 'Dose optimization based on academic performance and side effects.', 'active', CURRENT_TIMESTAMP - INTERVAL '3 months', 'Dr. Jennifer Adams',
ARRAY['Adderall XR 25mg daily']
FROM patients p WHERE p.first_name = 'Brandon' AND p.last_name = 'Lewis';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'note', 'Academic Accommodation Support', 'Provided documentation for college disability services. Extended testing time approved.', 'active', CURRENT_TIMESTAMP - INTERVAL '8 months', 'Dr. Jennifer Adams'
FROM patients p WHERE p.first_name = 'Brandon' AND p.last_name = 'Lewis';

-- 18. Nancy Turner (70F, Retired Nurse)
INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name, medications, lab_values)
SELECT p.id, 'diagnosis', 'Hypothyroidism', 'Primary hypothyroidism diagnosed during routine screening. Started on levothyroxine.', 'chronic', 'low', CURRENT_TIMESTAMP - INTERVAL '5 years', 'Dr. Sarah Mitchell',
ARRAY['Levothyroxine 75mcg daily'], '{"tsh": "12.5 mIU/L", "free_t4": "0.7 ng/dL"}'::JSONB
FROM patients p WHERE p.first_name = 'Nancy' AND p.last_name = 'Turner';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, severity, date_recorded, provider_name)
SELECT p.id, 'diagnosis', 'Mild Cognitive Impairment', 'Subtle memory changes noted. Neuropsychological testing confirms MCI.', 'chronic', 'low', CURRENT_TIMESTAMP - INTERVAL '8 months', 'Dr. Steven Liu'
FROM patients p WHERE p.first_name = 'Nancy' AND p.last_name = 'Turner';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name, lab_values)
SELECT p.id, 'lab_result', 'Thyroid Function Monitoring', 'Annual thyroid function monitoring. Well-controlled on current dose.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '2 months', 'Dr. Sarah Mitchell',
'{"tsh": "2.8 mIU/L", "free_t4": "1.2 ng/dL"}'::JSONB
FROM patients p WHERE p.first_name = 'Nancy' AND p.last_name = 'Turner';

INSERT INTO medical_history (patient_id, entry_type, title, description, status, date_recorded, provider_name)
SELECT p.id, 'procedure', 'Cognitive Assessment', 'Annual cognitive screening. Stable compared to baseline. Continue monitoring.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '3 months', 'Dr. Steven Liu'
FROM patients p WHERE p.first_name = 'Nancy' AND p.last_name = 'Turner';

-- Verify the comprehensive medical history data
SELECT
  (SELECT COUNT(*) FROM medical_history) AS total_medical_records,
  (SELECT COUNT(DISTINCT patient_id) FROM medical_history) AS patients_with_history,
  (SELECT COUNT(*) FROM medical_history WHERE entry_type = 'diagnosis') AS diagnoses,
  (SELECT COUNT(*) FROM medical_history WHERE entry_type = 'treatment') AS treatments,
  (SELECT COUNT(*) FROM medical_history WHERE entry_type = 'medication') AS medications,
  (SELECT COUNT(*) FROM medical_history WHERE entry_type = 'lab_result') AS lab_results,
  (SELECT COUNT(*) FROM medical_history WHERE entry_type = 'procedure') AS procedures;

SELECT 'Comprehensive medical history data inserted successfully.' AS result;