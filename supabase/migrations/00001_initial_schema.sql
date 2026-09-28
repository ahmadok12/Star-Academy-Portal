-- ============================================================================
-- ACADEMY MANAGEMENT SYSTEM - FOUNDATION PHASE MIGRATION
-- Migration: 00001_initial_schema.sql
-- ============================================================================

-- 1. EXTENSIONS & UTILITIES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. USER PROFILES TABLE (Extensible Role System)
-- Decouples application profile information from auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'teacher', 'student', 'parent', 'staff')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. ACADEMY SETTINGS (Singleton Pattern)
CREATE TABLE IF NOT EXISTS public.academy_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_name TEXT NOT NULL DEFAULT 'Star Academy',
    logo_url TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    timezone TEXT NOT NULL DEFAULT 'Asia/Karachi',
    currency TEXT NOT NULL DEFAULT 'PKR',
    is_singleton BOOLEAN NOT NULL DEFAULT true UNIQUE CHECK (is_singleton = true),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER update_academy_settings_updated_at
    BEFORE UPDATE ON public.academy_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. ACADEMIC YEARS
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    is_current BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_academic_year_dates CHECK (start_date < end_date)
);

-- Constraint rule: Only ONE academic year can have is_current = true
CREATE UNIQUE INDEX IF NOT EXISTS idx_academic_years_single_current 
ON public.academic_years (is_current) 
WHERE is_current = true;

CREATE TRIGGER update_academic_years_updated_at
    BEFORE UPDATE ON public.academic_years
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Atomic function to set current academic year
CREATE OR REPLACE FUNCTION set_current_academic_year(target_year_id UUID)
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.academic_years WHERE id = target_year_id) THEN
        RAISE EXCEPTION 'Academic year with ID % does not exist.', target_year_id;
    END IF;

    -- Unset previous current year
    UPDATE public.academic_years
    SET is_current = false
    WHERE is_current = true AND id != target_year_id;

    -- Set new current year and activate it
    UPDATE public.academic_years
    SET is_current = true, status = 'active'
    WHERE id = target_year_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CLASSES MASTER
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. SECTIONS MASTER
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER update_sections_updated_at
    BEFORE UPDATE ON public.sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. CLASS SECTIONS (Relationship per Academic Year)
CREATE TABLE IF NOT EXISTS public.class_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_class_section_per_year UNIQUE (academic_year_id, class_id, section_id)
);

CREATE TRIGGER update_class_sections_updated_at
    BEFORE UPDATE ON public.class_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. SUBJECTS MASTER
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    short_name TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER update_subjects_updated_at
    BEFORE UPDATE ON public.subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. CLASS SUBJECTS (Relationship per Academic Year)
CREATE TABLE IF NOT EXISTS public.class_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
    display_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_class_subject_per_year UNIQUE (academic_year_id, class_id, subject_id)
);

CREATE TRIGGER update_class_subjects_updated_at
    BEFORE UPDATE ON public.class_subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;

-- Helper check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins can update profiles"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Academy Settings Policies
CREATE POLICY "Authenticated users can read academy settings"
    ON public.academy_settings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can modify academy settings"
    ON public.academy_settings FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Academic Years Policies
CREATE POLICY "Authenticated users can read academic years"
    ON public.academic_years FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can modify academic years"
    ON public.academic_years FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Classes Policies
CREATE POLICY "Authenticated users can read classes"
    ON public.classes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can modify classes"
    ON public.classes FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Sections Policies
CREATE POLICY "Authenticated users can read sections"
    ON public.sections FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can modify sections"
    ON public.sections FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Class Sections Policies
CREATE POLICY "Authenticated users can read class sections"
    ON public.class_sections FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can modify class sections"
    ON public.class_sections FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Subjects Policies
CREATE POLICY "Authenticated users can read subjects"
    ON public.subjects FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can modify subjects"
    ON public.subjects FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Class Subjects Policies
CREATE POLICY "Authenticated users can read class subjects"
    ON public.class_subjects FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can modify class subjects"
    ON public.class_subjects FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================================
-- 11. STORAGE BUCKET CONFIGURATION (academy-assets)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('academy-assets', 'academy-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public can view assets (logos, etc.)
CREATE POLICY "Public Read Access for Academy Assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'academy-assets');

-- Admins can upload assets
CREATE POLICY "Admins can upload Academy Assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'academy-assets' AND public.is_admin());

-- Admins can update/delete assets
CREATE POLICY "Admins can update Academy Assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'academy-assets' AND public.is_admin());

CREATE POLICY "Admins can delete Academy Assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'academy-assets' AND public.is_admin());
