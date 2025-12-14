# Subscription Start and End Dates Explanation

## Overview

This document explains how **subscription start dates** and **end dates** are generated in the system, and why they appear in subscriptions but not in subscription plans.

---

## Key Concepts

### 1. **Subscription Plans** vs **Subscriptions**

- **Subscription Plans** (`subscription_plans` table):
  - These are **templates** or **products** that define pricing tiers
  - Examples: "Basic Hospital Plan", "Premium Doctor Plan", "Enterprise Doctor Plan"
  - Plans **do NOT have start/end dates** because they are reusable templates
  - Plans define: name, tier, price, currency, features, and limits
  - Plans are created by admins and remain available for users to subscribe to

- **Subscriptions** (`subscriptions` table):
  - These are **active instances** of a user subscribing to a plan
  - Each subscription **has start_date and end_date** because it represents a specific time period
  - Subscriptions are created when a user selects a plan
  - Multiple users can have subscriptions to the same plan, each with different dates

---

## How Start and End Dates Are Generated

### Exact Code Location

**File**: `app/components/hospital/SubscriptionBilling.tsx`  
**Function**: `handleSelectPlan`  
**Lines**: 116-130

### Complete Code Logic

Here is the **exact code** where dates are calculated:

```typescript
// File: app/components/hospital/SubscriptionBilling.tsx
// Function: handleSelectPlan (starts at line 98)

const handleSelectPlan = async (planId: string) => {
  if (!userId) {
    toast.error('User not found. Please login again.');
    router.push('/login');
    return;
  }

  try {
    setSelectingPlan(planId);
    
    // Get plan details
    const planResponse = await apiClient.get(`/api/subscriptions/plans/${planId}`);
    if (!planResponse.data.success || !planResponse.data.data) {
      throw new Error('Plan not found');
    }

    const plan = planResponse.data.data;
    
    // ============================================
    // ⭐ DATE CALCULATION LOGIC (Lines 116-119)
    // ============================================
    // Calculate dates (1 month subscription)
    const startDate = new Date();              // Line 117: Current date/time
    const endDate = new Date();                // Line 118: Create new date object
    endDate.setMonth(endDate.getMonth() + 1); // Line 119: Add 1 month to end date

    // Create subscription
    // Note: Schema only allows: 'active' | 'expired' | 'cancelled' | 'suspended'
    const subscriptionData = {
      userId: userId,
      planId: planId,
      status: 'active', // All plans start as active
      startDate: startDate.toISOString(),      // Line 127: Convert to ISO string
      endDate: endDate.toISOString(),          // Line 128: Convert to ISO string
      autoRenew: plan.tier !== 'free',         // Line 129: Free plans don't auto-renew
    };

    const createResponse = await apiClient.post('/api/subscriptions', subscriptionData);
    // ... rest of the code
  }
}
```

### Date Calculation Logic Explained

#### Step 1: Create Start Date (Line 117)
```typescript
const startDate = new Date();
```
- Creates a new `Date` object with the **current date and time**
- Example: If user subscribes on `December 8, 2025 at 10:30:45 AM`
  - Result: `2025-12-08T10:30:45.000Z`

#### Step 2: Create End Date Object (Line 118)
```typescript
const endDate = new Date();
```
- Creates another `Date` object (also with current time initially)
- This will be modified in the next step

#### Step 3: Calculate End Date (Line 119)
```typescript
endDate.setMonth(endDate.getMonth() + 1);
```
- **`endDate.getMonth()`**: Gets the current month (0-11, where 0 = January)
- **`+ 1`**: Adds 1 month
- **`setMonth()`**: Sets the month, automatically handling year rollover
- Example: If start date is `December 8, 2025`
  - `getMonth()` returns `11` (December is month 11)
  - `11 + 1 = 12`
  - `setMonth(12)` automatically becomes `January 8, 2026`
  - Result: `2026-01-08T10:30:45.000Z`

#### Step 4: Convert to ISO String (Lines 127-128)
```typescript
startDate: startDate.toISOString(),  // "2025-12-08T10:30:45.000Z"
endDate: endDate.toISOString(),      // "2026-01-08T10:30:45.000Z"
```
- Converts JavaScript `Date` objects to ISO 8601 format strings
- This format is required by the API and database

### How `setMonth()` Works

The `setMonth()` method is smart and handles edge cases:

```javascript
// Example 1: Normal case
const date = new Date('2025-12-08');
date.setMonth(date.getMonth() + 1);
// Result: 2026-01-08 ✅

// Example 2: Year rollover
const date = new Date('2025-11-15');
date.setMonth(date.getMonth() + 1);
// Result: 2025-12-15 ✅

// Example 3: Month with fewer days (handled automatically)
const date = new Date('2025-01-31');
date.setMonth(date.getMonth() + 1);
// Result: 2025-02-28 ✅ (February doesn't have 31 days)
```

