# Doctor API Documentation

Complete API documentation for mobile developers - Hospital Surgeons Application

**Base URL:** `https://hospital-surgoen.onrender.com` (Production) or `http://localhost:3000` (Development)

**Authentication:** All protected endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <accessToken>
```

---

## Table of Contents

1. [Authentication](#authentication)
2. [Doctor Registration](#doctor-registration)
3. [Doctor Profile](#doctor-profile)
4. [Credentials & Documents](#credentials--documents)
5. [Specializations](#specializations)
6. [Availability & Schedule](#availability--schedule)
7. [Leaves & Time Off](#leaves--time-off)
8. [Assignments](#assignments)
9. [Dashboard](#dashboard)
10. [Common Data Structures](#common-data-structures)
11. [Error Handling](#error-handling)

---

## Authentication

### Login

**Endpoint:** `POST /api/users/login`

**Description:** Authenticate doctor and receive access tokens

**Request:**
```json
{
  "email": "doctor@example.com",
  "password": "SecurePassword123!",
  "device": {
    "device_token": "device-token-here",
    "device_type": "web",
    "app_version": "1.0.0",
    "os_version": "1.0.0",
    "device_name": "Chrome Browser",
    "is_active": true
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "User not found"
}
```
or
```json
{
  "success": false,
  "message": "Invalid password"
}
```

---

## Doctor Registration

### Register Doctor

**Endpoint:** `POST /api/doctors/register`

**Description:** Complete doctor registration in a single API call (creates user account, doctor profile, and specialties)

**Request:**
```json
{
  "email": "doctor@example.com",
  "password": "SecurePassword123!",
  "phone": "+1234567890",
  "firstName": "John",
  "lastName": "Smith",
  "medicalLicenseNumber": "MD-12345",
  "yearsOfExperience": 5,
  "bio": "Experienced cardiologist with 5 years of practice...",
  "profilePhotoId": "uuid-optional",
  "primaryLocation": "Mumbai, India",
  "specialties": [
    {
      "specialtyId": "uuid-of-specialty",
      "isPrimary": true,
      "yearsOfExperience": 5
    }
  ],
  "device": {
    "device_token": "device-token",
    "device_type": "ios",
    "app_version": "1.0.0",
    "os_version": "14.0",
    "is_active": true
  }
}
```

**Required Fields:**
- `email` (string, email format)
- `password` (string, min 8 characters)
- `phone` (string)
- `firstName` (string)
- `lastName` (string)
- `medicalLicenseNumber` (string)
- `yearsOfExperience` (integer)
- `specialties` (array, min 1 item)

**Optional Fields:**
- `bio` (string)
- `profilePhotoId` (string, UUID)
- `primaryLocation` (string)
- `device` (object)

**Response (201 Created):**
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
        "specialtyId": "uuid",
        "isPrimary": true
      }
    ],
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400 Bad Request):**
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
  "message": "Doctor with this license number already exists"
}
```

---

## Doctor Profile

### Get Doctor Profile

**Endpoint:** `GET /api/doctors/profile`

**Description:** Get authenticated doctor's profile

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "firstName": "John",
    "lastName": "Smith",
    "medicalLicenseNumber": "MD-12345",
    "yearsOfExperience": 5,
    "bio": "Experienced cardiologist...",
    "primaryLocation": "Mumbai, India",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "profilePhotoId": "uuid",
    "licenseVerificationStatus": "pending",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Doctor profile not found"
}
```

### Create Doctor Profile

**Endpoint:** `POST /api/doctors/profile`

**Description:** Create doctor profile for authenticated user

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "medicalLicenseNumber": "MD-12345",
  "yearsOfExperience": 5,
  "bio": "Experienced cardiologist...",
  "primaryLocation": "Mumbai, India",
  "profilePhotoId": "uuid-optional"
}
```

**Required Fields:**
- `medicalLicenseNumber` (string)
- `primaryLocation` (string)

