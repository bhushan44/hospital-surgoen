/**
 * API Testing Script with Dummy Data
 * Tests all API endpoints with mock data
 * 
 * Usage: npm run test:api
 * Or: node scripts/test-apis.mjs
 * 
 * Make sure the dev server is running: npm run dev
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
let authToken = null;
let userId = null;
let hospitalId = null;
let doctorId = null;
let specialtyId = null;
let bookingId = null;
let paymentId = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

async function makeRequest(method, endpoint, data = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

// ==================== USER APIs ====================

async function testUserSignup() {
  logInfo('\n=== Testing User Signup ===');
  const dummyData = {
    email: `testdoctor${Date.now()}@example.com`,
    phone: '+1234567890',
    password: 'TestPassword123!',
    firstName: 'John',
    lastName: 'Doe',
    device: {
      device_token: 'test-device-token-123',
      device_type: 'web',
      app_version: '1.0.0',
      os_version: '1.0.0',
      is_active: true,
    },
  };

  const result = await makeRequest('POST', '/api/users/signup', dummyData);
  if (result.status === 201 && result.data.success) {
    authToken = result.data.data.accessToken;
    userId = result.data.data.user.id;
    logSuccess('User signup successful');
    logInfo(`Token: ${authToken.substring(0, 20)}...`);
    logInfo(`User ID: ${userId}`);
    return true;
  } else {
    logError(`User signup failed: ${result.data?.message || result.error}`);
    return false;
  }
}

async function testUserProfile() {
  logInfo('\n=== Testing Get User Profile ===');
  if (!authToken) {
    logWarning('Skipping - No auth token');
    return false;
  }

  const result = await makeRequest('GET', '/api/users/profile', null, authToken);
  if (result.status === 200 && result.data.success) {
    logSuccess('Get user profile successful');
    return true;
  } else {
    logError(`Get user profile failed: ${result.data?.message || result.error}`);
    return false;
  }
}

// ==================== DOCTOR APIs ====================

async function testCreateDoctor() {
  logInfo('\n=== Testing Create Doctor ===');
  if (!authToken) {
    logWarning('Skipping - No auth token');
    return false;
  }

  const dummyData = {
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    medicalLicenseNumber: `LIC-${Date.now()}`,
    yearsOfExperience: 10,
    bio: 'Experienced cardiologist with 10 years of practice.',
  };

  const result = await makeRequest('POST', '/api/doctors', dummyData, authToken);
  if (result.status === 201 && result.data.success) {
    doctorId = result.data.data.id;
    logSuccess('Create doctor successful');
    logInfo(`Doctor ID: ${doctorId}`);
    return true;
  } else {
    logError(`Create doctor failed: ${result.data?.message || result.error}`);
    return false;
  }
}

async function testGetDoctors() {
  logInfo('\n=== Testing Get Doctors ===');
  const result = await makeRequest('GET', '/api/doctors');
  if (result.status === 200 && result.data.success) {
    logSuccess(`Get doctors successful (${result.data.data?.length || 0} doctors)`);
    return true;
  } else {
    logError(`Get doctors failed: ${result.data?.message || result.error}`);
    return false;
  }
}

// ==================== HOSPITAL APIs ====================

async function testCreateHospital() {
  logInfo('\n=== Testing Create Hospital ===');
  const dummyData = {
    email: `hospital${Date.now()}@example.com`,
    phone: '+1234567890',
    password: 'HospitalPass123!',
    name: 'City General Hospital',
    hospitalType: 'General Hospital',
    registrationNumber: `REG-${Date.now()}`,
    address: '123 Medical Center Blvd',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA',
    numberOfBeds: 200,
  };

  const result = await makeRequest('POST', '/api/users/provider-signup', dummyData);
  if (result.status === 201 && result.data.success) {
    hospitalId = result.data.data.hospital.id;
    logSuccess('Create hospital successful');
    logInfo(`Hospital ID: ${hospitalId}`);
    return true;
  } else {
    logError(`Create hospital failed: ${result.data?.message || result.error}`);
    return false;
  }
}

async function testGetHospitals() {
  logInfo('\n=== Testing Get Hospitals ===');
  const result = await makeRequest('GET', '/api/hospitals');
  if (result.status === 200 && result.data.success) {
    logSuccess(`Get hospitals successful (${result.data.data?.length || 0} hospitals)`);
    return true;
  } else {
    logError(`Get hospitals failed: ${result.data?.message || result.error}`);
    return false;
  }
}

// ==================== SPECIALTY APIs ====================

async function testGetSpecialties() {
  logInfo('\n=== Testing Get Specialties ===');
  const result = await makeRequest('GET', '/api/specialties');
  if (result.status === 200 && result.data.success) {
    logSuccess(`Get specialties successful (${result.data.data?.length || 0} specialties)`);
    if (!specialtyId && result.data.data?.length > 0) {
      specialtyId = result.data.data[0].id;
    }
    return true;
  } else {
    logError(`Get specialties failed: ${result.data?.message || result.error}`);
    return false;
  }
}

async function testCreateSpecialty() {
  logInfo('\n=== Testing Create Specialty ===');
  if (!authToken) {
    logWarning('Skipping - No auth token');
    return false;
  }

  const dummyData = {
    name: `Test Specialty ${Date.now()}`,
    description: 'Test specialty description',
    isActive: true,
  };

  const result = await makeRequest('POST', '/api/specialties', dummyData, authToken);
  if (result.status === 201 && result.data.success) {
    specialtyId = result.data.data.id;
    logSuccess('Create specialty successful');
    logInfo(`Specialty ID: ${specialtyId}`);
    return true;
  } else {
    logError(`Create specialty failed: ${result.data?.message || result.error}`);
    return false;
  }
}

// ==================== BOOKING APIs ====================

async function testCreateBooking() {
  logInfo('\n=== Testing Create Booking ===');
  if (!authToken || !doctorId || !hospitalId) {
    logWarning('Skipping - Missing required IDs');
    return false;
  }

  const dummyData = {
    doctorId: doctorId,
    hospitalId: hospitalId,
    appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    appointmentTime: '10:00:00',
    duration: 60,
    status: 'pending',
    notes: 'Test booking',
  };

  const result = await makeRequest('POST', '/api/bookings', dummyData, authToken);
  if (result.status === 201 && result.data.success) {
    bookingId = result.data.data.id;
    logSuccess('Create booking successful');
    logInfo(`Booking ID: ${bookingId}`);
    return true;
  } else {
    logError(`Create booking failed: ${result.data?.message || result.error}`);
    return false;
  }
}

async function testGetBookings() {
  logInfo('\n=== Testing Get Bookings ===');
  if (!authToken) {
    logWarning('Skipping - No auth token');
    return false;
  }

  const result = await makeRequest('GET', '/api/bookings', null, authToken);
  if (result.status === 200 && result.data.success) {
    logSuccess(`Get bookings successful (${result.data.data?.length || 0} bookings)`);
    return true;
  } else {
    logError(`Get bookings failed: ${result.data?.message || result.error}`);
    return false;
  }
}

// ==================== PAYMENT APIs ====================

async function testCreatePayment() {
  logInfo('\n=== Testing Create Payment ===');
  if (!authToken) {
    logWarning('Skipping - No auth token');
    return false;
  }

  const dummyData = {
    paymentType: 'subscription',
    amount: '5000',
    paymentGateway: 'stripe',
    gatewayTransactionId: `TXN-${Date.now()}`,
    status: 'completed',
  };

  const result = await makeRequest('POST', '/api/payments', dummyData, authToken);
  if (result.status === 201 && result.data.success) {
    paymentId = result.data.data.id;
    logSuccess('Create payment successful');
    logInfo(`Payment ID: ${paymentId}`);
    return true;
  } else {
    logError(`Create payment failed: ${result.data?.message || result.error}`);
    return false;
  }
}

async function testGetPayments() {
  logInfo('\n=== Testing Get Payments ===');
  if (!authToken) {
    logWarning('Skipping - No auth token');
    return false;
  }

  const result = await makeRequest('GET', '/api/payments', null, authToken);
  if (result.status === 200 && result.data.success) {
    logSuccess(`Get payments successful (${result.data.data?.length || 0} payments)`);
    return true;
  } else {
    logError(`Get payments failed: ${result.data?.message || result.error}`);
    return false;
  }
}

// ==================== SUBSCRIPTION APIs ====================

async function testGetSubscriptionPlans() {
  logInfo('\n=== Testing Get Subscription Plans ===');
  const result = await makeRequest('GET', '/api/subscriptions/plans');
  if (result.status === 200 && result.data.success) {
    logSuccess(`Get subscription plans successful (${result.data.data?.length || 0} plans)`);
    return true;
  } else {
    logError(`Get subscription plans failed: ${result.data?.message || result.error}`);
    return false;
  }
}

// ==================== NOTIFICATION APIs ====================

async function testCreateNotification() {
  logInfo('\n=== Testing Create Notification ===');
  if (!authToken || !userId) {
    logWarning('Skipping - Missing required IDs');
    return false;
  }

  const dummyData = {
    userId: userId,
    type: 'booking',
    title: 'Test Notification',
    message: 'This is a test notification',
    channel: 'in_app',
  };

  const result = await makeRequest('POST', '/api/notifications', dummyData, authToken);
  if (result.status === 201 && result.data.success) {
    logSuccess('Create notification successful');
    return true;
  } else {
    logError(`Create notification failed: ${result.data?.message || result.error}`);
    return false;
  }
}

async function testGetNotifications() {
  logInfo('\n=== Testing Get Notifications ===');
  if (!authToken) {
    logWarning('Skipping - No auth token');
    return false;
  }

  const result = await makeRequest('GET', '/api/notifications', null, authToken);
  if (result.status === 200 && result.data.success) {
    logSuccess(`Get notifications successful (${result.data.data?.length || 0} notifications)`);
    return true;
  } else {
    logError(`Get notifications failed: ${result.data?.message || result.error}`);
    return false;
  }
}

// ==================== REVIEW APIs ====================

async function testGetReviews() {
  logInfo('\n=== Testing Get Reviews ===');
  const result = await makeRequest('GET', '/api/reviews');
  if (result.status === 200 && result.data.success) {
    logSuccess(`Get reviews successful (${result.data.data?.length || 0} reviews)`);
    return true;
  } else {
    logError(`Get reviews failed: ${result.data?.message || result.error}`);
    return false;
  }
}

// ==================== MAIN TEST RUNNER ====================

async function runAllTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('API TESTING SCRIPT - Testing All Endpoints', 'blue');
  log('='.repeat(60), 'blue');
  log(`Base URL: ${BASE_URL}`, 'cyan');
  logWarning('Make sure the dev server is running: npm run dev\n');

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
  };

  const tests = [
    { name: 'User Signup', fn: testUserSignup },
    { name: 'User Profile', fn: testUserProfile },
    { name: 'Get Specialties', fn: testGetSpecialties },
    { name: 'Create Specialty', fn: testCreateSpecialty },
    { name: 'Create Doctor', fn: testCreateDoctor },
    { name: 'Get Doctors', fn: testGetDoctors },
    { name: 'Create Hospital', fn: testCreateHospital },
    { name: 'Get Hospitals', fn: testGetHospitals },
    { name: 'Create Booking', fn: testCreateBooking },
    { name: 'Get Bookings', fn: testGetBookings },
    { name: 'Create Payment', fn: testCreatePayment },
    { name: 'Get Payments', fn: testGetPayments },
    { name: 'Get Subscription Plans', fn: testGetSubscriptionPlans },
    { name: 'Create Notification', fn: testCreateNotification },
    { name: 'Get Notifications', fn: testGetNotifications },
    { name: 'Get Reviews', fn: testGetReviews },
  ];

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result === true) {
        results.passed++;
      } else if (result === false) {
        results.failed++;
      } else {
        results.skipped++;
      }
    } catch (error) {
      logError(`Test ${test.name} threw an error: ${error.message}`);
      results.failed++;
    }
  }

  log('\n' + '='.repeat(60), 'blue');
  log('TEST SUMMARY', 'blue');
  log('='.repeat(60), 'blue');
  logSuccess(`Passed: ${results.passed}`);
  logError(`Failed: ${results.failed}`);
  logWarning(`Skipped: ${results.skipped}`);
  log(`Total: ${results.passed + results.failed + results.skipped}`, 'cyan');
  log('='.repeat(60), 'blue');
}

runAllTests().catch(console.error);
