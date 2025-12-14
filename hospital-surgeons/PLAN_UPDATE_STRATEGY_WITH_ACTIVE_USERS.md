# Plan Update Strategy: Handling Active Subscriptions

## The Problem

**Scenario**: Admin updates a plan (changes price, features, limits) but there are already active users subscribed to that plan.

**Questions**:
- Should existing users get the new price or keep old price?
- Should existing users get new features or keep old features?
- What happens on renewal?
- How to maintain historical accuracy?

---

## 🎯 Core Principle: Price Locking

### The Golden Rule

**Existing subscriptions should NOT be affected by plan changes until renewal.**

This is how Stripe, AWS, GitHub, and all major SaaS platforms work.

---

## 📊 Two Types of Plan Updates

### Type 1: Price Changes
- Admin increases/decreases plan price
- Example: Basic Plan was ₹499/month, now ₹599/month

### Type 2: Feature Changes
- Admin changes plan features/limits
- Example: Max assignments changed from 100 to 200

---

## 💰 Strategy 1: Price Updates (Recommended)

### How It Works

#### When Admin Updates Plan Price:

1. **Update `plan_pricing` table**:
   - Create NEW pricing entry with `valid_from = now()`
   - Mark old pricing as `valid_until = now()` (or keep active for new subscriptions)
   - OR: Update existing pricing (affects only NEW subscriptions)

2. **Existing Subscriptions**:
   - ✅ Keep their `price_at_purchase` (locked-in price)
   - ✅ Continue paying old price
   - ✅ No changes to their subscription

3. **New Subscriptions**:
   - ✅ Use new price from `plan_pricing`
   - ✅ Lock in new price in their subscription

4. **On Renewal**:
   - **Option A**: Keep locked-in price (grandfathered)
   - **Option B**: Use current plan price (standard)
   - **Option C**: User chooses (upgrade to new price or keep old)

### Example Scenario

```
Timeline:
Day 1:  Admin creates "Basic Plan" at ₹499/month
Day 5:  User A subscribes → price_at_purchase = ₹499
Day 10: User B subscribes → price_at_purchase = ₹499
Day 20: Admin updates plan to ₹599/month
Day 25: User C subscribes → price_at_purchase = ₹599

Result:
- User A: Still pays ₹499 (locked in)
- User B: Still pays ₹499 (locked in)
- User C: Pays ₹599 (new price)
```

### Database Structure

```
plan_pricing:
  - id: 1
  - plan_id: "basic-plan"
  - billing_cycle: "monthly"
  - price: 49900 (cents)
  - valid_from: "2025-01-01"
  - valid_until: "2025-01-20"  ← Old pricing

  - id: 2
  - plan_id: "basic-plan"
  - billing_cycle: "monthly"
  - price: 59900 (cents)
  - valid_from: "2025-01-20"  ← New pricing
  - valid_until: NULL

subscriptions:
  - User A: price_at_purchase = 49900 (locked)
  - User B: price_at_purchase = 49900 (locked)
  - User C: price_at_purchase = 59900 (new price)
```

---

## 🎁 Strategy 2: Feature Updates

### The Challenge

When admin updates plan features, should existing users:
- **Option A**: Get new features immediately (upgrade)
- **Option B**: Keep old features until renewal (locked)
- **Option C**: Get new features but keep old limits (hybrid)

### Recommended Approach: Feature Versioning

#### Concept

Store feature snapshot in subscription, not just reference to plan.

#### Database Structure

```
subscription_plans:
  - id
  - name
  - tier
  - current_features (JSON) ← Current version

plan_features_history:  ⭐ NEW TABLE
  - id
  - plan_id
  - features (JSON) ← Snapshot of features at this time
  - valid_from (TIMESTAMP)
  - valid_until (TIMESTAMP)

subscriptions:
  - id
  - plan_id
  - features_at_purchase (JSON) ← Locked features ⭐
  - price_at_purchase
  - ...
```

