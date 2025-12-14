Got it — you want the same explanation again, but with SIMPLE tables + REAL DATA + STEP-BY-STEP inserts and outputs.

I will now explain Approach 3 (Hybrid) using very simple tables and real examples so you can clearly understand what happens.

✅ 1. Table 1 — subscription_plans (Plan Template)

This table defines ONLY features, NOT price.

id	name	tier	user_role	is_active
plan_1	Enterprise Doctor Plan	enterprise	doctor	true
plan_2	Premium Hospital Plan	premium	hospital	true

⚠ NO price
⚠ NO currency
⚠ NO billing_cycle

This is ONLY “what this plan offers”.

Example features stored separately:

doctor_plan_features:

plan_id	feature	valueGot it — you want the same explanation again, but with SIMPLE tables + REAL DATA + STEP-BY-STEP inserts and outputs.

I will now explain Approach 3 (Hybrid) using very simple tables and real examples so you can clearly understand what happens.

✅ 1. Table 1 — subscription_plans (Plan Template)

This table defines ONLY features, NOT price.

id	name	tier	user_role	is_active
plan_1	Enterprise Doctor Plan	enterprise	doctor	true
plan_2	Premium Hospital Plan	premium	hospital	true

⚠ NO price
⚠ NO currency
⚠ NO billing_cycle

This is ONLY “what this plan offers”.

Example features stored separately:

doctor_plan_features:

plan_id	feature	value
plan_1	maxAssignmentsPerMonth	-1
plan_1	visibilityWeight	10
plan_1	maxAffiliations	5
✅ 2. Table 2 — plan_pricing (Pricing Options)

Same plan, multiple pricing options.

id	plan_id	billing_cycle	billing_period_months	price	currency	discount
price_1	plan_1	monthly	1	50000	USD	0
price_2	plan_1	quarterly	3	135000	USD	10
price_3	plan_1	yearly	12	540000	USD	20

So plan_1 has three pricing options.

✅ 3. Table 3 — subscriptions (User’s Purchase Snapshot)

This table stores EVERYTHING at the moment the user buys.

id	user_id	plan_id	pricing_id	price_at_purchase	billing_cycle	period_months	start_date	end_date	status
sub_1	userA	plan_1	price_1	50000	monthly	1	2025-01-01	2025-02-01	active
sub_2	userB	plan_1	price_3	540000	yearly	12	2025-01-10	2026-01-10	active
plan_1	maxAssignmentsPerMonth	-1
plan_1	visibilityWeight	10
plan_1	maxAffiliations	5
✅ 2. Table 2 — plan_pricing (Pricing Options)

Same plan, multiple pricing options.

id	plan_id	billing_cycle	billing_period_months	price	currency	discount
price_1	plan_1	monthly	1	50000	USD	0
price_2	plan_1	quarterly	3	135000	USD	10
price_3	plan_1	yearly	12	540000	USD	20

So plan_1 has three pricing options.

✅ 3. Table 3 — subscriptions (User’s Purchase Snapshot)

This table stores EVERYTHING at the moment the user buys.

id	user_id	plan_id	pricing_id	price_at_purchase	billing_cycle	period_months	start_date	end_date	status
sub_1	userA	plan_1	price_1	50000	monthly	1	2025-01-01	2025-02-01	active
sub_2	userB	plan_1	price_3	540000	yearly	12	2025-01-10	2026-01-10	activeGot it — you want the same explanation again, but with SIMPLE tables + REAL DATA + STEP-BY-STEP inserts and outputs.

I will now explain Approach 3 (Hybrid) using very simple tables and real examples so you can clearly understand what happens.

✅ 1. Table 1 — subscription_plans (Plan Template)

This table defines ONLY features, NOT price.

id	name	tier	user_role	is_active
plan_1	Enterprise Doctor Plan	enterprise	doctor	true
plan_2	Premium Hospital Plan	premium	hospital	true

⚠ NO price
⚠ NO currency
⚠ NO billing_cycle

