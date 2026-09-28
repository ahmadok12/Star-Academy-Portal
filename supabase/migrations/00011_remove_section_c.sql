-- ============================================================================
-- Star Academy ERP - Migration 00011: Remove Section C from Sections Master
-- ============================================================================

-- 1. Ensure any lingering historical references in association tables are cleaned up if any exist
DELETE FROM public.class_subjects WHERE section_id = 'e0000000-0000-0000-0000-000000000003';
DELETE FROM public.class_sections WHERE section_id = 'e0000000-0000-0000-0000-000000000003';
DELETE FROM public.teacher_subject_assignments WHERE section_id = 'e0000000-0000-0000-0000-000000000003';
DELETE FROM public.timetable_slots WHERE section_id = 'e0000000-0000-0000-0000-000000000003';
DELETE FROM public.daily_attendance WHERE section_id = 'e0000000-0000-0000-0000-000000000003';
DELETE FROM public.lecture_attendance WHERE section_id = 'e0000000-0000-0000-0000-000000000003';
DELETE FROM public.student_academic_records WHERE section_id = 'e0000000-0000-0000-0000-000000000003';

-- 2. Remove Section C from sections master
DELETE FROM public.sections 
WHERE id = 'e0000000-0000-0000-0000-000000000003' 
   OR code = 'SEC-C';
