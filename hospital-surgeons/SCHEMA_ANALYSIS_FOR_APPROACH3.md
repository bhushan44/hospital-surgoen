# Schema Analysis: Support for Approach 3 (Hybrid)

## Current Schema Analysis

### ✅ What You Already Have

#### 1. `subscription_plans` Table (Lines 36-48)
```
✅ id (uuid, primary key)
✅ name (text, unique)
✅ tier (text, with check constraint)
✅ user_role (text, with check constraint)
✅ price (bigint, mode: "number") - ⚠️ This needs to be moved
✅ currency (text, default 'USD') - ⚠️ This needs to be moved
```

**Status**: ✅ Basic structure exists, but price/currency should be in separate table

#### 2. `subscriptions` Table (Lines 215-252)
```
✅ id (uuid, primary key)
✅ userId (uuid, foreign key)
✅ planId (uuid, foreign key)
✅ orderId (uuid, foreign key, nullable)
✅ paymentTransactionId (uuid, foreign key, nullable)
✅ status (text, with check constraint)
✅ startDate (timestamp) - ✅ Perfect!
✅ endDate (timestamp) - ✅ Perfect!
✅ autoRenew (boolean, default true)
✅ createdAt (timestamp)
✅ updatedAt (timestamp)
```

**Status**: ✅ Good foundation, but missing billing cycle info

#### 3. Feature Tables
```
✅ doctor_plan_features (lines 50-62)
   - planId, visibilityWeight, maxAffiliations, notes

✅ hospital_plan_features (lines 829-842)
   - planId, maxPatientsPerMonth, includesPremiumDoctors, 
     maxAssignmentsPerMonth, notes
```

**Status**: ✅ Features are already separated - Perfect for Approach 3!

---

## ❌ What's Missing for Approach 3

### 1. `plan_pricing` Table - **DOES NOT EXIST** ⚠️

**Required Fields**:
```
❌ id (uuid, primary key)
❌ plan_id (uuid, foreign key to subscription_plans)
❌ billing_cycle (text/enum: 'monthly', 'quarterly', 'yearly', 'custom')
❌ billing_period_months (integer)
❌ price (bigint or decimal)
❌ currency (text)
❌ setup_fee (decimal, nullable)
❌ discount_percentage (decimal, default 0)
❌ is_active (boolean, default true)
❌ valid_from (timestamp)
❌ valid_until (timestamp, nullable)
❌ created_at (timestamp)
❌ updated_at (timestamp)
```

**Constraint Needed**:
```
UNIQUE(plan_id, billing_cycle) - One pricing per cycle per plan
```

---

### 2. Updates to `subscription_plans` Table

**Current Issues**:
- ⚠️ Has `price` field - Should be removed (moved to plan_pricing)
- ⚠️ Has `currency` field - Should be removed (moved to plan_pricing)
- ❌ Missing `is_active` flag
- ❌ Missing `description` field (optional but useful)
- ❌ Missing `default_billing_cycle` (optional, for UI defaults)

**Recommended Changes**:
```
REMOVE:
  - price (move to plan_pricing)
  - currency (move to plan_pricing)

ADD:
  - is_active (boolean, default true)
  - description (text, nullable)
  - default_billing_cycle (text, nullable) - Optional
```

---

### 3. Updates to `subscriptions` Table

**Missing Fields**:
```
❌ billing_cycle (text) - Which cycle user chose
❌ billing_period_months (integer) - Copied from plan_pricing
❌ price_at_purchase (bigint/decimal) - Locked-in price
❌ currency_at_purchase (text) - Locked-in currency
```

**Current Fields That Are Good**:
```
✅ startDate - Perfect
✅ endDate - Perfect
✅ status - Perfect
✅ autoRenew - Perfect
```

---

## 📊 Schema Compatibility Score

| Component | Current Status | Approach 3 Support |
|-----------|---------------|-------------------|
| `subscription_plans` | ⚠️ Partial | 60% - Has structure, but price/currency in wrong place |
| `subscriptions` | ⚠️ Partial | 70% - Has dates/status, missing billing cycle info |
| Feature Tables | ✅ Good | 100% - Already separated perfectly |
| `plan_pricing` | ❌ Missing | 0% - Does not exist, needs to be created |

**Overall Compatibility**: **~58%** - Needs significant additions

---

## 🔧 Required Schema Changes

### Change 1: Create `plan_pricing` Table

**New Table Structure**:
```sql
CREATE TABLE plan_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly', 'custom')),
  billing_period_months INTEGER NOT NULL,
  price BIGINT NOT NULL,  -- Stored in cents
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

CREATE INDEX idx_plan_pricing_plan_id ON plan_pricing(plan_id);
CREATE INDEX idx_plan_pricing_active ON plan_pricing(is_active) WHERE is_active = true;
```

---

### Change 2: Modify `subscription_plans` Table

**Remove Fields**:
```sql
ALTER TABLE subscription_plans 
  DROP COLUMN price,
  DROP COLUMN currency;
```

**Add Fields**:
```sql
ALTER TABLE subscription_plans 
  ADD COLUMN is_active BOOLEAN DEFAULT true,
  ADD COLUMN description TEXT,
  ADD COLUMN default_billing_cycle TEXT CHECK (default_billing_cycle IN ('monthly', 'quarterly', 'yearly', 'custom'));
```

