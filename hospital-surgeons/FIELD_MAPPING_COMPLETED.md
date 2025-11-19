# Field Mapping Progress

## ✅ Completed Mappings

### 1. Hospitals Repository & Service
- **phone** → **contactPhone** ✅
- **website** → **websiteUrl** ✅  
- **profilePhotoUrl** → **logoId** (UUID reference) ✅
- Removed non-existent fields: `state`, `postalCode`, `country`, `location`, `description`, `isActive`, `onboardingCompleted`, `onboardingStep`

**Files Updated:**
- `lib/repositories/hospitals.repository.ts`
- `lib/services/hospitals.service.ts`

### 2. Specialties Repository
- Removed **isActive** field references ✅
- Removed **createdAt** sorting (field doesn't exist) ✅
- Removed `toggleSpecialtyStatus` method (depends on isActive)

**Files Updated:**
- `lib/repositories/specialties.repository.ts`

## ⏳ Pending Mappings (More Complex)

### 3. Doctors Repository
- **profilePhotoUrl** → **profilePhotoId** (UUID reference)
- **consultationFee** → Get from `assignments` table (not in doctors table)
- **isAvailable** → Check `doctorAvailability` table
- **totalBookings** → **completedAssignments**

### 4. Bookings → Assignments
- Entire table change: `bookings` → `assignments`
- Field mappings needed for new structure

### 5. Payments → PaymentTransactions/AssignmentPayments
- Split into two tables based on payment type
- Subscription payments → `paymentTransactions`
- Assignment payments → `assignmentPayments`

### 6. Reviews → AssignmentRatings
- Table change: `reviews` → `assignmentRatings`
- Field structure changes

### 7. Notifications
- **userId** → **recipientId** (where `recipientType = 'user'`)
- **isRead** → **read**
- **relatedId** → **assignmentId** or extract from `payload`

## Next Steps

1. Test current changes (hospitals & specialties)
2. Continue with remaining mappings if needed
3. Re-run API tests to verify 100% working



