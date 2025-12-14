# Database Schema Changes for Upgrade/Renewal Strategy (Approach 3)

## Overview

This document contains **ONLY the database schema changes** needed to support the upgrade/renewal strategy with user choice (Option 3) in Approach 3.

You've already run the initial migration. These are the **additional changes** needed for upgrade/renewal functionality.

---

## 🔧 Required Schema Changes

### Change 1: Add Fields to `subscriptions` Table

**Purpose**: Store renewal strategy, plan snapshot, and features at purchase

```sql
-- Add renewal strategy field
ALTER TABLE subscriptions 
  ADD COLUMN renewal_price_strategy TEXT DEFAULT 'current' 
    CHECK (renewal_price_strategy IN ('locked', 'current', 'user_choice'));

-- Add plan snapshot (complete plan state at purchase)
ALTER TABLE subscriptions 
  ADD COLUMN plan_snapshot JSONB;

-- Add features snapshot (locked features at purchase)
ALTER TABLE subscriptions 
  ADD COLUMN features_at_purchase JSONB;

-- Add pricing reference (which pricing option was chosen)
ALTER TABLE subscriptions 
  ADD COLUMN pricing_id UUID REFERENCES plan_pricing(id) ON DELETE SET NULL;

-- Add renewal tracking fields
ALTER TABLE subscriptions 
  ADD COLUMN next_renewal_date TIMESTAMP,
  ADD COLUMN last_renewal_date TIMESTAMP,
  ADD COLUMN renewal_count INTEGER DEFAULT 0;

-- Add cancellation tracking (for upgrade/renewal context)
ALTER TABLE subscriptions 
  ADD COLUMN cancelled_at TIMESTAMP,
  ADD COLUMN cancellation_reason TEXT,
  ADD COLUMN cancelled_by TEXT CHECK (cancelled_by IN ('user', 'admin', 'system'));

-- Add upgrade/downgrade tracking
ALTER TABLE subscriptions 
  ADD COLUMN previous_subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  ADD COLUMN upgrade_from_plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  ADD COLUMN upgrade_from_pricing_id UUID REFERENCES plan_pricing(id) ON DELETE SET NULL;
```

---

### Change 2: Create `subscription_renewals` Table

**Purpose**: Track all renewal attempts and history

```sql
CREATE TABLE subscription_renewals (
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
  price_difference BIGINT,  -- Positive = increase, Negative = decrease
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  user_choice TEXT,  -- What user selected: 'keep_old', 'upgrade', 'downgrade'
  payment_transaction_id UUID REFERENCES payment_transactions(id),
  order_id UUID REFERENCES orders(id),
  scheduled_at TIMESTAMP NOT NULL,
  processed_at TIMESTAMP,
  failed_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscription_renewals_subscription_id ON subscription_renewals(subscription_id);
CREATE INDEX idx_subscription_renewals_status ON subscription_renewals(status);
CREATE INDEX idx_subscription_renewals_scheduled_at ON subscription_renewals(scheduled_at);
```

---

### Change 3: Create `subscription_upgrades` Table

**Purpose**: Track upgrade/downgrade requests and history

```sql
CREATE TABLE subscription_upgrades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  upgrade_type TEXT NOT NULL CHECK (upgrade_type IN ('upgrade', 'downgrade', 'switch')),
  from_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  to_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  from_pricing_id UUID REFERENCES plan_pricing(id),
  to_pricing_id UUID REFERENCES plan_pricing(id),
  from_billing_cycle TEXT,
  to_billing_cycle TEXT,
  prorated_amount BIGINT,  -- Credit or charge amount
  prorated_days INTEGER,  -- Days remaining in current period
  total_days INTEGER,  -- Total days in current period
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'failed', 'cancelled')),
  effective_date TIMESTAMP NOT NULL,  -- When upgrade takes effect
  payment_transaction_id UUID REFERENCES payment_transactions(id),
  order_id UUID REFERENCES orders(id),
  requested_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscription_upgrades_subscription_id ON subscription_upgrades(subscription_id);
CREATE INDEX idx_subscription_upgrades_status ON subscription_upgrades(status);
CREATE INDEX idx_subscription_upgrades_effective_date ON subscription_upgrades(effective_date);
```

---

### Change 4: Create `plan_changes_history` Table

**Purpose**: Track all plan changes for audit and impact analysis

```sql
CREATE TABLE plan_changes_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('price', 'features', 'both', 'deleted', 'reactivated')),
  pricing_id UUID REFERENCES plan_pricing(id) ON DELETE SET NULL,  -- If price change
  old_data JSONB,  -- Snapshot before change
  new_data JSONB,  -- Snapshot after change
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  affected_subscriptions_count INTEGER DEFAULT 0,  -- How many active subscriptions affected
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMP,
  notes TEXT
);

CREATE INDEX idx_plan_changes_history_plan_id ON plan_changes_history(plan_id);
CREATE INDEX idx_plan_changes_history_changed_at ON plan_changes_history(changed_at);
CREATE INDEX idx_plan_changes_history_change_type ON plan_changes_history(change_type);
```

---

### Change 5: Add Indexes for Performance

