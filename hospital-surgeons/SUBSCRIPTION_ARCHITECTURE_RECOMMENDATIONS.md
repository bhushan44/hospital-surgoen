# Subscription Architecture Recommendations

## Executive Summary

Your current architecture is **fundamentally correct** for a basic subscription system. However, there are several improvements you should consider to make it production-ready and scalable for real-world billing scenarios.

---

## ✅ What You're Doing Right

1. **Plans store price per billing cycle** - Correct ✅
2. **Subscriptions have start_date and end_date** - Correct ✅
3. **Plans are templates, subscriptions are instances** - Correct ✅
4. **Dates calculated at subscription creation time** - Correct ✅

---

## 🔥 Critical Recommendations

### 1. Add Billing Period to Plans

**Current Issue**: All subscriptions are hardcoded to 1 month duration.

**Recommendation**: Add `billing_period_months` field to `subscription_plans` table.

**Why This Matters**:
- Allows different plans to have different billing cycles
- Enables monthly, quarterly, annual, or custom durations
- Makes the system flexible for future business needs

**Suggested Schema Addition**:
```
subscription_plans:
  - billing_period_months: INTEGER (default: 1)
  - billing_cycle: ENUM('monthly', 'quarterly', 'yearly', 'custom')
```

**Benefits**:
- Monthly plans: `billing_period_months = 1`
- Quarterly plans: `billing_period_months = 3`
- Annual plans: `billing_period_months = 12`
- Custom plans: `billing_period_months = 6` (semi-annual)

---

### 2. Store Price at Purchase Time in Subscriptions

**Current Issue**: Subscription only references plan_id, not the actual price paid.

**Recommendation**: Add `price_at_purchase` field to `subscriptions` table.

**Why This Matters**:
- **Price Lock-in**: If admin increases plan price, existing subscribers keep old price
- **Historical Accuracy**: Invoices and records show what was actually charged
- **Audit Trail**: Compliance and accounting require accurate historical data
- **Renewal Pricing**: Auto-renewals can use locked-in price

**Suggested Schema Addition**:
```
subscriptions:
  - price_at_purchase: DECIMAL (copied from plan.price when subscription created)
  - currency_at_purchase: VARCHAR (copied from plan.currency)
```

**Real-World Example**:
```
2025-01-10: User subscribes to Basic Plan at ₹499/month
  → price_at_purchase = ₹499

2025-06-01: Admin increases Basic Plan to ₹599/month
  → Existing subscribers still pay ₹499
  → New subscribers pay ₹599
```

---

### 3. Implement Proper Billing Cycle Calculation

**Current Implementation**: Hardcoded `endDate.setMonth(endDate.getMonth() + 1)`

**Recommendation**: Calculate based on plan's `billing_period_months`.

**Suggested Logic**:
```
1. Get plan details (including billing_period_months)
2. Calculate end_date based on billing_period_months
3. Handle edge cases (month-end dates, leap years)
```

**Edge Cases to Handle**:
- **Month-end dates**: Jan 31 + 1 month = Feb 28/29 (not Mar 3)
- **Different durations**: 
  - Monthly: +1 month
  - Quarterly: +3 months
  - Yearly: +12 months
  - Custom: +N months

---

### 4. Add Trial Period Support

**Recommendation**: Add `trial_period_days` to plans.

**Why This Matters**:
- Many SaaS products offer free trials
- Users need time to evaluate before paying
- Common practice: 7-day, 14-day, or 30-day trials

**Suggested Schema Addition**:
```
subscription_plans:
  - trial_period_days: INTEGER (default: 0)
  - trial_price: DECIMAL (usually 0)
```

**Logic Flow**:
```
1. If plan has trial_period_days > 0:
   - start_date = now
   - trial_end_date = now + trial_period_days
   - end_date = trial_end_date + billing_period_months
   - status = 'trial' (or 'active' with trial flag)
2. After trial ends:
   - Charge user
   - Update status to 'active'
```

---

### 5. Implement Grace Period for Failed Payments

**Recommendation**: Add grace period handling for expired subscriptions.

**Why This Matters**:
- Payment failures happen (expired cards, insufficient funds)
- Users need time to update payment method
- Prevents immediate service cutoff

**Suggested Approach**:
```
subscriptions:
  - grace_period_ends_at: TIMESTAMP (nullable)
  - payment_failed_at: TIMESTAMP (nullable)
  - status: 'active' | 'past_due' | 'expired' | 'cancelled'
```

**Logic**:
```
1. On renewal failure:
   - Set status = 'past_due'
   - Set grace_period_ends_at = now + 7 days
   - Send payment reminder
2. If grace period expires:
   - Set status = 'expired'
   - Suspend service access
```

---

