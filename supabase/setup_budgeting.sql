-- Create Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(20,2) NOT NULL DEFAULT 0,
  period_type TEXT NOT NULL CHECK (period_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Workspace-Aware Access Policy
CREATE POLICY "Access budgets" ON budgets 
FOR ALL USING (
    user_id = auth.uid() OR 
    workspace_id IN (SELECT m.workspace_id FROM public.workspace_members m WHERE m.user_id = auth.uid())
);

-- Unique constraint: A workspace can only have one budget per category per period type
CREATE UNIQUE INDEX idx_budget_workspace_category_period ON budgets(workspace_id, category_id, period_type);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
