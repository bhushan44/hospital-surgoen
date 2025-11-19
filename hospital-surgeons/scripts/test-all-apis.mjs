/**
 * Comprehensive API Testing Script
 * Tests ALL API endpoints with dummy data
 * 
 * Usage: npm run test:api
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
let subscriptionPlanId = null;
let notificationId = null;
let reviewId = null;
let supportTicketId = null;
let fileId = null;
let departmentId = null;
let staffId = null;
let availabilityId = null;

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
    let result;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = { text: await response.text() };
    }
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
    if (result.data) logInfo(`Response: ${JSON.stringify(result.data)}`);
    return false;
  }
}

async function testUserLogin() {
  logInfo('\n=== Testing User Login ===');
  const dummyData = {
    email: `testdoctor${Date.now() - 1000}@example.com`,
    password: 'TestPassword123!',
    device: {
      device_token: 'test-device-token-123',
      device_type: 'web',
    },
  };

  const result = await makeRequest('POST', '/api/users/login', dummyData);
  if (result.status === 200 && result.data.success) {
    if (!authToken) {
      authToken = result.data.data.accessToken;
      userId = result.data.data.user.id;
    }
    logSuccess('User login successful');
    return true;
  } else {
    logWarning(`User login failed (expected if user doesn't exist): ${result.data?.message || result.error}`);
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

async function testGetUsers() {
  logInfo('\n=== Testing Get All Users ===');
  if (!authToken) {
    logWarning('Skipping - No auth token');
    return false;
  }

  const result = await makeRequest('GET', '/api/users', null, authToken);
  if (result.status === 200 && result.data.success) {
    logSuccess(`Get users successful (${result.data.data?.length || 0} users)`);
    return true;
  } else {
    logError(`Get users failed: ${result.data?.message || result.error}`);
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
    if (result.data) logInfo(`Response: ${JSON.stringify(result.data)}`);
    return false;
  }
}

async function testGetDoctors() {
  logInfo('\n=== Testing Get Doctors ===');
  const result = await makeRequest('GET', '/api/doctors');
  if (result.status === 200 && result.data.success) {
    logSuccess(`Get doctors successful (${result.data.data?.length || 0} doctors)`);
    if (!doctorId && result.data.data?.length > 0) {
      doctorId = result.data.data[0].id;
    }
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

async function testGetDoctorProfile() {
  logInfo('\n=== Testing Get Doctor Profile ===');
  if (!authToken) {
    logWarning('Skipping - No auth token');
    return false;
  }

  const result = await makeRequest('GET', '/api/doctors/profile', null, authToken);
  if (result.status === 200 && result.data.success) {
    logSuccess('Get doctor profile successful');
    return true;
  } else {
    logWarning(`Get doctor profile failed (might be expected): ${result.data?.message || result.error}`);
    return false;
  }
}

async function testGetDoctorStats() {
  logInfo('\n=== Testing Get Doctor Stats ===');
  if (!doctorId || !authToken) {
    logWarning('Skipping - Missing doctor ID or auth token');
    return false;
  }

  const result = await makeRequest('GET', `/api/doctors/${doctorId}/stats`, null, authToken);
  if (result.status === 200 && result.data.success) {
    logSuccess('Get doctor stats successful');
    return true;
  } else {
    logWarning(`Get doctor stats failed: ${result.data?.message || result.error}`);
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
    if (result.data) logInfo(`Response: ${JSON.stringify(result.data)}`);
    return false;
  }
}

async function testGetHospitals() {
  logInfo('\n=== Testing Get Hospitals ===');
  const result = await makeRequest('GET', '/api/hospitals');
  if (result.status === 200 && result.data.success) {
    logSuccess(`Get hospitals successful (${result.data.data?.length || 0} hospitals)`);
    if (!hospitalId && result.data.data?.length > 0) {
      hospitalId = result.data.data[0].id;
    }
    return true;
  } else {
    logError(`Get hospitals failed: ${result.data?.message || result.error}`);
    return false;
  }
}

async function testGetHospitalById() {
  logInfo('\n=== Testing Get Hospital By ID ===');
  if (!hospitalId) {
    logWarning('Skipping - No hospital ID');
    return false;
  }

  const result = await makeRequest('GET', `/api/hospitals/${hospitalId}`);
  if (result.status === 200 && result.data.success) {
    logSuccess('Get hospital by ID successful');
    return true;
  } else {
    logError(`Get hospital by ID failed: ${result.data?.message || result.error}`);
    return false;
  }
}

async function testGetHospitalProfile() {
  logInfo('\n=== Testing Get Hospital Profile ===');
  if (!authToken) {
    logWarning('Skipping - No auth token');
    return false;
  }

  const result = await makeRequest('GET', '/api/hospitals/profile', null, authToken);
  if (result.status === 200 && result.data.success) {
    logSuccess('Get hospital profile successful');
    return true;
  } else {
    logWarning(`Get hospital profile failed (might be expected): ${result.data?.message || result.error}`);
    return false;
  }
}

async function testGetHospitalStats() {
  logInfo('\n=== Testing Get Hospital Stats ===');
  if (!hospitalId || !authToken) {
    logWarning('Skipping - Missing hospital ID or auth token');
    return false;
  }

  const result = await makeRequest('GET', `/api/hospitals/${hospitalId}/stats`, null, authToken);
  if (result.status === 200 && result.data.success) {
    logSuccess('Get hospital stats successful');
    return true;
  } else {
    logWarning(`Get hospital stats failed: ${result.data?.message || result.error}`);
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

async function testGetActiveSpecialties() {
  logInfo('\n=== Testing Get Active Specialties ===');
  const result = await makeRequest('GET', '/api/specialties/active');
  if (result.status === 200 && result.data.success) {
    logSuccess(`Get active specialties successful (${result.data.data?.length || 0} specialties)`);
    return true;
  } else {
    logWarning(`Get active specialties failed: ${result.data?.message || result.error}`);
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

async function testGetSpecialtyById() {
  logInfo('\n=== Testing Get Specialty By ID ===');
  if (!specialtyId) {
    logWarning('Skipping - No specialty ID');
    return false;
  }

  const result = await makeRequest('GET', `/api/specialties/${specialtyId}`);
  if (result.status === 200 && result.data.success) {
    logSuccess('Get specialty by ID successful');
    return true;
  } else {
    logError(`Get specialty by ID failed: ${result.data?.message || result.error}`);
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
    if (result.data) logInfo(`Response: ${JSON.stringify(result.data)}`);
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
    if (!bookingId && result.data.data?.length > 0) {
      bookingId = result.data.data[0].id;
    }
    return true;
  } else {
    logError(`Get bookings failed: ${result.data?.message || result.error}`);
    return false;
  }
}

async function testGetBookingById() {
  logInfo('\n=== Testing Get Booking By ID ===');
  if (!bookingId || !authToken) {
    logWarning('Skipping - Missing booking ID or auth token');
    return false;
  }

  const result = await makeRequest('GET', `/api/bookings/${bookingId}`, null, authToken);
  if (result.status === 200 && result.data.success) {
    logSuccess('Get booking by ID successful');
    return true;
  } else {
    logWarning(`Get booking by ID failed: ${result.data?.message || result.error}`);
    return false;
  }
}

async function testGetBookingStats() {
  logInfo('\n=== Testing Get Booking Stats ===');
  if (!authToken) {
    logWarning('Skipping - No auth token');
    return false;
  }

  const result = await makeRequest('GET', '/api/bookings/stats', null, authToken);
  if (result.status === 200 && result.data.success) {
    logSuccess('Get booking stats successful');
    return true;
  } else {
    logWarning(`Get booking stats failed: ${result.data?.message || result.error}`);
    return false;
  }
}

// ==================== PAYMENT APIs ====================

async function testCreatePayment() {
  logInfo('\n=== Testing Create Payment ===');
  if (!authToken || !userId) {
    logWarning('Skipping - No auth token or user ID');
    return false;
  }

  const dummyData = {
    userId: userId,
    paymentType: 'subscription',
    amount: 5000,
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
    if (result.data) logInfo(`Response: ${JSON.stringify(result.data)}`);
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
    if (!paymentId && result.data.data?.length > 0) {
      paymentId = result.data.data[0].id;
    }
    return true;
  } else {
    logError(`Get payments failed: ${result.data?.message || result.error}`);
    return false;
  }
}

async function testGetPaymentById() {
  logInfo('\n=== Testing Get Payment By ID ===');
  if (!paymentId || !authToken) {
    logWarning('Skipping - Missing payment ID or auth token');
    return false;
  }

  const result = await makeRequest('GET', `/api/payments/${paymentId}`, null, authToken);
  if (result.status === 200 && result.data.success) {
    logSuccess('Get payment by ID successful');
    return true;
  } else {
    logWarning(`Get payment by ID failed: ${result.data?.message || result.error}`);
    return false;
  }
}

// ==================== SUBSCRIPTION APIs ====================

async function testGetSubscriptionPlans() {
  logInfo('\n=== Testing Get Subscription Plans ===');
  const result = await makeRequest('GET', '/api/subscriptions/plans');
  if (result.status === 200 && result.data.success) {
    logSuccess(`Get subscription plans successful (${result.data.data?.length || 0} plans)`);
    if (!subscriptionPlanId && result.data.data?.length > 0) {
      subscriptionPlanId = result.data.data[0].id;
    }
    return true;
  } else {
    logError(`Get subscription plans failed: ${result.data?.message || result.error}`);
    return false;
  }
}

async function testGetSubscriptions() {
  logInfo('\n=== Testing Get Subscriptions ===');
  if (!authToken) {
    logWarning('Skipping - No auth token');
    return false;
  }

  const result = await makeRequest('GET', '/api/subscriptions', null, authToken);
  if (result.status === 200 && result.data.success) {
    logSuccess(`Get subscriptions successful (${result.data.data?.length || 0} subscriptions)`);
    return true;
  } else {
    logWarning(`Get subscriptions failed: ${result.data?.message || result.error}`);
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
    notificationId = result.data.data.id;
    logSuccess('Create notification successful');
    logInfo(`Notification ID: ${notificationId}`);
    return true;
  } else {
    logError(`Create notification failed: ${result.data?.message || result.error}`);
    if (result.data) logInfo(`Response: ${JSON.stringify(result.data)}`);
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
    if (!notificationId && result.data.data?.length > 0) {
      notificationId = result.data.data[0].id;
    }
    return true;
  } else {
    logError(`Get notifications failed: ${result.data?.message || result.error}`);
    return false;
  }
}

async function testGetNotificationById() {
  logInfo('\n=== Testing Get Notification By ID ===');
  if (!notificationId || !authToken) {
    logWarning('Skipping - Missing notification ID or auth token');
    return false;
  }

  const result = await makeRequest('GET', `/api/notifications/${notificationId}`, null, authToken);
  if (result.status === 200 && result.data.success) {
    logSuccess('Get notification by ID successful');
    return true;
  } else {
    logWarning(`Get notification by ID failed: ${result.data?.message || result.error}`);
    return false;
  }
}

async function testGetNotificationPreferences() {
  logInfo('\n=== Testing Get Notification Preferences ===');
  if (!authToken) {
    logWarning('Skipping - No auth token');
    return false;
  }

  const result = await makeRequest('GET', '/api/notifications/preferences', null, authToken);
  if (result.status === 200 && result.data.success) {
    logSuccess('Get notification preferences successful');
    return true;
  } else {
    logWarning(`Get notification preferences failed: ${result.data?.message || result.error}`);
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
    reviewId = result.data.data.id;
    logSuccess('Create review successful');
    logInfo(`Review ID: ${reviewId}`);
    return true;
  } else {
    logError(`Create review failed: ${result.data?.message || result.error}`);
    if (result.data) logInfo(`Response: ${JSON.stringify(result.data)}`);
    return false;
  }
}

async function testGetReviews() {
  logInfo('\n=== Testing Get Reviews ===');
  const result = await makeRequest('GET', '/api/reviews');
  if (result.status === 200 && result.data.success) {
    logSuccess(`Get reviews successful (${result.data.data?.length || 0} reviews)`);
    if (!reviewId && result.data.data?.length > 0) {
      reviewId = result.data.data[0].id;
    }
    return true;
  } else {
    logError(`Get reviews failed: ${result.data?.message || result.error}`);
    return false;
  }
}

async function testGetReviewById() {
  logInfo('\n=== Testing Get Review By ID ===');
  if (!reviewId) {
    logWarning('Skipping - No review ID');
    return false;
  }

  const result = await makeRequest('GET', `/api/reviews/${reviewId}`);
  if (result.status === 200 && result.data.success) {
    logSuccess('Get review by ID successful');
    return true;
  } else {
    logWarning(`Get review by ID failed: ${result.data?.message || result.error}`);
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
    supportTicketId = result.data.data.id;
    logSuccess('Create support ticket successful');
    logInfo(`Support Ticket ID: ${supportTicketId}`);
    return true;
  } else {
    logError(`Create support ticket failed: ${result.data?.message || result.error}`);
    if (result.data) logInfo(`Response: ${JSON.stringify(result.data)}`);
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
    if (!supportTicketId && result.data.data?.length > 0) {
      supportTicketId = result.data.data[0].id;
    }
    return true;
  } else {
    logError(`Get support tickets failed: ${result.data?.message || result.error}`);
    return false;
  }
}

async function testGetSupportTicketById() {
  logInfo('\n=== Testing Get Support Ticket By ID ===');
  if (!supportTicketId || !authToken) {
    logWarning('Skipping - Missing support ticket ID or auth token');
    return false;
  }

  const result = await makeRequest('GET', `/api/support/tickets/${supportTicketId}`, null, authToken);
  if (result.status === 200 && result.data.success) {
    logSuccess('Get support ticket by ID successful');
    return true;
  } else {
    logWarning(`Get support ticket by ID failed: ${result.data?.message || result.error}`);
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
    if (result.data) logInfo(`Response: ${JSON.stringify(result.data)}`);
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
    logWarning(`Get analytics events failed: ${result.data?.message || result.error}`);
    return false;
  }
}

// ==================== FILE APIs ====================

async function testGetFileById() {
  logInfo('\n=== Testing Get File By ID ===');
  if (!fileId) {
    logWarning('Skipping - No file ID (file upload test would create one)');
    return false;
  }

  const result = await makeRequest('GET', `/api/files/${fileId}`, null, authToken);
  if (result.status === 200 && result.data.success) {
    logSuccess('Get file by ID successful');
    return true;
  } else {
    logWarning(`Get file by ID failed: ${result.data?.message || result.error}`);
    return false;
  }
}

// ==================== MAIN TEST RUNNER ====================

async function runAllTests() {
  log('\n' + '='.repeat(70), 'blue');
  log('COMPREHENSIVE API TESTING - Testing All Endpoints', 'blue');
  log('='.repeat(70), 'blue');
  log(`Base URL: ${BASE_URL}`, 'cyan');
  logWarning('Make sure the dev server is running: npm run dev\n');

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
  };

  const tests = [
    // User APIs
    { name: 'User Signup', fn: testUserSignup },
    { name: 'User Login', fn: testUserLogin },
    { name: 'User Profile', fn: testUserProfile },
    { name: 'Refresh Token', fn: testUserRefresh },
    { name: 'Get All Users', fn: testGetUsers },

    // Specialty APIs
    { name: 'Get Specialties', fn: testGetSpecialties },
    { name: 'Get Active Specialties', fn: testGetActiveSpecialties },
    { name: 'Create Specialty', fn: testCreateSpecialty },
    { name: 'Get Specialty By ID', fn: testGetSpecialtyById },

    // Doctor APIs
    { name: 'Create Doctor', fn: testCreateDoctor },
    { name: 'Get Doctors', fn: testGetDoctors },
    { name: 'Get Doctor By ID', fn: testGetDoctorById },
    { name: 'Get Doctor Profile', fn: testGetDoctorProfile },
    { name: 'Get Doctor Stats', fn: testGetDoctorStats },

    // Hospital APIs
    { name: 'Create Hospital', fn: testCreateHospital },
    { name: 'Get Hospitals', fn: testGetHospitals },
    { name: 'Get Hospital By ID', fn: testGetHospitalById },
    { name: 'Get Hospital Profile', fn: testGetHospitalProfile },
    { name: 'Get Hospital Stats', fn: testGetHospitalStats },

    // Booking APIs
    { name: 'Create Booking', fn: testCreateBooking },
    { name: 'Get Bookings', fn: testGetBookings },
    { name: 'Get Booking By ID', fn: testGetBookingById },
    { name: 'Get Booking Stats', fn: testGetBookingStats },

    // Payment APIs
    { name: 'Create Payment', fn: testCreatePayment },
    { name: 'Get Payments', fn: testGetPayments },
    { name: 'Get Payment By ID', fn: testGetPaymentById },

    // Subscription APIs
    { name: 'Get Subscription Plans', fn: testGetSubscriptionPlans },
    { name: 'Get Subscriptions', fn: testGetSubscriptions },

    // Notification APIs
    { name: 'Create Notification', fn: testCreateNotification },
    { name: 'Get Notifications', fn: testGetNotifications },
    { name: 'Get Notification By ID', fn: testGetNotificationById },
    { name: 'Get Notification Preferences', fn: testGetNotificationPreferences },

    // Review APIs
    { name: 'Create Review', fn: testCreateReview },
    { name: 'Get Reviews', fn: testGetReviews },
    { name: 'Get Review By ID', fn: testGetReviewById },

    // Support APIs
    { name: 'Create Support Ticket', fn: testCreateSupportTicket },
    { name: 'Get Support Tickets', fn: testGetSupportTickets },
    { name: 'Get Support Ticket By ID', fn: testGetSupportTicketById },

    // Analytics APIs
    { name: 'Create Analytics Event', fn: testCreateAnalyticsEvent },
    { name: 'Get Analytics Events', fn: testGetAnalyticsEvents },

    // File APIs
    { name: 'Get File By ID', fn: testGetFileById },
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

  log('\n' + '='.repeat(70), 'blue');
  log('TEST SUMMARY', 'blue');
  log('='.repeat(70), 'blue');
  logSuccess(`Passed: ${results.passed}`);
  logError(`Failed: ${results.failed}`);
  logWarning(`Skipped: ${results.skipped}`);
  log(`Total: ${results.passed + results.failed + results.skipped}`, 'cyan');
  log('='.repeat(70), 'blue');

  if (results.failed > 0) {
    log('\n⚠ Some tests failed. Check the errors above for details.', 'yellow');
    process.exit(1);
  } else {
    log('\n✓ All tests passed!', 'green');
    process.exit(0);
  }
}

runAllTests().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});

