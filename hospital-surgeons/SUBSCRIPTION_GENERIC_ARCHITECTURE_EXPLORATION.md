# Generic Subscription Architecture - Exploration & Options

## Problem Statement

Currently, plans are created without specifying billing cycles, and subscriptions are hardcoded to 1 month. We need a **generic, flexible system** where:

1. Plans are created **without being tied to a specific billing cycle**
2. Plans can support **multiple billing options** (monthly, quarterly, yearly)
3. Users can **choose their billing preference** when subscribing
4. Backend can **calculate prices dynamically** based on selected plan + billing cycle
5. System is **scalable** for future billing models

---

## 🎯 Core Design Principles

### 1. Separation of Concerns
- **Plan** = What features/limits are included
- **Billing Cycle** = How often user pays
- **Subscription** = User's active purchase (plan + billing cycle + dates)

### 2. Flexibility
- One plan can have multiple pricing tiers (monthly vs yearly)
- Plans define capabilities, not payment frequency
- Billing is a separate dimension

### 3. Extensibility
- Easy to add new billing cycles
- Easy to add usage-based pricing
- Easy to add discounts/promotions

---

## 🏗️ Architecture Option 1: Plan with Multiple Billing Tiers

### Concept
One plan has multiple pricing options (monthly, quarterly, yearly).

### Structure

```
subscription_plans:
  - id
  - name: "Enterprise Doctor Plan"
  - tier: "enterprise"
  - user_role: "doctor"
  - features: { ... }
  - is_active: true

plan_pricing_tiers:  ⭐ NEW TABLE
  - id
  - plan_id
  - billing_cycle: "monthly" | "quarterly" | "yearly"
  - billing_period_months: 1 | 3 | 12
  - price: 500
  - currency: "USD"
  - discount_percentage: 0 (yearly might have 10% discount)
  - is_active: true
```

### Example Data

**Plan**: "Enterprise Doctor Plan"
```
plan_pricing_tiers:
  - plan_id: "enterprise-plan-id"
    billing_cycle: "monthly"
    billing_period_months: 1
    price: 500
    currency: "USD"
    
  - plan_id: "enterprise-plan-id"
    billing_cycle: "quarterly"
    billing_period_months: 3
    price: 1350  (450/month, 10% discount)
    currency: "USD"
    
  - plan_id: "enterprise-plan-id"
    billing_cycle: "yearly"
    billing_period_months: 12
    price: 5400  (450/month, 20% discount)
    currency: "USD"
```

### Pros
- ✅ One plan, multiple pricing options
- ✅ Easy to add discounts for longer commitments
- ✅ Clear separation of plan features vs pricing
- ✅ Users see all options when subscribing

### Cons
- ⚠️ More complex data model
- ⚠️ Need to manage pricing tiers separately
- ⚠️ More tables to query

---

## 🏗️ Architecture Option 2: Billing Cycle as Plan Attribute

### Concept
Plan stores base price, billing cycles are calculated dynamically.

### Structure

```
subscription_plans:
  - id
  - name: "Enterprise Doctor Plan"
  - tier: "enterprise"
  - user_role: "doctor"
  - base_price_monthly: 500  ⭐ Base monthly price
  - currency: "USD"
  - features: { ... }
  - billing_cycles_available: ["monthly", "quarterly", "yearly"]  ⭐ JSON array
  - discount_quarterly: 0.10  ⭐ 10% discount
  - discount_yearly: 0.20      ⭐ 20% discount
```

### Pricing Calculation Logic
```
monthly_price = base_price_monthly
quarterly_price = (base_price_monthly * 3) * (1 - discount_quarterly)
yearly_price = (base_price_monthly * 12) * (1 - discount_yearly)
```

### Pros
- ✅ Simpler data model (one table)
- ✅ Easy to calculate prices dynamically
- ✅ Flexible discount structure
- ✅ Easy to add new billing cycles

### Cons
- ⚠️ Discount logic in application code
- ⚠️ Less flexible for custom pricing
- ⚠️ Harder to set exact prices (not calculated)

---

## 🏗️ Architecture Option 3: Hybrid Approach (Recommended)

### Concept
Plans define features, separate pricing table with flexible structure.

### Structure

