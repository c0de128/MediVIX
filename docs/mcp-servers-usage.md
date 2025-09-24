# MCP Servers Usage Guide for MediVIX

## PostgreSQL Server

### Purpose
Direct SQL access to your Supabase PostgreSQL database, bypassing the Supabase client for complex queries and administrative tasks.

### Use Cases for MediVIX

#### 1. Complex Reporting Queries
```sql
-- Monthly patient visit summary with diagnoses
WITH monthly_stats AS (
  SELECT
    DATE_TRUNC('month', a.start_time) as month,
    COUNT(DISTINCT a.patient_id) as unique_patients,
    COUNT(a.id) as total_appointments,
    COUNT(mh.id) as diagnoses_made
  FROM appointments a
  LEFT JOIN medical_history mh ON a.id = mh.appointment_id
  WHERE a.start_time >= NOW() - INTERVAL '6 months'
  GROUP BY DATE_TRUNC('month', a.start_time)
)
SELECT * FROM monthly_stats ORDER BY month DESC;
```

#### 2. Data Migration & Bulk Updates
```sql
-- Bulk update patient records with insurance information
UPDATE patients
SET insurance_provider = 'BlueCross BlueShield',
    insurance_policy_number = 'TEMP-' || id
WHERE insurance_provider IS NULL;
```

#### 3. Performance Analysis
```sql
-- Find slow queries and optimize indexes
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

## Brave Search Server

### Purpose
Web search capabilities for medical research, drug information, and healthcare guidelines.

### Use Cases for MediVIX

#### 1. Drug Information Lookup
- Search for drug interactions: "metformin and glipizide interactions"
- Find dosage guidelines: "pediatric amoxicillin dosing chart"
- Research side effects: "statins common side effects elderly"

#### 2. Medical Condition Research
- Latest treatments: "type 2 diabetes treatment guidelines 2024"
- Diagnostic criteria: "DSM-5 major depression criteria"
- Clinical protocols: "sepsis protocol emergency department"

#### 3. ICD-10 Code Lookup
- "ICD-10 code for hypertension"
- "billing code for annual physical exam"
- "CPT code for blood glucose test"

## Memory Server

### Purpose
Persistent knowledge graph for maintaining context about patients, treatments, and medical history across sessions.

### Use Cases for MediVIX

#### 1. Patient Allergy Tracking
```
Remember: Patient ID 123 is allergic to:
- Penicillin (severe - anaphylaxis)
- Sulfa drugs (moderate - rash)
- Latex (mild - contact dermatitis)
```

#### 2. Treatment Preferences
```
Remember: Dr. Smith's treatment protocols:
- Prefers generic medications when available
- Uses conservative dosing for elderly patients
- Always checks kidney function before prescribing NSAIDs
```

#### 3. Clinical Decision Support
```
Remember: Clinic protocols:
- All diabetic patients need HbA1c every 3 months
- Blood pressure meds require potassium check within 2 weeks
- Antibiotics require completion counseling
```

## Time Server

### Purpose
Timezone conversion and time calculations for appointment scheduling, especially for telemedicine across time zones.

### Use Cases for MediVIX

#### 1. Telemedicine Scheduling
```
Convert appointment times:
- Patient in California (PST)
- Doctor in New York (EST)
- Show both local times in confirmations
```

#### 2. Medication Timing
```
Calculate dosing schedules:
- TID (three times daily) = every 8 hours
- BID (twice daily) = every 12 hours
- QID (four times daily) = every 6 hours
```

#### 3. Follow-up Scheduling
```
Calculate follow-up dates:
- 2 weeks from surgery date
- 3 months for next checkup
- Annual screening reminders
```

## Fetch Server

### Purpose
Retrieve and process web content, especially from medical APIs and healthcare documentation.

### Use Cases for MediVIX

#### 1. Drug Database APIs
```
Fetch from RxNorm API:
- Drug interactions
- Generic/brand name mappings
- FDA warnings and recalls
```

#### 2. Lab Result Integration
```
Fetch from lab portals:
- Patient test results
- Reference ranges
- Critical values
```

#### 3. Insurance Verification
```
Fetch from payer APIs:
- Coverage verification
- Prior authorization status
- Copay amounts
```

#### 4. Medical Literature
```
Fetch from PubMed:
- Latest research papers
- Clinical trial results
- Treatment guidelines
```

## SQLite Server

### Purpose
Local database for offline access, testing, and rapid prototyping without Supabase dependency.

### Use Cases for MediVIX

#### 1. Offline Patient Access
```sql
-- Local cache of critical patient data
CREATE TABLE offline_patients (
  id TEXT PRIMARY KEY,
  name TEXT,
  allergies TEXT,
  medications TEXT,
  emergency_contact TEXT,
  last_sync TIMESTAMP
);
```

#### 2. Test Data Management
```sql
-- Generate test patients for development
INSERT INTO patients (first_name, last_name, dob)
SELECT
  'Test' || generate_series as first_name,
  'Patient' || generate_series as last_name,
  CURRENT_DATE - (generate_series * INTERVAL '1 year')
