# Hospital Registration API

## Overview

This document describes the single POST API endpoint for hospital registration that handles the entire registration process in one atomic transaction.

## Endpoint

**POST** `/api/hospitals/register`

## Request Body

```json
{
  "email": "hospital@example.com",
  "password": "SecurePassword123!",
  "phone": "+1234567890",
  "name": "City General Hospital",
  "registrationNumber": "HOSP-12345",
  "address": "123 Main Street",
  "city": "New York",
  "hospitalType": "general", // optional: general, specialty, clinic, trauma_center, teaching, other
  "numberOfBeds": 100, // optional
  "contactEmail": "contact@hospital.com", // optional, defaults to email
  "contactPhone": "+1234567890", // optional, defaults to phone
  "websiteUrl": "https://hospital.com", // optional
  "latitude": 40.7128, // optional
  "longitude": -74.0060, // optional
  "departments": [
    {
      "specialtyId": "uuid-of-specialty-1"
    },
    {
      "specialtyId": "uuid-of-specialty-2"
    }
  ],
  "device": { // optional
    "device_token": "web-token-123",
    "device_type": "web",
    "app_version": "1.0.0",
    "os_version": "1.0.0",
    "is_active": true
  }
}
```

## Required Fields

- `email` - Valid email address
- `password` - Minimum 8 characters
- `phone` - Valid phone number
- `name` - Hospital name (minimum 3 characters)
- `registrationNumber` - Unique registration number (minimum 3 characters)
- `address` - Hospital address (minimum 5 characters)
- `city` - City name (minimum 2 characters)
- `departments` - Array with at least one department (specialty ID)

## Response

### Success (201 Created)

```json
{
  "success": true,
  "message": "Hospital registered successfully and awaiting verification",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "hospital@example.com",
      "phone": "+1234567890",
      "role": "hospital",
      "status": "pending"
    },
    "hospital": {
      "id": "hospital-uuid",
      "name": "City General Hospital",
      "registrationNumber": "HOSP-12345",
      "city": "New York"
    },
    "departments": [
      {
        "id": "dept-uuid",
        "hospitalId": "hospital-uuid",
        "specialtyId": "specialty-uuid"
      }
    ],
    "accessToken": "jwt-token-here"
  }
}
```

### Error (400 Bad Request)

```json
{
  "success": false,
  "message": "Validation error message"
}
```

### Error (409 Conflict)

```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

or

```json
{
  "success": false,
  "message": "Hospital with this registration number already exists"
}
```

### Error (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Failed to register hospital",
  "error": "Error details",
  "details": "Detailed error (only in development)"
}
```

## What It Does

1. **Validates Input**: Checks all required fields and validates formats
2. **Checks Duplicates**: Verifies email and registration number are unique
3. **Creates User**: Inserts user record with hashed password
4. **Creates Hospital**: Inserts hospital profile
5. **Creates Departments**: Links hospital to selected specialties
6. **Registers Device**: (Optional) Creates device record for tracking
7. **Generates Token**: Returns JWT access token for immediate login

All operations are performed in a **database transaction** to ensure atomicity - if any step fails, all changes are rolled back.

## Frontend Integration

The frontend form (`/register/hospital`) includes:

- **Field-level validation** with real-time error messages
- **Multi-step form** (Organization, Location, Professional, Departments)
- **Progress indicator** showing completion percentage
- **Automatic token storage** in localStorage
- **Redirect to dashboard** after successful registration

## Field Validation Rules

- **Email**: Must be valid email format
- **Password**: Minimum 8 characters, must contain lowercase, uppercase, and number
- **Phone**: Must be valid phone number (minimum 10 digits)
- **Name**: Minimum 3 characters
- **Registration Number**: Minimum 3 characters, must be unique
- **Address**: Minimum 5 characters
- **City**: Minimum 2 characters
- **Number of Beds**: Must be non-negative integer, maximum 10,000
- **Departments**: At least one department must be selected

## Notes

- Hospital status is set to `pending` initially and requires admin verification
- License verification status is set to `pending`
- The API uses bcrypt for password hashing (10 rounds)
- JWT token expiration is set to 7 days by default


