# Required Code Changes (DO NOT UPDATE SCHEMA)

## 🎯 Overview
The database structure differs from the Drizzle schema. Update repositories and services to map fields correctly.

---

## 1. HOSPITALS TABLE - Critical Changes

### Database Has:
- `contact_phone` (NOT `phone`)
- `website_url` (NOT `website`)
- `contact_email` (NOT `email`)
- `latitude`, `longitude` (NOT `location`)
- `logo_id` (uuid, nullable)
- **MISSING**: `state`, `postal_code`, `country`, `location`, `phone`, `website`, `profile_photo_url`, `description`, `is_active`, `onboarding_completed`, `onboarding_step`, `average_rating`, `total_ratings`, `created_at`, `updated_at`

### File: `lib/repositories/hospitals.repository.ts`

#### Change `createHospital()` method:
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
    
    // REMOVE these (don't exist in DB):
    // - state, postalCode, country, location
    // - profilePhotoUrl, description
    // - isActive, onboardingCompleted, onboardingStep

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

#### Change `findHospitals()` method:
```typescript
async findHospitals(query: HospitalQuery) {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const offset = (page - 1) * limit;

  // Use simple order by name (remove rating/beds sorting if columns don't exist)
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

#### Change `findHospitalById()` and `findHospitalByUserId()`:
- These should work as-is, but verify they don't reference non-existent columns

### File: `lib/services/hospitals.service.ts`

#### Change `createHospital()` method:
```typescript
// Remove these fields from CreateHospitalDto usage:
// - state, postalCode, country, location
// - profilePhotoUrl, description
// - isActive, onboardingCompleted, onboardingStep