FROM generate_series(1, 100);
```

#### 3. Analytics Cache
```sql
-- Cache expensive calculations
CREATE TABLE analytics_cache (
  metric_name TEXT PRIMARY KEY,
  value REAL,
  calculated_at TIMESTAMP,
  expires_at TIMESTAMP
);
```

## Sequential Thinking Server

### Purpose
Step-by-step reasoning for complex medical workflows and diagnostic processes.

### Use Cases for MediVIX

#### 1. Differential Diagnosis
```
Patient presents with:
- Chest pain
- Shortness of breath
- Elevated troponin

Step 1: Rule out acute MI
Step 2: Consider pulmonary embolism
Step 3: Evaluate for pneumonia
Step 4: Check for anxiety/panic
```

#### 2. Treatment Planning
```
Newly diagnosed Type 2 Diabetes:

Step 1: Lifestyle modifications
  - Diet counseling
  - Exercise plan
  - Weight loss goals

Step 2: Metformin initiation
  - Check kidney function
  - Start 500mg daily
  - Titrate over 4 weeks

Step 3: Monitor and adjust
  - HbA1c in 3 months
  - Add second agent if needed
  - Consider insulin if HbA1c > 9%
```

#### 3. Clinical Pathways
```
Suspected Strep Throat Protocol:

Step 1: Clinical assessment
  - Fever > 38°C
  - Tonsillar exudate
  - Tender lymph nodes
  - Absence of cough

Step 2: Rapid strep test
  - If positive → treat
  - If negative → culture

Step 3: Treatment decision
  - Start antibiotics if high suspicion
  - Wait for culture if low risk
```

#### 4. Medication Reconciliation
```
Hospital Discharge Process:

Step 1: Review inpatient medications
Step 2: Compare with home medications
Step 3: Identify discrepancies
Step 4: Resolve with prescriber
Step 5: Create reconciled list
Step 6: Patient education
Step 7: Send to pharmacy
```

## Integration Examples

### Combining Multiple Servers

#### Example 1: Complete Patient Workup
1. **Memory**: Recall patient allergies and history
2. **PostgreSQL**: Query recent lab results
3. **Brave Search**: Look up latest treatment guidelines
4. **Sequential Thinking**: Create treatment plan
5. **Time**: Schedule follow-up appointments

#### Example 2: Drug Prescription Workflow
1. **Memory**: Check patient allergies
2. **Fetch**: Get drug interactions from API
3. **Brave Search**: Check for recent FDA warnings
4. **PostgreSQL**: Log prescription to database
5. **Time**: Calculate refill dates

#### Example 3: Telemedicine Visit
1. **Time**: Convert appointment to both time zones
2. **SQLite**: Cache patient data locally
3. **Memory**: Load patient preferences
4. **Sequential Thinking**: Follow clinical protocol
5. **PostgreSQL**: Save visit notes

## Best Practices

### 1. Data Privacy
- Use read-only connections when possible
- Anonymize data in examples
- Clear memory server of PHI regularly

### 2. Error Handling
- Always have fallbacks for external APIs
- Cache critical data locally with SQLite
- Log all MCP server errors

### 3. Performance
- Use PostgreSQL for complex queries
- Cache frequently accessed data in SQLite
- Batch API calls through Fetch server

### 4. Workflow Integration
- Document common query patterns
- Create templates for repeated tasks
- Train team on MCP capabilities

## Common Commands Reference

### PostgreSQL
- `SELECT * FROM patients LIMIT 10;`
- `EXPLAIN ANALYZE [query];`
- `\d+ table_name` (describe table)

### Brave Search
- "site:fda.gov drug recall [drug name]"
- "site:cdc.gov vaccination schedule 2024"
- "site:who.int ICD-11 [condition]"

### Memory
- "Remember: [fact about patient/protocol]"
- "What do you know about patient [ID]?"
- "Forget all information about [topic]"

### Time
- "Convert 3pm EST to PST"
- "What date is 6 weeks from today?"
- "Calculate age from DOB 1965-03-15"

### Fetch
- "Get content from [medical API URL]"
- "Fetch FDA drug label for [drug]"
- "Retrieve patient portal data from [URL]"

### SQLite
- "Create local cache table for patients"
- "Store offline appointment data"
- "Query local analytics cache"

### Sequential Thinking
- "Walk through diabetes diagnosis protocol"
- "Create step-by-step vaccination schedule"
- "Plan chronic disease management workflow"