This is ONLY “what this plan offers”.

Example features stored separately:

doctor_plan_features:

plan_id	feature	value
plan_1	maxAssignmentsPerMonth	-1
plan_1	visibilityWeight	10
plan_1	maxAffiliations	5
✅ 2. Table 2 — plan_pricing (Pricing Options)

Same plan, multiple pricing options.

id	plan_id	billing_cycle	billing_period_months	price	currency	discount
price_1	plan_1	monthly	1	50000	USD	0
price_2	plan_1	quarterly	3	135000	USD	10
price_3	plan_1	yearly	12	540000	USD	20

So plan_1 has three pricing options.

✅ 3. Table 3 — subscriptions (User’s Purchase Snapshot)

This table stores EVERYTHING at the moment the user buys.

id	user_id	plan_id	pricing_id	price_at_purchase	billing_cycle	period_months	start_date	end_date	status
sub_1	userA	plan_1	price_1	50000	monthly	1	2025-01-01	2025-02-01	active
sub_2	userB	plan_1	price_3	540000	yearly	12	2025-01-10	2026-01-10	active-- ============================================================================
-- APPROACH 3 - COLUMN CHANGES ONLY
-- Just the SQL to add/update columns
-- ============================================================================

-- ============================================================================
-- STEP 1: Create plan_pricing table
-- ============================================================================

CREATE TABLE plan_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly', 'custom')),
  billing_period_months INTEGER NOT NULL,
  price BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  setup_fee BIGINT DEFAULT 0,
  discount_percentage DECIMAL(5,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(plan_id, billing_cycle)
);

CREATE INDEX idx_plan_pricing_plan_id ON plan_pricing(plan_id);
CREATE INDEX idx_plan_pricing_active ON plan_pricing(is_active) WHERE is_active = true;

-- ============================================================================
-- STEP 2: Add columns to subscription_plans
-- ============================================================================

ALTER TABLE subscription_plans 
  ADD COLUMN is_active BOOLEAN DEFAULT true,
  ADD COLUMN description TEXT,
  ADD COLUMN default_billing_cycle TEXT CHECK (default_billing_cycle IN ('monthly', 'quarterly', 'yearly', 'custom'));

UPDATE subscription_plans SET is_active = true WHERE is_active IS NULL;

-- ============================================================================
-- STEP 3: Add columns to subscriptions
-- ============================================================================

ALTER TABLE subscriptions 
  ADD COLUMN billing_cycle TEXT DEFAULT 'monthly',
  ADD COLUMN billing_period_months INTEGER DEFAULT 1,
  ADD COLUMN price_at_purchase BIGINT DEFAULT 0,
  ADD COLUMN currency_at_purchase TEXT DEFAULT 'USD',
  ADD COLUMN pricing_id UUID REFERENCES plan_pricing(id) ON DELETE SET NULL,
  ADD COLUMN plan_snapshot JSONB,
  ADD COLUMN features_at_purchase JSONB,
  ADD COLUMN renewal_price_strategy TEXT DEFAULT 'current' CHECK (renewal_price_strategy IN ('locked', 'current', 'user_choice')),
  ADD COLUMN next_renewal_date TIMESTAMP,
  ADD COLUMN last_renewal_date TIMESTAMP,
  ADD COLUMN renewal_count INTEGER DEFAULT 0,
  ADD COLUMN cancelled_at TIMESTAMP,
  ADD COLUMN cancellation_reason TEXT,
  ADD COLUMN cancelled_by TEXT CHECK (cancelled_by IN ('user', 'admin', 'system')),
  ADD COLUMN previous_subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  ADD COLUMN upgrade_from_plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  ADD COLUMN upgrade_from_pricing_id UUID REFERENCES plan_pricing(id) ON DELETE SET NULL;

ALTER TABLE subscriptions 
  ADD CONSTRAINT subscriptions_billing_cycle_check 
    CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly', 'custom'));

