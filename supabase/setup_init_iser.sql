-- =========================================================================
-- TRIGGER UNTUK SETUP DATA AWAL SAAT USER BARU MENDAFTAR
-- =========================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS TRIGGER AS $$
DECLARE
    new_workspace_id UUID;
BEGIN
    -- 1. Create Personal Workspace for the new user
    INSERT INTO public.workspaces (name, owner_id, type)
    VALUES ('Personal Workspace', NEW.id, 'personal')
    RETURNING id INTO new_workspace_id;

    -- 2. Add the user as the owner of their workspace
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (new_workspace_id, NEW.id, 'owner');

    -- 3. Buat Dompet Utama Otomatis (Default Wallet)
    INSERT INTO public.wallets (name, balance, user_id, workspace_id)
    VALUES ('Tunai/Cash', 0, NEW.id, new_workspace_id);

    -- Catatan: Kategori Global (user_id IS NULL) sudah otomatis bisa dilihat 
    -- oleh user baru berkat RLS policy yang kita buat sebelumnya.
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Daftarkan trigger ke tabel auth.users (Tabel internal Supabase)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_setup();
