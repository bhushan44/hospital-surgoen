# Database Seed Scripts

## clear-database.ts

This script clears all data from all tables (except the `users` table).

### Usage

```bash
# Make sure you have DATABASE_URL in your .env file
npx tsx scripts/clear-database.ts
```

## seed-database.ts

This script seeds up to 30 records in each table with realistic test data.

### Usage

```bash
# Make sure you have DATABASE_URL in your .env file
npx tsx scripts/seed-database.ts
```

### Combined Usage

```bash
# Clear and then seed
npx tsx scripts/clear-database.ts && npx tsx scripts/seed-database.ts
```

### What it does

1. **Clears all tables** (except `users`):
   - notifications
   - audit_logs
   - analytics_events
   - support_tickets
   - user_devices
   - notification_preferences
   - subscriptions
   - plan_pricing
   - doctor_plan_features
   - hospital_plan_features
   - subscription_plans
   - bookings
   - assignments
   - doctor_credentials
   - doctor_specialties
   - doctors
   - hospitals
   - payment_transactions
   - orders
   - files
   - specialties

2. **Seeds data** in the following order (respecting dependencies):
   - Specialties (30)
   - Files (30)
   - Subscription Plans (8)
   - Plan Pricing (multiple per plan)
   - Doctor Plan Features
   - Hospital Plan Features
   - Doctors (up to 30, based on existing users)
   - Hospitals (up to 30, based on existing users)
   - Doctor Specialties
   - Subscriptions (30)
   - Orders (30)
   - Payment Transactions (30)
   - Assignments (30)
   - Bookings (30)
   - Notifications (30)
   - Audit Logs (30)
   - Analytics Events (30)
   - Support Tickets (30)
   - Notification Preferences (up to 30)
   - User Devices (30)

### Requirements

- Existing users in the database (the script uses existing users to create doctors and hospitals)
- `DATABASE_URL` environment variable set
- All database migrations applied

### Notes

- The script preserves the `users` table
- It requires at least some users to exist (for creating doctors and hospitals)
- All data is randomly generated but follows realistic patterns
- Foreign key relationships are maintained

## seed-hyderabad-test-data.ts

This script seeds test data specifically for testing the progressive radius feature:
- **30 hospitals** in Hyderabad with exact real-world locations
- **200 doctors** distributed around those hospitals at different distances (0-50km)
- Each doctor has a subscription plan (distributed evenly: 25% free, 25% basic, 25% premium, 25% enterprise)

### Usage

```bash
# Make sure you have DATABASE_URL in your .env file
# First, ensure specialties are seeded (run seed-database.ts or seed-admin-dashboard.ts first)
npx tsx scripts/seed-hyderabad-test-data.ts
```

### What it does

1. **Ensures subscription plans exist** (creates if not present)
2. **Seeds 30 hospitals** in Hyderabad:
   - Uses real hospital names and approximate locations
   - All hospitals are verified
   - Located in Hyderabad, Telangana
3. **Seeds 200 doctors**:
   - Distributed at distances: 0km, 1km, 2km, ..., 49km from hospitals
   - Each doctor has a subscription plan (free, basic, premium, or enterprise)
   - All doctors are verified
   - Each doctor has 1-3 specialties
4. **Creates subscriptions** for all doctors

### Requirements

- `DATABASE_URL` environment variable set
- All database migrations applied
- Specialties should be seeded (run `seed-database.ts` or `seed-admin-dashboard.ts` first)

### Notes

- This script creates new users for hospitals and doctors
- Doctors are distributed evenly around hospitals for accurate distance testing
- Perfect for testing progressive radius fetching functionality
- All doctors have active subscriptions

