-- Debt Management System Schema

CREATE TABLE IF NOT EXISTS public.debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    total_principal NUMERIC(15,2) NOT NULL DEFAULT 0,
    monthly_payment NUMERIC(15,2) NOT NULL DEFAULT 0,
    tenure_months INTEGER NOT NULL DEFAULT 1,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    interest_rate NUMERIC(5,2) DEFAULT 0, -- Annual interest rate in %
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAID_OFF', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add debt_id to transactions to link payments to specific debts
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS debt_id UUID REFERENCES public.debts(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- Workspace-Aware Access Policy
CREATE POLICY "Access debts" ON public.debts 
FOR ALL USING (
    user_id = auth.uid() OR 
    workspace_id IN (SELECT m.workspace_id FROM public.workspace_members m WHERE m.user_id = auth.uid())
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_debts_updated_at
BEFORE UPDATE ON public.debts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
