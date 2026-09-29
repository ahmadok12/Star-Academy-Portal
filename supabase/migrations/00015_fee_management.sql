-- Migration: 00015_fee_management.sql
-- Description: Fee Structures, Invoices, and Payment Transactions for Phase 10 (Fees)

-- 1. Fee Structures
CREATE TABLE IF NOT EXISTS public.fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  tuition_fee numeric(10, 2) NOT NULL DEFAULT 0.00,
  admission_fee numeric(10, 2) NOT NULL DEFAULT 0.00,
  exam_fee numeric(10, 2) NOT NULL DEFAULT 0.00,
  lab_fee numeric(10, 2) NOT NULL DEFAULT 0.00,
  other_fee numeric(10, 2) NOT NULL DEFAULT 0.00,
  total_amount numeric(10, 2) NOT NULL DEFAULT 0.00,
  billing_frequency text NOT NULL DEFAULT 'monthly' CHECK (billing_frequency IN ('monthly', 'term', 'annual', 'one_time')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Fee Invoices
CREATE TABLE IF NOT EXISTS public.fee_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no text NOT NULL UNIQUE,
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  section_id uuid REFERENCES public.sections(id) ON DELETE SET NULL,
  fee_structure_id uuid REFERENCES public.fee_structures(id) ON DELETE SET NULL,
  month text NOT NULL,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  subtotal numeric(10, 2) NOT NULL DEFAULT 0.00,
  discount numeric(10, 2) NOT NULL DEFAULT 0.00,
  discount_reason text,
  fine numeric(10, 2) NOT NULL DEFAULT 0.00,
  total_amount numeric(10, 2) NOT NULL DEFAULT 0.00,
  paid_amount numeric(10, 2) NOT NULL DEFAULT 0.00,
  balance_amount numeric(10, 2) NOT NULL DEFAULT 0.00,
  status text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'overdue', 'cancelled')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Fee Payments (Receipts)
