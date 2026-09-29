-- Migration: 00016_finance_payroll.sql
-- Description: Phase 11 - Finance Module (Bank Accounts, Transfers, Operational Expenses, Teacher Payroll)

-- 1. Bank Accounts Table
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) NOT NULL DEFAULT 'bank', -- 'cash', 'bank', 'mobile_wallet'
    opening_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    current_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Bank Transfers Table (Internal inter-account transfers)
CREATE TABLE IF NOT EXISTS public.bank_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    from_account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE RESTRICT,
    to_account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    reference_no VARCHAR(100),
    description TEXT,
    created_by VARCHAR(100) DEFAULT 'Admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Expenses Table (Operational Academy Expenses)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(100) NOT NULL, -- 'Salary', 'Electricity', 'Rent', 'Stationery', 'Maintenance', 'Transport', 'Marketing', 'Utilities', 'Lab Supplies', 'Other'
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
    payee_name VARCHAR(150),
    reference_no VARCHAR(100),
    description TEXT,
    receipt_url TEXT,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Payrolls Table (Staff & Teacher Payroll)
CREATE TABLE IF NOT EXISTS public.payrolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    salary_month VARCHAR(50) NOT NULL, -- e.g. "June 2026"
    basic_salary NUMERIC(12, 2) NOT NULL CHECK (basic_salary >= 0),
    allowances NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (allowances >= 0),
    allowances_breakdown TEXT,
    deductions NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (deductions >= 0),
    deductions_breakdown TEXT,
    advance_salary_deducted NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (advance_salary_deducted >= 0),
    net_salary NUMERIC(12, 2) NOT NULL CHECK (net_salary >= 0),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'approved', 'paid'
    payment_date DATE,
    payment_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
    payment_method VARCHAR(50) DEFAULT 'Bank Transfer', -- 'Cash', 'Bank Transfer', 'Cheque', 'Easypaisa'
    transaction_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_staff_salary_month UNIQUE (staff_id, salary_month)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transfers_from_account ON public.bank_transfers(from_account_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_account ON public.bank_transfers(to_account_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_account ON public.expenses(payment_account_id);
CREATE INDEX IF NOT EXISTS idx_payrolls_staff ON public.payrolls(staff_id);
CREATE INDEX IF NOT EXISTS idx_payrolls_month ON public.payrolls(salary_month);
CREATE INDEX IF NOT EXISTS idx_payrolls_status ON public.payrolls(payment_status);

-- Enable RLS
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payrolls ENABLE ROW LEVEL SECURITY;

-- Permissive RLS policies for authenticated users
DROP POLICY IF EXISTS "Allow all for authenticated users on bank_accounts" ON public.bank_accounts;
CREATE POLICY "Allow all for authenticated users on bank_accounts" ON public.bank_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for authenticated users on bank_transfers" ON public.bank_transfers;
CREATE POLICY "Allow all for authenticated users on bank_transfers" ON public.bank_transfers FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for authenticated users on expenses" ON public.expenses;
CREATE POLICY "Allow all for authenticated users on expenses" ON public.expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for authenticated users on payrolls" ON public.payrolls;
CREATE POLICY "Allow all for authenticated users on payrolls" ON public.payrolls FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Also allow anon read/write if used in demo mode
DROP POLICY IF EXISTS "Allow anon on bank_accounts" ON public.bank_accounts;
CREATE POLICY "Allow anon on bank_accounts" ON public.bank_accounts FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon on bank_transfers" ON public.bank_transfers;
CREATE POLICY "Allow anon on bank_transfers" ON public.bank_transfers FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon on expenses" ON public.expenses;
CREATE POLICY "Allow anon on expenses" ON public.expenses FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon on payrolls" ON public.payrolls;
CREATE POLICY "Allow anon on payrolls" ON public.payrolls FOR ALL TO anon USING (true) WITH CHECK (true);

-- Trigger: Process bank transfer balance update
CREATE OR REPLACE FUNCTION process_bank_transfer()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.bank_accounts
    SET current_balance = current_balance - NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.from_account_id;

    UPDATE public.bank_accounts
    SET current_balance = current_balance + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.to_account_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_process_bank_transfer ON public.bank_transfers;
CREATE TRIGGER trg_process_bank_transfer
AFTER INSERT ON public.bank_transfers
FOR EACH ROW EXECUTE FUNCTION process_bank_transfer();

-- Trigger: Deduct expense amount from payment account
CREATE OR REPLACE FUNCTION process_expense_deduction()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_account_id IS NOT NULL THEN
        UPDATE public.bank_accounts
        SET current_balance = current_balance - NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.payment_account_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_process_expense_deduction ON public.expenses;
CREATE TRIGGER trg_process_expense_deduction
AFTER INSERT ON public.expenses
FOR EACH ROW EXECUTE FUNCTION process_expense_deduction();

-- Seed initial Bank Accounts
INSERT INTO public.bank_accounts (id, name, account_number, bank_name, account_type, opening_balance, current_balance, status, notes)
VALUES
    ('b1000000-0000-0000-0000-000000000001', 'Cash in Hand (Admin Desk)', 'CASH-DESK-01', 'Cash Desk', 'cash', 50000.00, 78500.00, 'active', 'Front office daily petty cash & fee counter'),
    ('b1000000-0000-0000-0000-000000000002', 'Meezan Bank - Main Operational', '01020109876543', 'Meezan Bank Ltd', 'bank', 450000.00, 420000.00, 'active', 'Primary Islamic corporate current account for fee collection & salaries'),
    ('b1000000-0000-0000-0000-000000000003', 'Habib Bank Limited (HBL)', '00427901234503', 'Habib Bank Limited', 'bank', 300000.00, 315000.00, 'active', 'Secondary branch account for reserve funds and online transfers'),
    ('b1000000-0000-0000-0000-000000000004', 'Bank Alfalah Academic Acct', '55120098765432', 'Bank Alfalah', 'bank', 150000.00, 150000.00, 'active', 'Special development and equipment fund')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    current_balance = EXCLUDED.current_balance;

-- Seed initial Expenses
INSERT INTO public.expenses (id, date, category, amount, payment_account_id, payee_name, reference_no, description, academic_year_id)
VALUES
    ('b2000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '12 days', 'Electricity', 38500.00, 'b1000000-0000-0000-0000-000000000002', 'IESCO / Power Distribution Co.', 'IESCO-BILL-MAY-26', 'Campus monthly electricity bill for classrooms & air-conditioning', 'a0000000-0000-0000-0000-000000000001'),
    ('b2000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '8 days', 'Stationery', 14200.00, 'b1000000-0000-0000-0000-000000000001', 'Al-Rehman Book Depot', 'STAT-INV-4410', 'Examination answer booklets, printing paper, whiteboard markers', 'a0000000-0000-0000-0000-000000000001'),
    ('b2000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '4 days', 'Marketing', 22000.00, 'b1000000-0000-0000-0000-000000000002', 'Vision Graphics & Media', 'MKT-AD-2026-06', 'Admission campaign road banners and social media promotions', 'a0000000-0000-0000-0000-000000000001'),
    ('b2000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '2 days', 'Maintenance', 8500.00, 'b1000000-0000-0000-0000-000000000001', 'Bashir Electric Works', 'MAINT-092', 'Classroom ceiling fans servicing and backup UPS wiring repair', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Seed initial Bank Transfer
INSERT INTO public.bank_transfers (id, transfer_date, from_account_id, to_account_id, amount, reference_no, description, created_by)
VALUES
    ('b3000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '6 days', 'b1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 30000.00, 'TRF-CASH-DEP-01', 'Surplus cash deposited from front desk into Meezan corporate account', 'Principal Office')
ON CONFLICT (id) DO NOTHING;

-- Seed initial Teacher Payroll Records (for May 2026 / June 2026)
INSERT INTO public.payrolls (
    id, staff_id, academic_year_id, salary_month, basic_salary, allowances, allowances_breakdown,
    deductions, deductions_breakdown, advance_salary_deducted, net_salary, payment_status,
    payment_date, payment_account_id, payment_method, transaction_reference, notes
)
VALUES
    (
        'b4000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'May 2026',
        85000.00,
        5000.00,
        'Senior Teacher Allowance: Rs. 5,000',
        2000.00,
        'Income Tax deduction: Rs. 2,000',
        0.00,
        88000.00,
        'paid',
        CURRENT_DATE - INTERVAL '15 days',
        'b1000000-0000-0000-0000-000000000002',
        'Bank Transfer',
        'MEEZAN-PAY-88219',
        'Monthly salary credited directly to Meezan salary account'
    ),
    (
        'b4000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'May 2026',
        110000.00,
        8000.00,
        'Head of Dept Allowance: Rs. 5,000, Fuel: Rs. 3,000',
        3500.00,
        'Tax deduction: Rs. 3,500',
        0.00,
        114500.00,
        'paid',
        CURRENT_DATE - INTERVAL '15 days',
        'b1000000-0000-0000-0000-000000000002',
        'Bank Transfer',
        'MEEZAN-PAY-88220',
        'HOD physics salary transferred'
    ),
    (
        'b4000000-0000-0000-0000-000000000003',
        '30000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001',
        'June 2026',
        75000.00,
        4000.00,
        'Special coaching allowance: Rs. 4,000',
        1500.00,
        'Late coming fine: Rs. 1,500',
        5000.00,
        72500.00,
        'approved',
        NULL,
        NULL,
        'Bank Transfer',
        NULL,
        'Approved by Finance Committee, pending final disbursement'
    ),
    (
        'b4000000-0000-0000-0000-000000000004',
        '30000000-0000-0000-0000-000000000004',
        'a0000000-0000-0000-0000-000000000001',
        'June 2026',
        70000.00,
        3000.00,
        'Conveyance allowance: Rs. 3,000',
        1000.00,
        'Tax: Rs. 1,000',
        0.00,
        72000.00,
        'draft',
        NULL,
        NULL,
        'Cash',
        NULL,
        'Draft salary calculation for June cycle'
    )
ON CONFLICT (id) DO NOTHING;