-- ============================================================================
-- STEP 4: Migrate existing price data to plan_pricing
-- ============================================================================

INSERT INTO plan_pricing (plan_id, billing_cycle, billing_period_months, price, currency, is_active, valid_from)
SELECT 
  id as plan_id,
  'monthly' as billing_cycle,
  1 as billing_period_months,
  COALESCE(price, 0) as price,
  COALESCE(currency, 'USD') as currency,
  true as is_active,
  created_at as valid_from
FROM subscription_plans
ON CONFLICT (plan_id, billing_cycle) DO NOTHING;

-- ============================================================================
-- STEP 5: Backfill existing subscriptions
-- ============================================================================

UPDATE subscriptions 
SET 
  billing_cycle = COALESCE(billing_cycle, 'monthly'),
  billing_period_months = COALESCE(billing_period_months, 1),
  price_at_purchase = COALESCE(price_at_purchase, (SELECT price FROM subscription_plans WHERE id = subscriptions."planId")),
  currency_at_purchase = COALESCE(currency_at_purchase, (SELECT currency FROM subscription_plans WHERE id = subscriptions."planId"), 'USD'),
  next_renewal_date = COALESCE(next_renewal_date, end_date),
  last_renewal_date = COALESCE(last_renewal_date, start_date)
WHERE billing_cycle IS NULL OR price_at_purchase IS NULL OR price_at_purchase = 0;

UPDATE subscriptions s
SET plan_snapshot = jsonb_build_object(
  'plan_id', s."planId",
  'plan_name', sp.name,
  'tier', sp.tier,
  'user_role', sp."userRole",
  'price', s.price_at_purchase,
  'currency', s.currency_at_purchase,
  'billing_cycle', s.billing_cycle,
  'billing_period_months', s.billing_period_months,
  'purchased_at', s."createdAt"
)
FROM subscription_plans sp
WHERE s."planId" = sp.id AND s.plan_snapshot IS NULL;

UPDATE subscriptions s
SET features_at_purchase = (
  SELECT jsonb_build_object(
    'visibilityWeight', dpf."visibilityWeight",
    'maxAffiliations', dpf."maxAffiliations",
    'maxAssignmentsPerMonth', dpf."maxAssignmentsPerMonth",
    'notes', dpf.notes
  )
  FROM doctor_plan_features dpf
  WHERE dpf."planId" = s."planId"
  LIMIT 1
)
FROM subscription_plans sp
WHERE s."planId" = sp.id AND sp."userRole" = 'doctor' AND s.features_at_purchase IS NULL;

UPDATE subscriptions s
SET features_at_purchase = (
  SELECT jsonb_build_object(
    'maxPatientsPerMonth', hpf."maxPatientsPerMonth",
    'includesPremiumDoctors', hpf."includesPremiumDoctors",
    'maxAssignmentsPerMonth', hpf."maxAssignmentsPerMonth",
    'notes', hpf.notes
  )
  FROM hospital_plan_features hpf
  WHERE hpf."planId" = s."planId"
  LIMIT 1
)
FROM subscription_plans sp
WHERE s."planId" = sp.id AND sp."userRole" = 'hospital' AND s.features_at_purchase IS NULL;

UPDATE subscriptions s
SET pricing_id = (
  SELECT pp.id
  FROM plan_pricing pp
  WHERE pp.plan_id = s."planId"
    AND pp.billing_cycle = COALESCE(s.billing_cycle, 'monthly')
    AND pp.is_active = true
  ORDER BY pp.valid_from DESC
  LIMIT 1
)
WHERE s.pricing_id IS NULL;

-- ============================================================================
-- STEP 6: Create indexes
-- ============================================================================

CREATE INDEX idx_subscriptions_renewal_strategy ON subscriptions(renewal_price_strategy);
CREATE INDEX idx_subscriptions_next_renewal_date ON subscriptions(next_renewal_date) WHERE status = 'active';
CREATE INDEX idx_subscriptions_pricing_id ON subscriptions(pricing_id);

-- Done!

