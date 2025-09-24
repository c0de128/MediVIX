-- Enhanced Appointment Data with Proper Time Slots
-- This script adds realistic appointment patterns with standard time slots
-- All appointments follow standard medical office scheduling (30-minute slots)
-- Business hours: 8:00 AM - 6:00 PM, Lunch: 12:00 PM - 1:00 PM

-- Clear existing appointments to avoid duplicates
DELETE FROM appointments;

-- 1. Sarah Chen (34F, Software Engineer) - Annual physical pattern
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '14 days') + TIME '09:00:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '14 days') + TIME '09:30:00',
  'Annual Physical Exam', 'scheduled', 'Comprehensive annual exam. Labs to be drawn same day.'
FROM patients p WHERE p.first_name = 'Sarah' AND p.last_name = 'Chen';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '60 days') + TIME '14:00:00',
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '60 days') + TIME '14:15:00',
  'Lab Results Review', 'completed', 'Reviewed annual lab work. All values normal. Vitamin D supplementation started.'
FROM patients p WHERE p.first_name = 'Sarah' AND p.last_name = 'Chen';

-- 2. Marcus Williams (67M, Diabetes + Hypertension) - Chronic disease management
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '3 days') + TIME '10:00:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '3 days') + TIME '10:30:00',
  'Diabetes Follow-up', 'scheduled', 'Quarterly diabetes check. Review glucose logs and adjust medications if needed.'
FROM patients p WHERE p.first_name = 'Marcus' AND p.last_name = 'Williams';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '30 days') + TIME '14:30:00',
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '30 days') + TIME '15:00:00',
  'Diabetes & HTN Management', 'completed', 'HbA1c improved to 7.1%. Blood pressure well controlled. Continue current medications.'
FROM patients p WHERE p.first_name = 'Marcus' AND p.last_name = 'Williams';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '90 days') + TIME '11:00:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '90 days') + TIME '11:30:00',
  'Quarterly Diabetes Check', 'scheduled', 'Routine diabetes follow-up with lab work.'
FROM patients p WHERE p.first_name = 'Marcus' AND p.last_name = 'Williams';

-- 3. Emma Rodriguez (8F, Pediatric Asthma) - Pediatric follow-up pattern
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '7 days') + TIME '15:00:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '7 days') + TIME '15:30:00',
  'Asthma Check', 'scheduled', 'Pediatric asthma follow-up. Check inhaler technique and peak flow measurements.'
FROM patients p WHERE p.first_name = 'Emma' AND p.last_name = 'Rodriguez';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '60 days') + TIME '10:30:00',
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '60 days') + TIME '11:00:00',
  'Asthma Action Plan Review', 'completed', 'Updated asthma action plan. Parents comfortable with management. School notified.'
FROM patients p WHERE p.first_name = 'Emma' AND p.last_name = 'Rodriguez';

-- 4. James O'Connor (45M, Back Issues) - Work injury follow-up
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '5 days') + TIME '08:30:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '5 days') + TIME '09:00:00',
  'Physical Therapy Follow-up', 'scheduled', 'Assess progress with physical therapy for lower back pain. Review work restrictions.'
FROM patients p WHERE p.first_name = 'James' AND p.last_name = 'O''Connor';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '30 days') + TIME '16:00:00',
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '30 days') + TIME '16:30:00',
  'Work Restrictions Review', 'completed', 'Updated work restrictions. PT showing good progress. Continue current plan.'
FROM patients p WHERE p.first_name = 'James' AND p.last_name = 'O''Connor';

-- 5. Dr. Anita Patel (52F, Physician Colleague) - Professional preventive care
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '120 days') + TIME '08:00:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '120 days') + TIME '08:45:00',
  'Executive Physical', 'scheduled', 'Comprehensive executive physical with cardiac screening and full lab panel.'
FROM patients p WHERE p.first_name = 'Anita' AND p.last_name = 'Patel';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '180 days') + TIME '09:00:00',
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '180 days') + TIME '09:45:00',
  'Executive Physical', 'completed', 'All screening tests normal. Continue current preventive care regimen.'
FROM patients p WHERE p.first_name = 'Anita' AND p.last_name = 'Patel';

-- 6. Robert Thompson (78M, Multiple Conditions) - Complex care management
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '14 days') + TIME '10:30:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '14 days') + TIME '11:15:00',
  'Heart Failure Management', 'scheduled', 'CHF follow-up. Review daily weights, medication compliance, and symptoms.'
FROM patients p WHERE p.first_name = 'Robert' AND p.last_name = 'Thompson';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '21 days') + TIME '14:00:00',
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '21 days') + TIME '14:30:00',
  'Medication Adjustment', 'completed', 'Optimized heart failure medications. Added spironolactone. Follow-up in 2 weeks.'
FROM patients p WHERE p.first_name = 'Robert' AND p.last_name = 'Thompson';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '42 days') + TIME '15:30:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '42 days') + TIME '16:00:00',
  'COPD Follow-up', 'scheduled', 'Pulmonary function assessment and inhaler technique review.'
FROM patients p WHERE p.first_name = 'Robert' AND p.last_name = 'Thompson';