```
subscription_plans:
  - id
  - name: "Enterprise Doctor Plan"
  - tier: "enterprise"
  - user_role: "doctor"
  - features: { ... }
  - is_active: true
  - default_billing_cycle: "monthly"  ⭐ Default option

plan_pricing:  ⭐ Flexible pricing table
  - id
  - plan_id
  - billing_cycle: "monthly" | "quarterly" | "yearly" | "custom"
  - billing_period_months: INTEGER
  - price: DECIMAL
  - currency: "USD"
  - setup_fee: DECIMAL (optional, one-time)
  - discount_percentage: DECIMAL (optional)
  - is_active: true
  - valid_from: TIMESTAMP (for price changes)
  - valid_until: TIMESTAMP (nullable)
```

### Example

**Plan**: "Enterprise Doctor Plan"
```
plan_pricing entries:
  1. monthly:   1 month,  $500, 0% discount
  2. quarterly: 3 months, $1350, 10% discount
  3. yearly:    12 months, $5400, 20% discount
```

### Pros
- ✅ Most flexible approach
- ✅ Supports custom billing periods
- ✅ Price history (valid_from/valid_until)
- ✅ Can add setup fees, discounts
- ✅ Easy to query available options

### Cons
- ⚠️ More complex queries
- ⚠️ Need to handle price changes over time

---

## 🔄 Backend Price Calculation Route

### Option A: Calculate from Plan + Billing Cycle

**Endpoint**: `GET /api/subscriptions/plans/:planId/pricing`

**Query Parameters**:
- `billing_cycle`: "monthly" | "quarterly" | "yearly"
- `currency`: "USD" (optional, defaults to plan currency)

**Response**:
```json
{
  "success": true,
  "data": {
    "plan_id": "xxx",
    "plan_name": "Enterprise Doctor Plan",
    "billing_cycle": "yearly",
    "billing_period_months": 12,
    "price": 5400,
    "currency": "USD",
    "monthly_equivalent": 450,
    "discount_percentage": 20,
    "savings": 600,
    "features": { ... }
  }
}
```

### Option B: Get All Available Pricing Options

**Endpoint**: `GET /api/subscriptions/plans/:planId/pricing-options`

**Response**:
```json
{
  "success": true,
  "data": {
    "plan_id": "xxx",
    "plan_name": "Enterprise Doctor Plan",
    "pricing_options": [
      {
        "billing_cycle": "monthly",
        "billing_period_months": 1,
        "price": 500,
        "currency": "USD",
        "monthly_equivalent": 500
      },
      {
        "billing_cycle": "quarterly",
        "billing_period_months": 3,
        "price": 1350,
        "currency": "USD",
        "monthly_equivalent": 450,
        "discount_percentage": 10,
        "savings": 150
      },
      {
        "billing_cycle": "yearly",
        "billing_period_months": 12,
        "price": 5400,
        "currency": "USD",
        "monthly_equivalent": 450,
        "discount_percentage": 20,
        "savings": 600
      }
    ]
  }
}
```

### Option C: Calculate Custom Pricing

**Endpoint**: `POST /api/subscriptions/plans/:planId/calculate-price`

**Request Body**:
```json
{
  "billing_cycle": "yearly",
  "currency": "USD",
  "promo_code": "SAVE20" (optional),
  "quantity": 1 (for team plans)
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "base_price": 6000,
    "discount_amount": 600,
    "promo_discount": 0,
    "final_price": 5400,
    "currency": "USD",
    "billing_period_months": 12,
    "monthly_equivalent": 450,
    "breakdown": {
      "base": 6000,
      "billing_discount": -600,
      "promo_discount": 0,
      "total": 5400
    }
  }
}
```

---

## 📋 Plan Creation Flow (Generic)

### Step 1: Create Plan (No Billing Info)
```
Admin creates plan:
  - Name: "Enterprise Doctor Plan"
  - Tier: "enterprise"
  - User Role: "doctor"
  - Features: { maxAssignments: -1, visibilityWeight: 10 }
  - NO billing cycle specified
  - NO price specified
```

### Step 2: Add Pricing Tiers (Separate Step)
```
Admin adds pricing options:
  - Monthly: $500/month
  - Quarterly: $1350/quarter (10% off)
  - Yearly: $5400/year (20% off)
```

