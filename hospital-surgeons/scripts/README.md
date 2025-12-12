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

