# Schema Compatibility Analysis - Hospital Dashboard MVP Design

## Overview
This document analyzes the compatibility between the Hospital Dashboard MVP Design and the current database schema.

## ✅ Compatible Features

### 1. **Patients Table** ✅
- All required fields exist:
  - `fullName`, `dateOfBirth`, `gender`, `phone`, `emergencyContact`, `address`
  - `medicalCondition`, `roomType`, `costPerDay`, `medicalNotes`
  - `hospitalId` (foreign key)
- **Status**: Fully compatible

### 2. **Assignments Table** ✅
- All required fields exist:
  - `hospitalId`, `doctorId`, `patientId`
  - `status` (pending, accepted, declined, completed)
  - `priority` (routine, urgent, emergency)
  - `requestedAt`, `expiresAt`, `consultationFee`
  - `actualStartTime`, `actualEndTime`, `completedAt`
  - `cancellationReason`, `cancelledBy`, `cancelledAt`
- **Status**: Fully compatible

### 3. **Hospitals Table** ✅
- All required fields exist:
  - `name`, `hospitalType`, `registrationNumber`
  - `address`, `city`, `numberOfBeds`
  - `contactEmail`, `contactPhone`, `websiteUrl`
  - `licenseVerificationStatus`
- **Status**: Fully compatible

### 4. **Doctors Table** ✅
- Core fields exist:
  - `firstName`, `lastName`, `medicalLicenseNumber`
  - `yearsOfExperience`, `averageRating`, `totalRatings`
  - `completedAssignments`
- **Status**: Mostly compatible (see gaps below)

### 5. **Subscriptions** ✅
- Subscription system exists:
  - `subscriptionPlans` table with `tier`, `price`, `userRole`
  - `subscriptions` table for active subscriptions
  - `hospitalPlanFeatures` with `maxPatientsPerMonth`, `includesPremiumDoctors`
- **Status**: Compatible with minor mapping needed

## ⚠️ Schema Gaps & Required Changes

### 1. **Doctor Tiers** ⚠️
**MVP Design Expects:**
- Doctor tier field: `platinum`, `gold`, `silver`
- `requiredPlan` field on doctors to control subscription-based access

**Current Schema:**
- ❌ No `tier` field on `doctors` table
- ❌ No `requiredPlan` field on `doctors` table

**Recommendation:**
- **Option A (Recommended)**: Add `tier` and `requiredPlan` fields to `doctors` table
  ```sql
  ALTER TABLE doctors ADD COLUMN tier text CHECK (tier IN ('platinum', 'gold', 'silver'));
  ALTER TABLE doctors ADD COLUMN required_plan text CHECK (required_plan IN ('free', 'gold', 'premium'));
  ```
- **Option B**: Use a mapping table or configuration to determine doctor tiers
- **Option C**: Map based on `averageRating` and `completedAssignments` (temporary workaround)

### 2. **Subscription Plan Tier Names** ⚠️
**MVP Design Expects:**
- Plan tiers: `free`, `gold`, `premium`

**Current Schema:**
- Plan tiers: `free`, `basic`, `premium`, `enterprise`

**Recommendation:**
- **Option A**: Update schema to match MVP design
  ```sql
  -- Update subscription_plans tier check constraint
  ALTER TABLE subscription_plans DROP CONSTRAINT subscription_plans_tier_check;
  ALTER TABLE subscription_plans ADD CONSTRAINT subscription_plans_tier_check 
    CHECK (tier IN ('free', 'gold', 'premium'));
  ```
- **Option B**: Map in application code:
  - `basic` → `gold`
  - `enterprise` → `premium`
  - Keep `free` and `premium` as-is

### 3. **Patient Admission Date** ⚠️
**MVP Design Expects:**
- `admissionDate` field on patients

**Current Schema:**
- Only has `createdAt` timestamp

**Recommendation:**
- Add `admissionDate` field:
  ```sql
  ALTER TABLE patients ADD COLUMN admission_date date;
  ```
- Or use `createdAt` as admission date (temporary workaround)

### 4. **Assignment Expiration Logic** ⚠️
**MVP Design Expects:**
- Priority-based expiration times:
  - Routine: 24 hours
  - Urgent: 6 hours
  - Emergency: 1 hour

**Current Schema:**
- `expiresAt` field exists but no automatic calculation

**Recommendation:**
- Calculate `expiresAt` based on `priority` when creating assignment
- This can be handled in application logic, no schema change needed

### 5. **Doctor Availability Slots** ⚠️
**MVP Design Expects:**
- Display available time slots for doctors

**Current Schema:**
- `doctorAvailability` table exists (referenced in assignments)
- Need to verify structure matches MVP requirements

**Recommendation:**
- Verify `doctorAvailability` table has:
  - `date`, `startTime`, `endTime`
  - `isAvailable` boolean
  - Link to `doctorId`

## 📋 Summary of Required Schema Changes

### High Priority (Required for MVP)
1. ✅ Add `tier` field to `doctors` table
2. ✅ Add `requiredPlan` field to `doctors` table
3. ⚠️ Update subscription plan tier names OR map in code
4. ✅ Add `admissionDate` to `patients` table (optional, can use `createdAt`)

### Medium Priority (Can be handled in code)
1. Calculate `expiresAt` based on priority
2. Map subscription tiers in application layer

### Low Priority (Nice to have)
1. Add indexes for performance
2. Add audit fields if needed

## 🎯 Implementation Strategy

### Phase 1: Immediate (No Schema Changes)
- Convert MVP design to Next.js
- Use existing schema fields
- Map subscription tiers in code (`basic` → `gold`)
- Use `createdAt` as `admissionDate`
- Hardcode doctor tiers temporarily or use rating-based logic

### Phase 2: Schema Updates (Recommended)
- Add `tier` and `requiredPlan` to doctors table
- Add `admissionDate` to patients table
- Update subscription tier names if needed

### Phase 3: Full Integration
- Connect to real API endpoints
- Implement subscription-based doctor access
- Add real-time notifications
- Implement payment integration

## 📝 Notes
- The MVP design is well-structured and can be adapted to work with the current schema
- Most features can be implemented with minimal schema changes
- The main gap is doctor tier/plan requirements, which can be added or worked around