CREATE TABLE IF NOT EXISTS public.fee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_no text NOT NULL UNIQUE,
  invoice_id uuid NOT NULL REFERENCES public.fee_invoices(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text NOT NULL DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'Bank Transfer', 'Cheque', 'Online / Mobile Wallet')),
  transaction_reference text,
  collected_by text,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fee_structures_year ON public.fee_structures(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_fee_structures_class ON public.fee_structures(class_id);
CREATE INDEX IF NOT EXISTS idx_fee_invoices_year ON public.fee_invoices(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_fee_invoices_student ON public.fee_invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_invoices_status ON public.fee_invoices(status);
CREATE INDEX IF NOT EXISTS idx_fee_payments_invoice ON public.fee_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON public.fee_payments(student_id);

-- RLS Policies
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fee_structures' AND policyname = 'Allow public read fee_structures') THEN
    CREATE POLICY "Allow public read fee_structures" ON public.fee_structures FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fee_structures' AND policyname = 'Allow public insert fee_structures') THEN
    CREATE POLICY "Allow public insert fee_structures" ON public.fee_structures FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fee_structures' AND policyname = 'Allow public update fee_structures') THEN
    CREATE POLICY "Allow public update fee_structures" ON public.fee_structures FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fee_structures' AND policyname = 'Allow public delete fee_structures') THEN
    CREATE POLICY "Allow public delete fee_structures" ON public.fee_structures FOR DELETE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fee_invoices' AND policyname = 'Allow public read fee_invoices') THEN
    CREATE POLICY "Allow public read fee_invoices" ON public.fee_invoices FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fee_invoices' AND policyname = 'Allow public insert fee_invoices') THEN
    CREATE POLICY "Allow public insert fee_invoices" ON public.fee_invoices FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fee_invoices' AND policyname = 'Allow public update fee_invoices') THEN
    CREATE POLICY "Allow public update fee_invoices" ON public.fee_invoices FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fee_invoices' AND policyname = 'Allow public delete fee_invoices') THEN
    CREATE POLICY "Allow public delete fee_invoices" ON public.fee_invoices FOR DELETE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fee_payments' AND policyname = 'Allow public read fee_payments') THEN
    CREATE POLICY "Allow public read fee_payments" ON public.fee_payments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fee_payments' AND policyname = 'Allow public insert fee_payments') THEN
    CREATE POLICY "Allow public insert fee_payments" ON public.fee_payments FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fee_payments' AND policyname = 'Allow public update fee_payments') THEN
    CREATE POLICY "Allow public update fee_payments" ON public.fee_payments FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fee_payments' AND policyname = 'Allow public delete fee_payments') THEN
    CREATE POLICY "Allow public delete fee_payments" ON public.fee_payments FOR DELETE USING (true);
  END IF;
END $$;

-- Trigger to sync invoice totals and status on fee payments
CREATE OR REPLACE FUNCTION public.sync_invoice_payment_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_invoice_id uuid;
  v_total_paid numeric(10, 2);
  v_total_amount numeric(10, 2);
  v_balance numeric(10, 2);
  v_new_status text;
  v_due_date date;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_invoice_id := OLD.invoice_id;
  ELSE
    v_invoice_id := NEW.invoice_id;
  END IF;

  -- Calculate total payments for this invoice
  SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
  FROM public.fee_payments
  WHERE invoice_id = v_invoice_id;

  -- Get invoice details
  SELECT total_amount, due_date INTO v_total_amount, v_due_date
  FROM public.fee_invoices
  WHERE id = v_invoice_id;

  v_balance := GREATEST(0, v_total_amount - v_total_paid);

  IF v_balance <= 0 THEN
    v_new_status := 'paid';
  ELSIF v_total_paid > 0 THEN
    v_new_status := 'partial';
  ELSIF v_due_date < CURRENT_DATE THEN
    v_new_status := 'overdue';
  ELSE
    v_new_status := 'unpaid';
  END IF;

  UPDATE public.fee_invoices
  SET paid_amount = v_total_paid,
      balance_amount = v_balance,
      status = v_new_status,
      updated_at = now()
  WHERE id = v_invoice_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_invoice_payments ON public.fee_payments;
CREATE TRIGGER trg_sync_invoice_payments
AFTER INSERT OR UPDATE OR DELETE ON public.fee_payments
FOR EACH ROW EXECUTE FUNCTION public.sync_invoice_payment_totals();

-- Seeds
-- 1. Fee Structure for Class 9 (2026-27)
INSERT INTO public.fee_structures (
  id, academic_year_id, class_id, title, tuition_fee, admission_fee, exam_fee, lab_fee, other_fee, total_amount, billing_frequency, status
) VALUES
(
  'e1000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001', -- 2026-27
  'c0000000-0000-0000-0000-000000000001', -- Class 9
  'Matric Science Standard Fee',
  5000.00,
  0.00,
  500.00,
  500.00,
  0.00,
  6000.00,
  'monthly',
  'active'
),
(
  'e1000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002', -- Class 10
  'Matric Science 10th Fee',
  5500.00,
  0.00,
  500.00,
  500.00,
  0.00,
  6500.00,
  'monthly',
  'active'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Fee Invoices (May 2026)
INSERT INTO public.fee_invoices (
  id, invoice_no, academic_year_id, student_id, class_id, section_id, fee_structure_id, month, issue_date, due_date, subtotal, discount, discount_reason, fine, total_amount, paid_amount, balance_amount, status, notes
) VALUES
(
  'e2000000-0000-0000-0000-000000000001',
  'INV-2026-0001',
  'a0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001', -- Muhammad Ali
  'c0000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000001',
  'e1000000-0000-0000-0000-000000000001',
  'May 2026',
  '2026-05-01',
  '2026-05-15',
  6000.00,
  0.00,
  NULL,
  0.00,
  6000.00,
  3500.00,
  2500.00,
  'partial',
  'Partial installment paid on 5th May; remaining 2,500 due.'
),
(
  'e2000000-0000-0000-0000-000000000002',
  'INV-2026-0002',
  'a0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000002', -- Fatima Noor
  'c0000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000001',
  'e1000000-0000-0000-0000-000000000001',
  'May 2026',
  '2026-05-01',
  '2026-05-15',
  6000.00,
  1000.00,
  'Merit Scholarship 15% Waiver',
  0.00,
  5000.00,
  5000.00,
  0.00,
  'paid',
  'Full tuition and lab fee cleared via Bank Alfalah.'
),
(
  'e2000000-0000-0000-0000-000000000003',
  'INV-2026-0003',
  'a0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000003', -- Bilal Hassan
  'c0000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000001',
  'e1000000-0000-0000-0000-000000000001',
  'May 2026',
  '2026-05-01',
  '2026-05-15',
  6000.00,
  0.00,
  NULL,
  0.00,
  6000.00,
  0.00,
  6000.00,
  'unpaid',
  'First monthly fee voucher issued.'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Fee Payments (Audit trail)
INSERT INTO public.fee_payments (
  id, receipt_no, invoice_id, student_id, academic_year_id, amount, payment_date, payment_method, transaction_reference, collected_by, remarks
) VALUES
(
  'e3000000-0000-0000-0000-000000000001',
  'REC-2026-0001',
  'e2000000-0000-0000-0000-000000000001', -- Muhammad Ali
  'd0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  3500.00,
  '2026-05-05',
  'Cash',
  'CSH-8821',
  'Sheikh Zeeshan (Accounts)',
  'Part payment of Rs 3,500 received at front desk.'
),
(
  'e3000000-0000-0000-0000-000000000002',
  'REC-2026-0002',
  'e2000000-0000-0000-0000-000000000002', -- Fatima Noor
  'd0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  5000.00,
  '2026-05-08',
  'Bank Transfer',
  'BAFL-TRX-99412',
  'Sheikh Zeeshan (Accounts)',
  'Direct transfer to Star Academy Meezan Bank Account.'
)
ON CONFLICT (id) DO NOTHING;
