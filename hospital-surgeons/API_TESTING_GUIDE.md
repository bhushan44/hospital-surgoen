# API Testing Guide

This guide explains how to test all API endpoints with dummy data.

## Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **In another terminal, run the test script:**
   ```bash
   npm run test:api
   ```

   Or directly:
   ```bash
   node scripts/test-apis.mjs
   ```

## Test Script Location

- **File**: `scripts/test-apis.mjs`
- **Usage**: Tests all API endpoints with dummy data

## What Gets Tested

### User APIs
- ✅ User Signup (creates new user)
- ✅ User Login
- ✅ Get User Profile
- ✅ Refresh Token

### Doctor APIs
- ✅ Create Doctor
- ✅ Get All Doctors
- ✅ Get Doctor By ID

### Hospital APIs
- ✅ Create Hospital
- ✅ Get All Hospitals

### Specialty APIs
- ✅ Get All Specialties
- ✅ Create Specialty

### Booking APIs
- ✅ Create Booking
- ✅ Get All Bookings

### Payment APIs
- ✅ Create Payment
- ✅ Get All Payments

### Subscription APIs
- ✅ Get Subscription Plans
- ✅ Create Subscription Plan

### Notification APIs
- ✅ Create Notification
- ✅ Get All Notifications

### Review APIs
- ✅ Create Review
- ✅ Get All Reviews

### Support APIs
- ✅ Create Support Ticket
- ✅ Get All Support Tickets

### Analytics APIs
- ✅ Create Analytics Event
- ✅ Get All Analytics Events

## Test Flow

The test script runs tests in a specific order to handle dependencies:

1. **User Authentication** - Creates user and gets auth token
2. **Specialties** - Gets/creates specialties (needed for doctors/hospitals)
3. **Doctors** - Creates and retrieves doctors
4. **Hospitals** - Creates and retrieves hospitals
5. **Bookings** - Creates bookings (requires doctor & hospital)
6. **Payments** - Creates and retrieves payments
7. **Subscriptions** - Gets and creates subscription plans
8. **Notifications** - Creates and retrieves notifications
9. **Reviews** - Creates and retrieves reviews
10. **Support** - Creates and retrieves support tickets
11. **Analytics** - Creates and retrieves analytics events

## Dummy Data Used

### User Signup
```json
{
  "email": "testdoctor{timestamp}@example.com",
  "phone": "+1234567890",
  "password": "TestPassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Doctor Creation
```json
{
  "firstName": "Dr. Sarah",
  "lastName": "Johnson",
  "medicalLicenseNumber": "LIC-{timestamp}",
  "yearsOfExperience": 10,
  "bio": "Experienced cardiologist with 10 years of practice."
}
```

### Hospital Creation
```json
{
  "email": "hospital{timestamp}@example.com",
  "phone": "+1234567890",
  "password": "HospitalPass123!",
  "name": "City General Hospital",
  "hospitalType": "General Hospital",
  "registrationNumber": "REG-{timestamp}",
  "address": "123 Medical Center Blvd",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "USA",
  "numberOfBeds": 200
}
```

### Booking Creation
```json
{
  "doctorId": "{doctorId}",
  "hospitalId": "{hospitalId}",
  "appointmentDate": "{7 days from now}",
  "appointmentTime": "10:00:00",
  "duration": 60,
  "status": "pending",
  "notes": "Test booking"
}
```

## Output

The test script provides colored output:
- ✅ **Green** - Test passed
- ✗ **Red** - Test failed
- ⚠ **Yellow** - Test skipped (missing dependencies)
- ℹ **Cyan** - Information

## Example Output

```
============================================================
API TESTING SCRIPT - Testing All Endpoints
============================================================
Base URL: http://localhost:3000

=== Testing User Signup ===
✓ User signup successful
ℹ Token: eyJhbGciOiJIUzI1NiIs...
ℹ User ID: 123e4567-e89b-12d3-a456-426614174000

=== Testing Get Specialties ===
✓ Get specialties successful (5 specialties)

...

============================================================
TEST SUMMARY
============================================================
✓ Passed: 20
✗ Failed: 2
⚠ Skipped: 0
Total: 22
============================================================
```

## Customization

### Change Base URL

Set environment variable:
```bash
API_BASE_URL=http://localhost:3000 npm run test:api
```

Or edit the script:
```javascript
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
```

### Add More Tests

Edit `scripts/test-apis.mjs` and add new test functions following the same pattern:

```javascript
async function testNewEndpoint() {
  logInfo('\n=== Testing New Endpoint ===');
  const dummyData = { /* your data */ };
  const result = await makeRequest('POST', '/api/new-endpoint', dummyData, authToken);
  // ... handle result
}
```

Then add it to the `tests` array in `runAllTests()`.

## Troubleshooting

### "fetch is not defined"
- Make sure you're using Node.js 18+ or install `node-fetch`
- The script uses ES modules, ensure `package.json` has `"type": "module"` or use `.mjs` extension

### "Connection refused"
- Make sure the Next.js dev server is running (`npm run dev`)
- Check the BASE_URL is correct

### "Unauthorized" errors
- Tests that require authentication will be skipped if no token is available
- Make sure user signup/login tests run first

### Tests failing
- Check the server logs for detailed error messages
- Verify database connection is working
- Ensure all required environment variables are set

## Manual Testing

You can also test APIs manually using:

### cURL
```bash
curl -X POST http://localhost:3000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","phone":"+1234567890"}'
```

### Postman/Insomnia
- Import the API documentation from `/api-docs`
- Use the Swagger UI at `/api-docs` for interactive testing

### Browser Console
```javascript
fetch('/api/doctors', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(console.log);
```

## Next Steps

- Add more comprehensive test cases
- Add validation tests
- Add error handling tests
- Add performance tests
- Integrate with CI/CD pipeline




