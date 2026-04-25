-- Buat tabel transaksi
CREATE TABLE public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Aktifkan RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy (Users hanya bisa melihat dan menambah transaksi mereka sendiri + Cek kepemilikan wallet)
CREATE POLICY "Users can view their own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (
    auth.uid() = created_by AND 
    EXISTS (
        SELECT 1 FROM public.wallets 
        WHERE id = wallet_id AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own transactions" 
ON public.transactions FOR UPDATE 
USING (auth.uid() = created_by)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.wallets 
        WHERE id = wallet_id AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own transactions" 
ON public.transactions FOR DELETE 
USING (auth.uid() = created_by);

-- =========================================================================
-- TRIGGER UNTUK UPDATE SALDO WALLET SECARA OTOMATIS SAAT TRANSAKSI BERUBAH
-- =========================================================================

CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Kembalikan saldo dari data lama (Old balance reversal)
    IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
        IF OLD.type = 'INCOME' THEN
            UPDATE public.wallets 
            SET balance = balance - OLD.amount 
            WHERE id = OLD.wallet_id;
        ELSE
            UPDATE public.wallets 
            SET balance = balance + OLD.amount 
            WHERE id = OLD.wallet_id;
        END IF;
    END IF;

    -- Terapkan saldo dari data baru (New balance application)
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        IF NEW.type = 'INCOME' THEN
            UPDATE public.wallets 
            SET balance = balance + NEW.amount 
            WHERE id = NEW.wallet_id;
        ELSE
            UPDATE public.wallets 
            SET balance = balance - NEW.amount 
            WHERE id = NEW.wallet_id;
        END IF;
    END IF;

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mendaftarkan trigger ke tabel transactions (Tiga event)
DROP TRIGGER IF EXISTS on_transaction_change ON public.transactions;
CREATE TRIGGER on_transaction_change
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();