### Subscription Duration

- **Currently**: Fixed at **1 month (30 days)**
- **Hardcoded**: Line 119 uses `+ 1` month
- **No configuration**: Duration is not stored in the plan or configurable

---

## Backend Code - How Dates Are Stored

### API Endpoint Receives Dates

**File**: `app/api/subscriptions/route.ts`  
**Function**: `postHandler` (Line 93)

```typescript
async function postHandler(req: NextRequest) {
  try {
    const user = (req as any).user;
    const body = await req.json();
    
    // Use authenticated user's ID
    const subscriptionData = {
      ...body,  // Includes startDate and endDate from frontend
      userId: user.userId,
    };
    
    const subscriptionsService = new SubscriptionsService();
    const result = await subscriptionsService.create(subscriptionData);
    
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error) {
    // error handling
  }
}
```

### Service Layer Passes Dates Through

**File**: `lib/services/subscriptions.service.ts`  
**Function**: `create` (Line 132)

```typescript
async create(dto: CreateSubscriptionData) {
  try {
    const plan = await this.repo.getPlan(dto.planId);
    if (!plan) {
      return {
        success: false,
        message: 'Invalid plan',
      };
    }
    // dto contains: userId, planId, startDate, endDate, status, autoRenew
    const subscription = await this.repo.create(dto);
    return {
      success: true,
      message: 'Subscription created successfully',
      data: subscription,
    };
  } catch (error) {
    // error handling
  }
}
```

### Repository Stores Dates in Database

**File**: `lib/repositories/subscriptions.repository.ts`  
**Function**: `create` (Line 170)

```typescript
async create(dto: CreateSubscriptionData) {
  const [row] = await this.db
    .insert(subscriptions)
    .values({
      userId: dto.userId,
      planId: dto.planId,
      status: (dto.status || 'active') as any,
      startDate: dto.startDate,  // ✅ Stored as-is from frontend
      endDate: dto.endDate,      // ✅ Stored as-is from frontend
      autoRenew: dto.autoRenew ?? true,
    })
    .returning();
  return row;
}
```

**Interface Definition** (Line 17):
```typescript
export interface CreateSubscriptionData {
  userId: string;
  planId: string;
  status?: 'active' | 'expired' | 'cancelled' | 'suspended';
  startDate: string;  // ISO string format
  endDate: string;    // ISO string format
  autoRenew?: boolean;
  bookingsUsed?: number;
}
```

### Database Schema

**File**: `src/db/drizzle/migrations/schema.ts` (Line 215)

```typescript
export const subscriptions = pgTable("subscriptions", {
  id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  userId: uuid("user_id").notNull(),
  planId: uuid("plan_id").notNull(),
  orderId: uuid("order_id"),
  paymentTransactionId: uuid("payment_transaction_id"),
  status: text().default('active').notNull(),
  startDate: timestamp("start_date", { mode: 'string' }).notNull(),  // ✅ Required
  endDate: timestamp("end_date", { mode: 'string' }).notNull(),      // ✅ Required
  autoRenew: boolean("auto_renew").default(true),
  createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});
```

**Key Points**:
- `start_date` and `end_date` are **required** fields (`.notNull()`)
- Stored as `timestamp` type in PostgreSQL
- Mode is `'string'` so they're handled as ISO strings in TypeScript

---

## Complete Subscription Creation Flow

### Step-by-Step Process

1. **User Selects a Plan**
   - User browses available plans
   - Clicks on a plan (e.g., "Enterprise Doctor Plan")

2. **Frontend Calculates Dates** (`SubscriptionBilling.tsx`)
   ```typescript
   const startDate = new Date();
   const endDate = new Date();
   endDate.setMonth(endDate.getMonth() + 1);
   ```

3. **Frontend Creates Subscription Data**
   ```typescript
   const subscriptionData = {
     userId: userId,
     planId: planId,
     status: 'active',
     startDate: startDate.toISOString(),  // "2025-12-08T10:30:00.000Z"
     endDate: endDate.toISOString(),      // "2026-01-08T10:30:00.000Z"
     autoRenew: plan.tier !== 'free',
   };
   ```

4. **API Call** (`POST /api/subscriptions`)
   - Sends subscription data including dates to backend

5. **Backend Service** (`lib/services/subscriptions.service.ts`)
   - Validates the plan exists
   - Creates subscription record

