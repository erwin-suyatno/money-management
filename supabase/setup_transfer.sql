-- 0. Buat tabel transfers jika belum ada
CREATE TABLE IF NOT EXISTS public.transfers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    to_wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE
);

ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

-- Workspace-Aware Access Policy
-- Memungkinkan akses jika user adalah pembuat data ATAU anggota workspace terkait
CREATE POLICY "Access transfers" ON public.transfers
FOR ALL USING (
    created_by = auth.uid() OR 
    workspace_id IN (SELECT m.workspace_id FROM public.workspace_members m WHERE m.user_id = auth.uid())
);

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
