# Approach 3 - Simple Examples with Real Data

## Overview

This document shows Approach 3 using **simple tables** and **real data examples** with step-by-step inserts and outputs.

---

## 📊 Table Structure

### Table 1: `subscription_plans` (Plan Template)

**Purpose**: Defines WHAT the plan offers (features only, NO pricing)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Plan name |
| tier | TEXT | free, basic, premium, enterprise |
| user_role | TEXT | doctor or hospital |
| is_active | BOOLEAN | Is plan available? |
| description | TEXT | Optional description |

**⚠️ NO price column**
**⚠️ NO currency column**
**⚠️ NO billing_cycle column**

---

### Table 2: `plan_pricing` (Pricing Options)

**Purpose**: Defines HOW MUCH it costs for different billing cycles

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| plan_id | UUID | Links to subscription_plans |
| billing_cycle | TEXT | monthly, quarterly, yearly |
| billing_period_months | INTEGER | 1, 3, 12 |
| price | BIGINT | Price in cents (50000 = $500) |
| currency | TEXT | USD, INR, etc. |
| discount_percentage | DECIMAL | 0.00 to 100.00 |
| is_active | BOOLEAN | Is this pricing active? |

**Key**: One plan can have multiple pricing entries (one per billing cycle)

---

### Table 3: `subscriptions` (User's Purchase)

**Purpose**: Stores complete snapshot when user subscribes

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Who subscribed |
| plan_id | UUID | Which plan |
| pricing_id | UUID | Which pricing option chosen |
| price_at_purchase | BIGINT | Locked-in price |
| currency_at_purchase | TEXT | Locked-in currency |
| billing_cycle | TEXT | monthly, quarterly, yearly |
| billing_period_months | INTEGER | 1, 3, 12 |
| start_date | TIMESTAMP | When subscription starts |
| end_date | TIMESTAMP | When subscription ends |
| status | TEXT | active, expired, cancelled |
| plan_snapshot | JSONB | Complete plan state at purchase |
| features_at_purchase | JSONB | Locked features at purchase |

---

## 🎯 Step-by-Step Example

### Step 1: Admin Creates Plan (No Pricing)

**Action**: Admin creates "Enterprise Doctor Plan"

```sql
INSERT INTO subscription_plans (id, name, tier, user_role, is_active)
VALUES 
  ('plan_1', 'Enterprise Doctor Plan', 'enterprise', 'doctor', true);
```

**Result in `subscription_plans`**:

| id | name | tier | user_role | is_active |
|----|------|------|-----------|-----------|
| plan_1 | Enterprise Doctor Plan | enterprise | doctor | true |

**Features stored separately** (in `doctor_plan_features`):

```sql
INSERT INTO doctor_plan_features (plan_id, visibility_weight, max_affiliations, max_assignments_per_month)
VALUES 
  ('plan_1', 10, 5, -1);  -- -1 means unlimited
```

**Result in `doctor_plan_features`**:

| plan_id | visibility_weight | max_affiliations | max_assignments_per_month |
|---------|-------------------|------------------|---------------------------|
| plan_1 | 10 | 5 | -1 (unlimited) |

---

### Step 2: Admin Adds Pricing Options

**Action**: Admin adds 3 pricing options for the same plan

```sql
-- Monthly pricing
INSERT INTO plan_pricing (id, plan_id, billing_cycle, billing_period_months, price, currency, discount_percentage, is_active)
VALUES 
  ('price_1', 'plan_1', 'monthly', 1, 50000, 'USD', 0.00, true);

-- Quarterly pricing (10% discount)
INSERT INTO plan_pricing (id, plan_id, billing_cycle, billing_period_months, price, currency, discount_percentage, is_active)
VALUES 
  ('price_2', 'plan_1', 'quarterly', 3, 135000, 'USD', 10.00, true);
  -- $1,350 = $450/month (10% off $500/month)

-- Yearly pricing (20% discount)
INSERT INTO plan_pricing (id, plan_id, billing_cycle, billing_period_months, price, currency, discount_percentage, is_active)
VALUES 
  ('price_3', 'plan_1', 'yearly', 12, 540000, 'USD', 20.00, true);
  -- $5,400 = $450/month (20% off $500/month)
```

