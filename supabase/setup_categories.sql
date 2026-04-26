-- =========================================================================
-- 1. TABLE: category_types (MASTER GLOBAL)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.category_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR UNIQUE NOT NULL, -- INCOME, EXPENSE, SAVING, INVESTMENT
    name VARCHAR NOT NULL,        -- Label UI (Uang Masuk, Uang Keluar, dll)
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seeder Category Types (Stable Keys)
INSERT INTO public.category_types (code, name, description) VALUES
('INCOME', 'Uang Masuk', 'Semua sumber pendapatan'),
('EXPENSE', 'Uang Keluar', 'Semua jenis pengeluaran rutin dan mendadak'),
('SAVING', 'Nabung', 'Alokasi untuk tabungan atau dana darurat'),
('INVESTMENT', 'Investasi', 'Alokasi untuk aset produktif (Saham, Crypto, Emas)')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

-- =========================================================================
-- 2. TABLE: categories (GLOBAL + USER CUSTOM)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = System Default
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    category_type_id UUID NOT NULL REFERENCES public.category_types(id),
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE, -- Sub-category
    name VARCHAR NOT NULL,
    icon VARCHAR,           -- Lucide icon name
    color VARCHAR,          -- Hex color
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_budgetable BOOLEAN DEFAULT true,
    is_reportable BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Workspace-Aware View Policy
-- Memungkinkan akses ke kategori sistem (user_id IS NULL) ATAU milik user/workspace terkait
CREATE POLICY "View categories" ON public.categories
FOR SELECT USING (
    user_id IS NULL OR 
    user_id = auth.uid() OR
    workspace_id IN (SELECT m.workspace_id FROM public.workspace_members m WHERE m.user_id = auth.uid())
);

-- Workspace-Aware Manage Policy
CREATE POLICY "Manage categories" ON public.categories
FOR ALL USING (
    user_id = auth.uid() OR
    workspace_id IN (SELECT m.workspace_id FROM public.workspace_members m WHERE m.user_id = auth.uid() AND m.role IN ('owner', 'admin'))
);

-- =========================================================================
-- 3. INITIAL SEEDER (Standard Categories)
-- =========================================================================
DO $$ 
DECLARE 
    income_id UUID := (SELECT id FROM category_types WHERE code = 'INCOME');
    expense_id UUID := (SELECT id FROM category_types WHERE code = 'EXPENSE');
    saving_id UUID := (SELECT id FROM category_types WHERE code = 'SAVING');
    investment_id UUID := (SELECT id FROM category_types WHERE code = 'INVESTMENT');
BEGIN
    -- INCOME
    IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Gaji' AND user_id IS NULL) THEN
        INSERT INTO public.categories (category_type_id, name, icon, color, is_system) VALUES
        (income_id, 'Gaji', 'Briefcase', '#10B981', true),
        (income_id, 'Bonus', 'Gift', '#059669', true),
        (income_id, 'Freelance', 'Terminal', '#34D399', true);
    END IF;

    -- EXPENSE
    IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Makan' AND user_id IS NULL) THEN
        INSERT INTO public.categories (category_type_id, name, icon, color, is_system) VALUES
        (expense_id, 'Makan', 'Utensils', '#F43F5E', true),
        (expense_id, 'Transport', 'Car', '#3B82F6', true),
        (expense_id, 'Tagihan', 'Receipt', '#F59E0B', true),
        (expense_id, 'Hiburan', 'Gamepad', '#8B5CF6', true),
        (expense_id, 'Kesehatan', 'Heartpulse', '#EF4444', true);
    END IF;

    -- SAVING
    IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Tabungan' AND user_id IS NULL) THEN
        INSERT INTO public.categories (category_type_id, name, icon, color, is_system) VALUES
        (saving_id, 'Dana Darurat', 'ShieldCheck', '#6366F1', true),
        (saving_id, 'Tabungan Umum', 'PiggyBank', '#4F46E5', true);
    END IF;

    -- INVESTMENT
    IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Saham' AND user_id IS NULL) THEN
        INSERT INTO public.categories (category_type_id, name, icon, color, is_system) VALUES
        (investment_id, 'Saham', 'TrendingUp', '#0EA5E9', true),
        (investment_id, 'Crypto', 'Bitcoin', '#F97316', true),
        (investment_id, 'Emas', 'Gem', '#EAB308', true);
    END IF;
END $$;

-- =========================================================================
-- 4. LINK TRANSACTIONS TO CATEGORIES
-- =========================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='category_id') THEN
        ALTER TABLE public.transactions ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
    END IF;
END $$;