**Optional Fields:**
- `firstName` (string)
- `lastName` (string)
- `yearsOfExperience` (number)
- `bio` (string, max 500 chars)
- `profilePhotoId` (string, UUID)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Doctor profile created successfully",
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Smith",
    "medicalLicenseNumber": "MD-12345",
    "yearsOfExperience": 5,
    "bio": "Experienced cardiologist...",
    "primaryLocation": "Mumbai, India",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "profilePhotoId": "uuid",
    "licenseVerificationStatus": "pending"
  }
}
```

### Update Doctor Profile

**Endpoint:** `PATCH /api/doctors/{doctorId}`

**Description:** Update existing doctor profile

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "medicalLicenseNumber": "MD-12345",
  "yearsOfExperience": 5,
  "bio": "Updated bio...",
  "primaryLocation": "New Delhi, India",
  "profilePhotoId": "uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Doctor profile updated successfully",
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Smith",
    "medicalLicenseNumber": "MD-12345",
    "yearsOfExperience": 5,
    "bio": "Updated bio...",
    "primaryLocation": "New Delhi, India",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "profilePhotoId": "uuid",
    "licenseVerificationStatus": "pending"
  }
}
```

---

## Credentials & Documents

### Get Doctor Credentials

**Endpoint:** `GET /api/doctors/{doctorId}/credentials`

**Description:** Get all credentials/documents for a doctor

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "doctorId": "uuid",
      "credentialType": "degree",
      "title": "MBBS Degree",
      "institution": "AIIMS Delhi",
      "verificationStatus": "pending",
      "fileId": "uuid",
      "uploadedAt": "2024-01-15T10:00:00Z",
      "createdAt": "2024-01-15T10:00:00Z",
      "file": {
        "id": "uuid",
        "filename": "mbbs-certificate.pdf",
        "url": "https://...",
        "mimetype": "application/pdf",
        "size": 2048576
      }
    }
  ]
}
```

### Upload Credential File

**Endpoint:** `POST /api/files/upload`

**Description:** Upload credential document file

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Request (FormData):**
```
file: <File> (PDF or image, max 5MB)
folder: "doctor-credentials/{doctorId}"
bucket: "images"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "fileId": "uuid",
    "url": "https://...",
    "filename": "document.pdf",
    "size": 2048576,
    "mimetype": "application/pdf"
  }
}
```

### Create Credential Record

**Endpoint:** `POST /api/doctors/{doctorId}/credentials`

**Description:** Create credential record after file upload

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request:**
```json
{
  "fileId": "uuid",
  "credentialType": "degree",
  "title": "MBBS Degree",
  "institution": "AIIMS Delhi"
}
```

**Required Fields:**
- `fileId` (string, UUID)
- `credentialType` (string: "degree" | "certificate" | "license" | "other")
- `title` (string)

**Optional Fields:**
- `institution` (string)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Credential created successfully",
  "data": {
    "id": "uuid",
    "doctorId": "uuid",
    "credentialType": "degree",
    "title": "MBBS Degree",
    "institution": "AIIMS Delhi",
    "verificationStatus": "pending",
    "fileId": "uuid",
    "uploadedAt": "2024-01-15T10:00:00Z"
  }
}
```

### Download Credential File

**Endpoint:** `GET /api/files/{fileId}/download`

**Description:** Download credential file

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
- Binary file data (blob)
- Content-Type: Based on file type
- Content-Disposition: attachment; filename="document.pdf"

---

## Specializations

### Get Active Specialties

**Endpoint:** `GET /api/specialties/active`

**Description:** Get all available specialties

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Cardiology",
      "description": "Heart and cardiovascular system",
      "isActive": true
    },
    {
      "id": "uuid",
      "name": "Neurology",
      "description": "Nervous system disorders",
      "isActive": true
    }
  ]
}
```

### Get Doctor Specialties

**Endpoint:** `GET /api/doctors/{doctorId}/specialties`

**Description:** Get all specialties associated with a doctor

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "doctorSpecialty": {
        "id": "uuid",
        "doctorId": "uuid",
        "specialtyId": "uuid",
        "isPrimary": true,
        "yearsOfExperience": 5,
        "createdAt": "2024-01-15T10:00:00Z"
      },
      "specialty": {
        "id": "uuid",
        "name": "Cardiology",
        "description": "Heart and cardiovascular system"
      }
    }
  ]
}
```

