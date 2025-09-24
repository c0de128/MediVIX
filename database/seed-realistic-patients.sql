-- Realistic Patient Seed Data
-- This script adds diverse, realistic patient data for development and testing
-- Run this after clearing existing patient data

-- Note: Using the original schema structure with dob DATE field
-- These patients represent diverse demographics, ages, and medical profiles

INSERT INTO patients (first_name, last_name, dob, phone, email, allergies, chronic_conditions) VALUES

-- 1. Sarah Chen - 34F, Software Engineer, Healthy Adult
('Sarah', 'Chen', '1990-03-15', '2065551234', 'sarah.chen@techcorp.com',
 ARRAY[]::TEXT[], ARRAY[]::TEXT[]),

-- 2. Marcus Williams - 67M, Retired Teacher, Diabetes + Hypertension
('Marcus', 'Williams', '1957-08-22', '4255559876', 'marcus.williams@gmail.com',
 ARRAY['Sulfa drugs', 'Shellfish'], ARRAY['Type 2 Diabetes', 'Hypertension', 'High Cholesterol']),

-- 3. Emma Rodriguez - 8F, Elementary Student, Asthma
('Emma', 'Rodriguez', '2016-01-10', '2065552468', 'maria.rodriguez@email.com',
 ARRAY['Peanuts', 'Tree nuts'], ARRAY['Asthma']),

-- 4. James O''Connor - 45M, Construction Worker, Back Issues
('James', 'O''Connor', '1979-11-05', '3605558901', 'james.oconnor@construction.net',
 ARRAY['Penicillin'], ARRAY['Chronic Lower Back Pain', 'Osteoarthritis']),

-- 5. Dr. Anita Patel - 52F, Physician Colleague, Preventive Care
('Anita', 'Patel', '1972-06-18', '2065554567', 'dr.patel@medicenter.org',
 ARRAY[]::TEXT[], ARRAY[]::TEXT[]),

-- 6. Robert Thompson - 78M, Widower, Multiple Chronic Conditions
('Robert', 'Thompson', '1946-02-28', '2535553344', 'robert.thompson@senior.net',
 ARRAY['Aspirin', 'Latex'], ARRAY['Heart Disease', 'COPD', 'Osteoporosis', 'Depression']),

-- 7. Isabella Martinez - 29F, Nurse, Generally Healthy
('Isabella', 'Martinez', '1995-09-12', '2065557890', 'isabella.martinez@hospital.org',
 ARRAY['Iodine'], ARRAY[]::TEXT[]),

-- 8. David Kim - 31M, Accountant, Seasonal Allergies
('David', 'Kim', '1993-04-07', '4255556677', 'david.kim@accounting.com',
 ARRAY['Grass pollen', 'Ragweed', 'Dust mites'], ARRAY['Allergic Rhinitis']),

-- 9. Grace Johnson - 72F, Retired Librarian, Early Alzheimer's
('Grace', 'Johnson', '1952-12-03', '3605552211', 'grace.johnson@library.org',
 ARRAY[]::TEXT[], ARRAY['Early-stage Alzheimer''s Disease', 'Hypertension']),

-- 10. Alex Taylor - 26, Non-binary, Graduate Student, Mental Health
('Alex', 'Taylor', '1998-07-20', '2065559999', 'alex.taylor@university.edu',
 ARRAY[]::TEXT[], ARRAY['Anxiety Disorder', 'Depression']),

-- 11. Mohammed Al-Hassan - 41M, Recent Immigrant, Language Considerations
('Mohammed', 'Al-Hassan', '1983-10-15', '2065553333', 'mohammed.hassan@email.com',
 ARRAY[]::TEXT[], ARRAY[]::TEXT[]),

-- 12. Linda Foster - 58F, Office Manager, Cancer Survivor
('Linda', 'Foster', '1966-05-25', '4255558888', 'linda.foster@office.com',
 ARRAY['Contrast dye'], ARRAY['Breast Cancer (Remission)', 'Lymphedema']),

-- 13. Tyler Brooks - 16M, High School Student, Athletic
('Tyler', 'Brooks', '2008-08-14', '3605557777', 'karen.brooks@parent.com',
 ARRAY[]::TEXT[], ARRAY[]::TEXT[]),

-- 14. Patricia Wong - 63F, Real Estate Agent, Arthritis
('Patricia', 'Wong', '1961-01-30', '2065554444', 'patricia.wong@realty.com',
 ARRAY['Codeine'], ARRAY['Rheumatoid Arthritis', 'Osteoporosis']),

-- 15. Carlos Mendoza - 55M, Restaurant Owner, Diabetes
('Carlos', 'Mendoza', '1969-03-08', '2535555555', 'carlos.mendoza@restaurant.com',
 ARRAY[]::TEXT[], ARRAY['Type 2 Diabetes', 'Sleep Apnea']),

-- 16. Janet Miller - 84F, Widow, Multiple Medications
('Janet', 'Miller', '1940-11-11', '4255551111', 'janet.miller@senior.net',
 ARRAY['Penicillin', 'Sulfa'], ARRAY['Atrial Fibrillation', 'Chronic Kidney Disease', 'Dementia']),

-- 17. Brandon Lewis - 22M, College Student, ADHD
('Brandon', 'Lewis', '2002-04-03', '2065552222', 'brandon.lewis@college.edu',
 ARRAY[]::TEXT[], ARRAY['ADHD']),

-- 18. Nancy Turner - 70F, Retired Nurse, Well-managed Conditions
('Nancy', 'Turner', '1954-07-16', '3605556666', 'nancy.turner@healthcare.org',
 ARRAY[]::TEXT[], ARRAY['Hypothyroidism', 'Mild Cognitive Impairment']);

-- Verify the insert
SELECT
  COUNT(*) as total_patients,
  MIN(EXTRACT(YEAR FROM AGE(dob))) as youngest_age,
  MAX(EXTRACT(YEAR FROM AGE(dob))) as oldest_age
FROM patients;

SELECT 'Realistic patient data inserted successfully. Total patients: ' || COUNT(*) FROM patients;