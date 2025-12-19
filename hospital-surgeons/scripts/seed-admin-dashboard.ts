import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { getDb } from '../lib/db';
import * as schema from '../src/db/drizzle/migrations/schema';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const db = getDb();

// Helper functions
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => Number((Math.random() * (max - min) + min).toFixed(2));
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomString = (length: number) => Math.random().toString(36).substring(2, length + 2);

// Data arrays
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
  'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
  'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra',
  'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa', 'Timothy', 'Deborah'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee',
  'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams',
  'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips'
];

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego',
  'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco',
  'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville', 'Detroit',
  'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque',
  'Tucson', 'Fresno', 'Sacramento', 'Kansas City', 'Mesa', 'Atlanta', 'Omaha', 'Colorado Springs',
  'Raleigh', 'Virginia Beach', 'Miami', 'Oakland', 'Minneapolis', 'Tulsa', 'Cleveland', 'Wichita', 'Arlington', 'Tampa'
];

const specialties = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Oncology', 'Psychiatry', 'Radiology',
  'General Surgery', 'Emergency Medicine', 'Internal Medicine', 'Gynecology', 'Urology', 'Ophthalmology', 'ENT',
  'Pulmonology', 'Gastroenterology', 'Endocrinology', 'Rheumatology', 'Nephrology', 'Hematology', 'Infectious Disease',
  'Allergy & Immunology', 'Anesthesiology', 'Pathology', 'Physical Medicine', 'Preventive Medicine', 'Sports Medicine',
  'Geriatrics', 'Family Medicine', 'Plastic Surgery', 'Neurosurgery', 'Cardiac Surgery', 'Vascular Surgery',
  'Thoracic Surgery', 'Colorectal Surgery', 'Urological Surgery', 'Ophthalmic Surgery', 'Otolaryngology Surgery',
  'Maxillofacial Surgery', 'Trauma Surgery', 'Burn Surgery', 'Transplant Surgery', 'Pediatric Surgery',
  'Obstetric Surgery', 'Gynecologic Surgery', 'Breast Surgery', 'Endocrine Surgery', 'Hepatobiliary Surgery',
  'Surgical Oncology', 'Minimally Invasive Surgery'
];

const hospitalTypes = ['general', 'specialty', 'clinic', 'trauma_center', 'teaching', 'other'];
const subscriptionTiers = ['free', 'basic', 'premium', 'enterprise'];
const userRoles = ['doctor', 'hospital', 'admin'];
const userStatuses = ['active', 'inactive', 'pending', 'suspended'];
const subscriptionStatuses = ['active', 'expired', 'cancelled', 'suspended'];
const verificationStatuses = ['pending', 'verified', 'rejected'];
const assignmentStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
const assignmentPriorities = ['low', 'medium', 'high'];
const paymentStatuses = ['pending', 'success', 'failed', 'refunded'];
const orderStatuses = ['pending', 'paid', 'failed', 'expired', 'refunded'];
const orderTypes = ['subscription', 'consultation', 'other'];
const leaveTypes = ['sick', 'vacation', 'personal', 'emergency', 'other'];
const credentialTypes = ['degree', 'certificate', 'license', 'other'];
const documentTypes = ['license', 'accreditation', 'insurance', 'other'];
const consentTypes = ['treatment', 'data_sharing', 'research', 'photography', 'other'];
const genders = ['male', 'female', 'other', 'prefer_not_to_say'];
const roomTypes = ['general', 'private', 'semi_private', 'icu', 'emergency'];
const notificationChannels = ['push', 'email', 'sms', 'in_app'];
const notificationPriorities = ['low', 'medium', 'high', 'urgent'];
const supportCategories = ['technical', 'billing', 'general', 'urgent'];
const supportStatuses = ['open', 'in_progress', 'resolved', 'closed'];
const deviceTypes = ['ios', 'android', 'web'];