### Add Specialty to Doctor

**Endpoint:** `POST /api/doctors/{doctorId}/specialties`

**Description:** Add a specialty to doctor's profile

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request:**
```json
{
  "specialtyId": "uuid"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Specialty added successfully",
  "data": {
    "id": "uuid",
    "doctorId": "uuid",
    "specialtyId": "uuid",
    "isPrimary": false,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### Remove Specialty from Doctor

**Endpoint:** `DELETE /api/doctors/{doctorId}/specialties/{specialtyId}`

**Description:** Remove a specialty from doctor's profile

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Specialty removed successfully"
}
```

---

## Availability & Schedule

### Get Availability Slots

**Endpoint:** `GET /api/doctors/{doctorId}/availability`

**Description:** Get all availability slots for a doctor

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `startDate` (optional, string, YYYY-MM-DD) - Filter from date
- `endDate` (optional, string, YYYY-MM-DD) - Filter to date
- `status` (optional, string) - Filter by status: "available" | "booked" | "blocked"

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "doctorId": "uuid",
      "slotDate": "2024-01-15",
      "startTime": "09:00",
      "endTime": "10:00",
      "status": "available",
      "notes": "Regular consultation",
      "templateId": "uuid",
      "isManual": false,
      "createdAt": "2024-01-10T10:00:00Z"
    }
  ]
}
```

### Create Availability Slot

**Endpoint:** `POST /api/doctors/{doctorId}/availability`

**Description:** Create a new availability slot

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request:**
```json
{
  "slotDate": "2024-01-15",
  "startTime": "09:00",
  "endTime": "10:00",
  "notes": "Special consultation day",
  "status": "available",
  "isManual": true
}
```

**Required Fields:**
- `slotDate` (string, YYYY-MM-DD)
- `startTime` (string, HH:mm)
- `endTime` (string, HH:mm)

**Optional Fields:**
- `notes` (string)
- `status` (string, default: "available")
- `isManual` (boolean, default: false)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Availability slot created successfully",
  "data": {
    "id": "uuid",
    "doctorId": "uuid",
    "slotDate": "2024-01-15",
    "startTime": "09:00",
    "endTime": "10:00",
    "status": "available",
    "notes": "Special consultation day",
    "isManual": true
  }
}
```

### Update Availability Slot

**Endpoint:** `PATCH /api/doctors/availability/{availabilityId}`

**Description:** Update an availability slot

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request:**
```json
{
  "slotDate": "2024-01-15",
  "startTime": "10:00",
  "endTime": "11:00",
  "status": "blocked",
  "notes": "Updated notes"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Availability slot updated successfully",
  "data": {
    "id": "uuid",
    "slotDate": "2024-01-15",
    "startTime": "10:00",
    "endTime": "11:00",
    "status": "blocked",
    "notes": "Updated notes"
  }
}
```

### Delete Availability Slot

**Endpoint:** `DELETE /api/doctors/availability/{availabilityId}`

**Description:** Delete an availability slot

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Availability slot deleted successfully"
}
```

### Get Availability Templates

**Endpoint:** `GET /api/doctors/{doctorId}/availability/templates`

**Description:** Get all recurring availability templates

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "doctorId": "uuid",
      "templateName": "Morning Rounds",
      "startTime": "09:00",
      "endTime": "12:00",
      "recurrencePattern": "weekly",
      "recurrenceDays": ["mon", "wed", "fri"],
      "validFrom": "2024-01-01",
      "validUntil": "2024-12-31",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### Create Availability Template

**Endpoint:** `POST /api/doctors/{doctorId}/availability/templates`

**Description:** Create a recurring availability template

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request:**
```json
{
  "templateName": "Morning Rounds",
  "startTime": "09:00",
  "endTime": "12:00",
  "recurrencePattern": "weekly",
  "recurrenceDays": ["mon", "wed", "fri"],
  "validFrom": "2024-01-01",
  "validUntil": "2024-12-31"
}
```

**Required Fields:**
- `templateName` (string)
- `startTime` (string, HH:mm)
- `endTime` (string, HH:mm)
- `recurrencePattern` (string: "daily" | "weekly" | "monthly" | "custom")
- `validFrom` (string, YYYY-MM-DD)

**Optional Fields:**
- `recurrenceDays` (array of strings, required for weekly/custom: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"])
- `validUntil` (string, YYYY-MM-DD)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Template created successfully",
  "data": {
    "id": "uuid",
    "doctorId": "uuid",
    "templateName": "Morning Rounds",
    "startTime": "09:00",
    "endTime": "12:00",
    "recurrencePattern": "weekly",
    "recurrenceDays": ["mon", "wed", "fri"],
    "validFrom": "2024-01-01",
    "validUntil": "2024-12-31"
  }
}
```

