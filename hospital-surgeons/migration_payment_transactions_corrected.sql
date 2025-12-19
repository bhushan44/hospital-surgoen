-- ============================================
-- CORRECTED MIGRATION SCRIPT
-- Compatible with UUID-based schema
-- Supports doctor/hospital subscriptions
-- ============================================

-- ============================================
-- STEP 0: Add missing columns (map to existing schema)
-- ============================================

-- Add gateway_order_id if needed (for Razorpay order_id, Stripe session_id, etc.)
ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS gateway_order_id TEXT;

-- ============================================
-- STEP 1: Handle unique constraint for idempotency
-- ============================================

-- Your schema already has: UNIQUE(payment_id)
-- For multi-gateway idempotency, we could add composite unique: (payment_gateway, payment_id)
-- But since payment_id is already unique globally, we'll keep existing constraint
-- and add gateway_order_id index for faster lookups

-- ============================================
-- STEP 2: Add webhook tracking columns
-- ============================================

ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS webhook_event_id TEXT,
  ADD COLUMN IF NOT EXISTS webhook_processed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_via TEXT CHECK (verified_via IN ('webhook', 'manual'));

-- ============================================
-- STEP 3: Add refund tracking columns
-- ============================================

-- Note: refunded_at already exists in your schema
ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS refund_reference_id TEXT,
  ADD COLUMN IF NOT EXISTS refund_reason TEXT,
  ADD COLUMN IF NOT EXISTS refund_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS refund_history_id BIGINT;

-- ============================================
-- STEP 4: Add audit trail columns
-- ============================================

ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS created_by_user_id UUID,
  ADD COLUMN IF NOT EXISTS updated_by_user_id UUID,
  ADD COLUMN IF NOT EXISTS source_user_id UUID,
  ADD COLUMN IF NOT EXISTS source_text TEXT;

-- ============================================
-- STEP 5: Add gateway-specific details
-- ============================================

ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS gateway_bank TEXT,
  ADD COLUMN IF NOT EXISTS gateway_wallet TEXT,
  ADD COLUMN IF NOT EXISTS gateway_vpa TEXT;

-- ============================================
-- STEP 6: Add document & response columns
-- ============================================

-- Note: gateway_response already exists as JSON in your schema
-- Convert to JSONB if needed (optional - uncomment if you want JSONB)
-- ALTER TABLE payment_transactions
--   ALTER COLUMN gateway_response TYPE JSONB USING gateway_response::JSONB;

ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS receipt_number TEXT,
  ADD COLUMN IF NOT EXISTS response_message TEXT;

-- ============================================
-- STEP 7: Add payment_status and payment_type
-- ============================================

-- Note: Your schema has 'status' field, migration adds 'payment_status'
-- Keep both or map: payment_status → status
ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS payment_status TEXT,
  ADD COLUMN IF NOT EXISTS payment_type TEXT;

-- ============================================
-- STEP 8: Add indexes for performance
-- ============================================

-- Index on status (your existing field)
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status
  ON payment_transactions (status);

-- Index on payment_status (if different from status)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_transactions' 
    AND column_name = 'payment_status'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_status
      ON payment_transactions (payment_status);
  END IF;
END $$;

-- Index on payment_type and payment_status
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_transactions' 
    AND column_name = 'payment_type'
    AND EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'payment_transactions' 
      AND column_name = 'payment_status'
    )
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_payment_transactions_type_status
      ON payment_transactions (payment_type, payment_status);
  END IF;
END $$;

-- Index on created_at (should exist)
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at
  ON payment_transactions (created_at DESC);

-- Index on payment_gateway and gateway_order_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_transactions' 
    AND column_name = 'payment_gateway'
    AND EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'payment_transactions' 
      AND column_name = 'gateway_order_id'
    )
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_order
      ON payment_transactions (payment_gateway, gateway_order_id);
  END IF;
END $$;

-- Index on webhook_event_id (partial index)
CREATE INDEX IF NOT EXISTS idx_payment_transactions_webhook_event
  ON payment_transactions (webhook_event_id)
  WHERE webhook_event_id IS NOT NULL;

-- ============================================
-- STEP 9: Create webhook_events table (CORRECTED - UUID)
-- ============================================

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- ✅ CORRECTED: UUID (not BIGINT)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Gateway event identifiers
  gateway_name TEXT NOT NULL,  -- 'razorpay', 'stripe', etc.
  gateway_event_id TEXT NOT NULL,  -- Gateway's event ID (e.g., 'evt_xxx')
  event_type TEXT NOT NULL,  -- 'payment.captured', 'charge.succeeded', etc.
  
  -- Payment references
  gateway_payment_id TEXT NOT NULL,  -- Gateway payment ID (e.g., 'pay_xxx', 'pi_xxx')
  gateway_order_id TEXT,  -- Gateway order/session ID (e.g., 'order_xxx', 'cs_xxx')
  payment_transaction_id UUID,  -- ✅ CORRECTED: UUID to match payment_transactions.id
  
  -- Webhook data
  payload JSONB NOT NULL,  -- Full webhook payload
  signature TEXT,  -- Webhook signature for verification
  
  -- Processing status
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processing_status TEXT DEFAULT 'success' CHECK (processing_status IN ('success', 'failed', 'pending', 'retry')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Composite unique constraint (for idempotency)
  CONSTRAINT uq_gateway_event UNIQUE (gateway_name, gateway_event_id),
  
  -- Foreign key to payment_transactions (UUID)
  CONSTRAINT webhook_events_payment_transaction_id_fkey
    FOREIGN KEY (payment_transaction_id)
    REFERENCES payment_transactions (id)
    ON DELETE SET NULL
);

-- ============================================
-- STEP 10: Add indexes for webhook_events
-- ============================================

CREATE INDEX IF NOT EXISTS idx_webhook_events_gateway_payment
  ON webhook_events (gateway_name, gateway_payment_id);

CREATE INDEX IF NOT EXISTS idx_webhook_events_gateway_order
  ON webhook_events (gateway_name, gateway_order_id);

CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at
  ON webhook_events (processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_events_status
  ON webhook_events (processing_status);

CREATE INDEX IF NOT EXISTS idx_webhook_events_transaction
  ON webhook_events (payment_transaction_id)
  WHERE payment_transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type
  ON webhook_events (event_type);

-- ============================================
-- STEP 11: Support for Doctor/Hospital Subscriptions
-- ============================================

-- Your schema already supports this via:
-- - orders.plan_id → subscription_plans.id
-- - orders.user_id → users.id
-- - subscriptions.user_id → users.id
-- - subscriptions.plan_id → subscription_plans.id
-- - subscriptions.order_id → orders.id
-- - subscriptions.payment_transaction_id → payment_transactions.id

-- Add index for faster subscription queries
CREATE INDEX IF NOT EXISTS idx_orders_user_plan
  ON orders (user_id, plan_id)
  WHERE order_type = 'subscription';

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order
  ON payment_transactions (order_id);

-- ============================================
-- VERIFICATION QUERIES (Run after migration)
-- ============================================

-- Check if all columns were added
-- SELECT 
--   column_name,
--   data_type,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'payment_transactions'
--   AND column_name IN (
--     'gateway_order_id',
--     'webhook_event_id',
--     'webhook_processed_at',
--     'verified_via',
--     'refund_reference_id',
--     'refund_reason',
--     'refund_amount',
--     'payment_status',
--     'payment_type'
--   )
-- ORDER BY column_name;

-- Check webhook_events table
-- SELECT 
--   column_name,
--   data_type
-- FROM information_schema.columns
-- WHERE table_name = 'webhook_events'
-- ORDER BY ordinal_position;


