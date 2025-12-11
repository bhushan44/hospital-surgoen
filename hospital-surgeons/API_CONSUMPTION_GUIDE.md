# Subscription Plans API Consumption Guide

This document describes how the Subscription Plans feature consumes APIs in the admin panel.

## Overview

The Subscription Plans feature uses a **combined API approach** where plan details and features are sent together in a single request for create/update operations. This ensures atomic operations and prevents forgetting to add features.

---

## API Endpoints

### 1. GET `/api/admin/plans`
**Purpose:** Fetch all subscription plans grouped by user role

**Request:**
```http
GET /api/admin/plans
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "plan-id",
      "name": "Basic Plan",
      "tier": "basic",
      "userRole": "doctor",
      "price": 2999,
      "currency": "USD",
      "priceFormatted": "USD 29.99",
      "subscribers": 5
    }
  ],
  "grouped": {
    "doctors": [...],
    "hospitals": [...]
  }
}
```

**Frontend Usage:**
- Called on component mount via `fetchPlans()`
- Used to populate the plan list in both "Doctor Plans" and "Hospital Plans" tabs
- After fetching plans, features are loaded separately for each plan

**Location in Code:**
```typescript
// File: app/admin/_components/pages/SubscriptionPlans.tsx
const fetchPlans = async () => {
  const res = await fetch('/api/admin/plans');
  const data = await res.json();
  // ... handle response
}
```

---

### 2. POST `/api/admin/plans`
**Purpose:** Create a new subscription plan with features

**Request:**
```http
POST /api/admin/plans
Content-Type: application/json

{
  "name": "Premium Plan",
  "tier": "premium",
  "userRole": "doctor",
  "price": 99.99,
  "currency": "USD",
  "features": {
    // For doctor plans:
    "visibilityWeight": 5,
    "maxAffiliations": 3,
    "maxAssignmentsPerMonth": 100,  // or -1 for unlimited, or null
    "notes": "Premium features included"
    
    // OR for hospital plans:
    "maxPatientsPerMonth": 500,  // or -1 for unlimited, or null
    "maxAssignmentsPerMonth": 200,  // or -1 for unlimited, or null
    "includesPremiumDoctors": true,
    "notes": "Hospital premium plan"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription plan and features created successfully",
  "data": {
    "id": "new-plan-id",
    "name": "Premium Plan",
    "tier": "premium",
    "userRole": "doctor",
    "price": 9999,
    "currency": "USD"
  }
}
```

**Frontend Usage:**
- Called when user clicks "Create Plan & Features" button
- **Always includes features** in the request body
- Plan is created first, then features are saved automatically by the API

**Location in Code:**
```typescript
// File: app/admin/_components/pages/SubscriptionPlans.tsx
const handleSubmit = async (e: React.FormEvent) => {
  // ... validation
  const features = formatFeaturesForAPI(formData.userRole);
  
  const res = await fetch('/api/admin/plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.name.trim(),
      tier: formData.tier,
      userRole: formData.userRole,
      price: parseFloat(formData.price),
      currency: formData.currency,
      features: features  // Always included
    }),
  });
}
```

**Features Formatting:**
- Empty strings are converted to `null`
- "unlimited" string is converted to `-1`
- Numbers are parsed as integers
- Doctor and hospital plans have different feature structures

---

### 3. PUT `/api/admin/plans/[id]`
**Purpose:** Update an existing subscription plan with features

**Request:**
```http
PUT /api/admin/plans/{planId}
Content-Type: application/json

{
  "name": "Updated Plan Name",
  "tier": "premium",
  "price": 149.99,
  "currency": "USD",
  "features": {
    // Same structure as POST
    "visibilityWeight": 10,
    "maxAffiliations": 5,
    "maxAssignmentsPerMonth": -1,
    "notes": "Updated features"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription plan and features updated successfully",
  "data": {
    "id": "plan-id",
    "name": "Updated Plan Name",
    "tier": "premium",
    "userRole": "doctor",
    "price": 14999,
    "currency": "USD",
    "priceFormatted": "USD 149.99"
  }
}
```

**Frontend Usage:**
- Called when editing an existing plan (Edit button)
- **Always includes features** in the request body
- Updates plan details first, then updates/creates features

