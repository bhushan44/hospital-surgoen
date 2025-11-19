# Database Seeding Script

This script seeds all database tables with 30 records each (where applicable) for development and testing purposes.

## Prerequisites

1. Ensure your `.env.local` or `.env` file has the `DATABASE_URL` configured
2. Install dependencies: `npm install`

## Usage

Run the seeding script:

```bash
npm run db:seed
```

## What Gets Seeded

The script creates 30 records for each of the following tables:

1. **Users** (30 records: 10 doctors, 10 hospitals, 10 admins)
2. **Subscription Plans** (8 plans: 4 tiers × 2 roles)
3. **Specialties** (30 medical specialties)
4. **Files** (30 file records)
5. **Doctors** (10 doctor profiles)
6. **Hospitals** (10 hospital profiles)
7. **Doctor Specialties** (30 associations)
8. **Hospital Departments** (30 departments)
9. **Doctor Availability** (30 availability slots)
10. **Doctor Leaves** (30 leave records)
11. **Patients** (30 patient records)
12. **Assignments** (30 assignment/booking records)
13. **Subscriptions** (30 subscription records)
14. **Payment Transactions** (30 payment records)
15. **Assignment Payments** (30 assignment payment records)
16. **Assignment Ratings** (30 rating/review records)
17. **Notifications** (30 notification records)
18. **Support Tickets** (30 support ticket records)
19. **Analytics Events** (30 analytics event records)
20. **User Devices** (30 device records)
21. **Doctor Hospital Affiliations** (30 affiliation records)
22. **Doctor Credentials** (30 credential records)
23. **Orders** (30 order records)
24. **Hospital Plan Features** (8 feature records)
25. **Doctor Plan Features** (8 feature records)
26. **Patient Consents** (30 consent records)

## Data Details

- **Users**: All passwords are set to `Password123!` for testing
- **Emails**: Format `user1@example.com`, `user2@example.com`, etc.
- **Relationships**: All foreign key relationships are properly maintained
- **Dates**: Random dates within the past year for realistic data
- **Statuses**: Random status values based on allowed enum values

## Notes

- The script respects foreign key constraints and creates records in the correct order
- Some tables have fewer than 30 records due to logical constraints (e.g., subscription plans)
- All data is randomly generated but follows realistic patterns
- The script will fail if run multiple times due to unique constraints (email, license numbers, etc.)

## Troubleshooting

If you encounter errors:

1. **Database connection error**: Check your `DATABASE_URL` in `.env.local`
2. **Unique constraint violations**: Clear existing data first or modify the script to handle duplicates
3. **Foreign key errors**: Ensure parent tables are seeded before child tables (script handles this automatically)

## Clearing Data

To clear all seeded data, you can:

1. Use your database management tool to truncate tables
2. Or create a separate cleanup script

## Customization

To modify the number of records or data patterns, edit `scripts/seed-database.ts`:

- Change the loop count (e.g., `for (let i = 0; i < 30; i++)` to `for (let i = 0; i < 50; i++)`)
- Modify the data generation functions at the top of the file
- Adjust the random data ranges and choices



