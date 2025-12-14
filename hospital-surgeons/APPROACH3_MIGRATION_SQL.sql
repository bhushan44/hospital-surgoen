-- ============================================================================
-- APPROACH 3 MIGRATION SQL
-- Run these SQL statements manually in your database
-- ============================================================================

-- ============================================================================
-- STEP 1: Create plan_pricing table
-- ============================================================================

CREATE TABLE IF NOT EXISTS plan_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly', 'custom')),
  billing_period_months INTEGER NOT NULL,
  price BIGINT NOT NULL,  -- Stored in centsGot it — you want the same explanation again, but with SIMPLE tables + REAL DATA + STEP-BY-STEP inserts and outputs.

I will now explain Approach 3 (Hybrid) using very simple tables and real examples so you can clearly understand what happens.

✅ 1. Table 1 — subscription_plans (Plan Template)

This table defines ONLY features, NOT price.

id	name	tier	user_role	is_active
plan_1	Enterprise Doctor Plan	enterprise	doctor	true
plan_2	Premium Hospital Plan	premium	hospital	true

⚠ NO price
⚠ NO currency
⚠ NO billing_cycleGot it — you want the same explanation again, but with SIMPLE tables + REAL DATA + STEP-BY-STEP inserts and outputs.

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
sub_2	userB	plan_1	price_3	540000	yearly	12	2025-01-10	2026-01-10	active
This table stores EVERYTHING at the moment the user buys.

id	user_id	plan_id	pricing_id	price_at_purchase	billing_cycle	period_months	start_date	end_date	status
sub_1	userA	plan_1	price_1	50000	monthly	1	2025-01-01	2025-02-01	active
sub_2	userB	plan_1	price_3	540000	yearly	12	2025-01-10	2026-01-10	active

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
  currency TEXT NOT NULL DEFAULT 'USD',
  setup_fee BIGINT DEFAULT 0,  -- One-time fee in cents
  discount_percentage DECIMAL(5,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(plan_id, billing_cycle)
);