#### How It Works

1. **When Admin Updates Plan Features**:
   - Update `subscription_plans.current_features`
   - Create entry in `plan_features_history` with old features
   - Existing subscriptions keep `features_at_purchase`

2. **Feature Access Logic**:
   ```javascript
   // Check subscription features, not plan features
   const userFeatures = subscription.features_at_purchase;
   // NOT: plan.current_features
   ```

3. **On Renewal**:
   - **Option A**: Keep old features (grandfathered)
   - **Option B**: Upgrade to new features (standard)
   - **Option C**: User chooses

### Example Scenario

```
Day 1:  Admin creates plan with maxAssignments = 100
Day 5:  User A subscribes → features_at_purchase = {maxAssignments: 100}
Day 10: Admin updates plan → maxAssignments = 200
Day 15: User B subscribes → features_at_purchase = {maxAssignments: 200}

Result:
- User A: Still has limit of 100 (locked)
- User B: Has limit of 200 (new features)
```

---

## 🔄 Strategy 3: Hybrid Approach (Best Practice)

### Recommended: Store Everything at Purchase Time

#### Subscription Should Store:

```
subscriptions:
  - plan_id (reference)
  - plan_snapshot (JSON) ← Complete plan state at purchase ⭐
    {
      "name": "Basic Plan",
      "tier": "basic",
      "price": 49900,
      "currency": "USD",
      "billing_cycle": "monthly",
      "features": {
        "maxAssignments": 100,
        "visibilityWeight": 5
      }
    }
  - price_at_purchase
  - features_at_purchase
  - billing_cycle
  - billing_period_months
```

#### Benefits:

1. **Complete Historical Record**: Know exactly what user purchased
2. **No Dependency on Plan**: Even if plan is deleted, subscription works
3. **Audit Trail**: Perfect for compliance and support
4. **Flexibility**: Can handle any type of plan change

---

## 🎯 Real-World Scenarios

### Scenario 1: Price Increase

**Admin Action**: Increases plan price from ₹499 to ₹599

**What Happens**:
- ✅ Existing users: Keep paying ₹499
- ✅ New users: Pay ₹599
- ✅ On renewal: User can choose to keep ₹499 or upgrade to ₹599

**Implementation**:
- Update `plan_pricing` with new price
- Existing subscriptions keep `price_at_purchase = 49900`
- New subscriptions get `price_at_purchase = 59900`

---

### Scenario 2: Price Decrease

**Admin Action**: Decreases plan price from ₹599 to ₹499

**What Happens**:
- ✅ Existing users: Can request refund/credit OR keep paying ₹599
- ✅ New users: Pay ₹499
- ⚠️ Consider: Should existing users get automatic discount?

**Options**:
- **Option A**: Keep old price (standard)
- **Option B**: Automatically reduce to new price (customer-friendly)
- **Option C**: Give credit for difference (hybrid)

---

### Scenario 3: Feature Addition

**Admin Action**: Adds new feature (e.g., "Premium Support")

**What Happens**:
- ✅ Existing users: Get new feature immediately (upgrade)
- ✅ New users: Get new feature
- ✅ This is customer-friendly

**Implementation**:
- Check: `subscription.features_at_purchase` OR `plan.current_features`
- If feature exists in current plan but not in subscription → grant it

---

### Scenario 4: Feature Removal

**Admin Action**: Removes feature (e.g., "API Access")

**What Happens**:
- ✅ Existing users: Keep feature (grandfathered)
- ✅ New users: Don't get feature
- ✅ This protects existing customers

**Implementation**:
- Check: `subscription.features_at_purchase`
- If feature exists in subscription → keep it
- If feature doesn't exist in subscription → don't grant it

---

### Scenario 5: Limit Increase

**Admin Action**: Increases maxAssignments from 100 to 200

**What Happens**:
- **Option A**: Existing users keep 100 (locked)
- **Option B**: Existing users get 200 (upgrade) ⭐ Recommended
- **Option C**: User chooses