-- 7. Isabella Martinez (29F, Nurse) - Occupational health pattern
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '270 days') + TIME '13:00:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '270 days') + TIME '13:15:00',
  'Annual TB Screening', 'scheduled', 'Employee health requirement. Chest X-ray and tuberculin skin test.'
FROM patients p WHERE p.first_name = 'Isabella' AND p.last_name = 'Martinez';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '90 days') + TIME '16:30:00',
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '90 days') + TIME '16:45:00',
  'Employee Health Screening', 'completed', 'Annual employee health screening completed. All requirements met.'
FROM patients p WHERE p.first_name = 'Isabella' AND p.last_name = 'Martinez';

-- 8. David Kim (31M, Seasonal Allergies) - Allergy management
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '60 days') + TIME '17:00:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '60 days') + TIME '17:15:00',
  'Allergy Season Prep', 'scheduled', 'Pre-season allergy management planning. Medication review and environmental controls.'
FROM patients p WHERE p.first_name = 'David' AND p.last_name = 'Kim';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '60 days') + TIME '11:30:00',
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '60 days') + TIME '11:45:00',
  'Upper Respiratory Infection', 'completed', 'Viral URI. Symptomatic treatment recommended. Not related to allergies.'
FROM patients p WHERE p.first_name = 'David' AND p.last_name = 'Kim';

-- 9. Grace Johnson (72F, Early Alzheimer's) - Cognitive care
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '7 days') + TIME '09:30:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '7 days') + TIME '10:15:00',
  'Memory Assessment', 'scheduled', 'Cognitive assessment and medication review for early-stage Alzheimer''s disease.'
FROM patients p WHERE p.first_name = 'Grace' AND p.last_name = 'Johnson';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '90 days') + TIME '13:30:00',
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '90 days') + TIME '14:00:00',
  'Alzheimer''s Management', 'completed', 'Medication increased to donepezil 10mg. Caregiver resources provided.'
FROM patients p WHERE p.first_name = 'Grace' AND p.last_name = 'Johnson';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '90 days') + TIME '10:00:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '90 days') + TIME '10:30:00',
  'Neurology Follow-up', 'scheduled', 'Routine neurology follow-up for dementia management.'
FROM patients p WHERE p.first_name = 'Grace' AND p.last_name = 'Johnson';

-- 10. Alex Taylor (26, Mental Health) - Mental health management
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '4 days') + TIME '15:30:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '4 days') + TIME '16:00:00',
  'Mental Health Follow-up', 'scheduled', 'Anxiety and depression management. Assess medication response and therapy progress.'
FROM patients p WHERE p.first_name = 'Alex' AND p.last_name = 'Taylor';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '30 days') + TIME '14:30:00',
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '30 days') + TIME '15:00:00',
  'Medication Review', 'completed', 'Good response to sertraline 75mg. Continue therapy sessions. Next visit in 4 weeks.'
FROM patients p WHERE p.first_name = 'Alex' AND p.last_name = 'Taylor';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '30 days') + TIME '16:00:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '30 days') + TIME '16:30:00',
  'Therapy Progress Review', 'scheduled', 'CBT progress assessment and medication monitoring.'
FROM patients p WHERE p.first_name = 'Alex' AND p.last_name = 'Taylor';

-- 11. Mohammed Al-Hassan (41M, Recent Immigrant) - New patient care
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '180 days') + TIME '08:30:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '180 days') + TIME '09:00:00',
  'Annual Physical', 'scheduled', 'First annual physical as established patient. Complete health maintenance.'
FROM patients p WHERE p.first_name = 'Mohammed' AND p.last_name = 'Al-Hassan';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '120 days') + TIME '09:00:00',
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '120 days') + TIME '09:45:00',
  'New Patient Intake', 'completed', 'Comprehensive new patient visit. All screening tests completed. Immunizations updated.'
FROM patients p WHERE p.first_name = 'Mohammed' AND p.last_name = 'Al-Hassan';

-- 12. Linda Foster (58F, Cancer Survivor) - Oncology surveillance
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '150 days') + TIME '11:00:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '150 days') + TIME '11:30:00',
  'Oncology Follow-up', 'scheduled', 'Routine breast cancer surveillance. Clinical exam and labs.'
FROM patients p WHERE p.first_name = 'Linda' AND p.last_name = 'Foster';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '30 days') + TIME '10:00:00',
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '30 days') + TIME '10:30:00',
  'Cancer Survivorship Care', 'completed', 'Continue tamoxifen therapy. Annual mammography normal. Next oncology visit in 6 months.'
FROM patients p WHERE p.first_name = 'Linda' AND p.last_name = 'Foster';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '300 days') + TIME '13:30:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '300 days') + TIME '13:45:00',
  'Annual Mammography', 'scheduled', 'Surveillance mammography for breast cancer history.'
FROM patients p WHERE p.first_name = 'Linda' AND p.last_name = 'Foster';

-- 13. Tyler Brooks (16M, Athletic Student) - Adolescent care
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '270 days') + TIME '15:00:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '270 days') + TIME '15:30:00',
  'Sports Physical', 'scheduled', 'Pre-participation sports physical for next school year.'
