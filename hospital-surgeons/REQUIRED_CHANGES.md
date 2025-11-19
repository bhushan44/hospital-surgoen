# Required Changes to Work with Existing Database

## ⚠️ DO NOT UPDATE SCHEMA
Keep the Drizzle schema as-is. Instead, update the code/repositories to work with the actual database structure.

## 🔍 Schema Mismatches Found

### 1. HOSPITALS Table

**Database Has:**
- `logo_id` (uuid)
- `latitude` (numeric)
- `longitude` (numeric)
- `contact_email` (text)
- `contact_phone` (text)
- `website_url` (text)
- NO: `state`, `postal_code`, `country`, `location`, `phone`, `website`, `profile_photo_url`, `description`, `is_active`, `onboarding_completed`, `onboarding_step`

**Schema Expects:**
- `state`, `postal_code`, `country`, `location`, `phone`, `website`, `profile_photo_url`, `description`, `is_active`, `onboarding_completed`, `onboarding_step`

**Required Changes:**
1. **lib/repositories/hospitals.repository.ts** - `createHospital()` method:
   - Map `phone` → `contact_phone`
   - Map `website` → `website_url`
   - Remove: `state`, `postal_code`, `country`, `location`, `profile_photo_url`, `description`, `is_active`, `onboarding_completed`, `onboarding_step`
   - Add: `logo_id` (optional), `latitude`, `longitude`, `contact_email` (if provided)

2. **lib/repositories/hospitals.repository.ts** - `findHospitals()` method:
   - Update SELECT to use actual column names
   - Map database columns back to expected format if needed

3. **lib/repositories/hospitals.repository.ts** - `findHospitalById()` method:
   - Update SELECT to use actual column names

### 2. DOCTORS Table

**Check Required:**
- Verify column names match between database and schema
- Check if `first_name`, `last_name` vs `firstName`, `lastName` mapping needed

**Required Changes:**
1. **lib/repositories/doctors.repository.ts** - All methods:
   - Verify column name mappings
   - Update if using camelCase in code but snake_case in DB

### 3. SPECIALTIES Table

**Check Required:**
- Verify `is_active` vs `isActive` mapping
- Check if all columns exist

**Required Changes:**
1. **lib/repositories/specialties.repository.ts** - All methods:
   - Verify column mappings
   - Update SELECT/INSERT/UPDATE to use correct column names

### 4. BOOKINGS Table

**Check Required:**
- Verify all column names match
- Check date/time column formats

**Required Changes:**
1. **lib/repositories/bookings.repository.ts** - All methods:
   - Verify column mappings
   - Update queries if needed

### 5. PAYMENTS Table

**Check Required:**
- Verify column names match
- Check amount column type (numeric vs decimal)

**Required Changes:**
1. **lib/repositories/payments.repository.ts** - `create()` method:
   - Verify amount conversion (string vs number)
   - Check all column names match

### 6. REVIEWS Table

**Check Required:**
- Verify column names match
- Check rating column type

**Required Changes:**
1. **lib/repositories/reviews.repository.ts** - All methods:
   - Verify column mappings

### 7. NOTIFICATIONS Table

**Check Required:**
- Verify column names match
- Check enum types match

**Required Changes:**
1. **lib/repositories/notifications.repository.ts** - All methods:
   - Verify column mappings

### 8. SUBSCRIPTION_PLANS Table

**Check Required:**
- Verify column names match
- Check price column type

**Required Changes:**
1. **lib/repositories/subscription_plans.repository.ts** - All methods:
   - Verify column mappings

### 9. SUBSCRIPTIONS Table

**Check Required:**
- Verify column names match
- Check date column formats

**Required Changes:**
1. **lib/repositories/subscriptions.repository.ts** - All methods:
   - Verify column mappings

## 📝 Specific Code Changes Needed

### File: lib/repositories/hospitals.repository.ts

**In `createHospital()` method:**
```typescript
// CHANGE FROM:
if (hospitalData.phone) values.phone = hospitalData.phone;
if (hospitalData.website) values.website = hospitalData.website;
if (hospitalData.state) values.state = hospitalData.state;
if (hospitalData.postalCode) values.postalCode = hospitalData.postalCode;
if (hospitalData.country) values.country = hospitalData.country;
if (hospitalData.location) values.location = hospitalData.location;
if (hospitalData.profilePhotoUrl) values.profilePhotoUrl = hospitalData.profilePhotoUrl;
if (hospitalData.description) values.description = hospitalData.description;
if (hospitalData.isActive !== undefined) values.isActive = hospitalData.isActive;
if (hospitalData.onboardingCompleted !== undefined) values.onboardingCompleted = hospitalData.onboardingCompleted;
if (hospitalData.onboardingStep) values.onboardingStep = hospitalData.onboardingStep;

// CHANGE TO:
if (hospitalData.phone) values.contactPhone = hospitalData.phone; // Map to contact_phone
if (hospitalData.website) values.websiteUrl = hospitalData.website; // Map to website_url
// Remove: state, postalCode, country, location, profilePhotoUrl, description
// Remove: isActive, onboardingCompleted, onboardingStep (if not in DB)
// Add if needed: contactEmail, latitude, longitude
```

**In `findHospitals()` method:**
```typescript
// Update SELECT to use actual column names:
.select({
  hospital: {
    id: hospitals.id,
    userId: hospitals.userId,
    name: hospitals.name,
    hospitalType: hospitals.hospitalType,
    registrationNumber: hospitals.registrationNumber,
    address: hospitals.address,
    city: hospitals.city,
    phone: hospitals.contactPhone, // Map from contact_phone
    website: hospitals.websiteUrl, // Map from website_url
    // ... other actual columns
  }
})
```

### File: lib/services/hospitals.service.ts

**In `createHospital()` method:**
- Remove fields that don't exist in database:
  - `state`, `postalCode`, `country`, `location`
  - `profilePhotoUrl`, `description`
  - `isActive`, `onboardingCompleted`, `onboardingStep`

### File: All Repository Files

**General Pattern:**
1. Check actual database column names
2. Map Drizzle schema field names to actual DB column names
3. Update all SELECT, INSERT, UPDATE queries
4. Handle nullable fields correctly

## 🔧 Step-by-Step Fix Process

1. **Get Actual Database Structure:**
   ```sql
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'table_name' 
   ORDER BY ordinal_position;
   ```

2. **Update Repository Methods:**
   - Map field names in INSERT statements
   - Map field names in SELECT statements
   - Map field names in UPDATE statements
   - Handle missing fields gracefully

3. **Update Service Methods:**
   - Remove references to non-existent fields
   - Add mappings for field name differences

4. **Test Each Endpoint:**
   - Verify CREATE operations work
   - Verify GET operations work
   - Verify UPDATE operations work

## ⚠️ Important Notes

1. **Don't modify lib/db/schema.ts** - Keep it as-is
2. **Do modify repositories** - Map schema fields to actual DB columns
3. **Do modify services** - Remove non-existent field references
4. **Handle gracefully** - If a field doesn't exist, don't try to use it

## 🎯 Priority Order

1. **HIGH**: Fix hospitals repository (blocking hospital creation)
2. **HIGH**: Fix all GET endpoints (blocking data retrieval)
3. **MEDIUM**: Fix other repositories (doctors, specialties, etc.)
4. **LOW**: Clean up unused field references