**Recommendation**: Give upgrade (Option B) - it's customer-friendly and doesn't cost you anything

---

### Scenario 6: Limit Decrease

**Admin Action**: Decreases maxAssignments from 200 to 100

**What Happens**:
- ✅ Existing users: Keep 200 (grandfathered) ⭐ Must do this
- ✅ New users: Get 100
- ⚠️ Never reduce limits for existing users (breach of contract)

---

## 🏗️ Database Schema Recommendations

### Enhanced `subscriptions` Table

```
subscriptions:
  - id
  - user_id
  - plan_id (reference, can be updated)
  - plan_snapshot (JSON) ← Complete plan state at purchase
  - price_at_purchase (BIGINT) ← Locked price
  - currency_at_purchase (TEXT) ← Locked currency
  - billing_cycle (TEXT)
  - billing_period_months (INTEGER)
  - features_at_purchase (JSON) ← Locked features
  - start_date
  - end_date
  - status
  - auto_renew
  - renewal_price_strategy (TEXT) ← 'locked' | 'current' | 'user_choice'
  - created_at
  - updated_at
```

### New `plan_changes_history` Table (Optional but Recommended)

```
plan_changes_history:
  - id
  - plan_id
  - change_type (TEXT) ← 'price', 'features', 'both'
  - old_data (JSON) ← Snapshot before change
  - new_data (JSON) ← Snapshot after change
  - changed_by (UUID) ← Admin user ID
  - changed_at (TIMESTAMP)
  - affected_subscriptions_count (INTEGER)
  - notes (TEXT)
```

**Benefits**:
- Complete audit trail
- Know when/what changed
- Track impact on users
- Rollback capability

---

## 🔄 Renewal Strategies

### When Subscription Renews

**Question**: Should renewal use locked price or current price?

### Option 1: Locked Price Forever (Grandfathered)

```
User subscribed at ₹499
Plan price now ₹599
Renewal: Still ₹499 (forever)
```

**Pros**:
- Customer-friendly
- Rewards loyalty
- Predictable for users

**Cons**:
- Revenue loss over time
- Hard to increase revenue from existing users

**Use Case**: Lifetime deals, early adopters

---

### Option 2: Current Price on Renewal (Standard)

```
User subscribed at ₹499
Plan price now ₹599
Renewal: ₹599 (current price)
```

**Pros**:
- Revenue increases over time
- Simpler logic
- Standard industry practice

**Cons**:
- Users might cancel if price increases
- Less customer-friendly

**Use Case**: Most SaaS companies (Stripe, AWS, etc.)

---

### Option 3: User Choice (Flexible)

```
User subscribed at ₹499
Plan price now ₹599
Renewal: User chooses
  - Keep ₹499 (grandfathered)
  - Upgrade to ₹599 (get new features)
```

**Pros**:
- Maximum flexibility
- Customer-friendly
- Can upsell features

**Cons**:
- More complex UI/logic
- More support questions

**Use Case**: Premium services, enterprise plans

---

## 📋 Implementation Checklist

### When Admin Updates Plan Price:

- [ ] Create new entry in `plan_pricing` with `valid_from = now()`
- [ ] Mark old pricing with `valid_until = now()` (or keep for reference)
- [ ] Existing subscriptions: No changes (keep `price_at_purchase`)
- [ ] New subscriptions: Use new price
- [ ] Log change in `plan_changes_history` (optional)
- [ ] Notify affected users (optional, but recommended for price increases)

### When Admin Updates Plan Features:

- [ ] Update `subscription_plans.current_features`
- [ ] Create entry in `plan_features_history` (optional)
- [ ] Existing subscriptions: 
  - If feature added → grant immediately (upgrade)
  - If feature removed → keep in `features_at_purchase` (grandfathered)
  - If limit increased → upgrade (give more)
  - If limit decreased → keep old limit (protect user)