**Location in Code:**
```typescript
// File: app/admin/_components/pages/SubscriptionPlans.tsx
const handleSubmit = async (e: React.FormEvent) => {
  // ... validation
  const url = `/api/admin/plans/${editingPlan.id}`;
  const features = formatFeaturesForAPI(formData.userRole);
  
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.name.trim(),
      tier: formData.tier,
      price: parseFloat(formData.price),
      currency: formData.currency,
      features: features  // Always included
    }),
  });
}
```

---

### 4. GET `/api/admin/plans/[id]/features`
**Purpose:** Fetch features for a specific plan

**Request:**
```http
GET /api/admin/plans/{planId}/features
```

**Response (Doctor Plan):**
```json
{
  "success": true,
  "data": {
    "planId": "plan-id",
    "userRole": "doctor",
    "visibilityWeight": 5,
    "maxAffiliations": 3,
    "maxAssignmentsPerMonth": 100,
    "notes": "Some notes"
  }
}
```

**Response (Hospital Plan):**
```json
{
  "success": true,
  "data": {
    "planId": "plan-id",
    "userRole": "hospital",
    "maxPatientsPerMonth": 500,
    "maxAssignmentsPerMonth": 200,
    "includesPremiumDoctors": true,
    "notes": "Hospital features"
  }
}
```

**Frontend Usage:**
- Called after fetching plans to load features for each plan
- Used when editing a plan to populate the features form
- Called when clicking "Limits" button to edit features only

**Location in Code:**
```typescript
// File: app/admin/_components/pages/SubscriptionPlans.tsx
const loadPlanFeatures = async (plan: Plan) => {
  const res = await fetch(`/api/admin/plans/${plan.id}/features`);
  const data = await res.json();
  // ... populate featuresData state
}

const fetchPlanFeatures = async (plan: Plan) => {
  const res = await fetch(`/api/admin/plans/${plan.id}/features`);
  // ... update plan.features
}
```

---

### 5. PUT `/api/admin/plans/[id]/features`
**Purpose:** Update features for an existing plan (features-only update)

**Request:**
```http
PUT /api/admin/plans/{planId}/features
Content-Type: application/json

{
  // Doctor plan features:
  "visibilityWeight": 10,
  "maxAffiliations": 5,
  "maxAssignmentsPerMonth": -1,
  "notes": "Updated notes"
  
  // OR Hospital plan features:
  "maxPatientsPerMonth": 1000,
  "maxAssignmentsPerMonth": -1,
  "includesPremiumDoctors": true,
  "notes": "Updated hospital features"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Doctor plan features updated successfully",
  "data": {
    // Updated features object
  }
}
```

**Frontend Usage:**
- Called when user clicks "Limits" button and saves features only
- Used for quick feature updates without changing plan details
- Triggered when `editingFeaturesOnly` flag is true

**Location in Code:**
```typescript
// File: app/admin/_components/pages/SubscriptionPlans.tsx
const savePlanFeaturesOnly = async (planId: string, userRole: 'doctor' | 'hospital') => {
  const body = formatFeaturesForAPI(userRole);
  
  const res = await fetch(`/api/admin/plans/${planId}/features`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const handleSubmit = async (e: React.FormEvent) => {
  // If editing features only
  if (editingFeaturesOnly && editingPlan) {
    const result = await savePlanFeaturesOnly(editingPlan.id, editingPlan.userRole);
    // ... handle response
    return;
  }
  // ... regular create/update flow
}
```

---

### 6. DELETE `/api/admin/plans/[id]`
**Purpose:** Delete a subscription plan (and its features)

**Request:**
```http
DELETE /api/admin/plans/{planId}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription plan deleted successfully"
}
```

**Frontend Usage:**
- Called when user clicks delete button on a plan card
- Shows confirmation dialog before deletion
- Automatically deletes associated features

**Location in Code:**
```typescript
// File: app/admin/_components/pages/SubscriptionPlans.tsx
const handleDelete = async (plan: Plan) => {
  if (!confirm(`Are you sure you want to delete "${plan.name}"?`)) {
    return;
  }
  
  const res = await fetch(`/api/admin/plans/${plan.id}`, {
    method: 'DELETE',
  });
}
```

---

## API Consumption Flow

### Creating a New Plan