const hospitalData: CreateHospitalData = {
  name: createHospitalDto.name,
  hospitalType: createHospitalDto.hospitalType,
  registrationNumber: createHospitalDto.registrationNumber || `REG-${Date.now()}`,
  address: createHospitalDto.address || '',
  city: createHospitalDto.city || '',
  phone: createHospitalDto.phone, // Will map to contact_phone in repository
  website: createHospitalDto.website, // Will map to website_url in repository
  numberOfBeds: createHospitalDto.numberOfBeds,
  // REMOVE: state, postalCode, country, location, profilePhotoUrl, description
  // REMOVE: onboardingStep, onboardingCompleted
};
```

---

## 2. DOCTORS TABLE - Changes Needed

### Database Has:
- `profile_photo_id` (NOT `profile_photo_url`)
- `primary_location` (NOT location)
- `latitude`, `longitude`
- **MISSING**: `consultation_fee`, `is_available`, `total_bookings`, `created_at`

### File: `lib/repositories/doctors.repository.ts`

#### Change `createDoctor()` method:
```typescript
// Map profilePhotoUrl → profile_photo_id (if provided)
// Map location → primary_location
// Remove: consultationFee, isAvailable (if not in DB)
```

#### Update all SELECT queries:
- Don't select `consultation_fee`, `is_available`, `total_bookings` if they don't exist
- Map `profile_photo_id` back to `profilePhotoUrl` in response if needed

---

## 3. SPECIALTIES TABLE - Changes Needed

### Database Has:
- `name`, `description` only
- **MISSING**: `is_active`, `created_at`

### File: `lib/repositories/specialties.repository.ts`

#### Change `createSpecialty()` method:
```typescript
async createSpecialty(specialtyData: CreateSpecialtyData) {
  return await this.db
    .insert(specialties)
    .values({
      name: specialtyData.name,
      description: specialtyData.description,
      // REMOVE: isActive (doesn't exist in DB)
    })
    .returning();
}
```

#### Change `findSpecialties()` method:
```typescript
// Remove sorting by createdAt (doesn't exist)
// Remove filtering by isActive (doesn't exist)
```

### File: `lib/services/specialties.service.ts`

#### Change `findActiveSpecialties()` method:
```typescript
// This method won't work if isActive doesn't exist
// Either remove it or return all specialties
async findActiveSpecialties() {
  // Just return all specialties since isActive doesn't exist
  return await this.findSpecialties({});
}
```

---

## 4. BOOKINGS TABLE - Check Required

### Database Structure Unknown
- Table might not exist or has different structure
- **Action**: Check if table exists, if not, create it or skip booking-related APIs

---

## 5. PAYMENTS TABLE - Check Required

### Database Structure Unknown
- Table might not exist or has different structure
- **Action**: Check if table exists, verify column names match schema

---

## 6. REVIEWS TABLE - Check Required

### Database Structure Unknown
- Table might not exist or has different structure
- **Action**: Check if table exists, verify column names match schema

---

## 7. NOTIFICATIONS TABLE - Major Changes

### Database Has:
- `recipient_type`, `recipient_id` (NOT `user_id`)
- `assignment_id`
- `payload` (json)
- `read` (boolean)
- **MISSING**: `user_id`, `notification_type`, `channel`, `is_read`, `created_at` (different structure)

### File: `lib/repositories/notifications.repository.ts`

#### Major rewrite needed:
```typescript
// Map userId → recipient_id where recipient_type = 'user'
// Map notificationType → might need to extract from payload or use different field
// Map channel → check if exists
// Map isRead → read
```

---

## 8. SUBSCRIPTION_PLANS TABLE - Changes Needed

### Database Has:
- `price` is `bigint` (NOT `numeric`)
- `currency` field exists
- **MISSING**: `billing_cycle`, `features`, `is_active`, `created_at`, `updated_at`

### File: `lib/repositories/subscription_plans.repository.ts`

#### Change price handling:
```typescript
// Convert price to/from bigint
// Handle currency field
// Remove references to billing_cycle, features, is_active if they don't exist
```

---

## 9. SUBSCRIPTIONS TABLE - Changes Needed

### Database Has:
- `order_id`, `payment_transaction_id`
- **MISSING**: `auto_renew` might exist (check), `created_at`, `updated_at` exist

### File: `lib/repositories/subscriptions.repository.ts`

#### Verify:
- Check if all fields in schema exist in database
- Map fields correctly

---

## 📋 Summary of Changes

### Files to Modify:

1. **lib/repositories/hospitals.repository.ts**
   - ✅ Map `phone` → `contact_phone`
   - ✅ Map `website` → `website_url`
   - ✅ Remove: state, postalCode, country, location, profilePhotoUrl, description, isActive, onboardingCompleted, onboardingStep
   - ✅ Fix sorting (remove rating/beds if columns don't exist)

2. **lib/services/hospitals.service.ts**
   - ✅ Remove non-existent fields from CreateHospitalDto usage

3. **lib/repositories/doctors.repository.ts**
   - ✅ Map `profile_photo_url` → `profile_photo_id`
   - ✅ Remove: consultationFee, isAvailable if they don't exist

4. **lib/repositories/specialties.repository.ts**
   - ✅ Remove `isActive` field
   - ✅ Remove `createdAt` sorting

5. **lib/services/specialties.service.ts**
   - ✅ Fix `findActiveSpecialties()` to return all specialties

6. **lib/repositories/notifications.repository.ts**
   - ⚠️ Major rewrite needed - different structure

7. **lib/repositories/subscription_plans.repository.ts**
   - ✅ Handle `price` as bigint
   - ✅ Add `currency` field handling

### Quick Fix Priority:

1. **HIGH**: Fix hospitals repository (blocking hospital creation)
2. **HIGH**: Fix specialties repository (blocking specialty retrieval)
3. **MEDIUM**: Fix doctors repository
4. **MEDIUM**: Check and fix bookings, payments, reviews tables
5. **LOW**: Fix notifications (major rewrite)
6. **LOW**: Fix subscription plans

---

## 🔧 Testing After Changes

After making changes, test each endpoint:
1. Create operations (INSERT)
2. Read operations (SELECT)
3. Update operations (UPDATE)
4. Verify field mappings work correctly