FROM patients p WHERE p.first_name = 'Tyler' AND p.last_name = 'Brooks';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '90 days') + TIME '16:00:00',
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '90 days') + TIME '16:30:00',
  'Sports Physical', 'completed', 'Cleared for all sports activities. Updated immunizations administered.'
FROM patients p WHERE p.first_name = 'Tyler' AND p.last_name = 'Brooks';

-- 14. Patricia Wong (63F, Rheumatoid Arthritis) - Rheumatology care
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '60 days') + TIME '13:00:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '60 days') + TIME '13:30:00',
  'Rheumatology Follow-up', 'scheduled', 'Routine RA monitoring. Assess disease activity and medication side effects.'
FROM patients p WHERE p.first_name = 'Patricia' AND p.last_name = 'Wong';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '30 days') + TIME '14:00:00',
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '30 days') + TIME '14:30:00',
  'Disease Activity Assessment', 'completed', 'RA in excellent remission. Continue current biologic therapy. Labs normal.'
FROM patients p WHERE p.first_name = 'Patricia' AND p.last_name = 'Wong';

-- 15. Carlos Mendoza (55M, Diabetes + Sleep Apnea) - Complex care
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '30 days') + TIME '09:00:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '30 days') + TIME '09:30:00',
  'CPAP Follow-up', 'scheduled', 'Sleep apnea management. Review CPAP compliance and diabetes control.'
FROM patients p WHERE p.first_name = 'Carlos' AND p.last_name = 'Mendoza';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '60 days') + TIME '10:30:00',
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '60 days') + TIME '11:00:00',
  'Diabetes Management', 'completed', 'HbA1c improved with CPAP therapy. Weight loss program discussed.'
FROM patients p WHERE p.first_name = 'Carlos' AND p.last_name = 'Mendoza';

-- 16. Janet Miller (84F, Multiple Medications) - Geriatric care
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '14 days') + TIME '14:00:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '14 days') + TIME '14:30:00',
  'Medication Review', 'scheduled', 'Comprehensive medication review. INR monitoring and kidney function assessment.'
FROM patients p WHERE p.first_name = 'Janet' AND p.last_name = 'Miller';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '7 days') + TIME '08:00:00',
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '7 days') + TIME '08:15:00',
  'INR Check', 'completed', 'INR 2.8, therapeutic range. Continue current warfarin dose.'
FROM patients p WHERE p.first_name = 'Janet' AND p.last_name = 'Miller';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '30 days') + TIME '08:30:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '30 days') + TIME '08:45:00',
  'Lab Work', 'scheduled', 'Routine labs for chronic kidney disease and atrial fibrillation management.'
FROM patients p WHERE p.first_name = 'Janet' AND p.last_name = 'Miller';

-- 17. Brandon Lewis (22M, College Student, ADHD) - Young adult care
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '90 days') + TIME '17:30:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '90 days') + TIME '17:50:00',
  'ADHD Medication Check', 'scheduled', 'Routine ADHD medication monitoring. Assess academic performance and side effects.'
FROM patients p WHERE p.first_name = 'Brandon' AND p.last_name = 'Lewis';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '90 days') + TIME '16:30:00',
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '90 days') + TIME '17:00:00',
  'ADHD Follow-up', 'completed', 'Increased Adderall XR to 25mg daily. Academic performance improved.'
FROM patients p WHERE p.first_name = 'Brandon' AND p.last_name = 'Lewis';

-- 18. Nancy Turner (70F, Retired Nurse) - Senior wellness
INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '90 days') + TIME '11:30:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '90 days') + TIME '12:00:00',
  'Cognitive Assessment', 'scheduled', 'Annual cognitive screening for mild cognitive impairment monitoring.'
FROM patients p WHERE p.first_name = 'Nancy' AND p.last_name = 'Turner';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '60 days') + TIME '15:30:00',
  DATE_TRUNC('day', CURRENT_DATE - INTERVAL '60 days') + TIME '16:00:00',
  'Thyroid Monitoring', 'completed', 'Thyroid function stable on current levothyroxine dose. Continue monitoring.'
FROM patients p WHERE p.first_name = 'Nancy' AND p.last_name = 'Turner';

INSERT INTO appointments (patient_id, start_time, end_time, reason, status, notes)
SELECT p.id,
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '300 days') + TIME '14:30:00',
  DATE_TRUNC('day', CURRENT_DATE + INTERVAL '300 days') + TIME '15:00:00',
  'Annual Thyroid Check', 'scheduled', 'Annual thyroid function monitoring and medication review.'
FROM patients p WHERE p.first_name = 'Nancy' AND p.last_name = 'Turner';

-- Verify the appointment data
SELECT
  (SELECT COUNT(*) FROM appointments) AS total_appointments,
  (SELECT COUNT(*) FROM appointments WHERE status = 'scheduled') AS scheduled_appointments,
  (SELECT COUNT(*) FROM appointments WHERE status = 'completed') AS completed_appointments,
  (SELECT COUNT(DISTINCT patient_id) FROM appointments) AS patients_with_appointments;

SELECT 'Enhanced appointment data with proper time slots inserted successfully.' AS result;