# Approach 3 (Hybrid) - Detailed Explanation

## What is Approach 3?

**Approach 3 (Hybrid)** is a flexible subscription architecture that separates:
- **Plan Features** (what the plan offers)
- **Pricing** (how much it costs and billing cycles)
- **Subscriptions** (user's active purchase with locked-in details)

It's called "Hybrid" because it combines the best of both worlds:
- Plans are generic (no pricing tied to them)
- Pricing is flexible (multiple billing cycles per plan)
- Subscriptions store everything at purchase time (complete snapshot)

---

## 🏗️ Core Architecture

### Three Main Components

```
1. subscription_plans (Template)
   └── Defines: Features, Tier, User Role
   └── Does NOT define: Price, Billing Cycle

2. plan_pricing (Pricing Options)
   └── Defines: Price, Billing Cycle, Discounts
   └── Links to: subscription_plans

3. subscriptions (User Purchase)
   └── Stores: Complete snapshot at purchase time
   └── Links to: plan_id + pricing_id
```

---

## 📊 Database Structure

### 1. `subscription_plans` Table (Plan Template)

**Purpose**: Defines what the plan offers (features, capabilities)

```
subscription_plans:
├── id (UUID)
├── name (TEXT)                    ← "Enterprise Doctor Plan"
├── tier (TEXT)                    ← "enterprise"
├── user_role (TEXT)               ← "doctor" | "hospital"
├── description (TEXT)             ← Optional description
├── is_active (BOOLEAN)            ← Can disable plan
├── default_billing_cycle (TEXT)   ← Optional default
├── created_at
└── updated_at

❌ NO price field
❌ NO currency field
❌ NO billing_cycle field
```

**Key Point**: This table only defines **WHAT** the plan is, not **HOW MUCH** it costs.

---

### 2. `plan_pricing` Table (Pricing Options)

**Purpose**: Defines pricing for different billing cycles

```
plan_pricing:
├── id (UUID)
├── plan_id (UUID)                 ← Foreign key to subscription_plans
├── billing_cycle (TEXT)            ← "monthly" | "quarterly" | "yearly" | "custom"
├── billing_period_months (INTEGER) ← 1, 3, 12, etc.
├── price (BIGINT)                  ← Price in cents (e.g., 50000 = $500)
├── currency (TEXT)                ← "USD", "INR", etc.
├── setup_fee (BIGINT)             ← Optional one-time fee
├── discount_percentage (DECIMAL)   ← 0.00 to 100.00
├── is_active (BOOLEAN)            ← Can disable specific pricing
├── valid_from (TIMESTAMP)          ← When this pricing starts
├── valid_until (TIMESTAMP)         ← When this pricing ends (NULL = current)
├── created_at
└── updated_at

UNIQUE(plan_id, billing_cycle)     ← One pricing per cycle per plan
```

**Key Point**: One plan can have **multiple pricing entries** (one for each billing cycle).

---

### 3. `subscriptions` Table (User's Active Purchase)

**Purpose**: Stores user's subscription with complete snapshot

```
subscriptions:
├── id (UUID)
├── user_id (UUID)                  ← Who subscribed
├── plan_id (UUID)                  ← Which plan (reference)
├── pricing_id (UUID)              ← Which pricing option was chosen
├── billing_cycle (TEXT)            ← Copied from plan_pricing
├── billing_period_months (INTEGER) ← Copied from plan_pricing
├── price_at_purchase (BIGINT)     ← Locked-in price
├── currency_at_purchase (TEXT)    ← Locked-in currency
├── plan_snapshot (JSON)           ← Complete plan state at purchase ⭐
├── features_at_purchase (JSON)    ← Locked features ⭐
├── start_date (TIMESTAMP)          ← When subscription starts
├── end_date (TIMESTAMP)            ← When subscription ends
├── status (TEXT)                  ← "active" | "expired" | "cancelled"
├── auto_renew (BOOLEAN)           ← Auto-renewal enabled?
├── renewal_price_strategy (TEXT)  ← "locked" | "current" | "user_choice"
├── created_at
└── updated_at
```

**Key Point**: Subscription stores **everything** at purchase time, so it's independent of plan changes.

---

## 🔄 How It Works: Step by Step

### Step 1: Admin Creates Plan (No Pricing)

```
Admin creates "Enterprise Doctor Plan":
  - Name: "Enterprise Doctor Plan"
  - Tier: "enterprise"
  - User Role: "doctor"
  - Features: (stored in doctor_plan_features table)
    - visibilityWeight: 10
    - maxAffiliations: 5
    - maxAssignmentsPerMonth: -1 (unlimited)

Result in subscription_plans:
  - id: "plan-123"
  - name: "Enterprise Doctor Plan"
  - tier: "enterprise"
  - user_role: "doctor"
  - NO price, NO currency, NO billing_cycle
```

---

### Step 2: Admin Adds Pricing Options

```
Admin adds pricing for the plan:

Option 1 - Monthly:
  - billing_cycle: "monthly"
  - billing_period_months: 1
  - price: 50000 (cents = $500)
  - currency: "USD"
  - discount_percentage: 0

Option 2 - Quarterly:
  - billing_cycle: "quarterly"
  - billing_period_months: 3
  - price: 135000 (cents = $1,350, which is $450/month)
  - currency: "USD"
  - discount_percentage: 10 (10% off)

Option 3 - Yearly:
  - billing_cycle: "yearly"
  - billing_period_months: 12
  - price: 540000 (cents = $5,400, which is $450/month)
  - currency: "USD"
  - discount_percentage: 20 (20% off)

Result in plan_pricing:
  - 3 entries, all linked to plan_id: "plan-123"
```

---

### Step 3: User Browses Plans

```
User sees:
  ┌─────────────────────────────────────┐
  │ Enterprise Doctor Plan              │
  │                                     │
  │ Features:                           │
  │ ✓ Unlimited assignments             │
  │ ✓ High visibility (weight: 10)      │
  │ ✓ Up to 5 affiliations              │
  │                                     │
  │ Pricing Options:                    │
  │ ○ Monthly    $500/month            │
  │ ○ Quarterly  $450/month (Save 10%) │
  │ ● Yearly     $450/month (Save 20%) │
  │                                     │
  │ [Subscribe to Yearly]               │
  └─────────────────────────────────────┘
```

**What Happens**:
1. Frontend fetches plan details from `subscription_plans`
2. Frontend fetches pricing options from `plan_pricing` where `plan_id = plan-123`
3. User sees all available billing cycles
4. User selects "yearly"

---

### Step 4: User Subscribes

```
User clicks "Subscribe to Yearly":

1. Frontend calls: GET /api/subscriptions/plans/plan-123/pricing?billing_cycle=yearly

2. Backend returns:
   {
     "plan_id": "plan-123",
     "plan_name": "Enterprise Doctor Plan",
     "billing_cycle": "yearly",
     "billing_period_months": 12,
     "price": 540000,
     "currency": "USD",
     "monthly_equivalent": 45000,
     "discount_percentage": 20,
     "features": {
       "visibilityWeight": 10,
       "maxAffiliations": 5,
       "maxAssignmentsPerMonth": -1
     }
   }

3. User confirms and subscribes

4. Frontend calls: POST /api/subscriptions
   {
     "plan_id": "plan-123",
     "pricing_id": "pricing-yearly-456",
     "billing_cycle": "yearly"
   }
```

---

### Step 5: Backend Creates Subscription

```
Backend process:

1. Fetch plan details:
   - From subscription_plans: name, tier, user_role
   - From doctor_plan_features: all features

2. Fetch pricing details:
   - From plan_pricing: price, currency, billing_period_months

3. Calculate dates:
   - start_date = now()
   - end_date = now() + billing_period_months (12 months)

4. Create complete snapshot:
   plan_snapshot = {
     "plan_id": "plan-123",
     "plan_name": "Enterprise Doctor Plan",
     "tier": "enterprise",
     "user_role": "doctor",
     "price": 540000,
     "currency": "USD",
     "billing_cycle": "yearly",
     "billing_period_months": 12,
     "features": {
       "visibilityWeight": 10,
       "maxAffiliations": 5,
       "maxAssignmentsPerMonth": -1
     },
     "purchased_at": "2025-12-08T10:30:00Z"
   }

5. Insert into subscriptions:
   - user_id: "user-789"
   - plan_id: "plan-123"
   - pricing_id: "pricing-yearly-456"
   - billing_cycle: "yearly"
   - billing_period_months: 12
   - price_at_purchase: 540000
   - currency_at_purchase: "USD"
   - plan_snapshot: { ... complete JSON ... }
   - features_at_purchase: { ... features JSON ... }
   - start_date: "2025-12-08T10:30:00Z"
   - end_date: "2026-12-08T10:30:00Z"
   - status: "active"
```

---

## 🎯 Key Concepts Explained

### 1. Plan is Generic (No Pricing)

**Why?**
- Plan defines **capabilities**, not cost
- Same plan can have different prices in different regions
- Same plan can have different prices over time
- Pricing is a separate concern

**Example**:
```
Plan: "Basic Hospital Plan"
  - Features: 100 patients/month, 50 assignments/month
  - Pricing Options:
    - Monthly: $100
    - Yearly: $1,000 (save $200)
    - Promo: $80/month (limited time)
```

---

### 2. Multiple Pricing Per Plan

**Why?**
- Users want flexibility (monthly vs yearly)
- Different billing cycles = different prices
- Discounts for longer commitments
- Easy to add new billing options

**Example**:
```
Enterprise Plan has 3 pricing options:
  1. Monthly: $500/month
  2. Quarterly: $1,350/quarter ($450/month, 10% off)
  3. Yearly: $5,400/year ($450/month, 20% off)
```

---

### 3. Complete Snapshot in Subscription

**Why?**
- Plan can change (price, features)
- Need historical accuracy
- User should get what they paid for
- Audit and compliance requirements

**What's Stored**:
```json
{
  "plan_name": "Enterprise Doctor Plan",
  "price": 540000,
  "currency": "USD",
  "billing_cycle": "yearly",
  "features": {
    "maxAssignmentsPerMonth": -1,
    "visibilityWeight": 10
  },
  "purchased_at": "2025-12-08T10:30:00Z"
}
```

**Benefits**:
- Even if plan is deleted, subscription still works
- Even if plan price changes, user keeps old price
- Even if plan features change, user keeps old features
- Complete audit trail

---

## 📋 Real-World Example

### Scenario: Complete Flow

**Day 1 - Admin Creates Plan**:
```
Admin creates "Premium Hospital Plan":
  - Name: "Premium Hospital Plan"
  - Tier: "premium"
  - User Role: "hospital"
  - Features:
    - maxPatientsPerMonth: 500
    - maxAssignmentsPerMonth: 200
    - includesPremiumDoctors: true
```

**Day 2 - Admin Adds Pricing**:
```
Admin adds 3 pricing options:

1. Monthly:
   - price: $200/month
   - billing_period_months: 1

2. Quarterly:
   - price: $540/quarter ($180/month, 10% off)
   - billing_period_months: 3

3. Yearly:
   - price: $2,160/year ($180/month, 20% off)
   - billing_period_months: 12
```

**Day 5 - User A Subscribes (Monthly)**:
```
User A selects:
  - Plan: "Premium Hospital Plan"
  - Billing: Monthly

Subscription created:
  - price_at_purchase: $200
  - billing_cycle: "monthly"
  - billing_period_months: 1
  - start_date: Day 5
  - end_date: Day 5 + 1 month
  - features_at_purchase: {maxPatients: 500, ...}
```

**Day 10 - User B Subscribes (Yearly)**:
```
User B selects:
  - Plan: "Premium Hospital Plan"
  - Billing: Yearly

Subscription created:
  - price_at_purchase: $2,160
  - billing_cycle: "yearly"
  - billing_period_months: 12
  - start_date: Day 10
  - end_date: Day 10 + 12 months
  - features_at_purchase: {maxPatients: 500, ...}
```

**Day 20 - Admin Updates Plan**:
```
Admin changes:
  - Price: Monthly now $250 (was $200)
  - Features: maxPatientsPerMonth now 600 (was 500)

What happens:
  - User A: Still pays $200, still has 500 patients limit
  - User B: Still pays $2,160, still has 500 patients limit
  - New users: Pay $250, get 600 patients limit
```

**Day 365 - User B Renews**:
```
User B's subscription expires:
  - Old subscription: $2,160/year, 500 patients
  - Current plan price: $2,700/year (new price)
  - Current plan features: 600 patients

Renewal options:
  - Option 1: Keep $2,160, keep 500 patients (grandfathered)
  - Option 2: Pay $2,700, get 600 patients (upgrade)
  - Option 3: User chooses
```

---

## 🔍 How to Query Data

### Get All Plans with Pricing Options

```sql
SELECT 
  sp.id,
  sp.name,
  sp.tier,
  pp.billing_cycle,
  pp.price,
  pp.currency,
  pp.billing_period_months
FROM subscription_plans sp
LEFT JOIN plan_pricing pp ON sp.id = pp.plan_id
WHERE sp.is_active = true
  AND pp.is_active = true
ORDER BY sp.name, pp.billing_period_months;
```

**Result**:
```
Enterprise Plan | monthly   | $500  | 1 month
Enterprise Plan | quarterly | $1,350| 3 months
Enterprise Plan | yearly    | $5,400| 12 months
Basic Plan      | monthly   | $100  | 1 month
Basic Plan      | yearly    | $1,000| 12 months
```

---

### Get User's Active Subscription

```sql
SELECT 
  s.id,
  s.plan_snapshot->>'plan_name' as plan_name,
  s.price_at_purchase,
  s.currency_at_purchase,
  s.billing_cycle,
  s.start_date,
  s.end_date,
  s.features_at_purchase
FROM subscriptions s
WHERE s.user_id = 'user-123'
  AND s.status = 'active';
```

**Result**:
```
plan_name: "Enterprise Doctor Plan"
price_at_purchase: 540000 (cents = $5,400)
currency: "USD"
billing_cycle: "yearly"
start_date: "2025-12-08"
end_date: "2026-12-08"
features: {"maxAssignments": -1, "visibilityWeight": 10}
```

---

### Get Pricing Options for a Plan

```sql
SELECT 
  billing_cycle,
  billing_period_months,
  price,
  currency,
  discount_percentage,
  (price / billing_period_months) as monthly_equivalent
FROM plan_pricing
WHERE plan_id = 'plan-123'
  AND is_active = true
  AND (valid_until IS NULL OR valid_until > NOW())
ORDER BY billing_period_months;
```

**Result**:
```
monthly   | 1  | $500  | 0%  | $500/month
quarterly | 3  | $1,350| 10% | $450/month
yearly    | 12 | $5,400| 20% | $450/month
```

---

## ✅ Benefits of Approach 3

### 1. Maximum Flexibility
- ✅ One plan, multiple pricing options
- ✅ Easy to add new billing cycles
- ✅ Easy to change prices without affecting plan
- ✅ Support for promotions and discounts

### 2. Historical Accuracy
- ✅ Complete snapshot at purchase time
- ✅ Know exactly what user paid for
- ✅ Audit trail for compliance
- ✅ Support and billing accuracy

### 3. Plan Independence
- ✅ Subscription works even if plan is deleted
- ✅ Subscription works even if plan changes
- ✅ No dependency on current plan state
- ✅ Can migrate users between plans

### 4. Scalability
- ✅ Easy to add regional pricing
- ✅ Easy to add promotional pricing
- ✅ Easy to add usage-based pricing
- ✅ Easy to add team/organization pricing

### 5. Customer Protection
- ✅ Users keep locked-in price
- ✅ Users keep locked-in features
- ✅ No surprises on renewals
- ✅ Transparent pricing

---

## ⚠️ Considerations

### 1. More Complex Queries
- Need to join multiple tables
- Need to handle pricing history
- Need to check valid_from/valid_until dates

### 2. More Storage
- Storing complete snapshot uses more space
- JSON fields can be large
- Need to index properly

### 3. Migration Complexity
- Need to migrate existing data
- Need to backfill snapshots
- Need to handle edge cases

### 4. Code Complexity
- More tables to manage
- More relationships to handle
- More validation logic needed

---

## 🎯 When to Use Approach 3

### ✅ Use Approach 3 If:
- You have multiple billing cycles (monthly, yearly, etc.)
- You need price history and audit trails
- You want to protect users from plan changes
- You need flexibility for promotions
- You plan to scale internationally
- You need compliance and audit requirements

### ❌ Don't Use Approach 3 If:
- You only have one billing cycle (monthly only)
- You have very simple pricing
- You don't need price history
- You want the simplest possible system
- You have limited development resources

---

## 📊 Comparison with Other Approaches

| Feature | Approach 1 | Approach 2 | Approach 3 |
|---------|-----------|------------|------------|
| **Flexibility** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Simplicity** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Price History** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Multiple Billing** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **User Protection** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Scalability** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🚀 Summary

**Approach 3 (Hybrid)** is the most flexible and robust solution:

1. **Plans are generic** - Define features, not pricing
2. **Pricing is separate** - Multiple options per plan
3. **Subscriptions store everything** - Complete snapshot at purchase
4. **Users are protected** - Locked-in price and features
5. **System is scalable** - Easy to add new billing cycles, regions, promotions

It's more complex than simpler approaches, but it gives you:
- ✅ Maximum flexibility
- ✅ Historical accuracy
- ✅ User protection
- ✅ Audit compliance
- ✅ Future-proof architecture

Perfect for production SaaS applications that need to scale and handle real-world billing scenarios.

