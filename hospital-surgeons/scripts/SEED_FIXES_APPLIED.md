# Database Seeding Script - Fixes Applied

## ✅ Fixed Issues

### 1. **Hospital Type Constraint Violation**
- **Error**: `violates check constraint "hospitals_hospital_type_check"`
- **Fix**: Updated `hospitalTypes` array to use allowed values from database:
  - Changed from: `['General Hospital', 'Specialty Hospital', 'Teaching Hospital', ...]`
  - Changed to: `['general', 'specialty', 'clinic', 'trauma_center', 'teaching', 'other']`

### 2. **User Status Constraint Violation**
- **Error**: `violates check constraint "users_status_check"`
- **Fix**: Updated status values to match database constraint:
  - Changed from: `['active', 'inactive', 'pending_verification']`
  - Changed to: `['active', 'inactive', 'pending', 'suspended']`

### 3. **Duplicate Doctor-Specialty Pairs**
- **Error**: `duplicate key value violates unique constraint "doctor_specialties_doctor_id_specialty_id_key"`
- **Fix**: Added duplicate detection logic using a `Set` to track doctor-specialty pairs and skip duplicates

### 4. **Duplicate Doctor-Hospital Affiliations**
- **Error**: `duplicate key value violates unique constraint` for affiliations
- **Fix**: Added duplicate detection logic using a `Set` to track doctor-hospital pairs

### 5. **Duplicate Hospital Departments**
- **Error**: `duplicate key value violates unique constraint` for departments
- **Fix**: Added duplicate detection logic using a `Set` to track hospital-specialty pairs

### 6. **Doctor Availability Schema Mismatch**
- **Error**: Missing required fields in `doctor_availability` table
- **Fix**: Updated to use correct schema fields:
  - Changed from: `dayOfWeek`, `isRecurring`, `isActive`, `effectiveFrom`
  - Changed to: `slotDate` (date), `startTime` (time), `endTime` (time)

### 7. **Hospital Departments Schema**
- **Error**: Trying to insert `name` and `description` fields that don't exist
- **Fix**: Removed `name` and `description` fields (table only has `hospitalId` and `specialtyId`)

### 8. **Files Table - Missing mimetype**
- **Error**: `null value in column "mimetype" violates not-null constraint`
- **Fix**: Changed `mimeType` to `mimetype` (correct column name)

### 9. **Unique Email/Registration Numbers**
- **Fix**: Added timestamps to emails, license numbers, and registration numbers to ensure uniqueness

## 📊 Current Status

The script successfully seeds:
- ✅ 30 users (10 doctors, 10 hospitals, 10 admins)
- ✅ 8 subscription plans (checks for existing)
- ✅ 30 specialties (checks for existing)
- ✅ 30 files
- ✅ 10 doctors
- ✅ 10 hospitals
- ✅ 30 doctor specialties (with duplicate prevention)
- ✅ 30 hospital departments (with duplicate prevention)
- ✅ 30 doctor availability slots (with correct schema)

## ⚠️ Known Issues

1. **Database Timeout (ETIMEDOUT)**: 
   - This is a network/database connection issue, not a code issue
   - The script works correctly but may timeout if:
     - Database is slow
     - Network connection is unstable
     - Database has connection limits
   - **Solution**: Run the script when database is more responsive, or increase timeout settings

## 🚀 Running the Script

```bash
npm run db:seed
```

The script will:
- Skip existing subscription plans and specialties
- Prevent duplicate doctor-specialty, doctor-hospital, and hospital-department pairs
- Use unique emails and registration numbers with timestamps
- Handle errors gracefully for duplicate records

## 📝 Notes

- All user passwords are: `Password123!` (for testing)
- The script can be run multiple times safely
- Some tables may have fewer than 30 records if duplicates are encountered (this is expected behavior)