### Step 3: User Subscribes
```
User selects:
  - Plan: "Enterprise Doctor Plan"
  - Billing Cycle: "yearly"
  
System:
  1. Fetches plan features
  2. Fetches pricing for "yearly" cycle
  3. Calculates dates (start_date = now, end_date = now + 12 months)
  4. Creates subscription with locked-in price
```

---

## 🎨 Frontend Flow (Generic)

### Plan Selection Screen
```
┌─────────────────────────────────────┐
│ Enterprise Doctor Plan              │
│                                     │
│ Features:                           │
│ ✓ Unlimited assignments             │
│ ✓ High visibility                  │
│                                     │
│ Choose Billing:                     │
│ ○ Monthly    $500/month            │
│ ○ Quarterly  $450/month (Save 10%) │
│ ● Yearly     $450/month (Save 20%) │
│                                     │
│ [Subscribe to Yearly]               │
└─────────────────────────────────────┘
```

### What Happens:
1. User sees plan features (from `subscription_plans`)
2. User sees pricing options (from `plan_pricing` or calculated)
3. User selects billing cycle
4. Frontend calls: `GET /api/subscriptions/plans/:id/pricing?billing_cycle=yearly`
5. Backend returns calculated price
6. User confirms and subscribes

---

## 🔍 Advanced Considerations

### 1. Usage-Based Pricing
Some plans might have:
- Base price + usage charges
- Per-assignment pricing
- Tiered usage (first 100 free, then $X per 100)

**Structure**:
```
plan_pricing:
  - base_price: 500
  - usage_type: "metered" | "tiered" | "flat"
  - usage_limits: { ... }
  - overage_rates: { ... }
```

### 2. Promotional Pricing
- Limited-time discounts
- Promo codes
- First-month free

**Structure**:
```
promotions:
  - code: "SAVE20"
  - discount_type: "percentage" | "fixed"
  - discount_value: 20
  - valid_for_plans: [...]
  - valid_until: TIMESTAMP
```

### 3. Regional Pricing
- Different prices for different countries
- Currency conversion
- Local payment methods

**Structure**:
```
plan_pricing:
  - price_usd: 500
  - price_eur: 450
  - price_inr: 40000
  - region: "global" | "us" | "eu" | "in"
```

### 4. Team/Organization Plans
- Per-user pricing
- Volume discounts
- Custom enterprise pricing

**Structure**:
```
plan_pricing:
  - pricing_model: "per_user" | "flat" | "tiered"
  - base_users: 1
  - price_per_user: 50
  - volume_discounts: { ... }
```

---

## 🗄️ Recommended Database Schema (Generic)

### subscription_plans (Core Plan Definition)
```
- id
- name
- tier
- user_role
- features (JSON)
- description
- is_active
- created_at
- updated_at
```

### plan_pricing (Pricing Options)
```
- id
- plan_id (FK to subscription_plans)
- billing_cycle: ENUM('monthly', 'quarterly', 'yearly', 'custom')
- billing_period_months: INTEGER
- price: DECIMAL
- currency: VARCHAR(3)
- setup_fee: DECIMAL (nullable, one-time)
- discount_percentage: DECIMAL (default 0)
- is_active: BOOLEAN
- valid_from: TIMESTAMP
- valid_until: TIMESTAMP (nullable)
- created_at
- updated_at

UNIQUE(plan_id, billing_cycle)  -- One pricing per cycle per plan
```

### subscriptions (User's Active Subscription)
```
- id
- user_id
- plan_id
- billing_cycle: VARCHAR (copied from plan_pricing)
- start_date: TIMESTAMP
- end_date: TIMESTAMP
- price_at_purchase: DECIMAL (locked-in price)
- currency_at_purchase: VARCHAR
- billing_period_months: INTEGER (copied from plan_pricing)
- status
- auto_renew
- created_at
- updated_at
```

---

## 🔄 API Endpoints Needed

### Plan Management
1. `GET /api/admin/plans` - List all plans
2. `POST /api/admin/plans` - Create plan (no pricing)
3. `GET /api/admin/plans/:id` - Get plan details
4. `PUT /api/admin/plans/:id` - Update plan
5. `DELETE /api/admin/plans/:id` - Delete plan

### Pricing Management
6. `GET /api/admin/plans/:id/pricing` - Get all pricing options for plan
7. `POST /api/admin/plans/:id/pricing` - Add pricing tier
8. `PUT /api/admin/plans/:id/pricing/:pricingId` - Update pricing
9. `DELETE /api/admin/plans/:id/pricing/:pricingId` - Remove pricing option