### 6. Store Billing History Separately

**Recommendation**: Create `subscription_invoices` or `billing_records` table.

**Why This Matters**:
- Track all charges (initial, renewals, upgrades, refunds)
- Generate proper invoices
- Handle tax calculations
- Support accounting and compliance

**Suggested Schema**:
```
subscription_invoices:
  - id
  - subscription_id
  - amount
  - currency
  - billing_period_start
  - billing_period_end
  - status: 'pending' | 'paid' | 'failed' | 'refunded'
  - payment_transaction_id
  - created_at
  - paid_at
```

**Benefits**:
- Complete audit trail
- Easy invoice generation
- Support for partial payments
- Refund tracking

---

### 7. Handle Plan Upgrades/Downgrades

**Recommendation**: Implement prorated billing for plan changes.

**Why This Matters**:
- Users may want to upgrade mid-cycle
- Need to calculate credit for unused time
- Charge difference for upgrade
- Refund difference for downgrade

**Suggested Logic**:
```
When user upgrades/downgrades:

1. Calculate unused time in current subscription
2. Calculate prorated credit = (unused_days / total_days) * current_price
3. Calculate new subscription cost
4. Charge/refund difference
5. Create new subscription with:
   - start_date = now
   - end_date = original_end_date (or extend if upgrade)
   - price_at_purchase = new_plan.price
```

---

### 8. Add Subscription Status Management

**Current**: Basic status field exists.

**Recommendation**: Implement comprehensive status workflow.

**Suggested Statuses**:
```
- 'trial': In trial period (not charged yet)
- 'active': Paid and active
- 'past_due': Payment failed, in grace period
- 'expired': Subscription ended, no access
- 'cancelled': User cancelled (may have access until end_date)
- 'suspended': Admin suspended (temporary)
```

**Status Transitions**:
```
trial → active (after trial ends and payment succeeds)
active → past_due (payment fails)
past_due → active (payment succeeds in grace period)
past_due → expired (grace period ends)
active → cancelled (user cancels, access until end_date)
cancelled → expired (end_date reached)
```

---

### 9. Implement Auto-Renewal Logic

**Current**: `autoRenew` flag exists but logic may not be implemented.

**Recommendation**: Create cron job or scheduled task for renewals.

**Suggested Flow**:
```
1. Daily cron job checks subscriptions:
   - end_date is within 3 days
   - status = 'active'
   - autoRenew = true

2. For each subscription:
   - Attempt payment (use stored payment method)
   - If successful:
     - Create new invoice
     - Update subscription:
       - start_date = old_end_date
       - end_date = start_date + billing_period_months
       - price_at_purchase = current_plan.price (or keep old price?)
   - If failed:
     - Set status = 'past_due'
     - Start grace period
     - Send notification
```

**Considerations**:
- Should renewals use locked-in price or current plan price?
- How many retry attempts before marking as failed?
- Email notifications for successful/failed renewals

---

### 10. Add Subscription Metadata

**Recommendation**: Store additional context about subscriptions.

**Suggested Fields**:
```
subscriptions:
  - cancellation_reason: TEXT (why user cancelled)
  - cancelled_at: TIMESTAMP
  - cancelled_by: ENUM('user', 'admin', 'system')
  - next_billing_date: TIMESTAMP (for clarity)
  - last_payment_date: TIMESTAMP
  - payment_method_id: UUID (reference to payment methods)
  - notes: TEXT (admin notes)
```

---

## 📊 Recommended Database Schema Updates

### subscription_plans (Enhanced)
```
- id
- name
- tier
- user_role
- price                    ✅ (already exists)
- currency                 ✅ (already exists)
- billing_period_months    ⭐ ADD THIS (default: 1)
- billing_cycle            ⭐ ADD THIS ('monthly', 'quarterly', 'yearly')
- trial_period_days        ⭐ ADD THIS (default: 0)
- features                 ✅ (already exists)
- is_active                ⭐ ADD THIS (to disable plans)
- created_at
- updated_at
```

### subscriptions (Enhanced)
```
- id
- user_id                  ✅
- plan_id                  ✅
- start_date               ✅
- end_date                 ✅
- price_at_purchase        ⭐ ADD THIS
- currency_at_purchase     ⭐ ADD THIS
- status                   ✅ (enhance with more statuses)
- auto_renew               ✅
- trial_ends_at            ⭐ ADD THIS (nullable)
- grace_period_ends_at     ⭐ ADD THIS (nullable)
- cancelled_at             ⭐ ADD THIS (nullable)
- cancellation_reason      ⭐ ADD THIS (nullable)
- next_billing_date        ⭐ ADD THIS (computed or stored)
- last_payment_date        ⭐ ADD THIS
- created_at               ✅
- updated_at               ✅
```