### Update Availability Template

**Endpoint:** `PATCH /api/doctors/{doctorId}/availability/templates/{templateId}`

**Description:** Update an availability template

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request:** (Same as create)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Template updated successfully",
  "data": {
    "id": "uuid",
    "templateName": "Updated Morning Rounds",
    "startTime": "10:00",
    "endTime": "13:00",
    "recurrencePattern": "weekly",
    "recurrenceDays": ["mon", "wed", "fri"]
  }
}
```

### Delete Availability Template

**Endpoint:** `DELETE /api/doctors/{doctorId}/availability/templates/{templateId}`

**Description:** Delete an availability template

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

### Generate Slots from Templates

**Endpoint:** `POST /api/doctors/{doctorId}/availability/templates/generate`

**Description:** Generate availability slots from templates for the next 7 days

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "slotsCreated": 21,
    "templatesProcessed": 3,
    "dateRange": {
      "start": "2024-01-15",
      "end": "2024-01-21"
    }
  }
}
```

---

## Leaves & Time Off

### Get Doctor Leaves

**Endpoint:** `GET /api/doctors/{doctorId}/unavailability`

**Description:** Get all leave/unavailability records for a doctor

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `startDate` (optional, string, YYYY-MM-DD) - Filter from date
- `endDate` (optional, string, YYYY-MM-DD) - Filter to date

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "doctorId": "uuid",
      "startDate": "2024-01-15",
      "endDate": "2024-01-20",
      "leaveType": "vacation",
      "reason": "Family vacation",
      "createdAt": "2024-01-10T10:00:00Z"
    }
  ]
}
```

### Create Leave

**Endpoint:** `POST /api/doctors/{doctorId}/unavailability`

**Description:** Create a new leave/unavailability record

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request:**
```json
{
  "startDate": "2024-01-15",
  "endDate": "2024-01-20",
  "leaveType": "vacation",
  "reason": "Family vacation"
}
```

**Required Fields:**
- `startDate` (string, YYYY-MM-DD)
- `endDate` (string, YYYY-MM-DD)

**Optional Fields:**
- `leaveType` (string: "sick" | "vacation" | "personal" | "emergency" | "other", default: "other")
- `reason` (string)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Leave record created successfully",
  "data": {
    "id": "uuid",
    "doctorId": "uuid",
    "startDate": "2024-01-15",
    "endDate": "2024-01-20",
    "leaveType": "vacation",
    "reason": "Family vacation",
    "createdAt": "2024-01-10T10:00:00Z"
  }
}
```

### Update Leave

**Endpoint:** `PATCH /api/doctors/unavailability/{unavailabilityId}`

**Description:** Update an existing leave record

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request:**
```json
{
  "startDate": "2024-01-15",
  "endDate": "2024-01-22",
  "leaveType": "vacation",
  "reason": "Extended vacation"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Leave record updated successfully",
  "data": {
    "id": "uuid",
    "startDate": "2024-01-15",
    "endDate": "2024-01-22",
    "leaveType": "vacation",
    "reason": "Extended vacation"
  }
}
```

### Delete Leave

**Endpoint:** `DELETE /api/doctors/unavailability/{unavailabilityId}`