**Result in `plan_pricing`**:

| id | plan_id | billing_cycle | billing_period_months | price | currency | discount_percentage | is_active |
|----|---------|---------------|----------------------|-------|----------|---------------------|-----------|
| price_1 | plan_1 | monthly | 1 | 50000 | USD | 0.00 | true |
| price_2 | plan_1 | quarterly | 3 | 135000 | USD | 10.00 | true |
| price_3 | plan_1 | yearly | 12 | 540000 | USD | 20.00 | true |

**Key Point**: Same plan (plan_1) now has 3 different pricing options!

---

### Step 3: User A Subscribes (Monthly)

**Action**: User A selects "Enterprise Doctor Plan" with monthly billing

```sql
INSERT INTO subscriptions (
  id, 
  user_id, 
  plan_id, 
  pricing_id,
  price_at_purchase,
  currency_at_purchase,
  billing_cycle,
  billing_period_months,
  start_date,
  end_date,
  status,
  plan_snapshot,
  features_at_purchase
)
VALUES (
  'sub_1',
  'userA',
  'plan_1',
  'price_1',  -- Monthly pricing
  50000,      -- $500 locked in
  'USD',
  'monthly',
  1,
  '2025-01-01 10:00:00',
  '2025-02-01 10:00:00',  -- 1 month later
  'active',
  '{
    "plan_id": "plan_1",
    "plan_name": "Enterprise Doctor Plan",
    "tier": "enterprise",
    "user_role": "doctor",
    "price": 50000,
    "currency": "USD",
    "billing_cycle": "monthly",
    "billing_period_months": 1,
    "purchased_at": "2025-01-01T10:00:00Z"
  }'::jsonb,
  '{
    "visibilityWeight": 10,
    "maxAffiliations": 5,
    "maxAssignmentsPerMonth": -1
  }'::jsonb
);
```

**Result in `subscriptions`**:

| id | user_id | plan_id | pricing_id | price_at_purchase | currency | billing_cycle | period_months | start_date | end_date | status |
|----|---------|---------|------------|-------------------|----------|---------------|---------------|------------|----------|--------|
| sub_1 | userA | plan_1 | price_1 | 50000 | USD | monthly | 1 | 2025-01-01 | 2025-02-01 | active |

**What's stored**:
- ✅ User chose monthly billing
- ✅ Price locked at $500 (50000 cents)
- ✅ Features locked: visibilityWeight=10, maxAffiliations=5, unlimited assignments
- ✅ Complete plan snapshot stored

---

### Step 4: User B Subscribes (Yearly)

**Action**: User B selects same plan but with yearly billing

```sql
INSERT INTO subscriptions (
  id, 
  user_id, 
  plan_id, 
  pricing_id,
  price_at_purchase,
  currency_at_purchase,
  billing_cycle,
  billing_period_months,
  start_date,
  end_date,
  status,
  plan_snapshot,
  features_at_purchase
)
VALUES (
  'sub_2',
  'userB',
  'plan_1',  -- Same plan!
  'price_3',  -- But yearly pricing
  540000,     -- $5,400 locked in (20% discount)
  'USD',
  'yearly',
  12,
  '2025-01-10 14:30:00',
  '2026-01-10 14:30:00',  -- 12 months later
  'active',
  '{
    "plan_id": "plan_1",
    "plan_name": "Enterprise Doctor Plan",
    "tier": "enterprise",
    "user_role": "doctor",
    "price": 540000,
    "currency": "USD",
    "billing_cycle": "yearly",
    "billing_period_months": 12,
    "purchased_at": "2025-01-10T14:30:00Z"
  }'::jsonb,
  '{
    "visibilityWeight": 10,
    "maxAffiliations": 5,
    "maxAssignmentsPerMonth": -1
  }'::jsonb
);
```

**Result in `subscriptions`**:

