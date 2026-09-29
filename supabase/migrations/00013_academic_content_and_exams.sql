-- ============================================================================
-- STAR ACADEMY ERP - PHASE 7 & 8: ACADEMIC CONTENT, EXAMS & TEACHER PORTAL
-- Migration: 00013_academic_content_and_exams.sql
-- ============================================================================

-- 1. SCHEME OF STUDY (SOS) TABLE
CREATE TABLE IF NOT EXISTS public.scheme_of_studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    month_name TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    chapter_title TEXT NOT NULL,
    topics_covered TEXT NOT NULL,
    learning_objectives TEXT,
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER update_scheme_of_studies_updated_at
    BEFORE UPDATE ON public.scheme_of_studies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. SUBJECT CONTENT & STUDY MATERIALS TABLE
CREATE TABLE IF NOT EXISTS public.subject_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'notes' CHECK (content_type IN ('syllabus', 'notes', 'assignment', 'past_paper', 'worksheet', 'reference')),
    chapter_ref TEXT,
    description TEXT,
    file_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER update_subject_contents_updated_at
    BEFORE UPDATE ON public.subject_contents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. ASSESSMENTS / EXAMS TABLE
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    assessment_type TEXT NOT NULL DEFAULT 'monthly_test' CHECK (assessment_type IN ('monthly_test', 'midterm', 'final', 'quiz', 'pre_board', 'supplementary_exam')),
    total_marks NUMERIC(6,2) NOT NULL DEFAULT 50.00,
    passing_marks NUMERIC(6,2) NOT NULL DEFAULT 20.00,
    test_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    room_number TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER update_assessments_updated_at
    BEFORE UPDATE ON public.assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. STUDENT MARKS TABLE
CREATE TABLE IF NOT EXISTS public.student_marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    obtained_marks NUMERIC(6,2),
    is_absent BOOLEAN NOT NULL DEFAULT false,
    percentage NUMERIC(5,2),
    grade TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_assessment_student UNIQUE (assessment_id, student_id)
);

CREATE TRIGGER update_student_marks_updated_at
    BEFORE UPDATE ON public.student_marks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. ROW LEVEL SECURITY
ALTER TABLE public.scheme_of_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_marks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read scheme_of_studies" ON public.scheme_of_studies FOR SELECT USING (true);
CREATE POLICY "Allow public modify scheme_of_studies" ON public.scheme_of_studies FOR ALL USING (true);

CREATE POLICY "Allow public read subject_contents" ON public.subject_contents FOR SELECT USING (true);
CREATE POLICY "Allow public modify subject_contents" ON public.subject_contents FOR ALL USING (true);

CREATE POLICY "Allow public read assessments" ON public.assessments FOR SELECT USING (true);
CREATE POLICY "Allow public modify assessments" ON public.assessments FOR ALL USING (true);

CREATE POLICY "Allow public read student_marks" ON public.student_marks FOR SELECT USING (true);
CREATE POLICY "Allow public modify student_marks" ON public.student_marks FOR ALL USING (true);