```sql
-- Indexes for subscription queries
CREATE INDEX idx_subscriptions_renewal_strategy ON subscriptions(renewal_price_strategy);
CREATE INDEX idx_subscriptions_next_renewal_date ON subscriptions(next_renewal_date) WHERE status = 'active';
CREATE INDEX idx_subscriptions_pricing_id ON subscriptions(pricing_id);
CREATE INDEX idx_subscriptions_cancelled_at ON subscriptions(cancelled_at) WHERE cancelled_at IS NOT NULL;

-- Index for finding subscriptions that need renewal
CREATE INDEX idx_subscriptions_renewal_due ON subscriptions(next_renewal_date, status) 
  WHERE status = 'active' AND next_renewal_date IS NOT NULL;
```

---

## 📋 Migration Script for Existing Data

### Step 1: Backfill Existing Subscriptions

```sql
-- Set default values for existing subscriptions
UPDATE subscriptions 
SET 
  renewal_price_strategy = 'current',
  billing_cycle = 'monthly',
  billing_period_months = 1,
  price_at_purchase = (
    SELECT price FROM subscription_plans WHERE id = subscriptions."planId"
  ),
  currency_at_purchase = COALESCE(
    (SELECT currency FROM subscription_plans WHERE id = subscriptions."planId"),
    'USD'
  ),
  next_renewal_date = end_date,
  last_renewal_date = start_date
WHERE 
  billing_cycle IS NULL 
  OR price_at_purchase IS NULL 
  OR price_at_purchase = 0;

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
)
FROM subscription_plans sp
WHERE s."planId" = sp.id
  AND sp."userRole" = 'hospital'
  AND s.features_at_purchase IS NULL;

-- Link existing subscriptions to pricing (if plan_pricing exists)
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
```

---

### Step 2: Create Initial Pricing Entries (If Not Already Done)

```sql
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
  "createdAt" as valid_from
FROM subscription_plans
WHERE id NOT IN (
  SELECT DISTINCT plan_id 
  FROM plan_pricing 
  WHERE billing_cycle = 'monthly'
)
ON CONFLICT (plan_id, billing_cycle) DO NOTHING;
```

---

## ✅ Summary of All Schema Changes

### New Tables Created:
1. ✅ `subscription_renewals` - Tracks renewal history
2. ✅ `subscription_upgrades` - Tracks upgrade/downgrade history
3. ✅ `plan_changes_history` - Tracks plan changes for audit

### Fields Added to `subscriptions`:
1. ✅ `renewal_price_strategy` - 'locked', 'current', or 'user_choice'
2. ✅ `plan_snapshot` - Complete plan state at purchase (JSONB)
3. ✅ `features_at_purchase` - Locked features at purchase (JSONB)
4. ✅ `pricing_id` - Reference to plan_pricing
5. ✅ `next_renewal_date` - When next renewal is due
6. ✅ `last_renewal_date` - When last renewal happened
7. ✅ `renewal_count` - Number of renewals
8. ✅ `cancelled_at` - When subscription was cancelled
9. ✅ `cancellation_reason` - Why it was cancelled
10. ✅ `cancelled_by` - Who cancelled it
11. ✅ `previous_subscription_id` - Link to previous subscription (for upgrades)
12. ✅ `upgrade_from_plan_id` - Original plan before upgrade
13. ✅ `upgrade_from_pricing_id` - Original pricing before upgrade

### Indexes Added:
1. ✅ Index on `renewal_price_strategy`
2. ✅ Index on `next_renewal_date` (for active subscriptions)
3. ✅ Index on `pricing_id`
4. ✅ Index on `cancelled_at`
5. ✅ Composite index for renewal queries

---

## 🎯 What These Changes Enable

### 1. User Choice on Renewal
- Users can choose to keep old price or upgrade to new price
- System tracks the choice in `renewal_price_strategy`

### 2. Complete History
- `subscription_renewals` table tracks all renewal attempts
- `subscription_upgrades` table tracks all upgrade/downgrade actions
- `plan_changes_history` tracks all plan modifications

### 3. Prorated Upgrades
- `subscription_upgrades` table stores prorated amounts
- Can calculate credit/charge for mid-cycle changes

### 4. Audit Trail
- Every plan change is logged
- Every renewal is tracked
- Every upgrade/downgrade is recorded

### 5. Renewal Management
- `next_renewal_date` shows when renewal is due
- Can query all subscriptions due for renewal
- Track renewal count and history

---

## ⚠️ Important Notes

1. **Run migrations in order** - Some depend on previous changes
2. **Backfill existing data** - Use the migration scripts provided
3. **Test thoroughly** - Verify all constraints work correctly
4. **Update application code** - These schema changes require code updates
5. **Monitor performance** - New indexes should help, but monitor query performance

---

## 📝 Next Steps After Schema Changes

1. ✅ Update application code to use new fields
2. ✅ Implement renewal logic with user choice
3. ✅ Implement upgrade/downgrade logic
4. ✅ Add admin interface for plan changes
5. ✅ Add user interface for renewal choices
6. ✅ Test all renewal scenarios
7. ✅ Test all upgrade/downgrade scenarios

---

**All schema changes are now documented. Run these in your database to enable the upgrade/renewal strategy with user choice.**