| id | user_id | plan_id | pricing_id | price_at_purchase | currency | billing_cycle | period_months | start_date | end_date | status |
|----|---------|---------|------------|-------------------|----------|---------------|---------------|------------|----------|--------|
| sub_1 | userA | plan_1 | price_1 | 50000 | USD | monthly | 1 | 2025-01-01 | 2025-02-01 | active |
| sub_2 | userB | plan_1 | price_3 | 540000 | USD | yearly | 12 | 2025-01-10 | 2026-01-10 | active |

**Key Point**: 
- ✅ Both users have same plan (plan_1)
- ✅ But different pricing (monthly vs yearly)
- ✅ Different prices locked in ($500 vs $5,400)
- ✅ Different end dates (1 month vs 12 months)

---

### Step 5: Admin Updates Plan Price

**Action**: Admin increases monthly price from $500 to $600

```sql
-- Create new pricing entry (don't update old one)
INSERT INTO plan_pricing (id, plan_id, billing_cycle, billing_period_months, price, currency, discount_percentage, is_active, valid_from)
VALUES 
  ('price_4', 'plan_1', 'monthly', 1, 60000, 'USD', 0.00, true, '2025-01-20 00:00:00');

-- Mark old pricing as inactive (or set valid_until)
UPDATE plan_pricing 
SET is_active = false, valid_until = '2025-01-20 00:00:00'
WHERE id = 'price_1';
```

**Result in `plan_pricing`**:

| id | plan_id | billing_cycle | price | is_active | valid_from | valid_until |
|----|---------|---------------|-------|-----------|------------|-------------|
| price_1 | plan_1 | monthly | 50000 | false | 2025-01-01 | 2025-01-20 |
| price_4 | plan_1 | monthly | 60000 | true | 2025-01-20 | NULL |

**What happens to existing subscriptions?**:

| id | user_id | price_at_purchase | status |
|----|---------|-------------------|--------|
| sub_1 | userA | 50000 | active ✅ Still pays $500 |
| sub_2 | userB | 540000 | active ✅ Still pays $5,400 |

**✅ Existing users keep their locked prices!**

---

### Step 6: User C Subscribes After Price Change

**Action**: User C subscribes on Day 25 (after price increase)

```sql
INSERT INTO subscriptions (
  id, user_id, plan_id, pricing_id, price_at_purchase, billing_cycle, start_date, end_date, status
)
VALUES (
  'sub_3',
  'userC',
  'plan_1',
  'price_4',  -- New pricing ($600)
  60000,      -- $600 locked in
  'monthly',
  '2025-01-25 09:00:00',
  '2025-02-25 09:00:00',
  'active'
);
```

**Result in `subscriptions`**:

| id | user_id | plan_id | price_at_purchase | billing_cycle | start_date | end_date | status |
|----|---------|---------|-------------------|---------------|------------|----------|--------|
| sub_1 | userA | plan_1 | 50000 | monthly | 2025-01-01 | 2025-02-01 | active |
| sub_2 | userB | plan_1 | 540000 | yearly | 2025-01-10 | 2026-01-10 | active |
| sub_3 | userC | plan_1 | 60000 | monthly | 2025-01-25 | 2025-02-25 | active |

**Summary**:
- ✅ User A: Pays $500 (old price, locked)
- ✅ User B: Pays $5,400/year (yearly, locked)
- ✅ User C: Pays $600 (new price, locked)

**All three have same plan, but different prices!**

---

### Step 7: Admin Updates Plan Features

**Action**: Admin increases maxAffiliations from 5 to 10

```sql
-- Update plan features
UPDATE doctor_plan_features 
SET max_affiliations = 10
WHERE plan_id = 'plan_1';
```

**What happens to existing subscriptions?**:

| id | user_id | features_at_purchase | Current Plan Features |
|----|---------|----------------------|----------------------|
| sub_1 | userA | `{"maxAffiliations": 5}` | `{"maxAffiliations": 10}` |
| sub_2 | userB | `{"maxAffiliations": 5}` | `{"maxAffiliations": 10}` |
| sub_3 | userC | `{"maxAffiliations": 5}` | `{"maxAffiliations": 10}` |

**Decision**: 
- **Option A**: Keep old limit (5) - locked features
- **Option B**: Upgrade to new limit (10) - customer-friendly ⭐ Recommended

