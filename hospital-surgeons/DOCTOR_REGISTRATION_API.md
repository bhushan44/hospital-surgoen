# Doctor Registration API - Single Endpoint Solution

## Overview

This document explains the new single POST API endpoint for complete doctor registration that replaces the previous multi-step flow.

## API Endpoint

**POST** `/api/doctors/register`

## Benefits of Single API Approach

1. **Atomicity**: All operations (user creation, doctor profile, specialties) happen in one request
2. **Better UX**: Single request/response cycle, no need to manage localStorage or multiple API calls
3. **Simpler Frontend**: No need to handle step-by-step state management
4. **Better Error Handling**: One place to handle all errors
5. **Performance**: Fewer network round trips
6. **Data Consistency**: All-or-nothing approach ensures data integrity

## Request Body

```json
{
  "email": "doctor@example.com",
  "password": "SecurePassword123!",
  "phone": "+1234567890",
  "firstName": "John",
  "lastName": "Smith",
  "medicalLicenseNumber": "MD-12345",
  "yearsOfExperience": 5,
  "bio": "Experienced cardiologist...",
  "profilePhotoId": "uuid-optional",
  "specialties": [
    {
      "specialtyId": "uuid-1",
      "isPrimary": true,
      "yearsOfExperience": 5
    },
    {
      "specialtyId": "uuid-2",
      "isPrimary": false
    }
  ],
  "device": {
    "device_token": "web-token-123",
    "device_type": "web",
    "app_version": "1.0.0",
    "os_version": "1.0.0",
    "is_active": true
  }
}
```

## Response

### Success (201)
```json
{
  "success": true,
  "message": "Doctor registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "doctor@example.com",
      "phone": "+1234567890",
      "role": "doctor",
      "status": "pending"
    },
    "doctor": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Smith",
      "medicalLicenseNumber": "MD-12345",
      "yearsOfExperience": 5
    },
    "specialties": [
      {
        "id": "uuid",
        "doctorId": "uuid",
        "specialtyId": "uuid-1",
        "isPrimary": true
      }
    ],
    "accessToken": "jwt-token"
  }
}
```

### Error (400/500)
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

## Schema Relationships

The API creates records in the following order:

1. **users** table
   - Creates user account with role='doctor'
   - Status set to 'pending' (requires verification)

2. **doctors** table
   - Links to user via `userId` foreign key
   - Stores doctor-specific information
   - License verification status set to 'pending'

3. **doctor_specialties** table
   - Links to doctor via `doctorId` foreign key
   - Links to specialties via `specialtyId` foreign key
   - Supports multiple specialties per doctor
   - First specialty is marked as primary if none specified

4. **user_devices** table (optional)
   - Links to user via `userId` foreign key
   - Stores device information for push notifications

## Validation

The API validates:
- All required fields are present
- Email format is valid
- Password is at least 8 characters
- At least one specialty is provided
- Email is not already registered
- Medical license number is unique

## Migration from Old Flow

### Old Flow (Multi-step)
```javascript
// Step 1: Create user
const userResponse = await fetch('/api/users/signup', {
  method: 'POST',
  body: JSON.stringify({ email, password, phone, firstName, lastName, role: 'doctor' })
});
const userData = await userResponse.json();
localStorage.setItem('token', userData.data.accessToken);
localStorage.setItem('userId', userData.data.user.id);

// Step 2: Create doctor profile
const doctorResponse = await fetch('/api/doctors/profile', {
  method: 'POST',
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  body: JSON.stringify({ firstName, lastName, medicalLicenseNumber, yearsOfExperience, bio })
});
const doctorData = await doctorResponse.json();
localStorage.setItem('doctorId', doctorData.data.id);

// Step 3: Add specialties (multiple calls)
for (const specialty of specialties) {
  await fetch(`/api/doctors/${localStorage.getItem('doctorId')}/specialties`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify({ specialtyId: specialty.id, isPrimary: specialty.isPrimary })
  });
}
```

### New Flow (Single API)
```javascript
const response = await fetch('/api/doctors/register', {
  method: 'POST',
  body: JSON.stringify({
    email,
    password,
    phone,
    firstName,
    lastName,
    medicalLicenseNumber,
    yearsOfExperience,
    bio,
    specialties: specialties.map(s => ({
      specialtyId: s.id,
      isPrimary: s.isPrimary
    }))
  })
});

const data = await response.json();
if (data.success) {
  localStorage.setItem('token', data.data.accessToken);
  localStorage.setItem('userId', data.data.user.id);
  localStorage.setItem('doctorId', data.data.doctor.id);
  // Redirect to dashboard
}
```

## Notes

- The API automatically marks the first specialty as primary if none is specified
- User status is set to 'pending' - requires admin verification
- License verification status is set to 'pending' - requires admin verification
- JWT token is returned for immediate login
- All operations are performed sequentially (consider adding database transactions for production)

## Future Improvements

1. **Database Transactions**: Wrap all operations in a transaction for true atomicity
2. **Email Verification**: Send verification email after registration
3. **Phone Verification**: Send OTP for phone verification
4. **Profile Photo Upload**: Handle file upload separately or via multipart form
5. **Validation Service**: Extract validation logic to a separate service

