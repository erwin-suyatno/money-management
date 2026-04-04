-- Membuat Tabel Wallets
CREATE TABLE public.wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    balance NUMERIC DEFAULT 0 NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Mengaktifkan Row Level Security (RLS)
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- 1. Create Policy: Users can view their own wallets
CREATE POLICY "Users can view their own wallets" 
ON public.wallets FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Create Policy: Users can insert their own wallets
CREATE POLICY "Users can insert their own wallets" 
ON public.wallets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Create Policy: Users can update their own wallets
CREATE POLICY "Users can update their own wallets" 
ON public.wallets FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Create Policy: Users can delete their own wallets
CREATE POLICY "Users can delete their own wallets" 
ON public.wallets FOR DELETE 
USING (auth.uid() = user_id);