async function seedDatabase() {
  console.log('🌱 Starting comprehensive database seeding for Admin Dashboard...\n');
  console.log('📊 Target: 50 records per main table\n');

  try {
    // ============================================
    // 1. SEED ENUM TABLES (Required first)
    // ============================================
    console.log('📝 Seeding enum tables...');
    
    // Enum Status - All possible statuses for the system
    // Note: These must match what's used in doctor_availability and other tables
    const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'available', 'booked', 'released'];
    for (const status of allowedStatuses) {
      try {
        await db.insert(schema.enumStatus).values({ status, description: `Status: ${status}` });
      } catch (error: any) {
        // Ignore duplicate key errors (status already exists)
        const errorCode = error.cause?.code || error.code;
        if (errorCode !== '23505') throw error;
      }
    }

    // Enum Priority
    const allowedPriorities = ['low', 'medium', 'high'];
    for (const priority of allowedPriorities) {
      try {
        await db.insert(schema.enumPriority).values({ priority, description: `Priority: ${priority}` });
      } catch (error: any) {
        if (error.code !== '23505' && error.cause?.code !== '23505') throw error;
      }
    }

    // Enum Channel
    const allowedChannels = ['push', 'email', 'sms', 'in_app'];
    for (const channel of allowedChannels) {
      try {
        await db.insert(schema.enumChannel).values({ channel, description: `Channel: ${channel}` });
      } catch (error: any) {
        if (error.code !== '23505' && error.cause?.code !== '23505') throw error;
      }
    }
    console.log('✅ Enum tables seeded\n');

    // ============================================
    // 2. SEED USERS (50 records)
    // ============================================
    console.log('📝 Seeding users (50 records)...');
    const userIds: string[] = [];
    const doctorUserIds: string[] = [];
    const hospitalUserIds: string[] = [];
    const adminUserIds: string[] = [];
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    let userCreatedCount = 0;
    let userAttempts = 0;
    const maxUserAttempts = 100;

    while (userCreatedCount < 50 && userAttempts < maxUserAttempts) {
      userAttempts++;
      const role = userCreatedCount < 20 ? 'doctor' : userCreatedCount < 40 ? 'hospital' : 'admin';
      const timestamp = Date.now() + userAttempts + Math.random() * 10000;
      const createdAt = new Date(Date.now() - randomInt(0, 365) * 24 * 60 * 60 * 1000);
      // Generate unique email using timestamp, random number, and UUID-like string
      const uniqueId = `${timestamp}-${randomInt(10000, 99999)}-${randomString(8)}`;
      const uniqueEmail = `${role}-${uniqueId}@example.com`;
      
      try {
        const [user] = await db.insert(schema.users).values({
          email: uniqueEmail,
          passwordHash: hashedPassword,
          phone: `+1${randomInt(2000000000, 9999999999)}`,
          role: role,
          status: randomChoice(userStatuses),
          subscriptionStatus: role !== 'admin' ? randomChoice(['active', 'expired', 'cancelled', 'trial']) : null,
          subscriptionTier: role !== 'admin' ? randomChoice(subscriptionTiers) : null,
          emailVerified: Math.random() > 0.2,
          phoneVerified: Math.random() > 0.3,
          lastLoginAt: Math.random() > 0.4 ? new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString() : null,
          createdAt: createdAt.toISOString(),
        }).returning();

        userIds.push(user.id);
        if (role === 'doctor') doctorUserIds.push(user.id);
        if (role === 'hospital') hospitalUserIds.push(user.id);
        if (role === 'admin') adminUserIds.push(user.id);
        userCreatedCount++;
      } catch (error: any) {
        // If duplicate email, retry with different email
        const errorCode = error.cause?.code || error.code;
        if (errorCode === '23505') {
          continue; // Retry with new unique email
        }
        throw error;
      }
    }
    console.log(`✅ Created ${userIds.length} users (${doctorUserIds.length} doctors, ${hospitalUserIds.length} hospitals, ${adminUserIds.length} admins)\n`);

    // ============================================
    // 3. SEED SUBSCRIPTION PLANS (8 plans)
    // ============================================
    console.log('📝 Seeding subscription plans...');
    const planIds: string[] = [];
    const doctorPlanIds: string[] = [];
    const hospitalPlanIds: string[] = [];

    for (const tier of subscriptionTiers) {
      for (const role of ['doctor', 'hospital']) {
        const existingPlans = await db.select().from(schema.subscriptionPlans)
          .where(sql`tier = ${tier} AND user_role = ${role}`);
        
        if (existingPlans.length === 0) {
          const [plan] = await db.insert(schema.subscriptionPlans).values({
            name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} ${role.charAt(0).toUpperCase() + role.slice(1)} Plan`,
            tier: tier,
            userRole: role,
            isActive: true,
            defaultBillingCycle: 'monthly',
          }).returning();
          planIds.push(plan.id);
          if (role === 'doctor') doctorPlanIds.push(plan.id);
          if (role === 'hospital') hospitalPlanIds.push(plan.id);
        } else {
          planIds.push(existingPlans[0].id);
          if (role === 'doctor') doctorPlanIds.push(existingPlans[0].id);
          if (role === 'hospital') hospitalPlanIds.push(existingPlans[0].id);
        }
      }
    }
    console.log(`✅ Using ${planIds.length} subscription plans\n`);

    // ============================================
    // 4. SEED SPECIALTIES (50 records)
    // ============================================
    console.log('📝 Seeding specialties (50 records)...');
    const specialtyIds: string[] = [];
    const existingSpecialties = await db.select().from(schema.specialties);
    specialtyIds.push(...existingSpecialties.map(s => s.id));
    const existingNames = new Set(existingSpecialties.map(s => s.name));

    for (let i = specialtyIds.length; i < 50; i++) {
      const specialtyName = specialties[i % specialties.length];
      const uniqueName = existingNames.has(specialtyName) 
        ? `${specialtyName} ${Date.now()}-${i}`
        : specialtyName;
      
      try {
        const [specialty] = await db.insert(schema.specialties).values({
          name: uniqueName,
          description: `Medical specialty: ${specialtyName}`,
        }).returning();
        specialtyIds.push(specialty.id);
        existingNames.add(uniqueName);
      } catch (error: any) {
        if (error.code !== '23505') throw error;
      }
    }
    console.log(`✅ Using ${specialtyIds.length} specialties\n`);

    // ============================================
    // 5. SEED FILES (50 records)
    // ============================================
    console.log('📝 Seeding files (50 records)...');
    const fileIds: string[] = [];
    
    for (let i = 0; i < 50; i++) {
      const mimeType = randomChoice(['image/jpeg', 'image/png', 'application/pdf']);
      const [file] = await db.insert(schema.files).values({
        filename: `file-${i + 1}.${mimeType.includes('pdf') ? 'pdf' : 'jpg'}`,
        url: `https://example.com/files/file-${i + 1}`,
        mimetype: mimeType,
        size: randomInt(10000, 5000000), // bigint with mode: "number" accepts number
        isPublic: Math.random() > 0.5,
        createdAt: new Date(Date.now() - randomInt(0, 180) * 24 * 60 * 60 * 1000).toISOString(),
      }).returning();
      fileIds.push(file.id);
    }
    console.log(`✅ Created ${fileIds.length} files\n`);

    // ============================================
    // 6. SEED DOCTORS (20 records - matching doctor users)
    // ============================================
    console.log('📝 Seeding doctors (20 records)...');
    const doctorIds: string[] = [];
    
    for (let i = 0; i < 20; i++) {
      const [doctor] = await db.insert(schema.doctors).values({
        userId: doctorUserIds[i],
        firstName: firstNames[i],
        lastName: lastNames[i],
        medicalLicenseNumber: `MD-${Date.now()}-${randomInt(100000, 999999)}-${i}`,
        yearsOfExperience: randomInt(1, 35),
        bio: `Experienced ${specialties[i % specialties.length]} specialist with ${randomInt(5, 35)} years of practice.`,
        profilePhotoId: i < fileIds.length ? fileIds[i] : null,
        primaryLocation: randomChoice(cities),
        latitude: randomFloat(25.0, 49.0).toString(),
        longitude: randomFloat(-125.0, -66.0).toString(),
        licenseVerificationStatus: randomChoice(verificationStatuses),
        averageRating: randomFloat(3.0, 5.0).toString(),
        totalRatings: randomInt(5, 1000),
        completedAssignments: randomInt(0, 500),
      }).returning();
      doctorIds.push(doctor.id);
    }
    console.log(`✅ Created ${doctorIds.length} doctors\n`);

    // ============================================
    // 7. SEED HOSPITALS (20 records - matching hospital users)
    // ============================================
    console.log('📝 Seeding hospitals (20 records)...');
    const hospitalIds: string[] = [];
    
    for (let i = 0; i < 20; i++) {
      const [hospital] = await db.insert(schema.hospitals).values({
        userId: hospitalUserIds[i],
        name: `${randomChoice(cities)} ${randomChoice(['Medical Center', 'Hospital', 'Clinic', 'Health Center'])}`,
        registrationNumber: `REG-${Date.now()}-${randomInt(100000, 999999)}-${i}`,
        hospitalType: randomChoice(hospitalTypes),
        address: `${randomInt(100, 9999)} ${randomString(10)} Street`,
        city: randomChoice(cities),
        contactPhone: `+1${randomInt(2000000000, 9999999999)}`,
        contactEmail: `hospital${i + 1}@example.com`,
        websiteUrl: `https://hospital${i + 1}.example.com`,
        numberOfBeds: randomInt(50, 1000),
        latitude: randomFloat(25.0, 49.0).toString(),
        longitude: randomFloat(-125.0, -66.0).toString(),
        logoId: i + 20 < fileIds.length ? fileIds[i + 20] : null,
        licenseVerificationStatus: randomChoice(verificationStatuses),
      }).returning();
      hospitalIds.push(hospital.id);
    }
    console.log(`✅ Created ${hospitalIds.length} hospitals\n`);

    // ============================================
    // 8. SEED DOCTOR SPECIALTIES (50 records)
    // ============================================
    console.log('📝 Seeding doctor specialties (50 records)...');
    const doctorSpecialtyPairs = new Set<string>();
    let createdCount = 0;
    let attempts = 0;
    
    while (createdCount < 50 && attempts < 200) {
      attempts++;
      const doctorId = randomChoice(doctorIds);
      const specialtyId = randomChoice(specialtyIds);
      const pairKey = `${doctorId}-${specialtyId}`;
      
      if (doctorSpecialtyPairs.has(pairKey)) continue;
      
      try {
        await db.insert(schema.doctorSpecialties).values({
          doctorId,
          specialtyId,
          isPrimary: createdCount < 20,
          yearsOfExperience: randomInt(1, 15),
        });
        doctorSpecialtyPairs.add(pairKey);
        createdCount++;
      } catch (error: any) {
        if (error.code === '23505') {
          doctorSpecialtyPairs.add(pairKey);
          continue;
        }
        throw error;
      }
    }
    console.log(`✅ Created ${createdCount} doctor specialties\n`);

    // ============================================
    // 9. SEED HOSPITAL DEPARTMENTS (50 records)
    // ============================================
    console.log('📝 Seeding hospital departments (50 records)...');
    const departmentPairs = new Set<string>();
    let deptCount = 0;
    let deptAttempts = 0;
    
    while (deptCount < 50 && deptAttempts < 200) {
      deptAttempts++;
      const hospitalId = randomChoice(hospitalIds);
      const specialtyId = randomChoice(specialtyIds);
      const pairKey = `${hospitalId}-${specialtyId}`;
      
      if (departmentPairs.has(pairKey)) continue;
      
      try {
        await db.insert(schema.hospitalDepartments).values({
          hospitalId,
          specialtyId,
        });
        departmentPairs.add(pairKey);
        deptCount++;
      } catch (error: any) {
        if (error.code === '23505') {
          departmentPairs.add(pairKey);
          continue;
        }
        throw error;
      }
    }
    console.log(`✅ Created ${deptCount} hospital departments\n`);

    // ============================================
    // 10. SEED DOCTOR CREDENTIALS (50 records)
    // ============================================
    console.log('📝 Seeding doctor credentials (50 records)...');
    for (let i = 0; i < 50; i++) {
      await db.insert(schema.doctorCredentials).values({
        doctorId: randomChoice(doctorIds),
        fileId: randomChoice(fileIds),
        credentialType: randomChoice(credentialTypes),
        title: randomChoice(['MD', 'PhD', 'Board Certified', 'Fellow', 'Diplomate']),
        institution: `Medical Institution ${randomInt(1, 50)}`,
        verificationStatus: randomChoice(verificationStatuses),
        uploadedAt: new Date(Date.now() - randomInt(0, 365) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    console.log(`✅ Created 50 doctor credentials\n`);

    // ============================================
    // 11. SEED HOSPITAL DOCUMENTS (50 records)
    // ============================================
    console.log('📝 Seeding hospital documents (50 records)...');
    for (let i = 0; i < 50; i++) {
      await db.insert(schema.hospitalDocuments).values({
        hospitalId: randomChoice(hospitalIds),
        fileId: randomChoice(fileIds),
        documentType: randomChoice(documentTypes),
        verificationStatus: randomChoice(verificationStatuses),
        uploadedAt: new Date(Date.now() - randomInt(0, 365) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    console.log(`✅ Created 50 hospital documents\n`);

    // ============================================
    // 12. SEED DOCTOR AVAILABILITY (50 records)
    // ============================================
    console.log('📝 Seeding doctor availability (50 records)...');
    const availabilityIds: string[] = [];
    
    for (let i = 0; i < 50; i++) {
      const daysAhead = randomInt(-7, 30);
      const slotDate = new Date();
      slotDate.setDate(slotDate.getDate() + daysAhead);
      
      const [availability] = await db.insert(schema.doctorAvailability).values({
        doctorId: randomChoice(doctorIds),
        slotDate: slotDate.toISOString().split('T')[0],
        startTime: `${randomInt(8, 10).toString().padStart(2, '0')}:00:00`,
        endTime: `${randomInt(16, 18).toString().padStart(2, '0')}:00:00`,
        status: randomChoice(['available', 'booked', 'pending', 'confirmed']),
        isManual: Math.random() > 0.5,
        bookedByHospitalId: Math.random() > 0.7 ? randomChoice(hospitalIds) : null,
        bookedAt: Math.random() > 0.7 ? new Date(Date.now() - randomInt(0, 7) * 24 * 60 * 60 * 1000).toISOString() : null,
      }).returning();
      availabilityIds.push(availability.id);
    }
    console.log(`✅ Created ${availabilityIds.length} doctor availability slots\n`);

    // ============================================
    // 13. SEED DOCTOR LEAVES (50 records)
    // ============================================
    console.log('📝 Seeding doctor leaves (50 records)...');
    for (let i = 0; i < 50; i++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + randomInt(-30, 90));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + randomInt(1, 14));
      
      await db.insert(schema.doctorLeaves).values({
        doctorId: randomChoice(doctorIds),
        leaveType: randomChoice(leaveTypes),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        reason: `Leave reason ${i + 1}`,
        createdAt: new Date(Date.now() - randomInt(0, 60) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    console.log(`✅ Created 50 doctor leaves\n`);

    // ============================================
    // 14. SEED PATIENTS (50 records)
    // ============================================
    console.log('📝 Seeding patients (50 records)...');
    const patientIds: string[] = [];
    
    for (let i = 0; i < 50; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      
      const [patient] = await db.insert(schema.patients).values({
        hospitalId: randomChoice(hospitalIds),
        fullName: `${firstName} ${lastName}`,
        dateOfBirth: new Date(1950 + randomInt(0, 70), randomInt(0, 11), randomInt(1, 28)).toISOString().split('T')[0],
        gender: randomChoice(genders),
        phone: `+1${randomInt(2000000000, 9999999999)}`,
        emergencyContact: `${firstNames[(i + 1) % firstNames.length]} ${lastNames[(i + 1) % lastNames.length]} - +1${randomInt(2000000000, 9999999999)}`,
        address: `${randomInt(100, 9999)} ${randomString(10)} Street, ${randomChoice(cities)}`,
        medicalCondition: `Condition ${i + 1}`,
        roomType: randomChoice(roomTypes),
        costPerDay: randomFloat(100, 2000).toString(),
        medicalNotes: `Medical notes for patient ${i + 1}`,
        createdAt: new Date(Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000).toISOString(),
      }).returning();
      patientIds.push(patient.id);
    }
    console.log(`✅ Created ${patientIds.length} patients\n`);

    // ============================================
    // 15. SEED ASSIGNMENTS (50 records)
    // ============================================
    console.log('📝 Seeding assignments (50 records)...');
    const assignmentIds: string[] = [];
    
    for (let i = 0; i < 50; i++) {
      const requestedAt = new Date(Date.now() - randomInt(0, 180) * 24 * 60 * 60 * 1000);
      const expiresAt = new Date(requestedAt);
      expiresAt.setDate(expiresAt.getDate() + randomInt(1, 7));
      
      const [assignment] = await db.insert(schema.assignments).values({
        hospitalId: randomChoice(hospitalIds),
        doctorId: randomChoice(doctorIds),
        patientId: randomChoice(patientIds),
        availabilitySlotId: Math.random() > 0.3 ? randomChoice(availabilityIds) : null,
        priority: randomChoice(assignmentPriorities),
        status: randomChoice(assignmentStatuses),
        requestedAt: requestedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        actualStartTime: Math.random() > 0.5 ? new Date(requestedAt.getTime() + randomInt(0, 2) * 24 * 60 * 60 * 1000).toISOString() : null,
        actualEndTime: Math.random() > 0.6 ? new Date(requestedAt.getTime() + randomInt(1, 5) * 24 * 60 * 60 * 1000).toISOString() : null,
        treatmentNotes: Math.random() > 0.4 ? `Treatment notes for assignment ${i + 1}` : null,
        consultationFee: randomFloat(50, 500).toString(),
        cancellationReason: Math.random() > 0.8 ? `Cancellation reason ${i + 1}` : null,
        cancelledBy: Math.random() > 0.8 ? randomChoice(['hospital', 'doctor', 'system']) : null,
        cancelledAt: Math.random() > 0.8 ? new Date(requestedAt.getTime() + randomInt(0, 5) * 24 * 60 * 60 * 1000).toISOString() : null,
        completedAt: Math.random() > 0.6 ? new Date(requestedAt.getTime() + randomInt(1, 10) * 24 * 60 * 60 * 1000).toISOString() : null,
        paidAt: Math.random() > 0.5 ? new Date(requestedAt.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000).toISOString() : null,
      }).returning();
      assignmentIds.push(assignment.id);
    }
    console.log(`✅ Created ${assignmentIds.length} assignments\n`);

    // ============================================
    // 16. SEED ORDERS (50 records)
    // ============================================
    console.log('📝 Seeding orders (50 records)...');
    const orderIds: string[] = [];
    
    for (let i = 0; i < 50; i++) {
      const createdAt = new Date(Date.now() - randomInt(0, 180) * 24 * 60 * 60 * 1000);
      const status = randomChoice(orderStatuses);
      const paidAt = status === 'paid' ? new Date(createdAt.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000).toISOString() : null;
      
      const [order] = await db.insert(schema.orders).values({
        userId: randomChoice(userIds),
        orderType: randomChoice(orderTypes),
        planId: Math.random() > 0.3 ? randomChoice(planIds) : null,
        amount: randomInt(1000, 50000) * 100, // Convert to cents (bigint with mode: "number" accepts number)
        currency: 'USD',
        description: `Order ${i + 1} description`,
        status: status,
        createdAt: createdAt.toISOString(),
        expiresAt: new Date(createdAt.getTime() + randomInt(1, 30) * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: paidAt,
        failureReason: status === 'failed' ? `Failure reason ${i + 1}` : null,
        webhookReceived: status === 'paid' ? Math.random() > 0.3 : false,
      }).returning();
      orderIds.push(order.id);
    }
    console.log(`✅ Created ${orderIds.length} orders\n`);

    // ============================================
    // 17. SEED PAYMENT TRANSACTIONS (50 records)
    // ============================================
    console.log('📝 Seeding payment transactions (50 records)...');
    const paymentTransactionIds: string[] = [];
    
    for (let i = 0; i < 50; i++) {
      const orderId = randomChoice(orderIds);
      const createdAt = new Date(Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000);
      const status = randomChoice(paymentStatuses);
      const verifiedAt = status === 'success' ? new Date(createdAt.getTime() + randomInt(0, 2) * 24 * 60 * 60 * 1000).toISOString() : null;
      
      try {
        const timestamp = Date.now() + i;
        const paymentResult = await db.insert(schema.paymentTransactions).values({
          orderId: orderId,
          paymentGateway: randomChoice(['stripe', 'paypal', 'razorpay']),
          paymentId: `PAY-${timestamp}-${randomInt(100000, 999999)}`,
          paymentMethod: randomChoice(['credit_card', 'debit_card', 'net_banking', 'wallet']),
          amount: randomInt(1000, 50000) * 100, // Convert to cents (bigint with mode: "number" accepts number)
          currency: 'USD',
          status: status,
          gatewayResponse: { success: status === 'success', transactionId: `TXN-${timestamp}` },
          verifiedAt: verifiedAt,
          createdAt: createdAt.toISOString(),
        }).returning();
        
        const paymentTransaction = Array.isArray(paymentResult) ? paymentResult[0] : paymentResult;
        if (paymentTransaction && paymentTransaction.id) {
          paymentTransactionIds.push(paymentTransaction.id as string);
        }
      } catch (error: any) {
        if (error.code === '23505') continue;
        throw error;
      }
    }
    console.log(`✅ Created ${paymentTransactionIds.length} payment transactions\n`);

    // ============================================
    // 18. SEED SUBSCRIPTIONS (50 records)
    // ============================================
    console.log('📝 Seeding subscriptions (50 records)...');
    for (let i = 0; i < 50; i++) {
      const startDate = new Date(Date.now() - randomInt(0, 365) * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + randomInt(30, 365));
      
      await db.insert(schema.subscriptions).values({
        userId: randomChoice([...doctorUserIds, ...hospitalUserIds]),
        planId: randomChoice(planIds),
        orderId: Math.random() > 0.3 ? randomChoice(orderIds) : null,
        paymentTransactionId: Math.random() > 0.4 ? randomChoice(paymentTransactionIds) : null,
        status: randomChoice(subscriptionStatuses),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        autoRenew: Math.random() > 0.4,
        createdAt: startDate.toISOString(),
      });
    }
    console.log(`✅ Created 50 subscriptions\n`);

    // ============================================
    // 19. SEED ASSIGNMENT RATINGS (50 records)
    // ============================================
    console.log('📝 Seeding assignment ratings (50 records)...');
    const ratedAssignments = new Set<string>();
    
    for (let i = 0; i < 50; i++) {
      const assignmentId = randomChoice(assignmentIds);
      if (ratedAssignments.has(assignmentId)) continue;
      ratedAssignments.add(assignmentId);
      
      try {
        await db.insert(schema.assignmentRatings).values({
          assignmentId: assignmentId,
          hospitalId: randomChoice(hospitalIds),
          doctorId: randomChoice(doctorIds),
          rating: randomInt(1, 5),
          reviewText: Math.random() > 0.5 ? `Review text ${i + 1}` : null,
          positiveTags: Math.random() > 0.5 ? ['professional', 'punctual', 'helpful'] : [],
          negativeTags: Math.random() > 0.7 ? ['delayed'] : [],
          createdAt: new Date(Date.now() - randomInt(0, 60) * 24 * 60 * 60 * 1000).toISOString(),
        });
      } catch (error: any) {
        if (error.code === '23505') continue;
        throw error;
      }
    }
    console.log(`✅ Created ${ratedAssignments.size} assignment ratings\n`);

    // ============================================
    // 20. SEED ASSIGNMENT PAYMENTS (50 records)
    // ============================================
    console.log('📝 Seeding assignment payments (50 records)...');
    const paidAssignments = new Set<string>();
    
    for (let i = 0; i < 50; i++) {
      const assignmentId = randomChoice(assignmentIds);
      if (paidAssignments.has(assignmentId)) continue;
      paidAssignments.add(assignmentId);
      
      try {
        await db.insert(schema.assignmentPayments).values({
          assignmentId: assignmentId,
          hospitalId: randomChoice(hospitalIds),
          doctorId: randomChoice(doctorIds),
          consultationFee: randomFloat(50, 500).toString(),
          platformCommission: randomFloat(5, 50).toString(),
          doctorPayout: randomFloat(45, 450).toString(),
          paymentStatus: randomChoice(['pending', 'processing', 'completed', 'failed']),
          paidToDoctorAt: Math.random() > 0.5 ? new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString() : null,
          createdAt: new Date(Date.now() - randomInt(0, 60) * 24 * 60 * 60 * 1000).toISOString(),
        });
      } catch (error: any) {
        if (error.code === '23505') continue;
        throw error;
      }
    }
    console.log(`✅ Created ${paidAssignments.size} assignment payments\n`);

    // ============================================
    // 21. SEED DOCTOR-HOSPITAL AFFILIATIONS (50 records)
    // ============================================
    console.log('📝 Seeding doctor-hospital affiliations (50 records)...');
    const affiliationPairs = new Set<string>();
    let affiliationCount = 0;
    let affiliationAttempts = 0;
    
    while (affiliationCount < 50 && affiliationAttempts < 200) {
      affiliationAttempts++;
      const doctorId = randomChoice(doctorIds);
      const hospitalId = randomChoice(hospitalIds);
      const pairKey = `${doctorId}-${hospitalId}`;
      
      if (affiliationPairs.has(pairKey)) continue;
      
      try {
        await db.insert(schema.doctorHospitalAffiliations).values({
          doctorId,
          hospitalId,
          status: randomChoice(['active', 'inactive', 'pending', 'suspended']),
          isPreferred: Math.random() > 0.7,
          createdAt: new Date(Date.now() - randomInt(0, 365) * 24 * 60 * 60 * 1000).toISOString(),
        });
        affiliationPairs.add(pairKey);
        affiliationCount++;
      } catch (error: any) {
        if (error.code === '23505') {
          affiliationPairs.add(pairKey);
          continue;
        }
        throw error;
      }
    }
    console.log(`✅ Created ${affiliationCount} doctor-hospital affiliations\n`);

    // ============================================
    // 22. SEED PATIENT CONSENTS (50 records)
    // ============================================
    console.log('📝 Seeding patient consents (50 records)...');
    for (let i = 0; i < 50; i++) {
      await db.insert(schema.patientConsents).values({
        patientId: randomChoice(patientIds),
        consentType: randomChoice(consentTypes),
        granted: Math.random() > 0.3,
        grantedBy: randomChoice(['patient', 'guardian', 'family_member', 'self']),
        relationToPatient: Math.random() > 0.5 ? randomChoice(['spouse', 'child', 'parent', 'sibling']) : null,
        digitalSignature: Math.random() > 0.5 ? `signature-${i + 1}` : null,
        grantedAt: new Date(Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    console.log(`✅ Created 50 patient consents\n`);

    // ============================================
    // 23. SEED NOTIFICATIONS (50 records)
    // ============================================
    console.log('📝 Seeding notifications (50 records)...');
    for (let i = 0; i < 50; i++) {
      await db.insert(schema.notifications).values({
        recipientType: randomChoice(['user', 'role', 'all']),
        recipientId: Math.random() > 0.3 ? randomChoice(userIds) : null,
        title: `Notification ${i + 1}`,
        message: `This is notification message ${i + 1}`,
        channel: randomChoice(notificationChannels),
        priority: randomChoice(notificationPriorities),
        assignmentId: Math.random() > 0.5 ? randomChoice(assignmentIds) : null,
        payload: { type: 'assignment', assignmentId: assignmentIds[i % assignmentIds.length] },
        read: Math.random() > 0.4,
        createdAt: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    console.log(`✅ Created 50 notifications\n`);

    // ============================================
    // 24. SEED SUPPORT TICKETS (50 records)
    // ============================================
    console.log('📝 Seeding support tickets (50 records)...');
    for (let i = 0; i < 50; i++) {
      await db.insert(schema.supportTickets).values({
        userId: randomChoice(userIds),
        bookingId: Math.random() > 0.5 ? randomChoice(assignmentIds) : null,
        subject: `Support Ticket ${i + 1}`,
        description: `Description for support ticket ${i + 1}`,
        category: randomChoice(supportCategories),
        priority: randomChoice(assignmentPriorities),
        status: randomChoice(supportStatuses),
        assignedTo: Math.random() > 0.5 ? randomChoice(adminUserIds) : null,
        createdAt: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    console.log(`✅ Created 50 support tickets\n`);

    // ============================================
    // 25. SEED ANALYTICS EVENTS (50 records)
    // ============================================
    console.log('📝 Seeding analytics events (50 records)...');
    for (let i = 0; i < 50; i++) {
      await db.insert(schema.analyticsEvents).values({
        userId: Math.random() > 0.3 ? randomChoice(userIds) : null,
        eventType: randomChoice(['page_view', 'click', 'form_submit', 'api_call', 'assignment_created', 'user_registered']),
        eventName: `Event ${i + 1}`,
        properties: { 
          key: `value${i + 1}`, 
          timestamp: new Date().toISOString(),
          page: randomChoice(['dashboard', 'profile', 'assignments', 'settings']),
        },
        createdAt: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    console.log(`✅ Created 50 analytics events\n`);

    // ============================================
    // 26. SEED USER DEVICES (50 records)
    // ============================================
    console.log('📝 Seeding user devices (50 records)...');
    for (let i = 0; i < 50; i++) {
      await db.insert(schema.userDevices).values({
        userId: randomChoice(userIds),
        deviceType: randomChoice(deviceTypes),
        deviceToken: `device-token-${Date.now()}-${randomInt(100000, 999999)}-${i}`,
        appVersion: `${randomInt(1, 3)}.${randomInt(0, 9)}.${randomInt(0, 9)}`,
        osVersion: `${randomInt(10, 17)}.${randomInt(0, 9)}`,
        deviceName: randomChoice(['iPhone 14', 'Samsung Galaxy', 'Chrome Browser', 'Safari Browser', 'Firefox Browser']),
        isActive: Math.random() > 0.3,
        lastUsedAt: Math.random() > 0.4 ? new Date(Date.now() - randomInt(0, 7) * 24 * 60 * 60 * 1000).toISOString() : null,
        createdAt: new Date(Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    console.log(`✅ Created 50 user devices\n`);

    // ============================================
    // 27. SEED AUDIT LOGS (50 records)
    // ============================================
    console.log('📝 Seeding audit logs (50 records)...');
    for (let i = 0; i < 50; i++) {
      await db.insert(schema.auditLogs).values({
        userId: Math.random() > 0.3 ? randomChoice(userIds) : null,
        actorType: randomChoice(['user', 'system', 'admin', 'webhook']),
        action: randomChoice(['create', 'update', 'delete', 'verify', 'reject', 'approve', 'cancel']),
        entityType: randomChoice(['user', 'doctor', 'hospital', 'assignment', 'subscription', 'order']),
        entityId: Math.random() > 0.3 ? randomChoice([...userIds, ...doctorIds, ...hospitalIds, ...assignmentIds]) : null,
        details: {
          action: `Action ${i + 1}`,
          changes: { field: 'value' },
          ipAddress: `192.168.1.${randomInt(1, 255)}`,
        },
        createdAt: new Date(Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    console.log(`✅ Created 50 audit logs\n`);

    // ============================================
    // 28. SEED PLAN FEATURES
    // ============================================
    console.log('📝 Seeding plan features...');
    
    // Hospital Plan Features
    for (let i = 0; i < hospitalPlanIds.length; i++) {
      try {
        await db.insert(schema.hospitalPlanFeatures).values({
          planId: hospitalPlanIds[i],
          maxPatientsPerMonth: randomInt(100, 10000),
          includesPremiumDoctors: Math.random() > 0.5,
          notes: `Hospital plan feature ${i + 1}`,
        });
      } catch (error: any) {
        if (error.code !== '23505') throw error;
      }
    }

    // Doctor Plan Features
    for (let i = 0; i < doctorPlanIds.length; i++) {
      try {
        await db.insert(schema.doctorPlanFeatures).values({
          planId: doctorPlanIds[i],
          visibilityWeight: randomInt(1, 10),
          maxAffiliations: randomInt(1, 20),
          notes: `Doctor plan feature ${i + 1}`,
        });
      } catch (error: any) {
        if (error.code !== '23505') throw error;
      }
    }
    console.log(`✅ Created plan features\n`);

    // ============================================
    // 29. SEED DOCTOR PREFERENCES (20 records - one per doctor)
    // ============================================
    console.log('📝 Seeding doctor preferences (20 records)...');
    for (let i = 0; i < 20; i++) {
      try {
        await db.insert(schema.doctorPreferences).values({
          doctorId: doctorIds[i],
          maxTravelDistanceKm: randomInt(10, 100),
          acceptEmergencyOnly: Math.random() > 0.7,
          preferredHospitalIds: Math.random() > 0.5 ? [randomChoice(hospitalIds)] : [],
          blockedHospitalIds: Math.random() > 0.8 ? [randomChoice(hospitalIds)] : [],
        });
      } catch (error: any) {
        if (error.code !== '23505') throw error;
      }
    }
    console.log(`✅ Created 20 doctor preferences\n`);

    // ============================================
    // 30. SEED HOSPITAL PREFERENCES (20 records - one per hospital)
    // ============================================
    console.log('📝 Seeding hospital preferences (20 records)...');
    for (let i = 0; i < 20; i++) {
      try {
        await db.insert(schema.hospitalPreferences).values({
          hospitalId: hospitalIds[i],
          maxSearchDistanceKm: randomInt(20, 200),
          preferAffiliatedOnly: Math.random() > 0.6,
          preferredDoctorIds: Math.random() > 0.5 ? [randomChoice(doctorIds)] : [],
          blockedDoctorIds: Math.random() > 0.8 ? [randomChoice(doctorIds)] : [],
        });
      } catch (error: any) {
        if (error.code !== '23505') throw error;
      }
    }
    console.log(`✅ Created 20 hospital preferences\n`);

    // ============================================
    // 31. SEED NOTIFICATION PREFERENCES (50 records - one per user)
    // ============================================
    console.log('📝 Seeding notification preferences (50 records)...');
    const preferenceUserIds = new Set<string>();
    let prefCount = 0;
    
    // Create one preference per user (max 50 users)
    for (let i = 0; i < Math.min(50, userIds.length); i++) {
      const userId = userIds[i];
      if (preferenceUserIds.has(userId)) continue;
      
      try {
        await db.insert(schema.notificationPreferences).values({
          userId: userId,
          bookingUpdatesPush: Math.random() > 0.2,
          bookingUpdatesEmail: Math.random() > 0.2,
          paymentPush: Math.random() > 0.2,
          remindersPush: Math.random() > 0.2,
          createdAt: new Date(Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000).toISOString(),
        });
        preferenceUserIds.add(userId);
        prefCount++;
      } catch (error: any) {
        const errorCode = error.cause?.code || error.code;
        if (errorCode === '23505') {
          preferenceUserIds.add(userId);
          continue;
        }
        throw error;
      }
    }
    console.log(`✅ Created ${prefCount} notification preferences\n`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   ✅ Users: ${userIds.length} (${doctorUserIds.length} doctors, ${hospitalUserIds.length} hospitals, ${adminUserIds.length} admins)`);
    console.log(`   ✅ Doctors: ${doctorIds.length}`);
    console.log(`   ✅ Hospitals: ${hospitalIds.length}`);
    console.log(`   ✅ Specialties: ${specialtyIds.length}`);
    console.log(`   ✅ Patients: ${patientIds.length}`);
    console.log(`   ✅ Assignments: ${assignmentIds.length}`);
    console.log(`   ✅ Orders: ${orderIds.length}`);
    console.log(`   ✅ Subscriptions: 50`);
    console.log(`   ✅ Payment Transactions: ${paymentTransactionIds.length}`);
    console.log(`   ✅ Support Tickets: 50`);
    console.log(`   ✅ And many more...`);
    console.log('\n✨ Your admin dashboard is now ready with comprehensive test data!\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Export the function for use in other scripts
export { seedDatabase };

// Run the seeding script if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding script failed:', error);
      process.exit(1);
    });
}

