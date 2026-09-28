-- ============================================================================
-- Migration 00006: Dynamic Batches Settings & Supplementary Students
-- ============================================================================

-- 1. Batches Master Table
CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial 3 batches: Advance Batch, Regular Batch, ICU Batch
INSERT INTO batches (id, name, code, description, display_order, status)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Advance Batch', 'ADV', 'Accelerated curriculum and high-performance academic coaching', 1, 'active'),
    ('b0000000-0000-0000-0000-000000000002', 'Regular Batch', 'REG', 'Standard institutional curriculum and board examination preparation', 2, 'active'),
    ('b0000000-0000-0000-0000-000000000003', 'ICU Batch', 'ICU', 'Intensive Care Unit / academic reinforcement and rescue coaching for struggling students', 3, 'active')
ON CONFLICT (code) DO NOTHING;

-- 2. Add Batch and Supplementary Fields to student_academic_records
ALTER TABLE student_academic_records
    ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS enrollment_type TEXT NOT NULL DEFAULT 'regular' CHECK (enrollment_type IN ('regular', 'supplementary')),
    ADD COLUMN IF NOT EXISTS supplementary_subject_ids JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS supplementary_notes TEXT;

-- 3. Add Optional Enrollment Type to student_inquiries
ALTER TABLE student_inquiries
    ADD COLUMN IF NOT EXISTS enrollment_type TEXT DEFAULT 'regular' CHECK (enrollment_type IN ('regular', 'supplementary'));

-- 4. Enable Row Level Security & Policies for batches
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'batches' AND policyname = 'Public read batches'
    ) THEN
        CREATE POLICY "Public read batches" ON batches FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'batches' AND policyname = 'Admin write batches'
    ) THEN
        CREATE POLICY "Admin write batches" ON batches FOR ALL USING (true);
    END IF;
END $$;
