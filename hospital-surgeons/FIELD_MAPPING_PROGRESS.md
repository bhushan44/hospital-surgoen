# Field Mapping Progress - Complete

## ✅ Completed Mappings

### 1. Hospitals Repository & Service ✅
- **phone** → **contactPhone** ✅
- **website** → **websiteUrl** ✅  
- **profilePhotoUrl** → **logoId** (UUID reference) ✅
- Removed non-existent fields: `state`, `postalCode`, `country`, `location`, `description`, `isActive`, `onboardingCompleted`, `onboardingStep`

**Files Updated:**
- `lib/repositories/hospitals.repository.ts`
- `lib/services/hospitals.service.ts`

### 2. Doctors Repository & Service ✅
- **profilePhotoUrl** → **profilePhotoId** (UUID reference) ✅
- **totalBookings** → **completedAssignments** ✅
- Removed **consultationFee** (it's in assignments table) ✅
- Removed **isAvailable** (check via doctorAvailability table) ✅

**Files Updated:**
- `lib/db/schema.ts` - Updated column mappings
- `lib/repositories/doctors.repository.ts`
- `lib/services/doctors.service.ts`

### 3. Specialties Repository ✅
- Removed **isActive** field references ✅
- Removed **createdAt** sorting (field doesn't exist) ✅
- Removed `toggleSpecialtyStatus` method

**Files Updated:**
- `lib/repositories/specialties.repository.ts`

### 4. New Tables Added to Schema ✅
- **assignments** table (replaces bookings) ✅
- **assignmentPayments** table ✅
- **assignmentRatings** table (replaces reviews) ✅
- **paymentTransactions** table ✅
- Updated **notifications** table column mappings ✅

**Files Updated:**
- `lib/db/schema.ts` - Added new table definitions

## ⏳ Next Steps (Repository Updates Needed)

### 5. Bookings Repository → Assignments Repository
- Update to use `assignments` table instead of `bookings`
- Map fields: `bookingDate` → get from `availabilitySlotId`, `specialtyId` → get from doctorSpecialties

### 6. Payments Repository
- Split logic: subscription payments → `paymentTransactions`, assignment payments → `assignmentPayments`
- Map `amount` → `bigint` conversion

### 7. Reviews Repository → AssignmentRatings Repository
- Update to use `assignmentRatings` table
- Map `bookingId` → `assignmentId`, `reviewerId/revieweeId` → `hospitalId/doctorId`

### 8. Notifications Repository
- Map `userId` → `recipientId` (where `recipientType = 'user'`)
- Map `isRead` → `read`
- Map `relatedId` → `assignmentId` or store in `payload`

## Summary

**Schema Changes:**
- Updated column name mappings in existing tables (hospitals, doctors, specialties, notifications)
- Added new table definitions (assignments, assignmentPayments, assignmentRatings, paymentTransactions)

**Repository Changes:**
- Hospitals: ✅ Complete
- Doctors: ✅ Complete  
- Specialties: ✅ Complete
- Bookings: ⏳ Needs update to use assignments
- Payments: ⏳ Needs update to use paymentTransactions/assignmentPayments
- Reviews: ⏳ Needs update to use assignmentRatings
- Notifications: ⏳ Needs field mapping updates



