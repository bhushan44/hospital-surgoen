# Schema Comparison: Introspected vs Current

## 🔍 Key Finding: Different Naming Conventions

The introspected schema (`src/db/drizzle/migrations/schema.ts`) shows the **actual database structure**. The current schema (`lib/db/schema.ts`) has different field names.

---

## 1. HOSPITALS TABLE

### Introspected Schema (Actual DB):
```typescript
{
  id, userId, logoId, name, hospitalType, registrationNumber,
  address, city, latitude, longitude, numberOfBeds,
  contactEmail, contactPhone, websiteUrl, licenseVerificationStatus
}
```

### Current Schema (lib/db/schema.ts):
```typescript
{
  id, userId, name, hospitalType, registrationNumber,
  address, city, state, postalCode, country, location,
  phone, website, profilePhotoUrl, description, numberOfBeds,
  averageRating, totalRatings, isActive, onboardingCompleted,
  onboardingStep, createdAt, updatedAt
}
```

### Differences:
- ✅ **Has in DB**: `logoId`, `contactEmail`, `contactPhone`, `websiteUrl`, `latitude`, `longitude`
- ❌ **Missing in DB**: `state`, `postalCode`, `country`, `location`, `phone`, `website`, `profilePhotoUrl`, `description`, `averageRating`, `totalRatings`, `isActive`, `onboardingCompleted`, `onboardingStep`, `createdAt`, `updatedAt`

### Mapping Needed:
- `phone` → `contactPhone`
- `website` → `websiteUrl`
- Remove: `state`, `postalCode`, `country`, `location`, `profilePhotoUrl`, `description`, `isActive`, `onboardingCompleted`, `onboardingStep`, `averageRating`, `totalRatings`, `createdAt`, `updatedAt`

---

## 2. DOCTORS TABLE

### Introspected Schema (Actual DB):
```typescript
{
  id, userId, profilePhotoId, firstName, lastName,
  medicalLicenseNumber, yearsOfExperience, bio,
  primaryLocation, latitude, longitude,
  licenseVerificationStatus, averageRating, totalRatings,
  completedAssignments
}
```

### Current Schema (lib/db/schema.ts):
```typescript
{
  id, userId, firstName, lastName, profilePhotoUrl,
  medicalLicenseNumber, yearsOfExperience, bio,
  consultationFee, averageRating, totalRatings,
  totalBookings, isAvailable, createdAt
}
```

### Differences:
- ✅ **Has in DB**: `profilePhotoId`, `primaryLocation`, `latitude`, `longitude`, `completedAssignments`
- ❌ **Missing in DB**: `profilePhotoUrl`, `consultationFee`, `totalBookings`, `isAvailable`, `createdAt`

### Mapping Needed:
- `profilePhotoUrl` → `profilePhotoId` (UUID reference, not URL)
- `totalBookings` → `completedAssignments`
- Remove: `consultationFee`, `isAvailable`, `createdAt`

---

## 3. SPECIALTIES TABLE

### Introspected Schema (Actual DB):
```typescript
{
  id, name, description
}
```

### Current Schema (lib/db/schema.ts):
```typescript
{
  id, name, description, isActive, createdAt
}
```

### Differences:
- ❌ **Missing in DB**: `isActive`, `createdAt`

### Mapping Needed:
- Remove: `isActive`, `createdAt`

---

## 4. BOOKINGS TABLE

### Introspected Schema (Actual DB):
**DOES NOT EXIST** - Uses `assignments` table instead

### Current Schema (lib/db/schema.ts):
```typescript
{
  id, hospitalId, doctorId, specialtyId, bookingDate,
  startTime, endTime, duration, status, notes, createdAt
}
```

### Action Required:
- **Use `assignments` table instead of `bookings`**
- Map booking fields to assignment fields

---

## 5. PAYMENTS TABLE

### Introspected Schema (Actual DB):
**DOES NOT EXIST** - Uses `paymentTransactions` and `assignmentPayments` tables instead

### Current Schema (lib/db/schema.ts):
```typescript
{
  id, userId, subscriptionId, bookingId, paymentType,
  amount, status, paymentGateway, gatewayTransactionId,
  paidAt, createdAt
}
```

### Action Required:
- **Use `paymentTransactions` table for subscription payments**
- **Use `assignmentPayments` table for assignment/booking payments**

---

## 6. REVIEWS TABLE

