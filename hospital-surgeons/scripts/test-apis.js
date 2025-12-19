/**
 * API Testing Script with Dummy Data
 * Tests all API endpoints with mock data
 * 
 * Usage: node scripts/test-apis.js
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
let authToken = null;
let userId = null;
let hospitalId = null;
let doctorId = null;
let specialtyId = null;
let bookingId = null;
let paymentId = null;
let subscriptionId = null;

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

async function testUserLogin() {
  logInfo('\n=== Testing User Login ===');
  const dummyData = {
    email: 'testdoctor@example.com',
    password: 'TestPassword123!',
    device: {
      device_token: 'test-device-token-123',
      device_type: 'web',
    },
  };

  const result = await makeRequest('POST', '/api/users/login', dummyData);
  if (result.status === 200 && result.data.success) {
    logSuccess('User login successful');
    if (!authToken) {
      authToken = result.data.data.accessToken;
      userId = result.data.data.user.id;
    }
    return true;
  } else {
    logWarning(`User login failed (might be expected if user doesn't exist): ${result.data?.message || result.error}`);
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

async function testUserRefresh() {
  logInfo('\n=== Testing Refresh Token ===');
  if (!authToken) {
    logWarning('Skipping - No auth token');
    return false;
  }

  const dummyData = {
    token: authToken,
    device: {
      device_token: 'test-device-token-123',
      device_type: 'web',
    },
  };

  const result = await makeRequest('POST', '/api/users/refresh', dummyData);
  if (result.status === 200 && result.data.success) {
    logSuccess('Refresh token successful');
    return true;
  } else {
    logError(`Refresh token failed: ${result.data?.message || result.error}`);
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

async function testGetDoctorById() {
  logInfo('\n=== Testing Get Doctor By ID ===');
  if (!doctorId) {
    logWarning('Skipping - No doctor ID');
    return false;
  }

  const result = await makeRequest('GET', `/api/doctors/${doctorId}`, null, authToken);
  if (result.status === 200 && result.data.success) {
    logSuccess('Get doctor by ID successful');
    return true;
  } else {
    logError(`Get doctor by ID failed: ${result.data?.message || result.error}`);
    return false;
  }
}

// ==================== HOSPITAL APIs ====================

async function testCreateHospital() {
  logInfo('\n=== Testing Create Hospital ===');
  if (!authToken) {
    logWarning('Skipping - No auth token');
    return false;
  }

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

async function testCreateSubscriptionPlan() {
  logInfo('\n=== Testing Create Subscription Plan ===');
  if (!authToken) {
    logWarning('Skipping - No auth token');
    return false;
  }

  const dummyData = {
    name: 'Gold Plan',
    tier: 'premium',
    price: '5000',
    billingCycle: 'month',
    features: ['Feature 1', 'Feature 2'],
    isActive: true,
  };

  const result = await makeRequest('POST', '/api/subscriptions/plans', dummyData, authToken);
  if (result.status === 201 && result.data.success) {
    logSuccess('Create subscription plan successful');
    return true;
  } else {
    logError(`Create subscription plan failed: ${result.data?.message || result.error}`);
    return false;
  }
}

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

async function testCreateReview() {
  logInfo('\n=== Testing Create Review ===');
  if (!authToken || !doctorId || !hospitalId) {
    logWarning('Skipping - Missing required IDs');
    return false;
  }

  const dummyData = {
    doctorId: doctorId,
    hospitalId: hospitalId,
    rating: 5,
    comment: 'Excellent service!',
  };

  const result = await makeRequest('POST', '/api/reviews', dummyData, authToken);
  if (result.status === 201 && result.data.success) {
    logSuccess('Create review successful');
    return true;
  } else {
    logError(`Create review failed: ${result.data?.message || result.error}`);
    return false;
  }
}

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

// ==================== SUPPORT APIs ====================

async function testCreateSupportTicket() {
  logInfo('\n=== Testing Create Support Ticket ===');
  if (!authToken || !userId) {
    logWarning('Skipping - Missing required IDs');
    return false;
  }

  const dummyData = {
    userId: userId,
    subject: 'Test Support Ticket',
    description: 'This is a test support ticket',
    priority: 'medium',
    status: 'open',
  };

  const result = await makeRequest('POST', '/api/support/tickets', dummyData, authToken);
  if (result.status === 201 && result.data.success) {
    logSuccess('Create support ticket successful');
    return true;
  } else {
    logError(`Create support ticket failed: ${result.data?.message || result.error}`);
    return false;
  }
}

async function testGetSupportTickets() {
  logInfo('\n=== Testing Get Support Tickets ===');
  if (!authToken) {
    logWarning('Skipping - No auth token');
    return false;
  }

  const result = await makeRequest('GET', '/api/support/tickets', null, authToken);
  if (result.status === 200 && result.data.success) {
    logSuccess(`Get support tickets successful (${result.data.data?.length || 0} tickets)`);
    return true;
  } else {
    logError(`Get support tickets failed: ${result.data?.message || result.error}`);
    return false;
  }
}

// ==================== ANALYTICS APIs ====================

async function testCreateAnalyticsEvent() {
  logInfo('\n=== Testing Create Analytics Event ===');
  if (!authToken || !userId) {
    logWarning('Skipping - Missing required IDs');
    return false;
  }

  const dummyData = {
    userId: userId,
    eventType: 'page_view',
    eventName: 'dashboard_view',
    properties: { page: 'dashboard', timestamp: new Date().toISOString() },
  };

  const result = await makeRequest('POST', '/api/analytics/events', dummyData, authToken);
  if (result.status === 201 && result.data.success) {
    logSuccess('Create analytics event successful');
    return true;
  } else {
    logError(`Create analytics event failed: ${result.data?.message || result.error}`);
    return false;
  }
}

async function testGetAnalyticsEvents() {
  logInfo('\n=== Testing Get Analytics Events ===');
  if (!authToken) {
    logWarning('Skipping - No auth token');
    return false;
  }

  const result = await makeRequest('GET', '/api/analytics/events', null, authToken);
  if (result.status === 200 && result.data.success) {
    logSuccess(`Get analytics events successful (${result.data.data?.length || 0} events)`);
    return true;
  } else {
    logError(`Get analytics events failed: ${result.data?.message || result.error}`);
    return false;
  }
}

// ==================== MAIN TEST RUNNER ====================

async function runAllTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('API TESTING SCRIPT - Testing All Endpoints', 'blue');
  log('='.repeat(60), 'blue');

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
  };

  // Test sequence (order matters for dependencies)
  const tests = [
    // User tests
    { name: 'User Signup', fn: testUserSignup },
    { name: 'User Login', fn: testUserLogin },
    { name: 'User Profile', fn: testUserProfile },
    { name: 'Refresh Token', fn: testUserRefresh },

    // Specialty tests (needed for doctor/hospital)
    { name: 'Get Specialties', fn: testGetSpecialties },
    { name: 'Create Specialty', fn: testCreateSpecialty },

    // Doctor tests
    { name: 'Create Doctor', fn: testCreateDoctor },
    { name: 'Get Doctors', fn: testGetDoctors },
    { name: 'Get Doctor By ID', fn: testGetDoctorById },

    // Hospital tests
    { name: 'Create Hospital', fn: testCreateHospital },
    { name: 'Get Hospitals', fn: testGetHospitals },

    // Booking tests
    { name: 'Create Booking', fn: testCreateBooking },
    { name: 'Get Bookings', fn: testGetBookings },

    // Payment tests
    { name: 'Create Payment', fn: testCreatePayment },
    { name: 'Get Payments', fn: testGetPayments },

    // Subscription tests
    { name: 'Get Subscription Plans', fn: testGetSubscriptionPlans },
    { name: 'Create Subscription Plan', fn: testCreateSubscriptionPlan },

    // Notification tests
    { name: 'Create Notification', fn: testCreateNotification },
    { name: 'Get Notifications', fn: testGetNotifications },

    // Review tests
    { name: 'Create Review', fn: testCreateReview },
    { name: 'Get Reviews', fn: testGetReviews },

    // Support tests
    { name: 'Create Support Ticket', fn: testCreateSupportTicket },
    { name: 'Get Support Tickets', fn: testGetSupportTickets },

    // Analytics tests
    { name: 'Create Analytics Event', fn: testCreateAnalyticsEvent },
    { name: 'Get Analytics Events', fn: testGetAnalyticsEvents },
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

  // Summary
  log('\n' + '='.repeat(60), 'blue');
  log('TEST SUMMARY', 'blue');
  log('='.repeat(60), 'blue');
  logSuccess(`Passed: ${results.passed}`);
  logError(`Failed: ${results.failed}`);
  logWarning(`Skipped: ${results.skipped}`);
  log(`Total: ${results.passed + results.failed + results.skipped}`, 'cyan');
  log('='.repeat(60), 'blue');
}

// Run tests
if (typeof fetch === 'undefined') {
  // Node.js environment - need to install node-fetch
  logError('This script requires fetch API. Please use Node.js 18+ or install node-fetch');
  process.exit(1);
} else {
  runAllTests().catch(console.error);
}
























