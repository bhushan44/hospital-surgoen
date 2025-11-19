# Exact Code Changes Needed

## ⚠️ DO NOT UPDATE SCHEMA
Keep `lib/db/schema.ts` as-is. Update repositories to map fields correctly.

---

## 1. HOSPITALS REPOSITORY

### File: `lib/repositories/hospitals.repository.ts`

#### `createHospital()` method - CHANGE TO:
```typescript
async createHospital(hospitalData: CreateHospitalData, userId: string) {
  try {
    const values: any = {
      userId,
      name: hospitalData.name,
      registrationNumber: hospitalData.registrationNumber,
      address: hospitalData.address,
      city: hospitalData.city,
    };

    // Map to actual database columns
    if (hospitalData.hospitalType) values.hospitalType = hospitalData.hospitalType;
    if (hospitalData.phone) values.contactPhone = hospitalData.phone; // CHANGE: phone → contact_phone
    if (hospitalData.website) values.websiteUrl = hospitalData.website; // CHANGE: website → website_url
    if (hospitalData.numberOfBeds) values.numberOfBeds = hospitalData.numberOfBeds;
    
    // REMOVE these lines (fields don't exist):
    // if (hospitalData.state) values.state = hospitalData.state;
    // if (hospitalData.postalCode) values.postalCode = hospitalData.postalCode;
    // if (hospitalData.country) values.country = hospitalData.country;
    // if (hospitalData.location) values.location = hospitalData.location;
    // if (hospitalData.profilePhotoUrl) values.profilePhotoUrl = hospitalData.profilePhotoUrl;
    // if (hospitalData.description) values.description = hospitalData.description;
    // if (hospitalData.isActive !== undefined) values.isActive = hospitalData.isActive;
    // if (hospitalData.onboardingCompleted !== undefined) values.onboardingCompleted = hospitalData.onboardingCompleted;
    // if (hospitalData.onboardingStep) values.onboardingStep = hospitalData.onboardingStep;

    return await this.db
      .insert(hospitals)
      .values(values)
      .returning();
  } catch (error) {
    console.error('Error creating hospital:', error);
    throw error;
  }
}
```

#### `findHospitals()` method - CHANGE TO:
```typescript
async findHospitals(query: HospitalQuery) {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const offset = (page - 1) * limit;

  // Remove rating/beds sorting (columns don't exist)
  // Use simple name sorting
  const orderByClause = query.sortOrder === 'asc' 
    ? asc(hospitals.name) 
    : desc(hospitals.name);

  return await this.db
    .select({
      hospital: hospitals,
      user: users,
    })
    .from(hospitals)
    .leftJoin(users, eq(hospitals.userId, users.id))
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);
}
```

---

## 2. DOCTORS REPOSITORY

### File: `lib/repositories/doctors.repository.ts`

#### `createDoctor()` method - CHANGE:
```typescript
// If using profilePhotoUrl, convert to profilePhotoId (UUID)
// Remove: consultationFee, isAvailable
// Map: totalBookings → completedAssignments (if used)
```

#### All SELECT queries - CHANGE:
```typescript
// Don't select: consultationFee, isAvailable, totalBookings, createdAt
// Map profilePhotoId back to profilePhotoUrl in response if needed
```

---

## 3. SPECIALTIES REPOSITORY

### File: `lib/repositories/specialties.repository.ts`

#### `createSpecialty()` method - CHANGE TO:
```typescript
async createSpecialty(specialtyData: CreateSpecialtyData) {
  return await this.db
    .insert(specialties)
    .values({
      name: specialtyData.name,
      description: specialtyData.description,
      // REMOVE: isActive (doesn't exist)
    })
    .returning();
}
```

#### `findSpecialties()` method - CHANGE TO:
```typescript
async findSpecialties(query: SpecialtyQuery) {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const offset = (page - 1) * limit;

  // Remove createdAt sorting (doesn't exist)
  // Use name sorting only
  const orderByClause = query.sortOrder === 'asc' 
    ? asc(specialties.name) 
    : desc(specialties.name);

  return await this.db
    .select()
    .from(specialties)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);
}
```

---

## 4. BOOKINGS → ASSIGNMENTS

### File: `lib/repositories/bookings.repository.ts`

**MAJOR CHANGE**: Replace entire file to use `assignments` table instead of `bookings`

#### New structure:
```typescript
// Use assignments table
// Map booking fields:
// - bookingDate → slotDate (from doctorAvailability)
// - startTime/endTime → from doctorAvailability
// - status → assignment status
// - hospitalId, doctorId, patientId → from assignment
```

**OR** create new `lib/repositories/assignments.repository.ts` and update services to use it.

---

## 5. PAYMENTS → PAYMENT_TRANSACTIONS / ASSIGNMENT_PAYMENTS

