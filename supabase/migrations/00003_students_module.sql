-- ============================================================================
-- ACADEMY MANAGEMENT SYSTEM - PHASE 3: STUDENTS MODULE
-- Migration: 00003_students_module.sql
-- ============================================================================

-- 1. STUDENT INQUIRIES
CREATE TABLE IF NOT EXISTS public.student_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_no TEXT NOT NULL UNIQUE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    student_name TEXT NOT NULL,
    father_name TEXT,
    contact TEXT NOT NULL,
    interested_class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    source TEXT NOT NULL DEFAULT 'Walk-in',
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Follow-up', 'Enrolled', 'Rejected', 'Lost')),
    remarks TEXT,
    follow_up_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER update_student_inquiries_updated_at
    BEFORE UPDATE ON public.student_inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. STUDENT MASTER (Permanent Identity Information)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_no TEXT NOT NULL UNIQUE,
    student_name TEXT NOT NULL,
    father_name TEXT NOT NULL,
    mother_name TEXT,
    dob DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    cnic_bform TEXT,
    address TEXT,
    phone TEXT NOT NULL,
    emergency_contact TEXT,
    photo_url TEXT,
    blood_group TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'passed_out', 'struck_off')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. STUDENT ACADEMIC RECORDS (Year-Specific Academic Enrollment)
CREATE TABLE IF NOT EXISTS public.student_academic_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE RESTRICT,
    roll_no TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'promoted', 'retained', 'left')),
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    leaving_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_student_per_academic_year UNIQUE (student_id, academic_year_id)
);

CREATE TRIGGER update_student_academic_records_updated_at
    BEFORE UPDATE ON public.student_academic_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.student_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_academic_records ENABLE ROW LEVEL SECURITY;

-- Student Inquiries Policies
CREATE POLICY "Authenticated users can read student inquiries"
    ON public.student_inquiries FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can modify student inquiries"
    ON public.student_inquiries FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Students Policies
CREATE POLICY "Authenticated users can read students"
    ON public.students FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can modify students"
    ON public.students FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Student Academic Records Policies
CREATE POLICY "Authenticated users can read student academic records"
    ON public.student_academic_records FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can modify student academic records"
    ON public.student_academic_records FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================================
-- 5. SEED DATA FOR STUDENTS MODULE (Development & Verification)
-- ============================================================================
-- Sample Inquiries
INSERT INTO public.student_inquiries (
    id, inquiry_no, date, student_name, father_name, contact, interested_class_id, source, status, remarks, follow_up_date
) VALUES
    ('e0000000-0000-0000-0000-000000000001', 'INQ-2026-0001', CURRENT_DATE, 'Zaid Khan', 'Tariq Khan', '+92 300 1234567', 'c0000000-0000-0000-0000-000000000002', 'Walk-in', 'New', 'Interested in Science group admission', CURRENT_DATE + INTERVAL '3 days'),
    ('e0000000-0000-0000-0000-000000000002', 'INQ-2026-0002', CURRENT_DATE - INTERVAL '2 days', 'Ayesha Bibi', 'Muhammad Arshad', '+92 321 9876543', 'c0000000-0000-0000-0000-000000000003', 'Social Media', 'Follow-up', 'Called for fee structure query', CURRENT_DATE + INTERVAL '1 day')
ON CONFLICT (inquiry_no) DO NOTHING;

-- Sample Students (Permanent Master)
INSERT INTO public.students (
    id, admission_no, student_name, father_name, mother_name, dob, gender, cnic_bform, address, phone, emergency_contact, status
) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'ADM-2026-0001', 'Muhammad Ali', 'Usman Ali', 'Fatima Bibi', '2010-04-15', 'Male', '35202-1234567-1', 'House 14, Block B, Model Town, Lahore', '+92 300 5550101', '+92 300 5550102', 'active'),
    ('d0000000-0000-0000-0000-000000000002', 'ADM-2026-0002', 'Fatima Noor', 'Noor Ahmad', 'Zainab Bibi', '2010-08-20', 'Female', '35202-7654321-2', 'Street 3, Gulberg III, Lahore', '+92 321 5550202', '+92 321 5550203', 'active'),
    ('d0000000-0000-0000-0000-000000000003', 'ADM-2026-0003', 'Bilal Hassan', 'Hassan Raza', 'Maryam Bibi', '2009-11-12', 'Male', '35202-9988776-1', 'Sector C, DHA Phase 5, Lahore', '+92 333 5550303', '+92 333 5550304', 'active')
ON CONFLICT (admission_no) DO NOTHING;

-- Sample Academic Enrollments for 2026-27
INSERT INTO public.student_academic_records (
    student_id, academic_year_id, class_id, section_id, roll_no, status, enrollment_date
) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 's0000000-0000-0000-0000-000000000001', '01', 'active', '2026-05-01'),
    ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 's0000000-0000-0000-0000-000000000002', '02', 'active', '2026-05-01'),
    ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 's0000000-0000-0000-0000-000000000001', '01', 'active', '2026-05-01')
ON CONFLICT (student_id, academic_year_id) DO NOTHING;