### subscription_invoices (New Table)
```
- id
- subscription_id
- invoice_number           (unique, auto-generated)
- amount
- currency
- billing_period_start
- billing_period_end
- status                   ('pending', 'paid', 'failed', 'refunded')
- payment_transaction_id
- tax_amount               (if applicable)
- total_amount
- created_at
- paid_at
- due_date
```

---

## 🎯 Priority Implementation Order

### Phase 1: Critical (Do First)
1. ✅ Add `billing_period_months` to plans
2. ✅ Update date calculation to use `billing_period_months`
3. ✅ Add `price_at_purchase` to subscriptions
4. ✅ Copy price from plan when creating subscription

### Phase 2: Important (Do Soon)
5. ⭐ Implement auto-renewal cron job
6. ⭐ Add grace period handling
7. ⭐ Create subscription_invoices table
8. ⭐ Enhance status management

### Phase 3: Nice to Have (Future)
9. 🔮 Trial period support
10. 🔮 Upgrade/downgrade with proration
11. 🔮 Advanced cancellation reasons
12. 🔮 Subscription analytics

---

## 💡 Best Practices

### 1. Always Store Historical Prices
- Never rely solely on current plan price
- Subscription should remember what was paid
- Enables accurate invoicing and audits

### 2. Use UTC for All Dates
- Store all timestamps in UTC
- Convert to user timezone only for display
- Prevents timezone-related bugs

### 3. Idempotent Operations
- Renewal operations should be idempotent
- Prevent duplicate charges
- Use transaction IDs to track payments

### 4. Soft Deletes
- Don't hard-delete subscriptions
- Mark as cancelled/expired instead
- Preserves historical data

### 5. Audit Logging
- Log all subscription changes
- Track who made changes (user/admin/system)
- Essential for debugging and compliance

---

## 🚨 Common Pitfalls to Avoid

### ❌ Don't: Calculate end_date from plan
```
// WRONG
const endDate = plan.end_date;  // Plans don't have dates!
```

### ❌ Don't: Use current plan price for renewals
```
// WRONG - if plan price changed, user gets wrong price
const renewalAmount = currentPlan.price;
```

### ❌ Don't: Hardcode billing duration
```
// WRONG - not flexible
endDate.setMonth(endDate.getMonth() + 1);  // Always 1 month
```

### ✅ Do: Calculate from billing_period_months
```
// CORRECT
const months = plan.billing_period_months || 1;
endDate.setMonth(endDate.getMonth() + months);
```

### ✅ Do: Store price at purchase
```
// CORRECT
subscription.price_at_purchase = plan.price;
```

---

## 📝 Migration Strategy

If you want to implement these changes:

1. **Add new columns with defaults**
   - `billing_period_months = 1` (backward compatible)
   - `price_at_purchase = NULL` initially

2. **Backfill existing data**
   - Set `billing_period_months = 1` for all existing plans
   - Copy current plan price to `price_at_purchase` for existing subscriptions

3. **Update application code**
   - Modify date calculation logic
   - Update subscription creation to copy price
   - Add new fields to forms/APIs

4. **Test thoroughly**
   - Test with monthly, quarterly, annual plans
   - Test renewals
   - Test price changes
   - Test edge cases (month-end dates)

---

## 🎓 Real-World Examples

### Stripe Model
- Plans have `amount` and `interval` (month/year)
- Subscriptions store `current_period_start` and `current_period_end`
- Invoices track each billing cycle
- Price changes don't affect existing subscriptions

### AWS Model
- Plans define pricing tiers
- Subscriptions track billing periods
- Separate billing records for each charge
- Support for usage-based billing

### GitHub Model
- Plans have monthly/yearly options
- Subscriptions lock in price at purchase
- Prorated billing for upgrades
- Grace period for payment failures

---

## ✅ Final Checklist

Before going to production, ensure:

- [ ] Plans have `billing_period_months` field
- [ ] Subscriptions store `price_at_purchase`
- [ ] Date calculation uses plan's billing period
- [ ] Auto-renewal logic is implemented
- [ ] Grace period handling exists
- [ ] Invoice/billing records are created
- [ ] Status transitions are properly handled
- [ ] Payment failures are handled gracefully
- [ ] Historical data is preserved
- [ ] Audit logging is in place

---

## 📚 Additional Resources

- Stripe Billing Best Practices
- Chargebee Subscription Management Guide
- Recurly Billing Architecture Patterns
- SaaS Subscription Billing Standards

---

**Summary**: Your foundation is solid. Add billing period flexibility, price locking, and proper renewal logic to make it production-ready. Start with Phase 1 items, then gradually add Phase 2 and Phase 3 features as needed.

