-- ============================================
-- Add Direct Plan & Pricing Tracking to payment_transactions
-- Supports: Doctor/Hospital subscriptions, Plan tracking, Plan pricing tracking
-- ============================================

-- ============================================
-- STEP 1: Add Direct Tracking Columns
-- ============================================

ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS plan_id UUID,
  ADD COLUMN IF NOT EXISTS plan_pricing_id UUID;

-- ============================================
-- STEP 2: Add Foreign Key Constraints
-- ============================================

-- Foreign key to users (for doctor/hospital tracking)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payment_transactions_user_id_fkey'
  ) THEN
    ALTER TABLE payment_transactions
      ADD CONSTRAINT payment_transactions_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Foreign key to subscription_plans (for plan tracking)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payment_transactions_plan_id_fkey'
  ) THEN
    ALTER TABLE payment_transactions
      ADD CONSTRAINT payment_transactions_plan_id_fkey
      FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Foreign key to plan_pricing (for pricing tracking)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payment_transactions_plan_pricing_id_fkey'
  ) THEN
    ALTER TABLE payment_transactions
      ADD CONSTRAINT payment_transactions_plan_pricing_id_fkey
      FOREIGN KEY (plan_pricing_id) REFERENCES plan_pricing(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- STEP 3: Add Indexes for Performance
-- ============================================

-- Index on user_id (for doctor/hospital queries)
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id
  ON payment_transactions (user_id)
  WHERE user_id IS NOT NULL;

-- Index on plan_id (for plan queries)
CREATE INDEX IF NOT EXISTS idx_payment_transactions_plan_id
  ON payment_transactions (plan_id)
  WHERE plan_id IS NOT NULL;

-- Index on plan_pricing_id (for pricing queries)
CREATE INDEX IF NOT EXISTS idx_payment_transactions_plan_pricing_id
  ON payment_transactions (plan_pricing_id)
  WHERE plan_pricing_id IS NOT NULL;

-- Composite index for common queries (user + plan)
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_plan
  ON payment_transactions (user_id, plan_id)
  WHERE user_id IS NOT NULL AND plan_id IS NOT NULL;

-- Composite index for plan + status (common filter)
CREATE INDEX IF NOT EXISTS idx_payment_transactions_plan_status
  ON payment_transactions (plan_id, status)
  WHERE plan_id IS NOT NULL;

-- Composite index for pricing + status
CREATE INDEX IF NOT EXISTS idx_payment_transactions_pricing_status
  ON payment_transactions (plan_pricing_id, status)
  WHERE plan_pricing_id IS NOT NULL;

-- ============================================
-- STEP 4: Populate Existing Data (Optional)
-- ============================================

-- Update user_id from orders
UPDATE payment_transactions pt
SET user_id = o.user_id
FROM orders o
WHERE pt.order_id = o.id
  AND pt.user_id IS NULL;

-- Update plan_id from orders
UPDATE payment_transactions pt
SET plan_id = o.plan_id
FROM orders o
WHERE pt.order_id = o.id
  AND pt.plan_id IS NULL
  AND o.plan_id IS NOT NULL;

-- Update plan_pricing_id from subscriptions
UPDATE payment_transactions pt
SET plan_pricing_id = s.pricing_id
FROM subscriptions s
WHERE pt.id = s.payment_transaction_id
  AND pt.plan_pricing_id IS NULL
  AND s.pricing_id IS NOT NULL;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if columns were added
-- SELECT 
--   column_name,
--   data_type,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'payment_transactions'
--   AND column_name IN ('user_id', 'plan_id', 'plan_pricing_id')
-- ORDER BY column_name;

-- Check foreign key constraints
-- SELECT
--   tc.constraint_name,
--   tc.table_name,
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND tc.table_name = 'payment_transactions'
--   AND kcu.column_name IN ('user_id', 'plan_id', 'plan_pricing_id');

-- ============================================
-- EXAMPLE QUERIES (After Migration)
-- ============================================

-- Query 1: Get all transactions for a specific plan
-- SELECT *
-- FROM payment_transactions
-- WHERE plan_id = 'plan-uuid';

-- Query 2: Get all transactions for a specific user (doctor/hospital)
-- SELECT *
-- FROM payment_transactions
-- WHERE user_id = 'user-uuid';

-- Query 3: Get all transactions for a specific plan pricing
-- SELECT *
-- FROM payment_transactions
-- WHERE plan_pricing_id = 'pricing-uuid';

-- Query 4: Get doctor plan transactions with pricing details
-- SELECT 
--   pt.id,
--   pt.amount,
--   pt.currency,
--   pt.status,
--   pt.created_at,
--   sp.name AS plan_name,
--   sp.user_role AS plan_role,
--   pp.billing_cycle,
--   pp.price AS pricing_price,
--   u.email AS user_email
-- FROM payment_transactions pt
-- JOIN subscription_plans sp ON pt.plan_id = sp.id
-- LEFT JOIN plan_pricing pp ON pt.plan_pricing_id = pp.id
-- LEFT JOIN users u ON pt.user_id = u.id
-- WHERE sp.user_role = 'doctor'
--   AND pt.status = 'success';

-- Query 5: Track plan pricing usage
-- SELECT 
--   pp.id AS pricing_id,
--   pp.plan_id,
--   pp.billing_cycle,
--   pp.price,
--   COUNT(pt.id) AS transaction_count,
--   SUM(pt.amount) AS total_revenue,
--   COUNT(DISTINCT pt.user_id) AS unique_users
-- FROM plan_pricing pp
-- LEFT JOIN payment_transactions pt ON pp.id = pt.plan_pricing_id
-- WHERE pt.status = 'success'
-- GROUP BY pp.id, pp.plan_id, pp.billing_cycle, pp.price
-- ORDER BY transaction_count DESC;