### Introspected Schema (Actual DB):
**DOES NOT EXIST** - Uses `assignmentRatings` table instead

### Current Schema (lib/db/schema.ts):
```typescript
{
  id, bookingId, reviewerId, revieweeId, rating,
  reviewText, createdAt
}
```

### Action Required:
- **Use `assignmentRatings` table instead of `reviews`**
- Map review fields to assignment rating fields

---

## 7. NOTIFICATIONS TABLE

### Introspected Schema (Actual DB):
```typescript
{
  id, recipientType, recipientId, title, message,
  channel, priority, assignmentId, payload,
  createdAt, read
}
```

### Current Schema (lib/db/schema.ts):
```typescript
{
  id, userId, notificationType, title, message,
  channel, isRead, relatedId, createdAt
}
```

### Differences:
- ✅ **Has in DB**: `recipientType`, `recipientId`, `priority`, `assignmentId`, `payload`, `read`
- ❌ **Missing in DB**: `userId`, `notificationType`, `isRead`, `relatedId`

### Mapping Needed:
- `userId` → `recipientId` (where `recipientType = 'user'`)
- `notificationType` → Extract from `payload` or use different approach
- `isRead` → `read`
- `relatedId` → `assignmentId` or extract from `payload`

---

## 8. SUBSCRIPTION_PLANS TABLE

### Introspected Schema (Actual DB):
```typescript
{
  id, name, tier, userRole, price (bigint), currency
}
```

### Current Schema (lib/db/schema.ts):
```typescript
{
  id, name, tier, price (numeric), billingCycle,
  features, isActive, createdAt, updatedAt
}
```

### Differences:
- ✅ **Has in DB**: `userRole`, `currency`
- ❌ **Missing in DB**: `billingCycle`, `features`, `isActive`, `createdAt`, `updatedAt`

### Mapping Needed:
- `price` is `bigint` not `numeric` - handle conversion
- Add `currency` field
- Remove: `billingCycle`, `features`, `isActive`, `createdAt`, `updatedAt`

---

## 9. SUBSCRIPTIONS TABLE

### Introspected Schema (Actual DB):
```typescript
{
  id, userId, planId, orderId, paymentTransactionId,
  status, startDate, endDate, autoRenew,
  createdAt, updatedAt
}
```

### Current Schema (lib/db/schema.ts):
```typescript
{
  id, userId, planId, status, startDate, endDate,
  autoRenew, createdAt, updatedAt
}
```

### Differences:
- ✅ **Has in DB**: `orderId`, `paymentTransactionId`
- ✅ **Matches**: All other fields exist

### Mapping Needed:
- Add `orderId` and `paymentTransactionId` fields

---

## 📋 Summary of Required Changes

### Files to Update:

1. **lib/repositories/hospitals.repository.ts**
   - Map `phone` → `contactPhone`
   - Map `website` → `websiteUrl`
   - Remove all non-existent fields

2. **lib/repositories/doctors.repository.ts**
   - Map `profilePhotoUrl` → `profilePhotoId` (UUID)
   - Map `totalBookings` → `completedAssignments`
   - Remove `consultationFee`, `isAvailable`

3. **lib/repositories/specialties.repository.ts**
   - Remove `isActive`, `createdAt`

4. **lib/repositories/bookings.repository.ts**
   - **REPLACE with assignments repository**
   - Use `assignments` table instead

5. **lib/repositories/payments.repository.ts**
   - **REPLACE with paymentTransactions/assignmentPayments repositories**
   - Use appropriate table based on payment type

6. **lib/repositories/reviews.repository.ts**
   - **REPLACE with assignmentRatings repository**
   - Use `assignmentRatings` table instead

7. **lib/repositories/notifications.repository.ts**
   - Map `userId` → `recipientId` (where `recipientType = 'user'`)
   - Map `isRead` → `read`
   - Handle `payload` JSON field

8. **lib/repositories/subscription_plans.repository.ts**
   - Handle `price` as bigint
   - Add `currency` field
   - Remove non-existent fields

9. **lib/repositories/subscriptions.repository.ts**
   - Add `orderId` and `paymentTransactionId` fields

---

## 🎯 Critical Actions

1. **Replace bookings with assignments**
2. **Replace payments with paymentTransactions/assignmentPayments**
3. **Replace reviews with assignmentRatings**
4. **Fix all field mappings in hospitals, doctors, specialties**
5. **Fix notifications structure**



