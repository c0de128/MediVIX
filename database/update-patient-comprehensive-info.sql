-- Update Patient Comprehensive Information
-- This script adds insurance, emergency contact, and medication data for all 18 patients
-- Run this after adding the patient information columns

-- 1. Sarah Chen (34F, Software Engineer) - Young professional with good insurance
UPDATE patients
SET
  insurance_provider = 'Blue Cross Blue Shield',
  insurance_id = 'BCBS-745891234',
  emergency_contact_name = 'David Chen',
  emergency_contact_phone = '2065559876',
  emergency_contact_relationship = 'Husband',
  medications = ARRAY['Vitamin D3 1000 IU daily', 'Multivitamin daily']
WHERE first_name = 'Sarah' AND last_name = 'Chen';

-- 2. Marcus Williams (67M, Diabetes + Hypertension) - Medicare with complex medications
UPDATE patients
SET
  insurance_provider = 'Medicare Part B + AARP Supplement',
  insurance_id = 'MED-567234891A',
  emergency_contact_name = 'Linda Williams',
  emergency_contact_phone = '4255558765',
  emergency_contact_relationship = 'Wife',
  medications = ARRAY['Metformin 500mg BID', 'Lisinopril 10mg daily', 'Atorvastatin 20mg daily', 'Aspirin 81mg daily']
WHERE first_name = 'Marcus' AND last_name = 'Williams';

-- 3. Emma Rodriguez (8F, Pediatric Asthma) - Parent insurance, mother as emergency contact
UPDATE patients
SET
  insurance_provider = 'Kaiser Permanente',
  insurance_id = 'KP-449876523',
  emergency_contact_name = 'Maria Rodriguez',
  emergency_contact_phone = '2065552468',
  emergency_contact_relationship = 'Mother',
  medications = ARRAY['Albuterol inhaler PRN', 'Flovent 44mcg BID']
WHERE first_name = 'Emma' AND last_name = 'Rodriguez';

-- 4. James O'Connor (45M, Construction Worker) - Union insurance, wife as contact
UPDATE patients
SET
  insurance_provider = 'United Healthcare',
  insurance_id = 'UHC-332445678',
  emergency_contact_name = 'Patricia O''Connor',
  emergency_contact_phone = '3605559012',
  emergency_contact_relationship = 'Wife',
  medications = ARRAY['Ibuprofen 600mg TID PRN', 'Cyclobenzaprine 10mg HS PRN']
WHERE first_name = 'James' AND last_name = 'O''Connor';

-- 5. Dr. Anita Patel (52F, Physician) - Professional insurance, husband as contact
UPDATE patients
SET
  insurance_provider = 'Aetna PPO',
  insurance_id = 'AET-789123456',
  emergency_contact_name = 'Dr. Raj Patel',
  emergency_contact_phone = '2065556789',
  emergency_contact_relationship = 'Husband',
  medications = ARRAY['Multivitamin daily', 'Calcium 600mg BID']
WHERE first_name = 'Anita' AND last_name = 'Patel';

-- 6. Robert Thompson (78M, Multiple Conditions) - Medicare with extensive medications
UPDATE patients
SET
  insurance_provider = 'Medicare Advantage',
  insurance_id = 'MED-445789123B',
  emergency_contact_name = 'Susan Thompson',
  emergency_contact_phone = '2535554567',
  emergency_contact_relationship = 'Daughter',
  medications = ARRAY['Furosemide 40mg daily', 'Metoprolol 50mg BID', 'Lisinopril 10mg daily', 'Spironolactone 25mg daily', 'Spiriva 18mcg daily', 'Albuterol inhaler PRN']
WHERE first_name = 'Robert' AND last_name = 'Thompson';

-- 7. Isabella Martinez (29F, Nurse) - Hospital employee insurance
UPDATE patients
SET
  insurance_provider = 'Premera Blue Cross',
  insurance_id = 'PBC-556789012',
  emergency_contact_name = 'Carlos Martinez',
  emergency_contact_phone = '2065557654',
  emergency_contact_relationship = 'Brother',
  medications = ARRAY[]::TEXT[]
WHERE first_name = 'Isabella' AND last_name = 'Martinez';

-- 8. David Kim (31M, Accountant) - Corporate insurance, girlfriend as contact
UPDATE patients
SET
  insurance_provider = 'Cigna',
  insurance_id = 'CIG-667890123',
  emergency_contact_name = 'Jennifer Park',
  emergency_contact_phone = '4255557890',
  emergency_contact_relationship = 'Girlfriend',
  medications = ARRAY['Claritin 10mg daily PRN', 'Flonase nasal spray daily during season']
WHERE first_name = 'David' AND last_name = 'Kim';