### File: `lib/repositories/payments.repository.ts`

**MAJOR CHANGE**: Replace to use correct tables

#### For subscription payments:
```typescript
// Use paymentTransactions table
// Link via orderId
```

#### For assignment/booking payments:
```typescript
// Use assignmentPayments table
// Link via assignmentId
```

---

## 6. REVIEWS → ASSIGNMENT_RATINGS

### File: `lib/repositories/reviews.repository.ts`

**MAJOR CHANGE**: Replace to use `assignmentRatings` table

#### Mapping:
```typescript
// bookingId → assignmentId
// reviewerId → hospitalId or doctorId
// revieweeId → doctorId or hospitalId
// rating → rating
// reviewText → reviewText
```

---

## 7. NOTIFICATIONS REPOSITORY

### File: `lib/repositories/notifications.repository.ts`

#### `createNotification()` - CHANGE TO:
```typescript
async createNotification(data: CreateNotificationData) {
  return await this.db
    .insert(notifications)
    .values({
      recipientType: 'user', // or 'role' or 'all'
      recipientId: data.userId, // Map userId → recipientId
      title: data.title,
      message: data.message,
      channel: data.channel,
      priority: data.priority || 'medium',
      assignmentId: data.relatedId, // If related to assignment
      payload: data.payload || {}, // Store notificationType here if needed
      read: false, // Map isRead → read
    })
    .returning();
}
```

#### `findNotifications()` - CHANGE TO:
```typescript
// Filter by recipientId where recipientType = 'user'
// Map read → isRead in response
// Extract notificationType from payload if needed
```

---

## 8. SUBSCRIPTION_PLANS REPOSITORY

### File: `lib/repositories/subscription_plans.repository.ts`

#### `createSubscriptionPlan()` - CHANGE TO:
```typescript
async createSubscriptionPlan(data: CreateSubscriptionPlanData) {
  return await this.db
    .insert(subscriptionPlans)
    .values({
      name: data.name,
      tier: data.tier,
      userRole: data.userRole, // ADD this field
      price: BigInt(data.price), // Convert to bigint
      currency: data.currency || 'USD', // ADD this field
      // REMOVE: billingCycle, features, isActive, createdAt, updatedAt
    })
    .returning();
}
```

---

## 9. SUBSCRIPTIONS REPOSITORY

### File: `lib/repositories/subscriptions.repository.ts`

#### `createSubscription()` - ADD:
```typescript
// Add orderId and paymentTransactionId fields if provided
```

---

## 📝 Quick Reference: Field Mappings

| Current Schema Field | Database Field | Action |
|---------------------|----------------|--------|
| `hospitals.phone` | `hospitals.contact_phone` | Map |
| `hospitals.website` | `hospitals.website_url` | Map |
| `hospitals.state` | ❌ | Remove |
| `hospitals.postalCode` | ❌ | Remove |
| `hospitals.country` | ❌ | Remove |
| `hospitals.location` | ❌ | Remove |
| `hospitals.profilePhotoUrl` | ❌ | Remove |
| `hospitals.description` | ❌ | Remove |
| `hospitals.isActive` | ❌ | Remove |
| `hospitals.onboardingCompleted` | ❌ | Remove |
| `hospitals.onboardingStep` | ❌ | Remove |
| `doctors.profilePhotoUrl` | `doctors.profile_photo_id` | Map (UUID) |
| `doctors.consultationFee` | ❌ | Remove |
| `doctors.isAvailable` | ❌ | Remove |
| `doctors.totalBookings` | `doctors.completed_assignments` | Map |
| `specialties.isActive` | ❌ | Remove |
| `specialties.createdAt` | ❌ | Remove |
| `notifications.userId` | `notifications.recipient_id` | Map |
| `notifications.isRead` | `notifications.read` | Map |
| `notifications.notificationType` | Extract from `payload` | Handle |
| `subscription_plans.price` | `bigint` not `numeric` | Convert |
| `subscription_plans.billingCycle` | ❌ | Remove |
| `subscription_plans.features` | ❌ | Remove |
| `bookings` table | `assignments` table | Replace |
| `payments` table | `payment_transactions` / `assignment_payments` | Replace |
| `reviews` table | `assignment_ratings` table | Replace |

---

## 🚀 Implementation Order

1. **Fix Hospitals** (blocking hospital creation)
2. **Fix Specialties** (blocking specialty retrieval)
3. **Fix Doctors** (blocking doctor creation)
4. **Replace Bookings with Assignments** (major change)
5. **Replace Payments** (major change)
6. **Replace Reviews** (major change)
7. **Fix Notifications** (structure change)
8. **Fix Subscription Plans** (field changes)



