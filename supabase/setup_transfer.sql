-- 0. Buat tabel transfers jika belum ada
CREATE TABLE IF NOT EXISTS public.transfers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    to_wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

-- 0.1 Policy: Users can view their own transfers
DROP POLICY IF EXISTS "Users can view their own transfers" ON public.transfers;
CREATE POLICY "Users can view their own transfers" 
ON public.transfers FOR SELECT 
USING (auth.uid() = created_by);

-- 0.2 Policy: Users can insert their own transfers (Cek kepemilikan dompet asal & tujuan)
DROP POLICY IF EXISTS "Users can insert their own transfers" ON public.transfers;
CREATE POLICY "Users can insert their own transfers" 
ON public.transfers FOR INSERT 
WITH CHECK (
    auth.uid() = created_by AND 
    EXISTS (SELECT 1 FROM public.wallets WHERE id = from_wallet_id AND user_id = auth.uid()) AND
    EXISTS (SELECT 1 FROM public.wallets WHERE id = to_wallet_id AND user_id = auth.uid())
);

-- 1. Tambahkan policy UPDATE (Agar user bisa mengedit transfer mereka sendiri + Cek kepemilikan wallet)
DROP POLICY IF EXISTS "Users can update their own transfers" ON public.transfers;
CREATE POLICY "Users can update their own transfers" 
ON public.transfers FOR UPDATE 
USING (auth.uid() = created_by)
WITH CHECK (
    EXISTS (SELECT 1 FROM public.wallets WHERE id = from_wallet_id AND user_id = auth.uid()) AND
    EXISTS (SELECT 1 FROM public.wallets WHERE id = to_wallet_id AND user_id = auth.uid())
);

-- 2. Tambahkan/Pastikan policy DELETE (Agar user bisa menghapus transfer mereka sendiri)
DROP POLICY IF EXISTS "Users can delete their own transfers" ON public.transfers;
CREATE POLICY "Users can delete their own transfers" 
ON public.transfers FOR DELETE 
USING (auth.uid() = created_by);

-- 3. Ganti fungsi trigger dengan logika Update & Delete yang baru
CREATE OR REPLACE FUNCTION process_transfer()
RETURNS TRIGGER AS $$
BEGIN
    -- Logika REVERSAL (Kembalikan saldo jika data DIHAPUS atau DIEDIT)
    IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
        -- Kembalikan saldo ke dompet asal (tambah kembali)
        UPDATE public.wallets 
        SET balance = balance + OLD.amount 
        WHERE id = OLD.from_wallet_id;

        -- Kurangi saldo dari dompet tujuan (ambil kembali)
        UPDATE public.wallets 
        SET balance = balance - OLD.amount 
        WHERE id = OLD.to_wallet_id;
    END IF;

    -- Logika APPLICATION (Terapkan saldo jika data BARU masuk atau DIEDIT)
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        -- Cek kecukupan saldo di dompet asal yang baru
        IF (SELECT balance FROM public.wallets WHERE id = NEW.from_wallet_id) < NEW.amount THEN
            RAISE EXCEPTION 'Insufficient balance';
        END IF;

        -- Kurangi saldo dompet asal
        UPDATE public.wallets 
        SET balance = balance - NEW.amount 
        WHERE id = NEW.from_wallet_id;

        -- Tambah saldo dompet tujuan
        UPDATE public.wallets 
        SET balance = balance + NEW.amount 
        WHERE id = NEW.to_wallet_id;
    END IF;

    -- Kembalikan record sesuai operasi
    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Hapus trigger lama (jika ada) dan daftarkan trigger MULTI-EVENT yang baru
DROP TRIGGER IF EXISTS on_transfer_insert ON public.transfers;
DROP TRIGGER IF EXISTS on_transfer_change ON public.transfers;

CREATE TRIGGER on_transfer_change
AFTER INSERT OR UPDATE OR DELETE ON public.transfers
FOR EACH ROW EXECUTE FUNCTION process_transfer();