-- 9. Grace Johnson (72F, Early Alzheimer's) - Medicare, daughter as primary contact
UPDATE patients
SET
  insurance_provider = 'Medicare Part A + B',
  insurance_id = 'MED-778901234C',
  emergency_contact_name = 'Margaret Johnson',
  emergency_contact_phone = '3605558901',
  emergency_contact_relationship = 'Daughter',
  medications = ARRAY['Donepezil 10mg daily', 'Memantine 5mg BID', 'Vitamin B12 1000mcg daily']
WHERE first_name = 'Grace' AND last_name = 'Johnson';

-- 10. Alex Taylor (26, Mental Health) - Student insurance, parent as contact
UPDATE patients
SET
  insurance_provider = 'Student Health Insurance',
  insurance_id = 'SHI-889012345',
  emergency_contact_name = 'Janet Taylor',
  emergency_contact_phone = '2065559123',
  emergency_contact_relationship = 'Mother',
  medications = ARRAY['Sertraline 75mg daily']
WHERE first_name = 'Alex' AND last_name = 'Taylor';

-- 11. Mohammed Al-Hassan (41M, Recent Immigrant) - Medicaid, friend as contact
UPDATE patients
SET
  insurance_provider = 'Washington Apple Health (Medicaid)',
  insurance_id = 'WAH-990123456',
  emergency_contact_name = 'Ahmed Hassan',
  emergency_contact_phone = '2065552345',
  emergency_contact_relationship = 'Brother',
  medications = ARRAY[]::TEXT[]
WHERE first_name = 'Mohammed' AND last_name = 'Al-Hassan';

-- 12. Linda Foster (58F, Cancer Survivor) - Good insurance, daughter as contact
UPDATE patients
SET
  insurance_provider = 'Regence BlueShield',
  insurance_id = 'REG-101234567',
  emergency_contact_name = 'Sarah Foster-Clark',
  emergency_contact_phone = '4255558234',
  emergency_contact_relationship = 'Daughter',
  medications = ARRAY['Tamoxifen 20mg daily', 'Vitamin D3 2000 IU daily', 'Calcium 1200mg daily']
WHERE first_name = 'Linda' AND last_name = 'Foster';

-- 13. Tyler Brooks (16M, Athletic Student) - Parent insurance, both parents as contacts
UPDATE patients
SET
  insurance_provider = 'Group Health Cooperative',
  insurance_id = 'GHC-212345678',
  emergency_contact_name = 'Karen Brooks',
  emergency_contact_phone = '3605557777',
  emergency_contact_relationship = 'Mother',
  medications = ARRAY[]::TEXT[]
WHERE first_name = 'Tyler' AND last_name = 'Brooks';

-- 14. Patricia Wong (63F, Rheumatoid Arthritis) - Corporate retiree insurance
UPDATE patients
SET
  insurance_provider = 'Boeing Retiree Health',
  insurance_id = 'BRH-323456789',
  emergency_contact_name = 'Michael Wong',
  emergency_contact_phone = '2065556543',
  emergency_contact_relationship = 'Husband',
  medications = ARRAY['Methotrexate 15mg weekly', 'Folic acid 5mg weekly', 'Adalimumab 40mg every 2 weeks', 'Calcium 600mg BID']
WHERE first_name = 'Patricia' AND last_name = 'Wong';

-- 15. Carlos Mendoza (55M, Diabetes + Sleep Apnea) - Small business owner insurance
UPDATE patients
SET
  insurance_provider = 'Molina Healthcare',
  insurance_id = 'MOL-434567890',
  emergency_contact_name = 'Rosa Mendoza',
  emergency_contact_phone = '2535556789',
  emergency_contact_relationship = 'Wife',
  medications = ARRAY['Metformin 500mg BID', 'Vitamin D3 1000 IU daily']
WHERE first_name = 'Carlos' AND last_name = 'Mendoza';

-- 16. Janet Miller (84F, Multiple Medications) - Medicare, son as contact
UPDATE patients
SET
  insurance_provider = 'Medicare + Humana Part D',
  insurance_id = 'MED-545678901D',
  emergency_contact_name = 'Robert Miller Jr.',
  emergency_contact_phone = '4255553456',
  emergency_contact_relationship = 'Son',
  medications = ARRAY['Warfarin 5mg daily', 'Metoprolol 50mg BID', 'Lisinopril 5mg daily', 'Furosemide 20mg daily', 'Potassium 20mEq daily']
WHERE first_name = 'Janet' AND last_name = 'Miller';

-- 17. Brandon Lewis (22M, College Student, ADHD) - Parent insurance, roommate as contact
UPDATE patients
SET
  insurance_provider = 'Anthem Blue Cross',
  insurance_id = 'ANT-656789012',
  emergency_contact_name = 'Michael Lewis',
  emergency_contact_phone = '2065554321',
  emergency_contact_relationship = 'Father',
  medications = ARRAY['Adderall XR 25mg daily']
WHERE first_name = 'Brandon' AND last_name = 'Lewis';

-- 18. Nancy Turner (70F, Retired Nurse) - Medicare, neighbor as contact
UPDATE patients
SET
  insurance_provider = 'Medicare + AARP MediGap',
  insurance_id = 'MED-767890123E',
  emergency_contact_name = 'Dorothy Martinez',
  emergency_contact_phone = '3605555678',
  emergency_contact_relationship = 'Friend/Neighbor',
  medications = ARRAY['Levothyroxine 75mcg daily', 'Vitamin B12 1000mcg daily', 'Multivitamin daily']
WHERE first_name = 'Nancy' AND last_name = 'Turner';

-- Verify the updates
SELECT
  first_name,
  last_name,
  insurance_provider,
  emergency_contact_name,
  emergency_contact_relationship,
  array_length(medications, 1) as medication_count
FROM patients
ORDER BY last_name, first_name;

SELECT 'Patient comprehensive information updated successfully for all 18 patients.' AS result;