# Money Management Project - Task List

## Phase 1: Setup Project
- [x] Initialize Vue 3 (Vite) project
- [x] Install dependencies (vue-router, pinia, supabase-js, tailwindcss)
- [x] Setup Supabase Project (get anon key & project URL) - (buat dalam .env)
- [x] Setup Supabase Client (`/src/services/supabase.js`)
- [x] Setup Routing (/login, /dashboard, /wallet, /transaction, /import)

## Phase 2: Auth
- [x] UI Login (Google / Gmail login button)
- [x] Integrate Supabase Auth (OAuth Google, logout)
- [x] Auth Guard (redirect if not logged in)
- [x] Persist Session (auto-login on refresh)

## Phase 3: Wallet
- [x] Create `wallets` table in Supabase
- [x] Setup RLS Policy (user only sees own wallet)
- [x] UI Wallet Page (list wallets, create wallet)
- [x] CRUD Wallet (create, read, delete)

## Phase 4: Transaction
- [x] Create `transactions` table in Supabase
- [x] UI Transaction Page (form input, list transactions)
- [x] Logic Income/Expense (update wallet balance via DB trigger)
- [x] Validation (no negative balance - optional)

## Phase 5: Transfer
- [x] Create `transfers` table in Supabase
- [x] UI Transfer (select source & destination wallet)
- [x] Logic Transfer (balance -, balance +)
- [x] Edge Cases (cannot transfer to same wallet, check sufficient balance)

## Phase 6: OCR Mutasi (Core Feature)
- [x] Upload File UI (page `/import`, input file, select wallet)
- [x] Upload to Supabase Storage (bucket `imports`)
- [x] Install OCR Library (`tesseract.js`)
- [x] OCR Processing (get file, convert to text)
- [x] Display RAW TEXT UI (textarea for OCR result debugging)
- [x] Basic Parsing with Regex (split lines, detect date, nominal, type CR/DB)
- [x] Convert to JSON format
- [x] Preview UI (table of parsed results, manual edit)
- [x] Select Valid Data (checkbox per row)
- [x] Insert to Transactions (loop data, insert DB, update wallet balance)
- [x] Error Handling (OCR fail, unrecognized format)

## Phase 7: Dashboard
- [x] Summary Logic (total balance, income, expense)
- [x] Chart UI (Income vs Expense with Date Range Filter)
- [x] Net Calculation indicator (Plus or Minus)

## Phase 8: Testing
- [ ] Manual Testing (login, create wallet, transaction, transfer, OCR import)
- [ ] Fix Bugs (sync balance, parsing errors)

## Phase 9: Deploy
- [ ] Deploy Frontend (Vercel / Netlify)
- [ ] Environment Config (supabase URL, anon key)

## Phase 10: UI/UX Refactoring (Senior Level)
- [x] Global Theme & Navigation (App.vue)
- [x] Wallet UI Consolidation (Neutral & Iconography)
- [x] Transaction & Income/Expense Hierarchy (Green/Red)
- [x] Transfer UI (Blue & Grey Action-oriented)
- [x] Dashboard & Chart Polishing (Green/Red area)
- [x] Import OCR UI (Blue Process-oriented)

## Phase 11: Contextual Transactions (Calendar Modal)
- [x] Add "Quick Add" button in Calendar Day detail modal.
- [x] Implement pre-filled date logic (Transaction uses the clicked calendar date).
- [x] Unified form for modal-based entries.

## Phase 12: Budgeting System
- [ ] Database: Create `budgets` table (amount, period, category_id).
- [ ] Logic: Support for Daily, Weekly, Monthly, and Yearly cycles.
- [ ] UI: Dashboard "Budget Progress" widget with visual alerts for overspending.

## Phase 13: Categorization & Defaults
- [x] Database: Schema for `category_types` (Global Master) and `categories` (Hierarchical).
- [x] App Init: Seed 4 Standard Types (INCOME, EXPENSE, SAVING, INVESTMENT).
- [x] App Init: Seed default Global Categories (Gaji, Makan, Transport, Crypto, etc.).
- [x] Store: Implement `useCategoryStore` to fetch types and categories.
- [x] UI: Add Category Picker inside Transaction Entry (Income/Expense).
- [x] UI: Category Management (Create, Edit, Delete categories & sub-categories).
- [x] Logic: Update Transaction and Budget logic to link via category_id.


## Phase 14: Data Correction (Edit & Delete)
- [x] UI: Add Edit/Delete actions to Transaction and Transfer list items.
- [x] Store Logic: Implement update/delete methods with **Wallet Synchronization**.
- [x] Sync Rule (Delete): Revert the transaction nominal back to the wallet (e.g., delete Expense -> Refund Wallet).
- [x] Sync Rule (Update): Calculate delta between old and new nominal to adjust wallet balance accurately.