**Result**:
```
subscription_plans:
  - id
  - name
  - tier
  - user_role
  - is_active ⭐ NEW
  - description ⭐ NEW (optional)
  - default_billing_cycle ⭐ NEW (optional)
```

---

### Change 3: Modify `subscriptions` Table

**Add Fields**:
```sql
ALTER TABLE subscriptions 
  ADD COLUMN billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  ADD COLUMN billing_period_months INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN price_at_purchase BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN currency_at_purchase TEXT NOT NULL DEFAULT 'USD';
```

**Add Constraints**:
```sql
ALTER TABLE subscriptions 
  ADD CONSTRAINT subscriptions_billing_cycle_check 
    CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly', 'custom'));
```

**Result**:
```
subscriptions:
  - id
  - userId
  - planId
  - billing_cycle ⭐ NEW
  - billing_period_months ⭐ NEW
  - price_at_purchase ⭐ NEW
  - currency_at_purchase ⭐ NEW
  - orderId
  - paymentTransactionId
  - status
  - startDate
  - endDate
  - autoRenew
  - createdAt
  - updatedAt
```

---

## 📋 Migration Strategy

### Step 1: Create New Table (No Breaking Changes)
```sql
-- Create plan_pricing table
-- This doesn't break existing code
```

### Step 2: Migrate Existing Data
```sql
-- For each existing plan:
-- 1. Create a monthly pricing entry in plan_pricing
-- 2. Use current plan.price and plan.currency
-- 3. Set billing_cycle = 'monthly', billing_period_months = 1
```

### Step 3: Update Application Code
- Update plan creation to not set price/currency
- Update subscription creation to use plan_pricing
- Add pricing management endpoints

### Step 4: Remove Old Fields (Breaking Change)
```sql
-- Only after application code is updated
ALTER TABLE subscription_plans DROP COLUMN price, DROP COLUMN currency;
```

### Step 5: Update Existing Subscriptions
```sql
-- Backfill billing_cycle and price_at_purchase for existing subscriptions
-- Set billing_cycle = 'monthly' (default)
-- Copy price from plan (or from order if available)
```

---

## ✅ What Works Without Changes

### 1. Feature Management
- ✅ `doctor_plan_features` - Already separate
- ✅ `hospital_plan_features` - Already separate
- ✅ Features are not tied to pricing - Perfect!

### 2. Subscription Lifecycle
- ✅ `startDate` and `endDate` - Already perfect
- ✅ `status` field - Already supports active/expired/cancelled
- ✅ `autoRenew` flag - Already exists

### 3. Order and Payment Integration
- ✅ `orderId` - Links to orders table
- ✅ `paymentTransactionId` - Links to payment_transactions
- ✅ Orders table already has amount/currency

---

## ⚠️ Potential Issues to Consider

### Issue 1: Existing Data
- **Problem**: Existing plans have price/currency in `subscription_plans`
- **Solution**: Migrate to `plan_pricing` before removing fields
- **Risk**: Medium - Need careful migration

### Issue 2: Existing Subscriptions
- **Problem**: Old subscriptions don't have `billing_cycle` or `price_at_purchase`
- **Solution**: Backfill with defaults (monthly, copy from plan)
- **Risk**: Low - Can set defaults

### Issue 3: Application Code Dependencies
- **Problem**: Code might be reading `plan.price` directly
- **Solution**: Update all code to use `plan_pricing` table
- **Risk**: Medium - Need to find all references

### Issue 4: API Compatibility
- **Problem**: Existing APIs might return `plan.price`
- **Solution**: Update APIs to return pricing from `plan_pricing`
- **Risk**: Medium - Might break frontend if not updated

---

## 🎯 Summary

### Can You Use Approach 3? **YES, with modifications**

### What You Need:
1. ✅ **Create** `plan_pricing` table (new)
2. ✅ **Modify** `subscription_plans` (remove price/currency, add is_active)
3. ✅ **Modify** `subscriptions` (add billing_cycle, price_at_purchase, etc.)
4. ✅ **Migrate** existing data
5. ✅ **Update** application code

### What You Already Have:
- ✅ Good foundation with separated features
- ✅ Proper subscription lifecycle fields
- ✅ Good foreign key relationships
- ✅ Proper indexes and constraints

### Effort Required:
- **Database Changes**: Medium (1 new table, 2 table modifications)
- **Data Migration**: Medium (migrate existing plans/pricing)
- **Code Updates**: High (update all plan/subscription code)
- **Testing**: High (test all subscription flows)

### Recommendation:
**✅ Your schema CAN support Approach 3**, but you'll need to:
1. Create the `plan_pricing` table
2. Migrate existing price data
3. Update application code to use new structure
4. Test thoroughly before removing old fields

The good news: Your feature separation is already perfect for Approach 3! You just need to do the same for pricing.

---

## 📝 Next Steps

1. **Review** this analysis with your team
2. **Plan** the migration strategy
3. **Create** migration scripts
4. **Test** in development environment
5. **Deploy** in phases (add new table → migrate → update code → remove old fields)

