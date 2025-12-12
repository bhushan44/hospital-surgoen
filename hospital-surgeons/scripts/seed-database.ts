/**
 * Seed Database Script
 * 
 * This script seeds up to 30 records in each table with realistic data
 * 
 * Usage: npx tsx scripts/seed-database.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { getDb } from '../lib/db/index';
import { sql } from 'drizzle-orm';
import {
  notifications,
  doctorPlanFeatures,
  orders,
  paymentTransactions,
  doctors,
  files,
  doctorSpecialties,
  specialties,
  hospitals,
  assignments,
  hospitalPlanFeatures,
  subscriptions,
  subscriptionPlans,
  planPricing,
  auditLogs,
  userDevices,
  analyticsEvents,
  supportTickets,
  notificationPreferences,
  patients,
  enumStatus,
  enumPriority,
} from '../src/db/drizzle/migrations/schema';
import { users } from '../src/db/drizzle/migrations/schema';

// Helper function to get random element from array
const random = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper function to generate random date in the past
const randomDate = (daysAgo: number = 365): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
};

// Helper function to generate random date in the future
const randomFutureDate = (daysAhead: number = 365): string => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead));
  return date.toISOString();
};

async function seedEnumTables() {
  console.log('🌱 Seeding enum tables...');
  const db = getDb();

  // Seed enum_status
  const statuses = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'];
  for (const status of statuses) {
    try {
      await db.insert(enumStatus).values({ status, description: `Status: ${status}` }).onConflictDoNothing();
    } catch (error) {
      // Ignore if already exists
    }
  }

  // Seed enum_priority
  const priorities = ['low', 'medium', 'high'];
  for (const priority of priorities) {
    try {
      await db.insert(enumPriority).values({ priority, description: `Priority: ${priority}` }).onConflictDoNothing();
    } catch (error) {
      // Ignore if already exists
    }
  }

  console.log('  ✓ Seeded enum tables\n');
}

async function seedSpecialties() {
  console.log('🌱 Seeding specialties...');
  const db = getDb();

  const specialtyNames = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology',
    'Oncology', 'Psychiatry', 'Radiology', 'Surgery', 'Anesthesiology',
    'Emergency Medicine', 'Internal Medicine', 'Gynecology', 'Urology',
    'Ophthalmology', 'ENT', 'Pulmonology', 'Gastroenterology', 'Endocrinology',
    'Nephrology', 'Hematology', 'Rheumatology', 'Infectious Disease',
    'Critical Care', 'Family Medicine', 'Sports Medicine', 'Plastic Surgery',
    'Vascular Surgery', 'Neurosurgery', 'Cardiothoracic Surgery',
  ];

  for (let i = 0; i < Math.min(30, specialtyNames.length); i++) {
    await db.insert(specialties).values({
      name: specialtyNames[i],
      description: `Specialty in ${specialtyNames[i]}`,
    });
  }

  console.log(`  ✓ Seeded ${Math.min(30, specialtyNames.length)} specialties\n`);
}

async function seedFiles() {
  console.log('🌱 Seeding files...');
  const db = getDb();

  const fileTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const extensions = ['.jpg', '.png', '.pdf'];

  for (let i = 0; i < 30; i++) {
    const type = random(fileTypes);
    const ext = extensions[fileTypes.indexOf(type)];
    await db.insert(files).values({
      filename: `file_${i + 1}${ext}`,
      url: `https://example.com/files/file_${i + 1}${ext}`,
      mimetype: type,
      size: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
      isPublic: Math.random() > 0.5,
      createdAt: randomDate(),
      updatedAt: randomDate(),
    });
  }

  console.log('  ✓ Seeded 30 files\n');
}

async function seedSubscriptionPlans() {
  console.log('🌱 Seeding subscription plans...');
  const db = getDb();

  const planData = [
    // Doctor plans
    { name: 'Free Doctor Plan', tier: 'free', userRole: 'doctor', description: 'Basic plan for doctors' },
    { name: 'Basic Doctor Plan', tier: 'basic', userRole: 'doctor', description: 'Standard plan for doctors' },
    { name: 'Premium Doctor Plan', tier: 'premium', userRole: 'doctor', description: 'Advanced plan for doctors' },
    { name: 'Enterprise Doctor Plan', tier: 'enterprise', userRole: 'doctor', description: 'Full-featured plan for doctors' },
    // Hospital plans
    { name: 'Free Hospital Plan', tier: 'free', userRole: 'hospital', description: 'Basic plan for hospitals' },
    { name: 'Basic Hospital Plan', tier: 'basic', userRole: 'hospital', description: 'Standard plan for hospitals' },
    { name: 'Premium Hospital Plan', tier: 'premium', userRole: 'hospital', description: 'Advanced plan for hospitals' },
    { name: 'Enterprise Hospital Plan', tier: 'enterprise', userRole: 'hospital', description: 'Full-featured plan for hospitals' },
  ];

  const planIds: string[] = [];
  for (const plan of planData) {
    const [inserted] = await db.insert(subscriptionPlans).values({
      ...plan,
      isActive: true,
      defaultBillingCycle: 'monthly',
    }).returning({ id: subscriptionPlans.id });
    planIds.push(inserted.id);
  }

  console.log(`  ✓ Seeded ${planData.length} subscription plans\n`);
  return planIds;
}

async function seedPlanPricing(planIds: string[]) {
  console.log('🌱 Seeding plan pricing...');
  const db = getDb();

  const billingCycles = ['monthly', 'quarterly', 'yearly'] as const;
  const currencies = ['INR', 'USD', 'EUR'] as const;

  let count = 0;
  for (const planId of planIds) {
    for (const cycle of billingCycles) {
      const months = cycle === 'monthly' ? 1 : cycle === 'quarterly' ? 3 : 12;
      const basePrice = Math.floor(Math.random() * 50000) + 1000; // 1000 to 50000 cents
      const price = cycle === 'yearly' ? basePrice * 10 : cycle === 'quarterly' ? basePrice * 2.5 : basePrice;

      await db.insert(planPricing).values({
        planId,
        billingCycle: cycle,
        billingPeriodMonths: months,
        price: Math.round(price),
        currency: random([...currencies]),
        setupFee: Math.random() > 0.7 ? Math.floor(Math.random() * 5000) : 0,
        discountPercentage: (cycle === 'yearly' ? Math.floor(Math.random() * 20) : 0).toString(),
        isActive: true,
        validFrom: randomDate(30),
        validUntil: null,
      });
      count++;
    }
  }

  console.log(`  ✓ Seeded ${count} pricing options\n`);
}

async function seedDoctorPlanFeatures(planIds: string[]) {
  console.log('🌱 Seeding doctor plan features...');
  const db = getDb();

  const doctorPlans = planIds.slice(0, 4); // First 4 are doctor plans

  for (const planId of doctorPlans) {
    await db.insert(doctorPlanFeatures).values({
      planId,
      visibilityWeight: Math.floor(Math.random() * 10) + 1,
      maxAffiliations: Math.floor(Math.random() * 5) + 1,
      notes: `Features for plan ${planId}`,
    });
  }

  console.log(`  ✓ Seeded ${doctorPlans.length} doctor plan features\n`);
}

async function seedHospitalPlanFeatures(planIds: string[]) {
  console.log('🌱 Seeding hospital plan features...');
  const db = getDb();

  const hospitalPlans = planIds.slice(4); // Last 4 are hospital plans

  for (const planId of hospitalPlans) {
    await db.insert(hospitalPlanFeatures).values({
      planId,
      maxPatientsPerMonth: Math.floor(Math.random() * 1000) + 100,
      maxAssignmentsPerMonth: Math.floor(Math.random() * 500) + 50,
      includesPremiumDoctors: Math.random() > 0.5,
      notes: `Features for plan ${planId}`,
    });
  }

  console.log(`  ✓ Seeded ${hospitalPlans.length} hospital plan features\n`);
}

async function seedDoctors(userIds: string[]) {
  console.log('🌱 Seeding doctors...');
  const db = getDb();

  const firstNames = ['Raj', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rohit', 'Kavita'];
  const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Reddy', 'Mehta', 'Joshi'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];

  const doctorIds: string[] = [];
  const doctorUserIds = userIds.filter((_, i) => i % 3 === 0).slice(0, 30); // Every 3rd user is a doctor

  for (let i = 0; i < Math.min(30, doctorUserIds.length); i++) {
    const [inserted] = await db.insert(doctors).values({
      userId: doctorUserIds[i],
      firstName: random([...firstNames]),
      lastName: random([...lastNames]),
      medicalLicenseNumber: `MED${String(i + 1).padStart(6, '0')}`,
      yearsOfExperience: Math.floor(Math.random() * 30) + 1,
      bio: `Experienced doctor with ${Math.floor(Math.random() * 30) + 1} years of practice`,
      primaryLocation: random([...cities]),
      latitude: parseFloat((Math.random() * 10 + 18).toFixed(8)),
      longitude: parseFloat((Math.random() * 10 + 72).toFixed(8)),
      licenseVerificationStatus: random(['pending', 'verified', 'rejected'] as const),
      averageRating: parseFloat((Math.random() * 2 + 3).toFixed(2)), // 3.0 to 5.0
      totalRatings: Math.floor(Math.random() * 100),
      completedAssignments: Math.floor(Math.random() * 50),
    }).returning({ id: doctors.id });
    doctorIds.push(inserted.id);
  }

  console.log(`  ✓ Seeded ${doctorIds.length} doctors\n`);
  return doctorIds;
}

async function seedHospitals(userIds: string[]) {
  console.log('🌱 Seeding hospitals...');
  const db = getDb();

  const hospitalNames = [
    'Apollo Hospital', 'Fortis Healthcare', 'Max Hospital', 'AIIMS', 'Tata Memorial',
    'Narayana Health', 'Manipal Hospital', 'Medanta', 'BLK Hospital', 'Columbia Asia',
  ];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
  const types = ['general', 'specialty', 'clinic', 'trauma_center', 'teaching', 'other'] as const;

  const hospitalIds: string[] = [];
  const hospitalUserIds = userIds.filter((_, i) => i % 3 === 1).slice(0, 30); // Every 3rd user starting from 1 is a hospital

  for (let i = 0; i < Math.min(30, hospitalUserIds.length); i++) {
    const city = random([...cities]);
    const [inserted] = await db.insert(hospitals).values({
      userId: hospitalUserIds[i],
      name: `${random([...hospitalNames])} ${city}`,
      hospitalType: random([...types]),
      registrationNumber: `HOSP${String(i + 1).padStart(6, '0')}`,
      address: `${Math.floor(Math.random() * 100)} Main Street`,
      city,
      latitude: parseFloat((Math.random() * 10 + 18).toFixed(8)),
      longitude: parseFloat((Math.random() * 10 + 72).toFixed(8)),
      numberOfBeds: Math.floor(Math.random() * 500) + 50,
      contactEmail: `hospital${i + 1}@example.com`,
      contactPhone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      licenseVerificationStatus: random(['pending', 'verified', 'rejected'] as const),
      fullAddress: `${Math.floor(Math.random() * 100)} Main Street, ${city}`,
      state: 'Maharashtra',
      pincode: String(Math.floor(Math.random() * 900000) + 100000),
    }).returning({ id: hospitals.id });
    hospitalIds.push(inserted.id);
  }

  console.log(`  ✓ Seeded ${hospitalIds.length} hospitals\n`);
  return hospitalIds;
}

async function seedPatients(hospitalIds: string[]) {
  console.log('🌱 Seeding patients...');
  const db = getDb();

  const firstNames = ['Ramesh', 'Sunita', 'Kiran', 'Meera', 'Arjun', 'Priya', 'Suresh', 'Lakshmi'];
  const lastNames = ['Patel', 'Sharma', 'Kumar', 'Singh', 'Reddy', 'Gupta', 'Mehta', 'Joshi'];
  const genders = ['male', 'female', 'other'] as const;
  const roomTypes = ['general', 'private', 'semi_private', 'icu', 'emergency'] as const;

  const patientIds: string[] = [];

  for (let i = 0; i < 30; i++) {
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - Math.floor(Math.random() * 80) - 1);
    
    const [inserted] = await db.insert(patients).values({
      hospitalId: random([...hospitalIds]),
      fullName: `${random([...firstNames])} ${random([...lastNames])}`,
      dateOfBirth: birthDate.toISOString().split('T')[0],
      gender: random([...genders]),
      phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      emergencyContact: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      address: `${Math.floor(Math.random() * 100)} Street, City`,
      medicalCondition: `Condition ${i + 1}`,
      roomType: random([...roomTypes]),
      costPerDay: (Math.random() * 10000 + 1000).toFixed(2),
      medicalNotes: `Medical notes for patient ${i + 1}`,
      createdAt: randomDate(90),
    }).returning({ id: patients.id });
    patientIds.push(inserted.id);
  }

  console.log(`  ✓ Seeded ${patientIds.length} patients\n`);
  return patientIds;
}

async function seedDoctorSpecialties(doctorIds: string[], specialtyIds: string[]) {
  console.log('🌱 Seeding doctor specialties...');
  const db = getDb();

  let count = 0;
  for (const doctorId of doctorIds) {
    const numSpecialties = Math.floor(Math.random() * 3) + 1; // 1-3 specialties per doctor
    const selectedSpecialties = [...specialtyIds].sort(() => 0.5 - Math.random()).slice(0, numSpecialties);

    for (let i = 0; i < selectedSpecialties.length; i++) {
      await db.insert(doctorSpecialties).values({
        doctorId,
        specialtyId: selectedSpecialties[i],
        isPrimary: i === 0,
        yearsOfExperience: Math.floor(Math.random() * 10) + 1,
      });
      count++;
    }
  }

  console.log(`  ✓ Seeded ${count} doctor-specialty relationships\n`);
}

async function seedSubscriptions(userIds: string[], planIds: string[]) {
  console.log('🌱 Seeding subscriptions...');
  const db = getDb();

  const statuses = ['active', 'expired', 'cancelled'] as const;
  const currencies = ['INR', 'USD', 'EUR'] as const;

  let count = 0;
  for (let i = 0; i < Math.min(30, userIds.length); i++) {
    const planId = random([...planIds]);
    const startDate = randomDate(180);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    await db.insert(subscriptions).values({
      userId: userIds[i],
      planId,
      status: random([...statuses]),
      startDate: startDate,
      endDate: endDate.toISOString(),
      billingCycle: random(['monthly', 'quarterly', 'yearly'] as const),
      billingPeriodMonths: random([1, 3, 12]),
      priceAtPurchase: Math.floor(Math.random() * 50000) + 1000,
      currencyAtPurchase: random([...currencies]),
      autoRenew: Math.random() > 0.3,
      createdAt: startDate,
      updatedAt: startDate,
    });
    count++;
  }

  console.log(`  ✓ Seeded ${count} subscriptions\n`);
}

async function seedOrders(userIds: string[], planIds: string[]) {
  console.log('🌱 Seeding orders...');
  const db = getDb();

  const statuses = ['pending', 'paid', 'failed', 'expired', 'refunded'] as const;
  const currencies = ['INR', 'USD', 'EUR'] as const;

  for (let i = 0; i < 30; i++) {
    await db.insert(orders).values({
      userId: random([...userIds]),
      orderType: 'subscription',
      planId: random([...planIds]),
      amount: Math.floor(Math.random() * 50000) + 1000,
      currency: random([...currencies]),
      description: `Subscription order ${i + 1}`,
      status: random([...statuses]),
      createdAt: randomDate(90),
      expiresAt: randomFutureDate(30),
      paidAt: Math.random() > 0.5 ? randomDate(30) : null,
      failureReason: Math.random() > 0.8 ? 'Payment failed' : null,
      webhookReceived: Math.random() > 0.5,
    });
  }

  console.log('  ✓ Seeded 30 orders\n');
}

async function seedAssignments(doctorIds: string[], hospitalIds: string[], patientIds: string[]) {
  console.log('🌱 Seeding assignments...');
  const db = getDb();

  const statuses = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'] as const;
  const priorities = ['low', 'medium', 'high'] as const;

  for (let i = 0; i < 30; i++) {
    await db.insert(assignments).values({
      doctorId: random([...doctorIds]),
      hospitalId: random([...hospitalIds]),
      patientId: random([...patientIds]),
      priority: random([...priorities]),
      status: random([...statuses]),
      requestedAt: randomDate(60),
      expiresAt: randomFutureDate(30),
      treatmentNotes: Math.random() > 0.5 ? `Treatment notes ${i + 1}` : null,
      consultationFee: (Math.random() * 5000 + 500).toFixed(2),
    });
  }

  console.log('  ✓ Seeded 30 assignments\n');
}

async function seedNotifications(userIds: string[]) {
  console.log('🌱 Seeding notifications...');
  const db = getDb();

  const priorities = ['low', 'medium', 'high', 'urgent'] as const;
  const channels = ['email', 'push', 'sms'] as const;
  const recipientTypes = ['user', 'role', 'all'] as const;

  for (let i = 0; i < 30; i++) {
    await db.insert(notifications).values({
      recipientType: random([...recipientTypes]),
      recipientId: random([...userIds]),
      title: `Notification ${i + 1}`,
      message: `This is notification message ${i + 1}`,
      channel: random([...channels]),
      priority: random([...priorities]),
      read: Math.random() > 0.5,
      createdAt: randomDate(30),
    });
  }

  console.log('  ✓ Seeded 30 notifications\n');
}

async function seedAuditLogs(userIds: string[]) {
  console.log('🌱 Seeding audit logs...');
  const db = getDb();

  const actions = ['create', 'update', 'delete', 'login', 'logout'] as const;
  const entityTypes = ['user', 'doctor', 'hospital', 'subscription', 'plan'] as const;

  for (let i = 0; i < 30; i++) {
    await db.insert(auditLogs).values({
      userId: random([...userIds]),
      actorType: 'admin',
      action: random([...actions]),
      entityType: random([...entityTypes]),
      entityId: random([...userIds]),
      details: { message: `Audit log entry ${i + 1}` },
      createdAt: randomDate(90),
    });
  }

  console.log('  ✓ Seeded 30 audit logs\n');
}

async function seedAnalyticsEvents(userIds: string[]) {
  console.log('🌱 Seeding analytics events...');
  const db = getDb();

  const eventTypes = ['user_action', 'system_event', 'error'] as const;
  const eventNames = ['page_view', 'button_click', 'form_submit', 'api_call'] as const;

  for (let i = 0; i < 30; i++) {
    await db.insert(analyticsEvents).values({
      userId: Math.random() > 0.3 ? random([...userIds]) : null,
      eventType: random([...eventTypes]),
      eventName: random([...eventNames]),
      properties: { page: `page_${i + 1}`, timestamp: new Date().toISOString() },
      createdAt: randomDate(30),
    });
  }

  console.log('  ✓ Seeded 30 analytics events\n');
}

async function seedSupportTickets(userIds: string[]) {
  console.log('🌱 Seeding support tickets...');
  const db = getDb();

  const priorities = ['low', 'medium', 'high'] as const;
  const statuses = ['open', 'in_progress', 'resolved', 'closed'] as const;
  const categories = ['technical', 'billing', 'account', 'other'] as const;

  for (let i = 0; i < 30; i++) {
    await db.insert(supportTickets).values({
      userId: random([...userIds]),
      subject: `Support Ticket ${i + 1}`,
      description: `Description for support ticket ${i + 1}`,
      category: random([...categories]),
      priority: random([...priorities]),
      status: random([...statuses]),
      assignedTo: Math.random() > 0.5 ? random([...userIds]) : null,
      createdAt: randomDate(60),
    });
  }

  console.log('  ✓ Seeded 30 support tickets\n');
}

async function seedNotificationPreferences(userIds: string[]) {
  console.log('🌱 Seeding notification preferences...');
  const db = getDb();

  for (let i = 0; i < Math.min(30, userIds.length); i++) {
    await db.insert(notificationPreferences).values({
      userId: userIds[i],
      bookingUpdatesPush: Math.random() > 0.2,
      bookingUpdatesEmail: Math.random() > 0.2,
      paymentPush: Math.random() > 0.2,
      remindersPush: Math.random() > 0.2,
      createdAt: randomDate(30),
    });
  }

  console.log(`  ✓ Seeded ${Math.min(30, userIds.length)} notification preferences\n`);
}

async function seedUserDevices(userIds: string[]) {
  console.log('🌱 Seeding user devices...');
  const db = getDb();

  const deviceTypes = ['ios', 'android', 'web'] as const;

  for (let i = 0; i < 30; i++) {
    await db.insert(userDevices).values({
      userId: random([...userIds]),
      deviceType: random([...deviceTypes]),
      deviceToken: `token_${Math.random().toString(36).substring(7)}`,
      appVersion: '1.0.0',
      osVersion: '15.0',
      deviceName: `${random([...deviceTypes])} Device ${i + 1}`,
      isActive: Math.random() > 0.2,
      lastUsedAt: randomDate(7),
      createdAt: randomDate(90),
    });
  }

  console.log('  ✓ Seeded 30 user devices\n');
}

async function seedPaymentTransactions(userIds: string[], orderIds: string[]) {
  console.log('🌱 Seeding payment transactions...');
  const db = getDb();

  const statuses = ['pending', 'success', 'failed', 'refunded'] as const;
  const paymentMethods = ['card', 'upi', 'netbanking', 'wallet'] as const;
  const currencies = ['INR', 'USD', 'EUR'] as const;
  const paymentGateways = ['razorpay', 'stripe', 'paypal', 'payu'] as const;

  for (let i = 0; i < 30; i++) {
    await db.insert(paymentTransactions).values({
      orderId: random([...orderIds]),
      paymentGateway: random([...paymentGateways]),
      paymentId: `TXN${String(i + 1).padStart(10, '0')}`,
      paymentMethod: random([...paymentMethods]),
      amount: Math.floor(Math.random() * 50000) + 1000,
      currency: random([...currencies]),
      status: random([...statuses]),
      gatewayResponse: { status: 'success' },
      verifiedAt: Math.random() > 0.5 ? randomDate(30) : null,
      refundedAt: Math.random() > 0.8 ? randomDate(10) : null,
      createdAt: randomDate(60),
    });
  }

  console.log('  ✓ Seeded 30 payment transactions\n');
}

async function main() {
  console.log('🚀 Starting database seeding process...\n');

  try {
    const db = getDb();

    // Get existing users (we don't clear users table)
    const existingUsers = await db.select().from(users).limit(100);
    const userIds = existingUsers.map(u => u.id);

    if (userIds.length === 0) {
      console.log('⚠️  No users found. Please create users first.\n');
      return;
    }

    console.log(`📊 Found ${userIds.length} existing users\n`);

    // Seed data in dependency order
    await seedEnumTables();
    await seedSpecialties();
    const specialtyResults = await db.select({ id: specialties.id }).from(specialties);
    const specialtyIds = specialtyResults.map(s => s.id);

    await seedFiles();
    const fileResults = await db.select({ id: files.id }).from(files);
    const fileIds = fileResults.map(f => f.id);

    const planIds = await seedSubscriptionPlans();
    await seedPlanPricing(planIds);
    const pricingResults = await db.select({ id: planPricing.id }).from(planPricing);
    const pricingIds = pricingResults.map(p => p.id);

    await seedDoctorPlanFeatures(planIds);
    await seedHospitalPlanFeatures(planIds);

    const doctorIds = await seedDoctors(userIds);
    const hospitalIds = await seedHospitals(userIds);
    const patientIds = await seedPatients(hospitalIds);

    await seedDoctorSpecialties(doctorIds, specialtyIds);
    await seedSubscriptions(userIds, planIds);

    await seedOrders(userIds, planIds);
    const orderResults = await db.select({ id: orders.id }).from(orders);
    const orderIds = orderResults.map(o => o.id);

    await seedPaymentTransactions(userIds, orderIds);
    await seedAssignments(doctorIds, hospitalIds, patientIds);
    await seedNotifications(userIds);
    await seedAuditLogs(userIds);
    await seedAnalyticsEvents(userIds);
    await seedSupportTickets(userIds);
    await seedNotificationPreferences(userIds);
    await seedUserDevices(userIds);

    console.log('✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Specialties: ${specialtyIds.length}`);
    console.log(`   - Files: ${fileIds.length}`);
    console.log(`   - Subscription Plans: ${planIds.length}`);
    console.log(`   - Pricing Options: ${pricingIds.length}`);
    console.log(`   - Doctors: ${doctorIds.length}`);
    console.log(`   - Hospitals: ${hospitalIds.length}`);
    console.log(`   - Patients: ${patientIds.length}`);
    console.log(`   - Orders: ${orderIds.length}`);
    console.log(`   - And 30 records in other tables\n`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run the script
main()
  .then(() => {
    console.log('✨ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
