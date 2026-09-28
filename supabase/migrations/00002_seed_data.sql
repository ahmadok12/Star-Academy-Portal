-- ============================================================================
-- ACADEMY MANAGEMENT SYSTEM - DEVELOPMENT SEED DATA
-- Migration: 00002_seed_data.sql
-- ============================================================================

-- 1. Academy Settings Initial Record
INSERT INTO public.academy_settings (
    academy_name,
    logo_url,
    address,
    phone,
    email,
    website,
    timezone,
    currency
) VALUES (
    'Star Academy',
    null,
    'Main Campus, Education Hub, Lahore, Pakistan',
    '+92 42 35870000',
    'admin@staracademy.edu.pk',
    'https://staracademy.edu.pk',
    'Asia/Karachi',
    'PKR'
)
ON CONFLICT (is_singleton) DO UPDATE
SET academy_name = EXCLUDED.academy_name,
    updated_at = timezone('utc'::text, now());

-- 2. Academic Year: 2026-27 (Current)
INSERT INTO public.academic_years (
    id,
    name,
    start_date,
    end_date,
    status,
    is_current
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    '2026-27',
    '2026-05-01',
    '2027-04-30',
    'active',
    true
)
ON CONFLICT (name) DO NOTHING;

-- Also seed previous year 2025-26 for historical demonstration
INSERT INTO public.academic_years (
    id,
    name,
    start_date,
    end_date,
    status,
    is_current
) VALUES (
    'a0000000-0000-0000-0000-000000000000',
    '2025-26',
    '2025-05-01',
    '2026-04-30',
    'active',
    false
)
ON CONFLICT (name) DO NOTHING;

-- 3. Classes
INSERT INTO public.classes (id, name, code, display_order, status)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Pre 9th', 'PRE-9', 1, 'active'),
    ('c0000000-0000-0000-0000-000000000002', 'Class 9', 'CL-9', 2, 'active'),
    ('c0000000-0000-0000-0000-000000000003', 'Class 10', 'CL-10', 3, 'active'),
    ('c0000000-0000-0000-0000-000000000004', 'FSc Part 1', 'FSC-1', 4, 'active'),
    ('c0000000-0000-0000-0000-000000000005', 'FSc Part 2', 'FSC-2', 5, 'active')
ON CONFLICT (name) DO NOTHING;

-- 4. Sections
INSERT INTO public.sections (id, name, code, display_order, status)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'A', 'SEC-A', 1, 'active'),
    ('e0000000-0000-0000-0000-000000000002', 'B', 'SEC-B', 2, 'active'),
    ('e0000000-0000-0000-0000-000000000003', 'C', 'SEC-C', 3, 'active')
ON CONFLICT (name) DO NOTHING;

-- 5. Subjects
INSERT INTO public.subjects (id, name, code, short_name, display_order, status)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'English', 'ENG', 'English', 1, 'active'),
    ('b0000000-0000-0000-0000-000000000002', 'Urdu', 'URD', 'Urdu', 2, 'active'),
    ('b0000000-0000-0000-0000-000000000003', 'Mathematics', 'MTH', 'Maths', 3, 'active'),
    ('b0000000-0000-0000-0000-000000000004', 'Science', 'SCI', 'Science', 4, 'active'),
    ('b0000000-0000-0000-0000-000000000005', 'Computer Science', 'CS', 'Comp Sci', 5, 'active'),
    ('b0000000-0000-0000-0000-000000000006', 'Islamiyat', 'ISL', 'Islamiyat', 6, 'active'),
    ('b0000000-0000-0000-0000-000000000007', 'Physics', 'PHY', 'Physics', 7, 'active'),
    ('b0000000-0000-0000-0000-000000000008', 'Chemistry', 'CHM', 'Chemistry', 8, 'active'),
    ('b0000000-0000-0000-0000-000000000009', 'Biology', 'BIO', 'Biology', 9, 'active')
ON CONFLICT (name) DO NOTHING;

-- 6. Initial Class Sections for 2026-27
INSERT INTO public.class_sections (academic_year_id, class_id, section_id, status)
VALUES
    -- Class 9 (A, B)
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'active'),
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'active'),
    -- Class 10 (A, B, C)
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'active'),
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000002', 'active'),
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'active')
ON CONFLICT (academic_year_id, class_id, section_id) DO NOTHING;

-- 7. Initial Class Subjects for 2026-27
INSERT INTO public.class_subjects (academic_year_id, class_id, subject_id, display_order, status)
VALUES
    -- Class 9 Subjects
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 1, 'active'),
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 2, 'active'),
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 3, 'active'),
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000005', 4, 'active'),
    -- Class 10 Subjects
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 1, 'active'),
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 2, 'active'),
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 3, 'active'),
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005', 4, 'active')
ON CONFLICT (academic_year_id, class_id, subject_id) DO NOTHING;
