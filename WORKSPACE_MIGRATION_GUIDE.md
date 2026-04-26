# Workspace Migration Guide v2.1.0 (MoneyCap)

Dokumentasi ini memberikan panduan langkah-demi-langkah untuk memperbarui aplikasi MoneyCap dari arsitektur *User-Centric* (Lama) ke *Workspace-Centric* (Baru).

## 📋 Prasyarat
- Akses ke Supabase Dashboard (SQL Editor).
- Izin untuk melakukan push ke cabang produksi/staging.
- Cadangan database terbaru (sangat disarankan).

---

## 🛠 Tahap 1: Migrasi Database (Supabase SQL)

Jalankan skrip berikut di **SQL Editor** Supabase Anda secara berurutan.

### 1. Fondasi Workspace & Migrasi Data Otomatis
Jalankan konten dari file: `supabase/setup_workspace_foundation.sql`.
Skrip ini akan:
- Membuat tabel `workspaces` dan `workspace_members`.
- Menangani perbaikan RLS Recursion (Error 42P17).
- **MIGRASI OTOMATIS**: Membuat workspace "Personal" untuk setiap user lama dan memindahkan kepemilikan data ke workspace tersebut.

### 2. Update Skema Tabel Inti
Pastikan semua tabel memiliki kolom `workspace_id`. Jika skrip fondasi belum melakukannya, jalankan:
```sql
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id);
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id);
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id);
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id);
ALTER TABLE public.transfers ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id);
```

### 3. Sinkronisasi Skrip Lokal
Pastikan folder `supabase/` di repository Anda sinkron dengan versi terbaru yang sudah kita perbarui:
- `setup_wallet.sql`
- `setup_transaction.sql`
- `setup_categories.sql`
- `setup_budgeting.sql`
- `setup_debts.sql`

---

## 💻 Tahap 2: Pembaruan Kode Aplikasi (Frontend)

Pastikan file-file berikut telah diperbarui sesuai perubahan terakhir:

### 1. State Management (Pinia Stores)
- **useAuthStore.js**: Wajib memiliki `activeWorkspaceId` dan getter `activeWorkspace`.
- **Store Lainnya**: Pastikan setiap fetch data menggunakan filter `.eq('workspace_id', authStore.activeWorkspaceId)`.

### 2. Komponen Layout (UI)
- **AppSidebar.vue**: Pastikan switcher workspace (Desktop) aktif.
- **MobileMenuModal.vue**: Pastikan kartu ganti workspace (Mobile) muncul di bagian atas menu.
- **AppNavbar.vue**: Pastikan nama workspace aktif muncul sebagai subtitle di Top Bar mobile.

---

## 🧪 Tahap 3: Verifikasi & Testing (Produksi)

Setelah deployment selesai, lakukan verifikasi berikut:

1. **Data Visibility**: Apakah data lama (dompet, transaksi) tetap terlihat? (Jika ya, migrasi workspace ID berhasil).
2. **Workspace Switching**:
   - Coba ganti workspace di Desktop (Sidebar).
   - Coba ganti workspace di Mobile (Menu Modal).
3. **Pencatatan Data Baru**: Tambahkan satu transaksi baru dan cek di Supabase Dashboard apakah kolom `workspace_id` terisi secara otomatis.
4. **RLS Error Check**: Buka Console Browser (F12), pastikan tidak ada error `42P17` (Infinite Recursion).

---

## ⚠️ Troubleshooting
- **Data Kosong?** Periksa apakah `activeWorkspaceId` di store sudah terisi. Jika null, aplikasi tidak akan menampilkan data karena filter RLS.
- **Error 500/42P17?** Jalankan ulang bagian RLS di `setup_workspace_foundation.sql` untuk memastikan kebijakan `workspace_members` adalah *independent anchor*.

---
**Dibuat oleh:** Antigravity AI
**Versi Dokumen:** 1.0.0
**Tanggal:** 26 April 2026
