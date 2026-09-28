-- ============================================================================
-- Star Academy ERP - Migration 00009: Attendance Module (Phase 6)
-- ============================================================================

-- 1. Create Daily / General Student Attendance Table
CREATE TABLE IF NOT EXISTS public.daily_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late', 'Leave')),
    remarks TEXT,
    recorded_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_daily_attendance_student_date UNIQUE(academic_year_id, student_id, date)
);

-- 2. Create Subject / Lecture Attendance Table (Linked to Timetable & Teachers)
CREATE TABLE IF NOT EXISTS public.lecture_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    timetable_slot_id UUID REFERENCES public.timetable_slots(id) ON DELETE SET NULL,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late', 'Leave')),
    remarks TEXT,
    recorded_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_lecture_attendance_slot_student_date UNIQUE(timetable_slot_id, student_id, date)
);

-- 3. High Performance Indexes
CREATE INDEX IF NOT EXISTS idx_daily_attendance_ay_date ON public.daily_attendance(academic_year_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_class_sec ON public.daily_attendance(class_id, section_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_student ON public.daily_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_batch ON public.daily_attendance(batch_id);

CREATE INDEX IF NOT EXISTS idx_lecture_attendance_slot_date ON public.lecture_attendance(timetable_slot_id, date);
CREATE INDEX IF NOT EXISTS idx_lecture_attendance_teacher_date ON public.lecture_attendance(teacher_id, date);
CREATE INDEX IF NOT EXISTS idx_lecture_attendance_student ON public.lecture_attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_lecture_attendance_subject ON public.lecture_attendance(subject_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.daily_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecture_attendance ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Allow all on daily_attendance" ON public.daily_attendance;
CREATE POLICY "Allow all on daily_attendance" ON public.daily_attendance FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on lecture_attendance" ON public.lecture_attendance;
CREATE POLICY "Allow all on lecture_attendance" ON public.lecture_attendance FOR ALL USING (true) WITH CHECK (true);

-- 6. Seed Sample Attendance Records for Academic Year 2026-27
-- (Class 9th Section A students: Muhammad Ali & Fatima Noor)
INSERT INTO public.daily_attendance (
    academic_year_id, student_id, class_id, section_id, date, status, remarks
)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', CURRENT_DATE, 'Present', 'On time'),
    ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', CURRENT_DATE, 'Present', 'On time'),
    ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '1 day', 'Present', 'On time'),
    ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '1 day', 'Late', 'Traffic delay 10 mins'),
    ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '2 day', 'Present', 'On time'),
    ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '2 day', 'Leave', 'Sick leave approved')
ON CONFLICT (academic_year_id, student_id, date) DO NOTHING;

-- 7. Seed Sample Lecture Attendance Records (Class 9A Maths & Physics lectures)
INSERT INTO public.lecture_attendance (
    academic_year_id, timetable_slot_id, student_id, subject_id, teacher_id, class_id, section_id, date, status, remarks
)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'fa000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', CURRENT_DATE, 'Present', 'Active in class'),
    ('a0000000-0000-0000-0000-000000000001', 'fa000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', CURRENT_DATE, 'Present', 'Completed lab work')
ON CONFLICT (timetable_slot_id, student_id, date) DO NOTHING;
