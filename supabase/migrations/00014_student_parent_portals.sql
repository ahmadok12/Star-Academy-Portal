-- Migration: 00014_student_parent_portals.sql
-- Description: Parents and Parent-Student Relationships for Parent & Student Portals (Phase 9)

CREATE TABLE IF NOT EXISTS public.parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  relationship text NOT NULL DEFAULT 'Father',
  phone text NOT NULL,
  email text,
  cnic text,
  occupation text,
  address text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.parent_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  relationship_type text NOT NULL DEFAULT 'Father',
  is_primary_contact boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_parent_student UNIQUE (parent_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_students_parent ON public.parent_students(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_student ON public.parent_students(student_id);

-- RLS Policies
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'Allow public read parents') THEN
    CREATE POLICY "Allow public read parents" ON public.parents FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'Allow public insert parents') THEN
    CREATE POLICY "Allow public insert parents" ON public.parents FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'Allow public update parents') THEN
    CREATE POLICY "Allow public update parents" ON public.parents FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'Allow public delete parents') THEN
    CREATE POLICY "Allow public delete parents" ON public.parents FOR DELETE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parent_students' AND policyname = 'Allow public read parent_students') THEN
    CREATE POLICY "Allow public read parent_students" ON public.parent_students FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parent_students' AND policyname = 'Allow public insert parent_students') THEN
    CREATE POLICY "Allow public insert parent_students" ON public.parent_students FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parent_students' AND policyname = 'Allow public update parent_students') THEN
    CREATE POLICY "Allow public update parent_students" ON public.parent_students FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parent_students' AND policyname = 'Allow public delete parent_students') THEN
    CREATE POLICY "Allow public delete parent_students" ON public.parent_students FOR DELETE USING (true);
  END IF;
END $$;

-- Seed Sample Parents and Link them to existing Matric students
INSERT INTO public.parents (id, full_name, relationship, phone, email, cnic, occupation, address, status)
VALUES
  (
    'e0000000-0000-0000-0000-000000000001',
    'Usman Ali',
    'Father',
    '+92 300 5550101',
    'usman.ali@example.com',
    '35201-1234567-1',
    'Senior Electrical Engineer',
    'House 42, Street 8, Sector G-9/1, Islamabad',
    'active'
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'Noor Ahmad',
    'Father',
    '+92 321 5550202',
    'noor.ahmad@example.com',
    '35201-2345678-3',
    'Business Consultant & Entrepreneur',
    'Plot 15-B, Commercial Area, F-10, Islamabad',
    'active'
  ),
  (
    'e0000000-0000-0000-0000-000000000003',
    'Hassan Raza',
    'Father',
    '+92 333 5550303',
    'hassan.raza@example.com',
    '35201-3456789-5',
    'Chartered Accountant',
    'House 12, Lane 3, Askari 14, Rawalpindi',
    'active'
  )
ON CONFLICT (id) DO NOTHING;

-- Map Parents to Students
INSERT INTO public.parent_students (id, parent_id, student_id, relationship_type, is_primary_contact)
VALUES
  (
    'f0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001', -- Muhammad Ali
    'Father',
    true
  ),
  (
    'f0000000-0000-0000-0000-000000000002',
    'e0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000002', -- Fatima Noor
    'Father',
    true
  ),
  (
    'f0000000-0000-0000-0000-000000000003',
    'e0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000003', -- Bilal Hassan
    'Father',
    true
  ),
  -- Also link Usman Ali to Bilal Hassan as secondary guardian to demonstrate multi-child switching
  (
    'f0000000-0000-0000-0000-000000000004',
    'e0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000003', -- Bilal Hassan (Ward / Nephew)
    'Guardian',
    false
  )
ON CONFLICT (id) DO NOTHING;
