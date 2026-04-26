# Workspace Invitation & Onboarding System

Dokumentasi ini merinci alur kerja untuk menangani pengguna baru (onboarding) dan sistem undangan (invitation) untuk kolaborasi antar pengguna.

## 1. Alur Onboarding (Pengguna Baru)

Sistem memastikan setiap pengguna baru memiliki setidaknya satu workspace pribadi agar aplikasi dapat langsung digunakan.

### A. Pendaftaran Langsung
1. **Sign-up**: Pengguna mendaftar melalui Google atau Email.
2. **Auto-Provisioning**:
   - Saat login pertama kali, `useAuthStore` memeriksa jumlah workspace.
   - Jika `workspaces.length === 0`, sistem memicu fungsi `createPersonalWorkspace()`.
   - Membuat workspace dengan tipe `personal` dan mendaftarkan pengguna sebagai `owner`.
3. **Landing**: Pengguna diarahkan ke Dashboard dengan workspace personal aktif.

### B. Pendaftaran via Undangan
1. **Landing Link**: Pengguna mengklik `moneycap.app/invite?token=TOKEN_XYZ`.
2. **Auth Check**: Jika belum login, sistem mengarahkan ke halaman Sign-up.
3. **Acceptance**:
   - Setelah auth sukses, sistem memproses token undangan.
   - Pengguna ditambahkan ke tabel `workspace_members` untuk workspace yang mengundang.
4. **Hybrid Onboarding**: Sistem tetap membuatkan satu workspace `personal` tambahan (jika belum punya) sebagai ruang pribadi pengguna.

---

## 2. Struktur Database (Invitation)

Tabel `workspace_invitations` digunakan untuk mengelola status undangan.

```sql
CREATE TABLE public.workspace_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);
```

---

## 3. Komponen Sistem

### A. Edge Function: `invite-user`
Fungsi backend yang menangani pengiriman email.
- **Input**: `workspace_id`, `email`, `role`.
- **Output**: Record baru di `workspace_invitations` & pengiriman email via SMTP/Resend.

### B. InviteView.vue
Halaman frontend untuk menangani penerimaan undangan.
- Memvalidasi token via Supabase.
- Menampilkan detail workspace (Nama, Owner).
- Tombol "Gabung Sekarang".

---

## 4. Keamanan (Security)
- **RLS**: Hanya `owner` atau `admin` workspace yang dapat membuat undangan.
- **Token Expiry**: Undangan otomatis kadaluwarsa setelah 7 hari.
- **Email Validation**: Token hanya bisa diklaim oleh pengguna yang login dengan email yang sesuai dengan data undangan (opsional, tergantung preferensi privasi).

---
**Status Dokumen:** DRAFT / PROPOSAL
**Versi:** 1.0.0
**Tanggal:** 26 April 2026
