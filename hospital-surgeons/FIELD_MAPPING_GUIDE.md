# Field Mapping Guide: Current Code → Database

## Quick Reference for Code Updates

---

## HOSPITALS

### In Code (lib/db/schema.ts):
```typescript
phone, website, state, postalCode, country, location,
profilePhotoUrl, description, isActive, onboardingCompleted, onboardingStep
```

### In Database (Actual):
```typescript
contactPhone, websiteUrl, latitude, longitude, logoId
// Missing: state, postalCode, country, location, profilePhotoUrl, 
//          description, isActive, onboardingCompleted, onboardingStep
```

### Mapping:
- `phone` → `contactPhone` ✅
- `website` → `websiteUrl` ✅
- `profilePhotoUrl` → Use `logoId` (UUID reference to files table) ✅
- Remove: `state`, `postalCode`, `country`, `location`, `description`, `isActive`, `onboardingCompleted`, `onboardingStep` ❌

---

## DOCTORS

### In Code (lib/db/schema.ts):
```typescript
profilePhotoUrl, consultationFee, isAvailable, totalBookings
```

### In Database (Actual):
```typescript
profilePhotoId, completedAssignments, primaryLocation, latitude, longitude
// consultationFee is in assignments table, not doctors table
```

### Mapping:
- `profilePhotoUrl` → `profilePhotoId` (UUID reference) ✅
- `totalBookings` → `completedAssignments` ✅
- `consultationFee` → Get from `assignments.consultationFee` ✅
- `isAvailable` → Check `doctorAvailability` table ✅
- Remove: Direct `consultationFee`, `isAvailable` from doctors table ❌

---

## BOOKINGS → ASSIGNMENTS

### In Code (lib/db/schema.ts):
```typescript
bookings {
  hospitalId, doctorId, specialtyId,
  bookingDate, startTime, endTime, duration, status, notes
}
```

### In Database (Actual):
```typescript
assignments {
  hospitalId, doctorId, patientId, availabilitySlotId,
  priority, status, requestedAt, expiresAt,
  actualStartTime, actualEndTime, treatmentNotes,
  consultationFee, cancellationReason, cancelledBy,
  cancelledAt, completedAt, paidAt
}
```

### Mapping:
- `bookingDate` → Get from `doctorAvailability.slotDate` (via `availabilitySlotId`) ✅
- `startTime` → Get from `doctorAvailability.startTime` (via `availabilitySlotId`) ✅
- `endTime` → Get from `doctorAvailability.endTime` (via `availabilitySlotId`) ✅
- `duration` → Calculate from startTime/endTime ✅
- `status` → `assignments.status` ✅
- `notes` → `assignments.treatmentNotes` ✅
- `specialtyId` → Get from `doctorSpecialties` (via doctorId) ✅
- **NEW**: `patientId`, `priority`, `expiresAt` - Additional features ✅

---

## PAYMENTS → PAYMENT_TRANSACTIONS / ASSIGNMENT_PAYMENTS

### In Code (lib/db/schema.ts):
```typescript
payments {
  userId, subscriptionId, bookingId, paymentType,
  amount, status, paymentGateway, gatewayTransactionId, paidAt
}
```

### In Database (Actual):

#### For Subscriptions:
```typescript
paymentTransactions {
  orderId, paymentGateway, paymentId,
  amount (bigint), currency, status,
  gatewayResponse, verifiedAt, refundedAt
}
```

#### For Assignments:
```typescript
assignmentPayments {
  assignmentId, consultationFee, platformCommission,
  doctorPayout, paymentStatus, paidToDoctorAt
}
```

### Mapping:
- **Subscription payments**: Use `paymentTransactions` (via `orderId` → `orders` → `subscriptions`) ✅
- **Assignment payments**: Use `assignmentPayments` (via `assignmentId`) ✅
- `amount` → `bigint` not `numeric` (handle conversion) ✅
- `gatewayTransactionId` → `paymentId` in paymentTransactions ✅
- **NEW**: `platformCommission`, `doctorPayout` - Better tracking ✅

---

## REVIEWS → ASSIGNMENT_RATINGS

### In Code (lib/db/schema.ts):
```typescript
reviews {
  bookingId, reviewerId, revieweeId, rating, reviewText
}
```

### In Database (Actual):
```typescript
assignmentRatings {
  assignmentId, hospitalId, doctorId,
  rating, reviewText, positiveTags, negativeTags
}
```

### Mapping:
- `bookingId` → `assignmentId` ✅
- `reviewerId` → `hospitalId` or `doctorId` (depending on who reviewed) ✅
- `revieweeId` → `doctorId` or `hospitalId` (depending on who was reviewed) ✅
- `rating` → `rating` ✅
- `reviewText` → `reviewText` ✅
- **NEW**: `positiveTags`, `negativeTags` - Additional features ✅

---

## SPECIALTIES

### In Code (lib/db/schema.ts):
```typescript
specialties {
  name, description, isActive, createdAt
}
```

### In Database (Actual):
```typescript
specialties {
  name, description
}
```

### Mapping:
- `name` → `name` ✅
- `description` → `description` ✅
- Remove: `isActive`, `createdAt` ❌

---

## NOTIFICATIONS

### In Code (lib/db/schema.ts):
```typescript
notifications {
  userId, notificationType, title, message,
  channel, isRead, relatedId, createdAt
}
```

### In Database (Actual):
```typescript
notifications {
  recipientType, recipientId, title, message,
  channel, priority, assignmentId, payload,
  read, createdAt
}
```

### Mapping:
- `userId` → `recipientId` (where `recipientType = 'user'`) ✅
- `notificationType` → Store in `payload` JSON or derive from context ✅
- `isRead` → `read` ✅
- `relatedId` → `assignmentId` or extract from `payload` ✅
- **NEW**: `recipientType` (can target roles/all), `priority` ✅

---

## SUBSCRIPTION_PLANS

### In Code (lib/db/schema.ts):
```typescript
subscriptionPlans {
  name, tier, price (numeric), billingCycle, features, isActive
}
```

### In Database (Actual):
```typescript
subscriptionPlans {
  name, tier, userRole, price (bigint), currency
}
```

### Mapping:
- `name` → `name` ✅
- `tier` → `tier` ✅
- `price` → `price` (convert to/from bigint) ✅
- **NEW**: `userRole`, `currency` ✅
- Remove: `billingCycle`, `features`, `isActive` ❌

---

## ✅ All Fields Available - Just Need Mapping!

Every field we need exists, just with different names or in different tables. The database structure is actually more comprehensive than our initial design!



