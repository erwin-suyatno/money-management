-- =========================================================================
-- TRIGGER UNTUK SETUP DATA AWAL SAAT USER BARU MENDAFTAR
-- =========================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS TRIGGER AS $$
DECLARE
    expense_type_id UUID;
    income_type_id UUID;
BEGIN
    -- 1. Buat Dompet Utama Otomatis (Default Wallet)
    INSERT INTO public.wallets (name, balance, user_id)
    VALUES ('Tunai/Cash', 0, NEW.id);

    -- Catatan: Kategori Global (user_id IS NULL) sudah otomatis bisa dilihat 
    -- oleh user baru berkat RLS policy yang kita buat sebelumnya.
    
    -- Namun, jika Anda ingin user memiliki kategori PRIVAT yang bisa mereka edit sendiri 
    -- sejak awal, kita bisa melakukan INSERT Copy di sini. 
    -- Untuk sekarang, kita gunakan sistem Global agar database tetap ringan.

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Daftarkan trigger ke tabel auth.users (Tabel internal Supabase)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_setup();
