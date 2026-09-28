-- ============================================================================
-- Star Academy ERP - Phase 4: Staff & Teacher Assignments Migration
-- ============================================================================

-- 1. Create Staff Role and Status Domains / Checks
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin', 'accountant', 'clerk', 'principal', 'librarian', 'support', 'other')),
    designation VARCHAR(150) NOT NULL,
    department VARCHAR(150) DEFAULT 'General',
    qualification VARCHAR(255),
    specialization VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    cnic VARCHAR(50),
    gender VARCHAR(20) DEFAULT 'Male' CHECK (gender IN ('Male', 'Female', 'Other')),
    dob DATE,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    contract_type VARCHAR(50) DEFAULT 'Permanent' CHECK (contract_type IN ('Permanent', 'Visiting / Contract', 'Probation', 'Part-Time')),
    salary NUMERIC(12, 2) DEFAULT 0.00,
    address TEXT,
    emergency_contact VARCHAR(100),
    photo_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'terminated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);
CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department);

-- 2. Teacher Subject & Class Section Assignments (instructions.md §18)
CREATE TABLE IF NOT EXISTS teacher_subject_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    is_class_teacher BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_teacher_slot_assignment UNIQUE (academic_year_id, class_id, section_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_tsa_academic_year ON teacher_subject_assignments(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_tsa_teacher ON teacher_subject_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_tsa_class_section ON teacher_subject_assignments(class_id, section_id);
CREATE INDEX IF NOT EXISTS idx_tsa_subject ON teacher_subject_assignments(subject_id);

-- 3. Automatic updated_at triggers
DROP TRIGGER IF EXISTS trg_staff_updated_at ON staff;
CREATE TRIGGER trg_staff_updated_at
    BEFORE UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_tsa_updated_at ON teacher_subject_assignments;
CREATE TRIGGER trg_tsa_updated_at
    BEFORE UPDATE ON teacher_subject_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Row Level Security
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subject_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read staff" ON staff FOR SELECT USING (true);
CREATE POLICY "Allow all write staff" ON staff FOR ALL USING (true);

CREATE POLICY "Allow public read teacher assignments" ON teacher_subject_assignments FOR SELECT USING (true);
CREATE POLICY "Allow all write teacher assignments" ON teacher_subject_assignments FOR ALL USING (true);

-- 5. Seed Initial Staff & Teacher Records
INSERT INTO staff (id, employee_id, name, father_name, role, designation, department, qualification, specialization, phone, email, cnic, gender, joining_date, contract_type, salary, status)
VALUES
  ('30000000-0000-0000-0000-000000000001', 'TCH-001', 'Prof. Muhammad Tariq', 'Haji Ghulam Rasool', 'teacher', 'Senior Mathematics Lecturer', 'Mathematics', 'M.Sc Mathematics, M.Ed', 'Pure Mathematics & Calculus', '0300-1122334', 'tariq.math@staracademy.edu.pk', '35202-1234567-1', 'Male', '2020-08-15', 'Permanent', 85000.00, 'active'),
  ('30000000-0000-0000-0000-000000000002', 'TCH-002', 'Dr. Sarah Farooq', 'Dr. Farooq Ahmad', 'teacher', 'Head of Department - Physics', 'Sciences', 'Ph.D Applied Physics', 'Modern Physics & Electromagnetism', '0321-9876543', 'sarah.farooq@staracademy.edu.pk', '35201-7654321-2', 'Female', '2019-09-01', 'Permanent', 110000.00, 'active'),
  ('30000000-0000-0000-0000-000000000003', 'TCH-003', 'Engr. Bilal Hashmi', 'Hashmi Riaz', 'teacher', 'Lecturer Chemistry', 'Sciences', 'M.Phil Organic Chemistry', 'Organic & Analytical Chemistry', '0333-5566778', 'bilal.hashmi@staracademy.edu.pk', '35200-3344556-3', 'Male', '2022-01-10', 'Permanent', 75000.00, 'active'),
  ('30000000-0000-0000-0000-000000000004', 'TCH-004', 'Ms. Ayesha Siddiqui', 'Muhammad Siddique', 'teacher', 'English Language Instructor', 'Humanities', 'M.A English Literature & Linguistics', 'Grammar, Essay Writing & Literature', '0345-4433221', 'ayesha.eng@staracademy.edu.pk', '35202-9988776-4', 'Female', '2021-03-15', 'Permanent', 70000.00, 'active'),
  ('30000000-0000-0000-0000-000000000005', 'TCH-005', 'Mr. Usman Ali Khan', 'Liaquat Ali Khan', 'teacher', 'Computer Science Instructor', 'Computer Science', 'BS Computer Science, MS-CS', 'Database Systems & C++', '0312-8877665', 'usman.cs@staracademy.edu.pk', '35201-5544332-5', 'Male', '2023-08-01', 'Permanent', 72000.00, 'active'),
  ('30000000-0000-0000-0000-000000000006', 'TCH-006', 'Dr. Nida Rehman', 'Abdur Rehman', 'teacher', 'Senior Biology Lecturer', 'Sciences', 'M.Phil Zoology, MBBS', 'Cell Biology & Physiology', '0301-7788990', 'nida.bio@staracademy.edu.pk', '35200-1122998-6', 'Female', '2021-09-01', 'Permanent', 80000.00, 'active'),
  ('30000000-0000-0000-0000-000000000007', 'ADM-001', 'Malik Jahangir', 'Malik Khuda Bakhsh', 'admin', 'Academy Administrator / Registrar', 'Administration', 'MBA Educational Management', 'Admissions, HR & Compliance', '0300-5551122', 'admin@staracademy.edu.pk', '35202-4455667-7', 'Male', '2018-05-01', 'Permanent', 95000.00, 'active'),
  ('30000000-0000-0000-0000-000000000008', 'ACC-001', 'Sheikh Zeeshan', 'Sheikh Anwar', 'accountant', 'Finance & Accounts Officer', 'Finance', 'M.Com, ACCA Finalist', 'Payroll, Fee Reconciliation & Taxation', '0322-6677889', 'accounts@staracademy.edu.pk', '35201-8899001-8', 'Male', '2020-11-15', 'Permanent', 80000.00, 'active')
ON CONFLICT (employee_id) DO NOTHING;

-- 6. Seed Sample Teacher Subject Assignments for 2026-2027 (00000000-0000-0000-0000-000000000012)
-- Classes: 9th (00000000-0000-0000-0000-000000000021), 10th (00000000-0000-0000-0000-000000000022), FSc-1 (00000000-0000-0000-0000-000000000023)
-- Sections: Section A (00000000-0000-0000-0000-000000000031)
-- Subjects: Math (00000000-0000-0000-0000-000000000041), Physics (00000000-0000-0000-0000-000000000042), Chemistry (00000000-0000-0000-0000-000000000043), English (00000000-0000-0000-0000-000000000044)
INSERT INTO teacher_subject_assignments (
    id, academic_year_id, teacher_id, class_id, section_id, subject_id, is_class_teacher, status
)
VALUES
  -- Prof. Tariq -> Math for Class 9th Section A (Class Teacher)
  ('31000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000041', TRUE, 'active'),
  -- Dr. Sarah -> Physics for Class 9th Section A
  ('31000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000042', FALSE, 'active'),
  -- Engr. Bilal -> Chemistry for Class 9th Section A
  ('31000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000043', FALSE, 'active'),
  -- Ms. Ayesha -> English for Class 9th Section A
  ('31000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000044', FALSE, 'active'),
  -- Prof. Tariq -> Math for FSc Part 1 Section Pre-Engineering (00000000-0000-0000-0000-000000000034)
  ('31000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000034', '00000000-0000-0000-0000-000000000041', TRUE, 'active')
ON CONFLICT (academic_year_id, class_id, section_id, subject_id) DO NOTHING;
