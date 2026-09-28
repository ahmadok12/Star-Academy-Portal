-- ============================================================================
-- Star Academy ERP - Phase 2 Enhancement: Section-Specific Class Subjects
-- ============================================================================

-- Add section_id to class_subjects
ALTER TABLE IF EXISTS public.class_subjects
    ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.sections(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_class_subjects_section ON public.class_subjects(section_id);

-- Drop previous unique constraint if it existed on (academic_year_id, class_id, subject_id)
ALTER TABLE public.class_subjects DROP CONSTRAINT IF EXISTS unique_class_subject_per_year;

-- Create constraint allowing section-specific curriculum mappings
ALTER TABLE public.class_subjects ADD CONSTRAINT unique_class_section_subject_per_year
    UNIQUE NULLS NOT DISTINCT (academic_year_id, class_id, section_id, subject_id);