```
1. User fills "Plan Details" tab
   └─> Form data stored in `formData` state

2. User fills "Features & Limits" tab
   └─> Features stored in `featuresData` state

3. User clicks "Create Plan & Features"
   └─> handleSubmit() called
       └─> formatFeaturesForAPI() formats features
       └─> POST /api/admin/plans
           ├─> Request body includes both plan + features
           ├─> API creates plan first
           └─> API creates features second
       └─> Success: Plan and features created atomically
```

### Editing a Plan

```
1. User clicks "Edit" button
   └─> handleEdit() called
       └─> GET /api/admin/plans/{id}/features (load existing features)
       └─> Modal opens with plan details and features

2. User modifies plan details and/or features

3. User clicks "Update Plan & Features"
   └─> handleSubmit() called
       └─> formatFeaturesForAPI() formats features
       └─> PUT /api/admin/plans/{id}
           ├─> Request body includes both plan + features
           ├─> API updates plan first
           └─> API updates/creates features second
       └─> Success: Plan and features updated atomically
```

### Editing Features Only

```
1. User clicks "Limits" button
   └─> handleEditFeatures() called
       └─> GET /api/admin/plans/{id}/features (load existing features)
       └─> Modal opens with features tab active
       └─> Details tab disabled (editingFeaturesOnly = true)

2. User modifies features only

3. User clicks "Save Features"
   └─> handleSubmit() called
       └─> Detects editingFeaturesOnly flag
       └─> savePlanFeaturesOnly() called
           └─> PUT /api/admin/plans/{id}/features
               └─> Only features updated (plan unchanged)
       └─> Success: Features updated
```

---

## Key Design Decisions

### 1. Combined API for Create/Update
- **Why:** Ensures atomic operations (plan + features together)
- **Benefit:** Prevents forgetting to add features
- **Implementation:** Features always included in POST/PUT requests

### 2. Separate Features Endpoint
- **Why:** Allows quick feature updates without touching plan details
- **Benefit:** Flexibility for different use cases
- **Usage:** Only when clicking "Limits" button (features-only edit)

### 3. Features Formatting
- Empty strings → `null`
- "unlimited" → `-1`
- Numbers → parsed as integers
- Different structures for doctor vs hospital plans

### 4. Price Handling
- Frontend: Price in dollars (e.g., 99.99)
- API: Converts to cents (e.g., 9999)
- Display: Formatted as currency string

---

## Error Handling

All API calls include error handling:

```typescript
try {
  const res = await fetch(url, options);
  const data = await res.json();
  
  if (data.success) {
    // Success handling
    toast.success('Operation successful');
    fetchPlans(); // Refresh list
  } else {
    // API returned error
    toast.error(data.message || 'Operation failed');
  }
} catch (error) {
  // Network or parsing error
  console.error('Error:', error);
  toast.error('Failed to complete operation');
}
```

---

## State Management

### Form State (`formData`)
```typescript
{
  name: string;
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  userRole: 'doctor' | 'hospital';
  price: string;  // In dollars
  currency: 'USD' | 'EUR' | 'GBP';
}
```

### Features State (`featuresData`)
```typescript
{
  // Doctor features
  visibilityWeight: number;
  maxAffiliations: number;
  maxAssignmentsPerMonth: string;  // "unlimited" or number string
  
  // Hospital features
  maxPatientsPerMonth: string;  // "unlimited" or number string
  hospitalMaxAssignmentsPerMonth: string;  // "unlimited" or number string
  includesPremiumDoctors: boolean;
  
  // Common
  notes: string;
}
```

---

## Best Practices

1. **Always include features** when creating/updating plans
2. **Format features correctly** before sending to API
3. **Handle both success and error** responses
4. **Refresh plan list** after successful operations
5. **Validate required fields** before API calls
6. **Use proper error messages** from API responses

---

## Summary

- **Create Plan:** POST `/api/admin/plans` with plan + features
- **Update Plan:** PUT `/api/admin/plans/{id}` with plan + features
- **Update Features Only:** PUT `/api/admin/plans/{id}/features` with features only
- **Fetch Plans:** GET `/api/admin/plans` then GET features for each
- **Delete Plan:** DELETE `/api/admin/plans/{id}` (features auto-deleted)

The combined API approach ensures features are never forgotten and provides atomic operations for better data consistency.

