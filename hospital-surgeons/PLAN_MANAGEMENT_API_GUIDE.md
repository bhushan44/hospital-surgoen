# Plan Management API Guide

This guide explains how to create and update subscription plans using the API, including plan details, features, and pricing options.

## Table of Contents
1. [Create Plan](#1-create-plan)
2. [Update Plan](#2-update-plan)
3. [Get Plan Details](#3-get-plan-details)
4. [Manage Features](#4-manage-features)
5. [Manage Pricing Options](#5-manage-pricing-options)

---

## 1. Create Plan

### Endpoint
```
POST /api/admin/plans
```

### Request Body
```json
{
  "name": "Basic Doctor Plan",
  "tier": "basic",
  "userRole": "doctor",
  "description": "Perfect for individual doctors starting out",
  "isActive": true,
  "defaultBillingCycle": "monthly",
  "features": {
    "visibilityWeight": 1,
    "maxAffiliations": 1,
    "maxAssignmentsPerMonth": 10,
    "notes": "Basic plan features"
  }
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Plan name (min 1 character) |
| `tier` | enum | Yes | One of: `free`, `basic`, `premium`, `enterprise` |
| `userRole` | enum | Yes | Either `doctor` or `hospital` |
| `description` | string | No | Plan description |
| `isActive` | boolean | No | Whether plan is active (default: `true`) |
| `defaultBillingCycle` | enum | No | One of: `monthly`, `quarterly`, `yearly`, `custom` |
| `features` | object | No | Plan-specific features (see below) |

### Doctor Plan Features
```json
{
  "visibilityWeight": 1,
  "maxAffiliations": 1,
  "maxAssignmentsPerMonth": 10,  // or -1 for unlimited, or null
  "notes": "Optional notes"
}
```

### Hospital Plan Features
```json
{
  "maxPatientsPerMonth": 100,  // or -1 for unlimited, or null
  "hospitalMaxAssignmentsPerMonth": 50,  // or -1 for unlimited, or null
  "includesPremiumDoctors": false,
  "notes": "Optional notes"
}
```

### Response (Success)
```json
{
  "success": true,
  "message": "Plan created successfully",
  "data": {
    "id": "plan_123",
    "name": "Basic Doctor Plan",
    "tier": "basic",
    "userRole": "doctor",
    "description": "Perfect for individual doctors starting out",
    "isActive": true,
    "defaultBillingCycle": "monthly",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

### Response (Error)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "name: Plan name is required",
    "tier: Tier must be one of: free, basic, premium, enterprise"
  ]
}
```

### Example: Create Doctor Plan
```bash
curl -X POST http://localhost:3000/api/admin/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Doctor Plan",
    "tier": "premium",
    "userRole": "doctor",
    "description": "Advanced features for experienced doctors",
    "isActive": true,
    "defaultBillingCycle": "monthly",
    "features": {
      "visibilityWeight": 5,
      "maxAffiliations": 5,
      "maxAssignmentsPerMonth": -1,
      "notes": "Unlimited assignments"
    }
  }'
```

### Example: Create Hospital Plan
```bash
curl -X POST http://localhost:3000/api/admin/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enterprise Hospital Plan",
    "tier": "enterprise",
    "userRole": "hospital",
    "description": "Full-featured plan for large hospitals",
    "isActive": true,
    "defaultBillingCycle": "yearly",
    "features": {
      "maxPatientsPerMonth": -1,
      "hospitalMaxAssignmentsPerMonth": -1,
      "includesPremiumDoctors": true,
      "notes": "Unlimited everything"
    }
  }'
```

---

## 2. Update Plan

### Endpoint
```
PUT /api/admin/plans/{planId}
```

### Request Body
All fields are optional (only include what you want to update):
```json
{
  "name": "Updated Plan Name",
  "tier": "premium",
  "description": "Updated description",
  "isActive": false,
  "defaultBillingCycle": "quarterly",
  "features": {
    "visibilityWeight": 3,
    "maxAffiliations": 3,
    "maxAssignmentsPerMonth": 20
  }
}
```

### Response (Success)
```json
{
  "success": true,
  "message": "Plan updated successfully",
  "data": {
    "id": "plan_123",
    "name": "Updated Plan Name",
    "tier": "premium",
    "userRole": "doctor",
    "description": "Updated description",
    "isActive": false,
    "defaultBillingCycle": "quarterly",
    "updatedAt": "2025-01-15T11:00:00Z"
  }
}
```

### Example: Update Plan
```bash
curl -X PUT http://localhost:3000/api/admin/plans/plan_123 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Doctor Plan v2",
    "description": "Updated with new features",
    "isActive": true
  }'
```

**Note:** You cannot update `price` or `currency` directly on the plan. Use the pricing endpoints (see section 5).

---

## 3. Get Plan Details

### Endpoint
```
GET /api/admin/plans/{planId}
```

### Response (Success)
```json
{
  "success": true,
  "data": {
    "id": "plan_123",
    "name": "Premium Doctor Plan",
    "tier": "premium",
    "userRole": "doctor",
    "description": "Advanced features for experienced doctors",
    "isActive": true,
    "defaultBillingCycle": "monthly",
    "pricingOptions": [
      {
        "id": "pricing_1",
        "billingCycle": "monthly",
        "billingPeriodMonths": 1,
        "price": 49900,
        "currency": "INR",
        "discountPercentage": 0,
        "isActive": true
      },
      {
        "id": "pricing_2",
        "billingCycle": "yearly",
        "billingPeriodMonths": 12,
        "price": 499000,
        "currency": "INR",
        "discountPercentage": 10,
        "isActive": true
      }
    ],
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

### Example: Get Plan
```bash
curl http://localhost:3000/api/admin/plans/plan_123
```

---

## 4. Manage Features

### Get Plan Features
```
GET /api/admin/plans/{planId}/features
```

### Response
```json
{
  "success": true,
  "data": {
    "visibilityWeight": 5,
    "maxAffiliations": 5,
    "maxAssignmentsPerMonth": -1,
    "notes": "Unlimited assignments"
  }
}
```

### Update Features (via Plan Update)
Features are updated as part of the plan update endpoint:

```bash
curl -X PUT http://localhost:3000/api/admin/plans/plan_123 \
  -H "Content-Type: application/json" \
  -d '{
    "features": {
      "visibilityWeight": 10,
      "maxAffiliations": 10,
      "maxAssignmentsPerMonth": -1,
      "notes": "Updated to unlimited"
    }
  }'
```

### Feature Values
- **Numbers**: Positive integers (e.g., `1`, `5`, `100`)
- **Unlimited**: Use `-1` to indicate unlimited
- **Null**: Use `null` if the feature doesn't apply

---

## 5. Manage Pricing Options

### 5.1 Get All Pricing Options for a Plan
```
GET /api/admin/plans/{planId}/pricing
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "pricing_1",
      "planId": "plan_123",
      "billingCycle": "monthly",
      "billingPeriodMonths": 1,
      "price": 49900,
      "currency": "INR",
      "setupFee": 0,
      "discountPercentage": 0,
      "isActive": true,
      "validFrom": "2025-01-15T00:00:00Z",
      "validUntil": null,
      "createdAt": "2025-01-15T10:30:00Z"
    },
    {
      "id": "pricing_2",
      "planId": "plan_123",
      "billingCycle": "yearly",
      "billingPeriodMonths": 12,
      "price": 499000,
      "currency": "INR",
      "setupFee": 5000,
      "discountPercentage": 10,
      "isActive": true,
      "validFrom": "2025-01-15T00:00:00Z",
      "validUntil": null,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### 5.2 Create Pricing Option
```
POST /api/admin/plans/{planId}/pricing
```

### Request Body
```json
{
  "billingCycle": "monthly",
  "billingPeriodMonths": 1,
  "price": 499.00,
  "currency": "INR",
  "setupFee": 0,
  "discountPercentage": 0,
  "isActive": true,
  "validFrom": "2025-01-15T00:00:00Z",
  "validUntil": null
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `billingCycle` | enum | Yes | One of: `monthly`, `quarterly`, `yearly`, `custom` |
| `billingPeriodMonths` | number | Yes | Number of months (1, 3, 12, or custom) |
| `price` | number | Yes | Price in **cents** (e.g., 49900 = ₹499.00) |
| `currency` | enum | Yes | One of: `INR`, `USD`, `EUR`, `GBP` |
| `setupFee` | number | No | Setup fee in cents (default: 0) |
| `discountPercentage` | number | No | Discount % (0-100, default: 0) |
| `isActive` | boolean | No | Whether pricing is active (default: true) |
| `validFrom` | string | No | ISO date string (default: now) |
| `validUntil` | string | No | ISO date string or null (default: null) |

### Important: Price Format
- **API expects price in cents** (smallest currency unit)
- ₹499.00 = `49900` cents
- $9.99 = `999` cents
- €10.50 = `1050` cents

### Response (Success)
```json
{
  "success": true,
  "message": "Pricing option created successfully",
  "data": {
    "id": "pricing_3",
    "planId": "plan_123",
    "billingCycle": "monthly",
    "billingPeriodMonths": 1,
    "price": 49900,
    "currency": "INR",
    "setupFee": 0,
    "discountPercentage": 0,
    "isActive": true,
    "validFrom": "2025-01-15T10:30:00Z",
    "validUntil": null,
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

### Example: Create Monthly Pricing
```bash
curl -X POST http://localhost:3000/api/admin/plans/plan_123/pricing \
  -H "Content-Type: application/json" \
  -d '{
    "billingCycle": "monthly",
    "billingPeriodMonths": 1,
    "price": 49900,
    "currency": "INR",
    "setupFee": 0,
    "discountPercentage": 0,
    "isActive": true
  }'
```

### Example: Create Yearly Pricing with Discount
```bash
curl -X POST http://localhost:3000/api/admin/plans/plan_123/pricing \
  -H "Content-Type: application/json" \
  -d '{
    "billingCycle": "yearly",
    "billingPeriodMonths": 12,
    "price": 499000,
    "currency": "INR",
    "setupFee": 5000,
    "discountPercentage": 10,
    "isActive": true
  }'
```

### Example: Create Custom Billing Cycle
```bash
curl -X POST http://localhost:3000/api/admin/plans/plan_123/pricing \
  -H "Content-Type: application/json" \
  -d '{
    "billingCycle": "custom",
    "billingPeriodMonths": 6,
    "price": 249000,
    "currency": "INR",
    "setupFee": 0,
    "discountPercentage": 5,
    "isActive": true
  }'
```

### 5.3 Get Single Pricing Option
```
GET /api/admin/plans/{planId}/pricing/{pricingId}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": "pricing_1",
    "planId": "plan_123",
    "billingCycle": "monthly",
    "billingPeriodMonths": 1,
    "price": 49900,
    "currency": "INR",
    "setupFee": 0,
    "discountPercentage": 0,
    "isActive": true,
    "validFrom": "2025-01-15T00:00:00Z",
    "validUntil": null,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

### 5.4 Update Pricing Option
```
PUT /api/admin/plans/{planId}/pricing/{pricingId}
```

### Request Body (all fields optional)
```json
{
  "price": 59900,
  "discountPercentage": 5,
  "isActive": false,
  "validUntil": "2025-12-31T23:59:59Z"
}
```

### Response (Success)
```json
{
  "success": true,
  "message": "Pricing option updated successfully",
  "data": {
    "id": "pricing_1",
    "price": 59900,
    "discountPercentage": 5,
    "isActive": false,
    "updatedAt": "2025-01-15T11:00:00Z"
  }
}
```

### Example: Update Pricing
```bash
curl -X PUT http://localhost:3000/api/admin/plans/plan_123/pricing/pricing_1 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 59900,
    "discountPercentage": 5,
    "isActive": true
  }'
```

### 5.5 Delete Pricing Option
```
DELETE /api/admin/plans/{planId}/pricing/{pricingId}
```

### Response (Success)
```json
{
  "success": true,
  "message": "Pricing option deleted successfully"
}
```

### Example: Delete Pricing
```bash
curl -X DELETE http://localhost:3000/api/admin/plans/plan_123/pricing/pricing_1
```

---

## Complete Workflow Example

### Step 1: Create Plan
```bash
curl -X POST http://localhost:3000/api/admin/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Doctor Plan",
    "tier": "premium",
    "userRole": "doctor",
    "description": "Advanced features for experienced doctors",
    "isActive": true,
    "defaultBillingCycle": "monthly",
    "features": {
      "visibilityWeight": 5,
      "maxAffiliations": 5,
      "maxAssignmentsPerMonth": -1
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "plan_123"
  }
}
```

### Step 2: Add Monthly Pricing
```bash
curl -X POST http://localhost:3000/api/admin/plans/plan_123/pricing \
  -H "Content-Type: application/json" \
  -d '{
    "billingCycle": "monthly",
    "billingPeriodMonths": 1,
    "price": 49900,
    "currency": "INR",
    "isActive": true
  }'
```

### Step 3: Add Quarterly Pricing
```bash
curl -X POST http://localhost:3000/api/admin/plans/plan_123/pricing \
  -H "Content-Type: application/json" \
  -d '{
    "billingCycle": "quarterly",
    "billingPeriodMonths": 3,
    "price": 139700,
    "currency": "INR",
    "discountPercentage": 5,
    "isActive": true
  }'
```

### Step 4: Add Yearly Pricing
```bash
curl -X POST http://localhost:3000/api/admin/plans/plan_123/pricing \
  -H "Content-Type: application/json" \
  -d '{
    "billingCycle": "yearly",
    "billingPeriodMonths": 12,
    "price": 499000,
    "currency": "INR",
    "discountPercentage": 10,
    "isActive": true
  }'
```

### Step 5: Get Complete Plan with Pricing
```bash
curl http://localhost:3000/api/admin/plans/plan_123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "plan_123",
    "name": "Premium Doctor Plan",
    "tier": "premium",
    "userRole": "doctor",
    "description": "Advanced features for experienced doctors",
    "isActive": true,
    "defaultBillingCycle": "monthly",
    "pricingOptions": [
      {
        "id": "pricing_1",
        "billingCycle": "monthly",
        "billingPeriodMonths": 1,
        "price": 49900,
        "currency": "INR",
        "discountPercentage": 0
      },
      {
        "id": "pricing_2",
        "billingCycle": "quarterly",
        "billingPeriodMonths": 3,
        "price": 139700,
        "currency": "INR",
        "discountPercentage": 5
      },
      {
        "id": "pricing_3",
        "billingCycle": "yearly",
        "billingPeriodMonths": 12,
        "price": 499000,
        "currency": "INR",
        "discountPercentage": 10
      }
    ]
  }
}
```

---

## Important Notes

1. **Price Format**: Always send price in **cents** (smallest currency unit)
   - ₹499.00 = `49900`
   - ₹999.99 = `99999`
   - $9.99 = `999`

2. **Billing Cycle Mapping**:
   - `monthly` → `billingPeriodMonths: 1`
   - `quarterly` → `billingPeriodMonths: 3`
   - `yearly` → `billingPeriodMonths: 12`
   - `custom` → `billingPeriodMonths: <any number>`

3. **Features are Plan-Specific**:
   - Doctor plans use: `visibilityWeight`, `maxAffiliations`, `maxAssignmentsPerMonth`
   - Hospital plans use: `maxPatientsPerMonth`, `hospitalMaxAssignmentsPerMonth`, `includesPremiumDoctors`

4. **Pricing is Separate**: 
   - Plans don't have price/currency directly
   - Pricing options are managed separately
   - One plan can have multiple pricing options

5. **Unlimited Values**: Use `-1` for unlimited features (e.g., `maxAssignmentsPerMonth: -1`)

---

## Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "name: Plan name is required",
    "price: Price must be non-negative"
  ],
  "details": [
    {
      "code": "invalid_type",
      "path": ["name"],
      "message": "Plan name is required"
    }
  ]
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Plan not found"
}
```

### Server Error
```json
{
  "success": false,
  "message": "Failed to create plan",
  "error": "Database connection error"
}
```

---

## Summary

1. **Create Plan** → `POST /api/admin/plans` (with features)
2. **Add Pricing** → `POST /api/admin/plans/{planId}/pricing` (multiple times for different cycles)
3. **Update Plan** → `PUT /api/admin/plans/{planId}` (details and features)
4. **Update Pricing** → `PUT /api/admin/plans/{planId}/pricing/{pricingId}`
5. **View Plan** → `GET /api/admin/plans/{planId}` (includes all pricing options)

This approach (Approach 3) separates plan features from pricing, allowing flexible pricing management without affecting existing subscriptions.