**Description:** Delete a leave record

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Leave record deleted successfully"
}
```

---

## Assignments

### Get Doctor Assignments

**Endpoint:** `GET /api/doctors/{doctorId}/assignments`

**Description:** Get all assignments for a doctor with filters

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `status` (optional, string) - Filter by status: "pending" | "confirmed" | "completed" | "cancelled" | "all"
- `search` (optional, string) - Search by patient name, hospital name, or condition
- `todayOnly` (optional, boolean) - Filter to only today's assignments

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "patient": "John Doe",
      "condition": "Cardiac Arrhythmia",
      "hospital": "City Hospital",
      "date": "2024-01-15",
      "time": "10:00",
      "endTime": "11:00",
      "status": "pending",
      "priority": "urgent",
      "fee": 5000,
      "createdAt": "2024-01-10T10:00:00Z",
      "expiresIn": "2 hours",
      "hospitalId": "uuid",
      "patientId": "uuid"
    }
  ]
}
```

### Accept Assignment

**Endpoint:** `PATCH /api/assignments/{assignmentId}/status`

**Description:** Accept a pending assignment

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request:**
```json
{
  "status": "accepted"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Assignment accepted successfully",
  "data": {
    "id": "uuid",
    "status": "accepted",
    "acceptedAt": "2024-01-10T12:00:00Z"
  }
}
```

### Decline Assignment

**Endpoint:** `PATCH /api/assignments/{assignmentId}/status`

**Description:** Decline a pending assignment with optional reason

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request:**
```json
{
  "status": "declined",
  "cancellationReason": "Schedule conflict, unable to accommodate on requested date"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Assignment declined successfully",
  "data": {
    "id": "uuid",
    "status": "declined",
    "declinedAt": "2024-01-10T12:00:00Z",
    "declineReason": "Schedule conflict, unable to accommodate on requested date"
  }
}
```

---

## Dashboard

### Get Dashboard Statistics

**Endpoint:** `GET /api/doctors/dashboard`

**Description:** Get dashboard statistics for authenticated doctor

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "profileCompletion": 90,
    "totalAssignments": 25,
    "pendingAssignments": 3,
    "completedAssignments": 20,
    "totalEarnings": 125000,
    "upcomingAssignments": [
      {
        "id": "uuid",
        "patient": "John Doe",
        "hospital": "City Hospital",
        "date": "2024-01-15",
        "time": "10:00"
      }
    ],
    "recentActivity": [
      {
        "type": "assignment_completed",
        "text": "Completed assignment for John Doe",
        "time": "2 hours ago",
        "timestamp": "2024-01-10T10:00:00Z"
      }
    ]
  }
}
```

### Get Pending Assignments

**Endpoint:** `GET /api/doctors/pending-assignments`

**Description:** Get pending assignment requests

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "patient": "John Doe",
      "condition": "Cardiac Arrhythmia",
      "hospital": "City Hospital",
      "date": "2024-01-15",
      "time": "10:00",
      "priority": "urgent",
      "fee": 5000,
      "expiresIn": "2 hours"
    }
  ]
}
```

### Get Earnings

**Endpoint:** `GET /api/doctors/earnings`

**Description:** Get earnings and payment statistics

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `startDate` (optional, string, YYYY-MM-DD)
- `endDate` (optional, string, YYYY-MM-DD)
- `period` (optional, string) - "week" | "month" | "year" | "all"

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalEarnings": 125000,
    "pendingPayments": 15000,
    "paidAmount": 110000,
    "periodEarnings": 25000,
    "transactions": [
      {
        "id": "uuid",
        "amount": 5000,
        "status": "paid",
        "date": "2024-01-15",
        "assignmentId": "uuid"
      }
    ]
  }
}
```

### Get Recent Activity

**Endpoint:** `GET /api/doctors/recent-activity`

**Description:** Get recent activity for authenticated doctor

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `limit` (optional, integer, default: 10) - Maximum number of activities

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "type": "assignment_completed",
      "icon": "check-circle",
      "text": "Completed assignment for John Doe",
      "time": "2 hours ago",
      "timestamp": "2024-01-10T10:00:00Z"
    },
    {
      "type": "credential_verified",
      "icon": "verified",
      "text": "MBBS Degree verified by admin",
      "time": "1 day ago",
      "timestamp": "2024-01-09T10:00:00Z"
    }
  ]
}
```

---

## Common Data Structures