### Public/User Endpoints
10. `GET /api/subscriptions/plans` - List available plans (with pricing)
11. `GET /api/subscriptions/plans/:id` - Get plan details
12. `GET /api/subscriptions/plans/:id/pricing-options` - Get all pricing options
13. `GET /api/subscriptions/plans/:id/pricing?billing_cycle=yearly` - Calculate specific price
14. `POST /api/subscriptions/plans/:id/calculate-price` - Calculate with discounts/promos

### Subscription Management
15. `POST /api/subscriptions` - Create subscription (with plan_id + billing_cycle)
16. `GET /api/subscriptions` - List user's subscriptions
17. `PUT /api/subscriptions/:id` - Update subscription
18. `DELETE /api/subscriptions/:id` - Cancel subscription

---

## 💡 Implementation Strategy

### Phase 1: Basic Generic Structure
1. Keep `subscription_plans` as-is (features only)
2. Create `plan_pricing` table
3. Add pricing calculation endpoint
4. Update subscription creation to accept `billing_cycle`

### Phase 2: Admin Interface
1. Plan creation form (no pricing)
2. Separate pricing management UI
3. Add/edit/remove pricing tiers
4. Preview pricing options

### Phase 3: User Interface
1. Show all billing options when selecting plan
2. Call pricing calculation API
3. Display savings/discounts
4. Handle subscription creation with billing cycle

### Phase 4: Advanced Features
1. Promotional pricing
2. Usage-based pricing
3. Regional pricing
4. Team/organization plans

---

## 🎯 Key Benefits of Generic Approach

### For Admins
- ✅ Create plans without thinking about billing
- ✅ Add multiple pricing options later
- ✅ Change prices without affecting plan features
- ✅ A/B test different pricing strategies

### For Users
- ✅ See all billing options upfront
- ✅ Choose what works for them
- ✅ Understand savings from longer commitments
- ✅ Easy to compare plans

### For System
- ✅ Flexible and extensible
- ✅ Easy to add new billing cycles
- ✅ Supports complex pricing models
- ✅ Scalable architecture

---

## 🤔 Questions to Consider

1. **Should plans always have all billing cycles?**
   - Option A: Yes, every plan has monthly/quarterly/yearly
   - Option B: Admins choose which cycles to offer per plan
   - Recommendation: Option B (more flexible)

2. **How to handle price changes?**
   - Option A: Update existing pricing (affects new subscriptions only)
   - Option B: Create new pricing entry with valid_from date
   - Recommendation: Option B (preserves history)

3. **What if user wants custom billing?**
   - Option A: Only predefined cycles
   - Option B: Allow custom periods (e.g., 6 months)
   - Recommendation: Start with Option A, add Option B later

4. **Should pricing be per currency or converted?**
   - Option A: Store prices in multiple currencies
   - Option B: Store base price, convert on-the-fly
   - Recommendation: Option A (more control, accurate)

5. **How to handle plan upgrades with different cycles?**
   - User on monthly, wants to upgrade to yearly
   - Need proration logic
   - Calculate unused time, apply credit

---

## 📊 Comparison Matrix

| Aspect | Option 1 (Tiers Table) | Option 2 (Plan Attributes) | Option 3 (Hybrid) |
|--------|----------------------|--------------------------|-------------------|
| **Flexibility** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Simplicity** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Extensibility** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Price History** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Query Complexity** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Recommended** | ✅ Good | ✅ Simple | ✅✅ Best |

---

## ✅ Final Recommendation

**Use Option 3 (Hybrid Approach)** with:
- `subscription_plans` for features only
- `plan_pricing` table for flexible pricing
- Pricing calculation API endpoint
- Support for multiple billing cycles per plan
- Price locking in subscriptions

This gives you:
- Maximum flexibility
- Clean separation of concerns
- Easy to extend
- Production-ready architecture

---

## 🚀 Next Steps

1. **Design Review**: Review this document with team
2. **Schema Design**: Finalize database schema
3. **API Design**: Define exact API contracts
4. **Migration Plan**: How to migrate existing data
5. **Implementation**: Start with Phase 1, iterate

---

**Remember**: Start simple, add complexity as needed. You can always add more features later, but it's harder to simplify a complex system.

