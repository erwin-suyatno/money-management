-- =========================================================================
-- WORKSPACE FOUNDATION MIGRATION
-- This script transforms the database from User-Centric to Workspace-Centric.
-- Designed for 0 data loss and future-proof group implementation.
-- =========================================================================

BEGIN;

-- 1. Create Workspaces Table
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'personal' CHECK (type IN ('personal', 'shared')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Workspace Members Table
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(workspace_id, user_id)
);

-- 3. Enable RLS on new tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- 4. Initial Backfill: Create a Personal Workspace for every existing user
INSERT INTO public.workspaces (owner_id, name, type)
SELECT id, 'Personal Workspace', 'personal'
FROM auth.users
ON CONFLICT DO NOTHING;

-- 5. Link users as Owners of their Personal Workspaces
INSERT INTO public.workspace_members (workspace_id, user_id, role)
SELECT id, owner_id, 'owner'
FROM public.workspaces
WHERE type = 'personal'
ON CONFLICT DO NOTHING;

-- 6. Add workspace_id to Core Tables (Nullable initially)
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.transfers ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- 7. PRECISION DATA MAPPING: Update records to point to their owner's Personal Workspace
UPDATE public.wallets w 
SET workspace_id = ws.id 
FROM public.workspaces ws 
WHERE w.user_id = ws.owner_id AND ws.type = 'personal' AND w.workspace_id IS NULL;

UPDATE public.categories c 
SET workspace_id = ws.id 
FROM public.workspaces ws 
WHERE c.user_id = ws.owner_id AND ws.type = 'personal' AND c.workspace_id IS NULL;

UPDATE public.transactions t 
SET workspace_id = ws.id 
FROM public.workspaces ws 
WHERE t.created_by = ws.owner_id AND ws.type = 'personal' AND t.workspace_id IS NULL;

UPDATE public.transfers tr 
SET workspace_id = ws.id 
FROM public.workspaces ws 
WHERE tr.created_by = ws.owner_id AND ws.type = 'personal' AND tr.workspace_id IS NULL;

UPDATE public.debts d 
SET workspace_id = ws.id 
FROM public.workspaces ws 
WHERE d.user_id = ws.owner_id AND ws.type = 'personal' AND d.workspace_id IS NULL;

UPDATE public.budgets b 
SET workspace_id = ws.id 
FROM public.workspaces ws 
WHERE b.user_id = ws.owner_id AND ws.type = 'personal' AND b.workspace_id IS NULL;

-- 8. RLS PIVOT: Drop old policies and add workspace-aware policies

-- 1. WORKSPACE_MEMBERS (The "Anchor" table - No recursion)
DROP POLICY IF EXISTS "View members" ON public.workspace_members;
DROP POLICY IF EXISTS "Access members" ON public.workspace_members;
CREATE POLICY "members_select_policy" ON public.workspace_members
FOR SELECT USING (user_id = auth.uid());

-- 2. WORKSPACES (Depends on members)
DROP POLICY IF EXISTS "View workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Access workspaces" ON public.workspaces;
CREATE POLICY "workspaces_select_policy" ON public.workspaces
FOR SELECT USING (
    owner_id = auth.uid() OR 
    id IN (SELECT m.workspace_id FROM public.workspace_members m WHERE m.user_id = auth.uid())
);

CREATE POLICY "workspaces_owner_manage" ON public.workspaces
FOR ALL USING (owner_id = auth.uid());

-- 3. CORE TABLES (Wallets, Transactions, etc. with Fallback)

-- WALLETS
DROP POLICY IF EXISTS "Users can view their own wallets" ON public.wallets;
DROP POLICY IF EXISTS "Workspace access for wallets" ON public.wallets;
DROP POLICY IF EXISTS "Access wallets" ON public.wallets;
CREATE POLICY "Access wallets" ON public.wallets
FOR ALL USING (
    user_id = auth.uid() OR 
    workspace_id IN (SELECT m.workspace_id FROM public.workspace_members m WHERE m.user_id = auth.uid())
);

-- TRANSACTIONS
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Workspace access for transactions" ON public.transactions;
DROP POLICY IF EXISTS "Access transactions" ON public.transactions;
CREATE POLICY "Access transactions" ON public.transactions
FOR ALL USING (
    created_by = auth.uid() OR 
    workspace_id IN (SELECT m.workspace_id FROM public.workspace_members m WHERE m.user_id = auth.uid())
);

-- TRANSFERS
DROP POLICY IF EXISTS "Users can view their own transfers" ON public.transfers;
DROP POLICY IF EXISTS "Workspace access for transfers" ON public.transfers;
DROP POLICY IF EXISTS "Access transfers" ON public.transfers;
CREATE POLICY "Access transfers" ON public.transfers
FOR ALL USING (
    created_by = auth.uid() OR 
    workspace_id IN (SELECT m.workspace_id FROM public.workspace_members m WHERE m.user_id = auth.uid())
);

-- DEBTS
DROP POLICY IF EXISTS "Users can view their own debts" ON public.debts;
DROP POLICY IF EXISTS "Workspace access for debts" ON public.debts;
DROP POLICY IF EXISTS "Access debts" ON public.debts;
CREATE POLICY "Access debts" ON public.debts 
FOR ALL USING (
    user_id = auth.uid() OR 
    workspace_id IN (SELECT m.workspace_id FROM public.workspace_members m WHERE m.user_id = auth.uid())
);

-- BUDGETS
DROP POLICY IF EXISTS "Users can view their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Workspace access for budgets" ON public.budgets;
DROP POLICY IF EXISTS "Access budgets" ON public.budgets;
CREATE POLICY "Access budgets" ON public.budgets 
FOR ALL USING (
    user_id = auth.uid() OR 
    workspace_id IN (SELECT m.workspace_id FROM public.workspace_members m WHERE m.user_id = auth.uid())
);

-- CATEGORIES (Allow workspace-specific OR system categories)
DROP POLICY IF EXISTS "Users can view their own categories" ON public.categories;
DROP POLICY IF EXISTS "View categories" ON public.categories;
DROP POLICY IF EXISTS "Manage workspace categories" ON public.categories;
DROP POLICY IF EXISTS "Manage categories" ON public.categories;

CREATE POLICY "View categories" ON public.categories
FOR SELECT USING (
    user_id IS NULL OR 
    user_id = auth.uid() OR
    workspace_id IN (SELECT m.workspace_id FROM public.workspace_members m WHERE m.user_id = auth.uid())
);

CREATE POLICY "Manage categories" ON public.categories
FOR ALL USING (
    user_id = auth.uid() OR
    workspace_id IN (SELECT m.workspace_id FROM public.workspace_members m WHERE m.user_id = auth.uid() AND m.role IN ('owner', 'admin'))
);

COMMIT;