-- 6. SEED SAMPLE SOS, ASSESSMENTS & MARKS
INSERT INTO public.scheme_of_studies (id, academic_year_id, class_id, subject_id, month_name, order_index, chapter_title, topics_covered, learning_objectives, status)
VALUES
    ('90000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'April', 1, 'Matrices and Determinants', 'Types of Matrices, Addition, Multiplication, Inverses & Cramer Rule', 'Understand linear equations solving using matrices', 'completed'),
    ('90000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'May', 2, 'Real and Complex Numbers', 'Radicals and Radicands, Laws of Exponents, Complex Numbers', 'Master complex number operations and algebraic simplification', 'completed'),
    ('90000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'June', 3, 'Logarithms', 'Scientific Notation, Common Logarithm, Characteristic & Mantissa, Laws of Logarithms', 'Perform multi-step calculations using log tables and laws', 'in_progress'),
    ('90000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'July', 4, 'Algebraic Expressions & Formulas', 'Algebraic Identities, Rational Expressions, Surds and their Conjugates', 'Factorization and polynomial expansion mastery', 'planned'),
    ('90000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000007', 'April', 1, 'Physical Quantities & Measurement', 'International System of Units, Vernier Callipers, Screw Gauge, Significant Figures', 'Lab measurement instruments and uncertainty calculation', 'completed'),
    ('90000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000007', 'May', 2, 'Kinematics', 'Speed, Velocity, Acceleration, Equations of Motion, Motion under Gravity', 'Derive and apply motion formulas for constant acceleration', 'completed'),
    ('90000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000007', 'June', 3, 'Dynamics', 'Newtons Laws of Motion, Momentum, Friction, Centripetal Force', 'Analyze force diagrams and friction coefficient problems', 'in_progress')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.subject_contents (id, academic_year_id, class_id, subject_id, title, content_type, chapter_ref, description, is_published, created_by)
VALUES
    ('91000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'Complete Matric Math Course Syllabus 2026-27', 'syllabus', 'General', 'Annual Board syllabus breakdown, chapter weightage, and paper pattern', true, '30000000-0000-0000-0000-000000000001'),
    ('91000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'Unit 1 Matrices & Determinants Handouts', 'notes', 'Chapter 1', 'Comprehensive theoretical derivations, solved numericals and shortcuts for Cramer Rule', true, '30000000-0000-0000-0000-000000000001'),
    ('91000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000007', 'Kinematics 3 Equations of Motion Practice Worksheet', 'worksheet', 'Chapter 2', '20 high-frequency board questions with step-by-step graphical proofs', true, '30000000-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.assessments (id, academic_year_id, class_id, section_id, subject_id, title, assessment_type, total_marks, passing_marks, test_date, start_time, end_time, room_number, status)
VALUES
    ('92000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'Monthly Assessment 1 (Math)', 'monthly_test', 50.00, 20.00, '2026-05-15', '09:00:00', '10:30:00', 'Hall A', 'completed'),
    ('92000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', 'Monthly Assessment 1 (Physics)', 'monthly_test', 50.00, 20.00, '2026-05-18', '09:00:00', '10:30:00', 'Hall A', 'completed'),
    ('92000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', 'Monthly Assessment 1 (Chemistry)', 'monthly_test', 50.00, 20.00, '2026-05-20', '09:00:00', '10:30:00', 'Hall A', 'completed'),
    ('92000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Monthly Assessment 1 (English)', 'monthly_test', 50.00, 20.00, '2026-05-22', '09:00:00', '10:30:00', 'Hall A', 'completed'),
    ('92000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'Mid-Term Examination 2026 (Math)', 'midterm', 75.00, 25.00, '2026-10-10', '08:30:00', '11:30:00', 'Exam Hall 1', 'scheduled'),
    ('92000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', 'Mid-Term Examination 2026 (Physics)', 'midterm', 75.00, 25.00, '2026-10-12', '08:30:00', '11:30:00', 'Exam Hall 1', 'scheduled')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.student_marks (id, assessment_id, student_id, obtained_marks, is_absent, percentage, grade, remarks)
VALUES
    ('93000000-0000-0000-0000-000000000001', '92000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 46.50, false, 93.00, 'A+', 'Outstanding performance in Cramer rule & matrices'),
    ('93000000-0000-0000-0000-000000000002', '92000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 42.00, false, 84.00, 'A+', 'Very good conceptual grasp of Kinematics'),
    ('93000000-0000-0000-0000-000000000003', '92000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 39.00, false, 78.00, 'A', 'Good attempt, review chemical bonding equations'),
    ('93000000-0000-0000-0000-000000000004', '92000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 44.00, false, 88.00, 'A+', 'Excellent grammar and comprehension writing')
ON CONFLICT (id) DO NOTHING;