6. **Repository** (`lib/repositories/subscriptions.repository.ts`)
   - Inserts subscription into database with:
     - `start_date`: The calculated start date
     - `end_date`: The calculated end date (1 month later)

---

## Database Schema

### Subscription Plans Table
```sql
subscription_plans
├── id
├── name
├── tier
├── price
├── currency
├── user_role
└── features
-- ❌ NO start_date or end_date (plans are templates)
```

### Subscriptions Table
```sql
subscriptions
├── id
├── user_id
├── plan_id          -- References subscription_plans
├── status
├── start_date       -- ✅ Set when subscription is created
├── end_date         -- ✅ Set when subscription is created (start_date + 1 month)
├── auto_renew
├── created_at
└── updated_at
```

---

## Example Scenario

### Scenario: User Subscribes on December 8, 2025

1. **Plan Created** (by Admin):
   ```
   Plan: "Enterprise Doctor Plan"
   - No dates (it's just a template)
   - Price: $50/month
   ```

2. **User Subscribes** (on Dec 8, 2025 at 10:30 AM):
   ```
   Subscription Created:
   - plan_id: [Enterprise Doctor Plan ID]
   - start_date: "2025-12-08T10:30:00.000Z"
   - end_date: "2026-01-08T10:30:00.000Z"  (1 month later)
   - status: "active"
   ```

3. **Result in Database**:
   ```
   subscriptions table:
   ┌─────────────┬──────────────────────┬──────────────────────┐
   │ User         │ Start Date           │ End Date             │
   ├─────────────┼──────────────────────┼──────────────────────┤
   │ guru@gmail   │ 2025-12-08 10:30:00  │ 2026-01-08 10:30:00  │
   └─────────────┴──────────────────────┴──────────────────────┘
   ```

---

## Why Plans Don't Have Dates

### Plans are Reusable Templates

- A single plan can be subscribed to by **multiple users**
- Each user gets their **own subscription** with **their own dates**
- Example:
  - Plan: "Basic Hospital Plan" (created once by admin)
  - User A subscribes: Dec 1, 2025 → Jan 1, 2026
  - User B subscribes: Dec 15, 2025 → Jan 15, 2026
  - Both use the same plan, but have different subscription periods

### Plans Define "What", Subscriptions Define "When"

- **Plan**: "What features and pricing are available?"
- **Subscription**: "When does this user have access? (start → end)"

---

## Current Implementation Details

### Subscription Duration

- **Currently**: Fixed at **1 month (30 days)**
- **Location**: `SubscriptionBilling.tsx` line 119
- **Code**: `endDate.setMonth(endDate.getMonth() + 1)`

### Future Considerations

If you want to support different subscription durations:

1. **Option 1**: Add `duration_months` field to `subscription_plans` table
   ```sql
   ALTER TABLE subscription_plans 
   ADD COLUMN duration_months INTEGER DEFAULT 1;
   ```

2. **Option 2**: Calculate based on plan tier
   ```typescript
   const durationMonths = plan.tier === 'enterprise' ? 12 : 1;
   endDate.setMonth(endDate.getMonth() + durationMonths);
   ```

---

## Summary

| Aspect | Subscription Plans | Subscriptions |
|-------|-------------------|---------------|
| **Purpose** | Template/Product | Active User Subscription |
| **Has Dates?** | ❌ No | ✅ Yes |
| **Created By** | Admin | User (when subscribing) |
| **Reusable?** | ✅ Yes (many users) | ❌ No (per user) |
| **Start Date** | N/A | Current date when created |
| **End Date** | N/A | Start date + 1 month |

---

## Key Files Reference

- **Frontend Subscription Creation**: `app/components/hospital/SubscriptionBilling.tsx` (lines 116-130)
- **API Endpoint**: `app/api/subscriptions/route.ts` (POST handler)
- **Service Layer**: `lib/services/subscriptions.service.ts` (create method)
- **Repository**: `lib/repositories/subscriptions.repository.ts` (create method)
- **Database Schema**: `src/db/drizzle/migrations/schema.ts` (subscriptions table)

---

## Questions & Answers

**Q: Why do I see start/end dates in subscriptions but not when creating a plan?**  
A: Plans are templates without dates. Dates are generated automatically when a user subscribes to that plan.

**Q: Can I change the subscription duration?**  
A: Currently hardcoded to 1 month. To change, modify `SubscriptionBilling.tsx` or add duration to plan schema.

**Q: What happens when a subscription expires?**  
A: The `status` field changes to `'expired'`. The system can check `end_date` against current date to determine expiration.

**Q: Can a user have multiple subscriptions?**  
A: Yes, but typically only one active subscription at a time. The system should check for existing active subscriptions before creating new ones.