-- Create indexes for plan_pricing
CREATE INDEX IF NOT EXISTS idx_plan_pricing_plan_id ON plan_pricing(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_pricing_active ON plan_pricing(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_plan_pricing_valid_dates ON plan_pricing(valid_from, valid_until);

-- ============================================================================
-- STEP 2: Migrate existing price data from subscription_plans to plan_pricing
-- ============================================================================

-- Create monthly pricing entries for all existing plans
INSERT INTO plan_pricing (
  plan_id,
  billing_cycle,
  billing_period_months,
  price,
  currency,
  is_active,
  valid_from
)
SELECT 
  id as plan_id,
  'monthly' as billing_cycle,
  1 as billing_period_months,
  COALESCE(price, 0) as price,
  COALESCE(currency, 'USD') as currency,
  true as is_active,
  created_at as valid_from
FROM subscription_plans
WHERE id NOT IN (
  SELECT DISTINCT plan_id 
  FROM plan_pricing 
  WHERE billing_cycle = 'monthly'
)
ON CONFLICT (plan_id, billing_cycle) DO NOTHING;

-- ============================================================================
-- STEP 3: Add new columns to subscription_plans table
-- ============================================================================

-- Add is_active column
ALTER TABLE subscription_plans 
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add description column
ALTER TABLE subscription_plans 
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Add default_billing_cycle column
ALTER TABLE subscription_plans 
  ADD COLUMN IF NOT EXISTS default_billing_cycle TEXT 
    CHECK (default_billing_cycle IN ('monthly', 'quarterly', 'yearly', 'custom'));

-- Update existing plans to be active
UPDATE subscription_plans 
SET is_active = true 
WHERE is_active IS NULL;

-- ============================================================================
-- STEP 4: Add new columns to subscriptions table
-- ============================================================================

-- Add billing_cycle
ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly';

-- Add constraint for billing_cycle
ALTER TABLE subscriptions 
  ADD CONSTRAINT IF NOT EXISTS subscriptions_billing_cycle_check 
    CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly', 'custom'));

-- Add billing_period_months
ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS billing_period_months INTEGER DEFAULT 1;

-- Add price_at_purchase
ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS price_at_purchase BIGINT DEFAULT 0;

-- Add currency_at_purchase
ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS currency_at_purchase TEXT DEFAULT 'USD';

-- Add pricing_id (reference to plan_pricing)
ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS pricing_id UUID REFERENCES plan_pricing(id) ON DELETE SET NULL;

-- Add plan_snapshot (JSONB for complete plan state)
ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS plan_snapshot JSONB;

-- Add features_at_purchase (JSONB for locked features)
ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS features_at_purchase JSONB;

-- Add renewal_price_strategy
ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS renewal_price_strategy TEXT DEFAULT 'current'
    CHECK (renewal_price_strategy IN ('locked', 'current', 'user_choice'));

-- Add renewal tracking fields
ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS next_renewal_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS last_renewal_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS renewal_count INTEGER DEFAULT 0;

-- Add cancellation tracking
ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_by TEXT 
    CHECK (cancelled_by IN ('user', 'admin', 'system'));

-- Add upgrade tracking
ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS previous_subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS upgrade_from_plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS upgrade_from_pricing_id UUID REFERENCES plan_pricing(id) ON DELETE SET NULL;

-- ============================================================================
-- STEP 5: Backfill existing subscriptions data
-- ============================================================================

-- Set default values for existing subscriptions
UPDATE subscriptions 
SET 
  billing_cycle = COALESCE(billing_cycle, 'monthly'),
  billing_period_months = COALESCE(billing_period_months, 1),
  price_at_purchase = COALESCE(
    price_at_purchase,
    (SELECT price FROM subscription_plans WHERE id = subscriptions."planId")
  ),
  currency_at_purchase = COALESCE(
    currency_at_purchase,
    (SELECT currency FROM subscription_plans WHERE id = subscriptions."planId"),
    'USD'
  ),
  renewal_price_strategy = COALESCE(renewal_price_strategy, 'current'),
  next_renewal_date = COALESCE(next_renewal_date, end_date),
  last_renewal_date = COALESCE(last_renewal_date, start_date)
WHERE 
  billing_cycle IS NULL 
  OR price_at_purchase IS NULL 
  OR price_at_purchase = 0
  OR currency_at_purchase IS NULL;

-- Create plan_snapshot for existing subscriptions
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
WHERE s."planId" = sp.id
  AND s.plan_snapshot IS NULL;

-- Create features_at_purchase for doctor plans
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
WHERE s."planId" = sp.id
  AND sp."userRole" = 'doctor'
  AND s.features_at_purchase IS NULL;

-- Create features_at_purchase for hospital plans
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
WHERE s."planId" = sp.id
  AND sp."userRole" = 'hospital'
  AND s.features_at_purchase IS NULL;

-- Link existing subscriptions to pricing
UPDATE subscriptions s
SET pricing_id = (
  SELECT pp.id
  FROM plan_pricing pp
  WHERE pp.plan_id = s."planId"
    AND pp.billing_cycle = COALESCE(s.billing_cycle, 'monthly')
    AND pp.is_active = true
    AND (pp.valid_until IS NULL OR pp.valid_until > NOW())
  ORDER BY pp.valid_from DESC
  LIMIT 1
)
WHERE s.pricing_id IS NULL;

-- ============================================================================
-- STEP 6: Create indexes for subscriptions table
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal_strategy ON subscriptions(renewal_price_strategy);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_renewal_date ON subscriptions(next_renewal_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_subscriptions_pricing_id ON subscriptions(pricing_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_cancelled_at ON subscriptions(cancelled_at) WHERE cancelled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal_due ON subscriptions(next_renewal_date, status) 
  WHERE status = 'active' AND next_renewal_date IS NOT NULL;

-- ============================================================================
-- STEP 7: Create supporting tables (optional but recommended)
-- ============================================================================

-- Create subscription_renewals table
CREATE TABLE IF NOT EXISTS subscription_renewals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  renewal_type TEXT NOT NULL CHECK (renewal_type IN ('automatic', 'manual', 'upgrade', 'downgrade')),
  previous_price BIGINT NOT NULL,
  new_price BIGINT NOT NULL,
  previous_billing_cycle TEXT,
  new_billing_cycle TEXT,
  previous_plan_id UUID REFERENCES subscription_plans(id),
  new_plan_id UUID REFERENCES subscription_plans(id),
  previous_pricing_id UUID REFERENCES plan_pricing(id),
  new_pricing_id UUID REFERENCES plan_pricing(id),
  price_difference BIGINT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  user_choice TEXT,
  payment_transaction_id UUID REFERENCES payment_transactions(id),
  order_id UUID REFERENCES orders(id),
  scheduled_at TIMESTAMP NOT NULL,
  processed_at TIMESTAMP,
  failed_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscription_renewals_subscription_id ON subscription_renewals(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_renewals_status ON subscription_renewals(status);
CREATE INDEX IF NOT EXISTS idx_subscription_renewals_scheduled_at ON subscription_renewals(scheduled_at);

-- Create subscription_upgrades table
CREATE TABLE IF NOT EXISTS subscription_upgrades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  upgrade_type TEXT NOT NULL CHECK (upgrade_type IN ('upgrade', 'downgrade', 'switch')),
  from_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  to_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  from_pricing_id UUID REFERENCES plan_pricing(id),
  to_pricing_id UUID REFERENCES plan_pricing(id),
  from_billing_cycle TEXT,
  to_billing_cycle TEXT,
  prorated_amount BIGINT,
  prorated_days INTEGER,
  total_days INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'failed', 'cancelled')),
  effective_date TIMESTAMP NOT NULL,
  payment_transaction_id UUID REFERENCES payment_transactions(id),
  order_id UUID REFERENCES orders(id),
  requested_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscription_upgrades_subscription_id ON subscription_upgrades(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_upgrades_status ON subscription_upgrades(status);
CREATE INDEX IF NOT EXISTS idx_subscription_upgrades_effective_date ON subscription_upgrades(effective_date);

-- Create plan_changes_history table
CREATE TABLE IF NOT EXISTS plan_changes_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('price', 'features', 'both', 'deleted', 'reactivated')),
  pricing_id UUID REFERENCES plan_pricing(id) ON DELETE SET NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  affected_subscriptions_count INTEGER DEFAULT 0,
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMP,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_plan_changes_history_plan_id ON plan_changes_history(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_changes_history_changed_at ON plan_changes_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_plan_changes_history_change_type ON plan_changes_history(change_type);

-- ============================================================================
-- STEP 8: Verify the migration
-- ============================================================================

-- Check plan_pricing table
SELECT COUNT(*) as total_pricing_options FROM plan_pricing;
SELECT plan_id, billing_cycle, price, currency FROM plan_pricing LIMIT 10;

-- Check subscriptions with new fields
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN billing_cycle IS NOT NULL THEN 1 END) as with_billing_cycle,
  COUNT(CASE WHEN price_at_purchase > 0 THEN 1 END) as with_price,
  COUNT(CASE WHEN plan_snapshot IS NOT NULL THEN 1 END) as with_snapshot,
  COUNT(CASE WHEN features_at_purchase IS NOT NULL THEN 1 END) as with_features
FROM subscriptions;

-- Check subscription_plans with new fields
SELECT 
  COUNT(*) as total_plans,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_plans
FROM subscription_plans;

-- ============================================================================
-- IMPORTANT: DO NOT RUN THIS YET - Only after updating application code
-- ============================================================================

-- STEP 9: Remove price and currency from subscription_plans
-- ONLY RUN THIS AFTER YOU'VE UPDATED YOUR APPLICATION CODE TO USE plan_pricing
-- 
-- ALTER TABLE subscription_plans 
--   DROP COLUMN IF EXISTS price,
--   DROP COLUMN IF EXISTS currency;
--
-- ============================================================================

-- Migration Complete!
-- Next steps:
-- 1. Update your application code to use plan_pricing table
-- 2. Test thoroughly
-- 3. Then run STEP 9 to remove price/currency from subscription_plans