- [ ] New subscriptions: Use new features
- [ ] Log change in `plan_changes_history` (optional)

### When Subscription Renews:

- [ ] Check `renewal_price_strategy`:
  - If 'locked' → use `price_at_purchase`
  - If 'current' → fetch current price from `plan_pricing`
  - If 'user_choice' → prompt user
- [ ] Check features:
  - Use `features_at_purchase` OR merge with current plan features
- [ ] Create new subscription period
- [ ] Charge user
- [ ] Update subscription dates

---

## ⚠️ Important Considerations

### 1. Never Reduce Existing User Benefits

**Rule**: Once granted, never take away (unless user explicitly agrees).

**Examples**:
- ❌ Don't reduce limits for existing users
- ❌ Don't remove features from existing users
- ✅ Can add new features to existing users
- ✅ Can increase limits for existing users

### 2. Price Increases Need Communication

**Best Practice**: Notify users before price increase takes effect.

**Timeline**:
- 30 days before: Email notification
- 15 days before: Reminder
- Day of: Confirmation

**Message**:
```
"Your plan price will increase from ₹499 to ₹599 
on [date]. You can continue at current price until 
your next renewal on [renewal_date]."
```

### 3. Feature Changes Should Be Backward Compatible

**Rule**: New features should not break existing functionality.

**Example**:
- ✅ Adding "API Access" → Safe, just adds capability
- ⚠️ Changing API format → Could break existing integrations
- ❌ Removing "Email Support" → Breaks existing users

### 4. Handle Plan Deletion

**Scenario**: Admin deletes a plan that has active subscribers.

**Options**:
- **Option A**: Prevent deletion if active subscribers exist
- **Option B**: Mark as inactive, keep for existing users
- **Option C**: Migrate users to new plan

**Recommended**: Option B (mark as inactive)

---

## 🎯 Summary: Best Practices

### For Price Updates:
1. ✅ Lock price in subscription (`price_at_purchase`)
2. ✅ Existing users keep old price
3. ✅ New users get new price
4. ✅ On renewal: Use current price (or let user choose)

### For Feature Updates:
1. ✅ Store features in subscription (`features_at_purchase`)
2. ✅ Add new features to existing users (upgrade)
3. ✅ Keep removed features for existing users (grandfathered)
4. ✅ Increase limits for existing users (upgrade)
5. ✅ Never decrease limits for existing users (protect)

### For Renewals:
1. ✅ Default: Use current plan price
2. ✅ Option: Allow grandfathered pricing
3. ✅ Option: Let user choose
4. ✅ Always preserve feature access

### For Admin Interface:
1. ✅ Show how many users will be affected
2. ✅ Warn before price increases
3. ✅ Preview changes before applying
4. ✅ Log all changes for audit

---

## 🔍 Real-World Examples

### Stripe
- Price changes: Existing subscriptions keep old price until renewal
- Feature changes: Immediate for all users
- Renewal: Uses current plan price

### AWS
- Price changes: Existing resources keep old price (grandfathered)
- Feature changes: Immediate for all users
- Renewal: Uses current pricing

### GitHub
- Price changes: Existing users grandfathered for 1 year
- Feature changes: Immediate for all users
- Renewal: Uses current price after grace period

### Notion
- Price changes: Existing users keep old price (lifetime)
- Feature changes: Immediate for all users
- Renewal: Uses locked price (grandfathered forever)

---

## ✅ Final Recommendation

**Use Hybrid Approach**:

1. **Store Complete Snapshot**: `plan_snapshot` in subscription
2. **Price**: Lock at purchase, use current on renewal
3. **Features**: Lock at purchase, but grant upgrades
4. **Limits**: Lock at purchase, but increase if plan increases
5. **Communication**: Always notify users of changes
6. **Audit**: Log all plan changes

This gives you:
- ✅ Historical accuracy
- ✅ Customer protection
- ✅ Revenue growth
- ✅ Flexibility
- ✅ Compliance

