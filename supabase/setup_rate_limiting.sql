-- =========================================================================
-- RATE LIMITING FOR TRANSACTIONS AND TRANSFERS
-- Prevents spam and bot attacks at the database level.
-- =========================================================================

-- 1. Function to check transaction rate limit (Max 10 per minute per user)
CREATE OR REPLACE FUNCTION public.check_transaction_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    tx_count INTEGER;
BEGIN
    -- Only limit non-admin users
    IF auth.role() = 'authenticated' THEN
        SELECT count(*)
        INTO tx_count
        FROM public.transactions
        WHERE created_by = auth.uid()
          AND created_at > now() - INTERVAL '1 minute';

        IF tx_count >= 10 THEN
            RAISE EXCEPTION 'Rate limit exceeded. Max 10 transactions per minute.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to check transfer rate limit (Max 5 per minute per user)
CREATE OR REPLACE FUNCTION public.check_transfer_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    tr_count INTEGER;
BEGIN
    -- Only limit non-admin users
    IF auth.role() = 'authenticated' THEN
        SELECT count(*)
        INTO tr_count
        FROM public.transfers
        WHERE created_by = auth.uid()
          AND created_at > now() - INTERVAL '1 minute';

        IF tr_count >= 5 THEN
            RAISE EXCEPTION 'Rate limit exceeded. Max 5 transfers per minute.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Apply triggers to transactions
DROP TRIGGER IF EXISTS tr_transaction_rate_limit ON public.transactions;
CREATE TRIGGER tr_transaction_rate_limit
BEFORE INSERT ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.check_transaction_rate_limit();

-- 4. Apply triggers to transfers
DROP TRIGGER IF EXISTS tr_transfer_rate_limit ON public.transfers;
CREATE TRIGGER tr_transfer_rate_limit
BEFORE INSERT ON public.transfers
FOR EACH ROW EXECUTE FUNCTION public.check_transfer_rate_limit();

-- =========================================================================
-- AUTH RATE LIMITING (Instructional)
-- =========================================================================
-- Note: Auth rate limits in Supabase are managed via the dashboard.
-- Recommended settings:
-- - Signup: 3 per hour per IP
-- - Login: 5 per 15 minutes per IP
-- - Password Reset: 3 per hour per IP
-- - Magic Link: 3 per hour per IP
