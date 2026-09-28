-- ============================================================================
-- Star Academy ERP - Migration 00008: Timetable & Schedules Module (Phase 5)
-- ============================================================================

-- 1. Create Periods Master
CREATE TABLE IF NOT EXISTS public.timetable_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_number INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_break BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create Timetable Slots (Class/Section, Day, Period, Subject, Teacher, Room)
CREATE TABLE IF NOT EXISTS public.timetable_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
    period_id UUID REFERENCES public.timetable_periods(id) ON DELETE SET NULL,
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    period_number INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    room VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_timetable_slots_academic_year ON public.timetable_slots(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_class_sec ON public.timetable_slots(class_id, section_id);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_teacher ON public.timetable_slots(teacher_id);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_day ON public.timetable_slots(day_of_week);

-- 4. Enable RLS
ALTER TABLE public.timetable_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Allow all on timetable_periods" ON public.timetable_periods;
CREATE POLICY "Allow all on timetable_periods" ON public.timetable_periods FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on timetable_slots" ON public.timetable_slots;
CREATE POLICY "Allow all on timetable_slots" ON public.timetable_slots FOR ALL USING (true) WITH CHECK (true);

-- 6. Initial Seed Periods
INSERT INTO public.timetable_periods (id, period_number, name, start_time, end_time, is_break, display_order, status)
VALUES
    ('f0000000-0000-0000-0000-000000000001', 1, 'Period 1', '08:00', '08:45', false, 1, 'active'),
    ('f0000000-0000-0000-0000-000000000002', 2, 'Period 2', '08:45', '09:30', false, 2, 'active'),
    ('f0000000-0000-0000-0000-000000000003', 3, 'Period 3', '09:30', '10:15', false, 3, 'active'),
    ('f0000000-0000-0000-0000-000000000004', 0, 'Morning Recess / Break', '10:15', '10:45', true, 4, 'active'),
    ('f0000000-0000-0000-0000-000000000005', 4, 'Period 4', '10:45', '11:30', false, 5, 'active'),
    ('f0000000-0000-0000-0000-000000000006', 5, 'Period 5', '11:30', '12:15', false, 6, 'active'),
    ('f0000000-0000-0000-0000-000000000007', 6, 'Period 6', '12:15', '13:00', false, 7, 'active'),
    ('f0000000-0000-0000-0000-000000000008', 7, 'Period 7', '13:00', '13:45', false, 8, 'active')
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Initial Slots for Academic Year 2026-27 (Class 9 - Section A)
INSERT INTO public.timetable_slots (
    id, academic_year_id, class_id, section_id, period_id, day_of_week, period_number, start_time, end_time, subject_id, teacher_id, room, status
)
VALUES
    -- Monday
    ('fa000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'Monday', 1, '08:00', '08:45', 'b0000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Room 101', 'active'), -- Maths / Prof Tariq
    ('fa000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002', 'Monday', 2, '08:45', '09:30', 'b0000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000002', 'Physics Lab', 'active'), -- Physics / Dr Sarah
    ('fa000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000003', 'Monday', 3, '09:30', '10:15', 'b0000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000003', 'Chem Lab', 'active'), -- Chem / Engr Bilal
    ('fa000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000005', 'Monday', 4, '10:45', '11:30', 'b0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004', 'Room 101', 'active'), -- English / Ms Maryam
    ('fa000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000006', 'Monday', 5, '11:30', '12:15', 'b0000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000006', 'Computer Lab', 'active'), -- CS / Engr Usman
    -- Tuesday
    ('fa000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'Tuesday', 1, '08:00', '08:45', 'b0000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000002', 'Room 101', 'active'), -- Physics / Dr Sarah
    ('fa000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002', 'Tuesday', 2, '08:45', '09:30', 'b0000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Room 101', 'active'), -- Maths / Prof Tariq
    ('fa000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000003', 'Tuesday', 3, '09:30', '10:15', 'b0000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000005', 'Room 101', 'active'), -- Urdu / Prof Zubair
    ('fa000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000005', 'Tuesday', 4, '10:45', '11:30', 'b0000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000007', 'Bio Lab', 'active')  -- Bio / Dr Noman
ON CONFLICT (id) DO NOTHING;
