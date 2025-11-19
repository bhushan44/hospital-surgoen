# Database Seeding Script Summary

## ✅ Script Created

**File**: `scripts/seed-database.ts`

## 📋 What It Does

Seeds **30 records** into each table (where applicable):

### Main Tables
- ✅ **Users** (30: 10 doctors, 10 hospitals, 10 admins)
- ✅ **Doctors** (10 profiles)
- ✅ **Hospitals** (10 profiles)
- ✅ **Patients** (30)
- ✅ **Assignments** (30)
- ✅ **Specialties** (30)
- ✅ **Files** (30)
- ✅ **Subscriptions** (30)
- ✅ **Payments** (30 payment transactions + 30 assignment payments)
- ✅ **Ratings** (30 assignment ratings)
- ✅ **Notifications** (30)
- ✅ **Support Tickets** (30)
- ✅ **Analytics Events** (30)
- ✅ **User Devices** (30)
- ✅ **Doctor Hospital Affiliations** (30)
- ✅ **Doctor Credentials** (30)
- ✅ **Doctor Availability** (30)
- ✅ **Doctor Leaves** (30)
- ✅ **Orders** (30)
- ✅ **Patient Consents** (30)
- ✅ **Hospital Departments** (30)
- ✅ **Doctor Specialties** (30)
- ✅ **Subscription Plans** (8: checks for existing)
- ✅ **Plan Features** (16: 8 hospital + 8 doctor)

## 🚀 How to Run

```bash
npm run db:seed
```

## ⚙️ Prerequisites

1. **Install tsx** (already added to package.json):
   ```bash
   npm install
   ```

2. **Database Connection**: Ensure `DATABASE_URL` is set in `.env.local` or `.env`

## 🔧 Features

- ✅ **Handles existing data**: Skips duplicates for subscription plans and specialties
- ✅ **Unique values**: Uses timestamps to ensure unique emails, license numbers, etc.
- ✅ **Realistic data**: Random but realistic names, dates, locations
- ✅ **Foreign key relationships**: Maintains all relationships correctly
- ✅ **Error handling**: Better error messages for debugging

## 📝 Test Credentials

All seeded users have the password: **`Password123!`**

Emails format: `user{timestamp}-{number}@example.com`

## ⚠️ Notes

- If you get **timeout errors**, your database connection might be slow. Try running again.
- If you get **duplicate key errors**, some data already exists. The script handles this for plans and specialties, but you may need to clear other tables first.
- The script creates **30 records per table** - adjust the loop counts if you need more/less.

## 🐛 Troubleshooting

1. **ETIMEDOUT errors**: Database connection timeout - check your `DATABASE_URL` and network
2. **Duplicate key errors**: Data already exists - clear tables or modify script
3. **Constraint violations**: Check that all required fields are provided
4. **Foreign key errors**: Ensure parent tables are seeded before child tables (script handles this)

## 📊 Expected Output

```
🌱 Starting database seeding...
⚠️  Note: Script will skip existing records to avoid duplicates

📝 Seeding users...
✅ Created 30 users

📝 Seeding subscription plans...
✅ Using 8 subscription plans

📝 Seeding specialties...
✅ Using 30 specialties

... (continues for all tables)

🎉 Database seeding completed successfully!
```

## 🔄 Re-running

The script can be run multiple times, but:
- **Users, Doctors, Hospitals**: Will create new records each time (unique emails)
- **Subscription Plans, Specialties**: Will reuse existing if found
- **Other tables**: Will create new records (may have duplicates if run multiple times)

To avoid duplicates, you may want to clear tables first or modify the script to check for existing records.