### Doctor Profile
```typescript
interface DoctorProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  medicalLicenseNumber: string;
  yearsOfExperience: number;
  bio: string | null;
  primaryLocation: string;
  latitude: number | null;
  longitude: number | null;
  profilePhotoId: string | null;
  licenseVerificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}
```

### Credential
```typescript
interface Credential {
  id: string;
  doctorId: string;
  credentialType: 'degree' | 'certificate' | 'license' | 'other';
  title: string;
  institution: string | null;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  fileId: string;
  uploadedAt: string;
  file?: {
    id: string;
    filename: string;
    url: string;
    mimetype: string;
    size: number;
  };
}
```

### Availability Slot
```typescript
interface AvailabilitySlot {
  id: string;
  doctorId: string;
  slotDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'available' | 'booked' | 'blocked';
  notes: string | null;
  templateId: string | null;
  isManual: boolean;
  createdAt: string;
}
```

### Availability Template
```typescript
interface AvailabilityTemplate {
  id: string;
  doctorId: string;
  templateName: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  recurrencePattern: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrenceDays: string[]; // ['mon', 'tue', 'wed', etc.]
  validFrom: string; // YYYY-MM-DD
  validUntil: string | null; // YYYY-MM-DD
  createdAt: string;
}
```

### Leave/Unavailability
```typescript
interface Leave {
  id: string;
  doctorId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  leaveType: 'sick' | 'vacation' | 'personal' | 'emergency' | 'other';
  reason: string | null;
  createdAt: string;
}
```

### Assignment
```typescript
interface Assignment {
  id: string;
  patient: string;
  condition: string;
  hospital: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  endTime: string | null; // HH:mm
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  priority: 'routine' | 'urgent' | 'emergency';
  fee: number;
  createdAt: string;
  acceptedAt: string | null;
  declinedAt: string | null;
  completedAt: string | null;
  expiresIn: string | null; // e.g., "2 hours"
  declineReason: string | null;
  hospitalId: string;
  patientId: string;
}
```

---

## Error Handling

### Standard Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "error": "Detailed error information (optional)"
}
```

### HTTP Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data or validation error
- **401 Unauthorized** - Missing or invalid authentication token
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

### Common Error Messages

**Authentication Errors:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Validation Errors:**
```json
{
  "success": false,
  "message": "firstName is required"
}
```

**Not Found Errors:**
```json
{
  "success": false,
  "message": "Doctor profile not found"
}
```

**Duplicate Errors:**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

## Notes for Mobile Developers

1. **Token Management:**
   - Store `accessToken` securely (Keychain on iOS, Keystore on Android)
   - Token expires after 15 minutes (900 seconds)
   - Use `refreshToken` to get new access token when expired
   - Include token in `Authorization` header for all protected endpoints

2. **File Uploads:**
   - Use `multipart/form-data` for file uploads
   - Maximum file size: 5MB
   - Supported formats: PDF, PNG, JPG, JPEG
   - Upload file first, then create credential record with returned `fileId`

3. **Date Formats:**
   - Dates: `YYYY-MM-DD` (e.g., "2024-01-15")
   - Times: `HH:mm` (24-hour format, e.g., "09:00", "14:30")
   - ISO timestamps: `YYYY-MM-DDTHH:mm:ssZ` (e.g., "2024-01-15T10:00:00Z")

4. **Pagination:**
   - Some endpoints support pagination with `page` and `limit` query parameters
   - Default limit: 10 items per page

5. **Error Handling:**
   - Always check `success` field in response
   - Display user-friendly error messages from `message` field
   - Log detailed errors for debugging

6. **Network Handling:**
   - Implement retry logic for network failures
   - Handle timeout scenarios (recommended: 30 seconds)
   - Show loading indicators during API calls
   - Cache responses where appropriate (profile, specialties list)

7. **Testing:**
   - Use Swagger UI at `/api-docs` for testing endpoints
   - Test with both valid and invalid data
   - Test authentication token expiration scenarios

---

## Support

For API support or questions:
- Swagger Documentation: `https://hospital-surgoen.onrender.com/api-docs`
- API Base URL: `https://hospital-surgoen.onrender.com`

---

**Last Updated:** January 2024
**API Version:** 1.0.0