**If Option B (Upgrade)**:
- ✅ All existing users get new limit (10)
- ✅ New users get new limit (10)
- ✅ Everyone benefits

---

## 📊 Complete Data Flow Example

### Initial State

**subscription_plans**:
| id | name | tier | user_role |
|----|------|------|-----------|
| plan_1 | Enterprise Doctor Plan | enterprise | doctor |

**plan_pricing**:
| id | plan_id | billing_cycle | price |
|----|---------|---------------|-------|
| price_1 | plan_1 | monthly | 50000 |
| price_3 | plan_1 | yearly | 540000 |

**subscriptions**: (empty)

---

### After User A Subscribes

**subscriptions**:
| id | user_id | plan_id | pricing_id | price_at_purchase | billing_cycle | start_date | end_date |
|----|---------|---------|------------|-------------------|---------------|------------|----------|
| sub_1 | userA | plan_1 | price_1 | 50000 | monthly | 2025-01-01 | 2025-02-01 |

---

### After Admin Updates Price

**plan_pricing**:
| id | plan_id | billing_cycle | price | is_active |
|----|---------|---------------|-------|-----------|
| price_1 | plan_1 | monthly | 50000 | false (old) |
| price_4 | plan_1 | monthly | 60000 | true (new) |
| price_3 | plan_1 | yearly | 540000 | true |

**subscriptions** (unchanged):
| id | user_id | price_at_purchase | status |
|----|---------|-------------------|--------|
| sub_1 | userA | 50000 | active ✅ Still $500 |

---

### After User C Subscribes

**subscriptions**:
| id | user_id | plan_id | pricing_id | price_at_purchase | billing_cycle |
|----|---------|---------|------------|-------------------|---------------|
| sub_1 | userA | plan_1 | price_1 | 50000 | monthly |
| sub_3 | userC | plan_1 | price_4 | 60000 | monthly |

**Result**: Same plan, different prices based on when they subscribed!

---

## 🎯 Key Takeaways

1. **Plan is generic** - No pricing in `subscription_plans`
2. **Pricing is separate** - Multiple options in `plan_pricing`
3. **Subscription stores everything** - Complete snapshot at purchase
4. **Price changes don't affect existing users** - They keep locked price
5. **Feature changes can upgrade users** - Give them new features

---

## 📋 Query Examples

### Get All Pricing Options for a Plan

```sql
SELECT 
  pp.billing_cycle,
  pp.price,
  pp.currency,
  pp.billing_period_months,
  pp.discount_percentage
FROM plan_pricing pp
WHERE pp.plan_id = 'plan_1'
  AND pp.is_active = true
ORDER BY pp.billing_period_months;
```

**Output**:
| billing_cycle | price | currency | billing_period_months | discount_percentage |
|---------------|-------|----------|----------------------|---------------------|
| monthly | 60000 | USD | 1 | 0.00 |
| quarterly | 135000 | USD | 3 | 10.00 |
| yearly | 540000 | USD | 12 | 20.00 |

---

### Get User's Active Subscription

```sql
SELECT 
  s.id,
  s.price_at_purchase,
  s.billing_cycle,
  s.start_date,
  s.end_date,
  s.plan_snapshot->>'plan_name' as plan_name,
  s.features_at_purchase
FROM subscriptions s
WHERE s.user_id = 'userA'
  AND s.status = 'active';
```

**Output**:
| id | price_at_purchase | billing_cycle | plan_name | features |
|----|-------------------|---------------|-----------|----------|
| sub_1 | 50000 | monthly | Enterprise Doctor Plan | `{"maxAffiliations": 5, ...}` |

---

### Find Subscriptions Due for Renewal

```sql
SELECT 
  s.id,
  s.user_id,
  s.price_at_purchase,
  s.billing_cycle,
  s.end_date
FROM subscriptions s
WHERE s.status = 'active'
  AND s.end_date <= NOW() + INTERVAL '7 days'  -- Renewal due in 7 days
ORDER BY s.end_date;
```

---

This shows how Approach 3 works with simple tables and real data examples!

