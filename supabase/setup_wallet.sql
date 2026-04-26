-- Membuat Tabel Wallets
CREATE TABLE public.wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    balance NUMERIC DEFAULT 0 NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Mengaktifkan Row Level Security (RLS)
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Workspace-Aware Access Policy
-- Memungkinkan akses jika user adalah pemilik data ATAU anggota workspace terkait
CREATE POLICY "Access wallets" ON public.wallets
FOR ALL USING (
    user_id = auth.uid() OR 
    workspace_id IN (SELECT m.workspace_id FROM public.workspace_members m WHERE m.user_id = auth.uid())
);
