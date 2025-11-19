import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { getDb } from '../lib/db';
import * as schema from '../src/db/drizzle/migrations/schema';
import bcrypt from 'bcrypt';

const db = getDb();

// Helper function to generate random data
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomString = (length: number) => Math.random().toString(36).substring(2, length + 2);

// Generate arrays of data
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica', 'William', 'Ashley', 'James', 'Amanda', 'Richard', 'Melissa', 'Joseph', 'Deborah', 'Thomas', 'Michelle', 'Charles', 'Laura', 'Christopher', 'Kimberly', 'Daniel', 'Amy', 'Matthew', 'Angela', 'Anthony', 'Sharon', 'Mark', 'Lisa'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young'];
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore'];
const specialties = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Oncology', 'Psychiatry', 'Radiology', 'Surgery', 'Emergency Medicine', 'Internal Medicine', 'Gynecology', 'Urology', 'Ophthalmology', 'ENT', 'Pulmonology', 'Gastroenterology', 'Endocrinology', 'Rheumatology', 'Nephrology', 'Hematology', 'Infectious Disease', 'Allergy', 'Anesthesiology', 'Pathology', 'Physical Medicine', 'Preventive Medicine', 'Sports Medicine', 'Geriatrics', 'Family Medicine'];
// Allowed hospital types from database constraint
const hospitalTypes = ['general', 'specialty', 'clinic', 'trauma_center', 'teaching', 'other'];
const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const priorities = ['low', 'medium', 'high'] as const;
const statuses = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
const paymentStatuses = ['pending', 'completed', 'failed', 'refunded'] as const;
const subscriptionTiers = ['free', 'basic', 'premium', 'enterprise'] as const;
const subscriptionStatuses = ['active', 'expired', 'cancelled', 'suspended'] as const;

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');
  console.log('⚠️  Note: Script will skip existing records to avoid duplicates\n');

  try {
    // 1. Seed Users (30 records)
    console.log('📝 Seeding users...');
    const userIds: string[] = [];
    const doctorUserIds: string[] = [];
    const hospitalUserIds: string[] = [];
    
    for (let i = 0; i < 30; i++) {
      const role = i < 10 ? 'doctor' : i < 20 ? 'hospital' : 'admin';
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const timestamp = Date.now();
      
      const [user] = await db.insert(schema.users).values({
        email: `user${timestamp}-${i + 1}@example.com`,
        passwordHash: hashedPassword,
        phone: `+1${randomInt(2000000000, 9999999999)}`,
        role: role,
        status: randomChoice(['active', 'inactive', 'pending', 'suspended']),
        emailVerified: Math.random() > 0.3,
        phoneVerified: Math.random() > 0.5,
        createdAt: new Date(Date.now() - randomInt(0, 365 * 24 * 60 * 60 * 1000)).toISOString(),
      }).returning();
      
      userIds.push(user.id);
      if (role === 'doctor') doctorUserIds.push(user.id);
      if (role === 'hospital') hospitalUserIds.push(user.id);
    }
    console.log(`✅ Created ${userIds.length} users\n`);

    // 2. Seed Subscription Plans (4 plans)
    console.log('📝 Seeding subscription plans...');
    const planIds: string[] = [];
    const doctorPlanIds: string[] = [];
    const hospitalPlanIds: string[] = [];
    
    // Check existing plans first
    const existingPlans = await db.select().from(schema.subscriptionPlans);
    const existingPlanMap = new Map(existingPlans.map(p => [`${p.tier}-${p.userRole}`, p]));
    
    for (const tier of subscriptionTiers) {
      for (const role of ['doctor', 'hospital']) {
        const key = `${tier}-${role}`;
        let plan;
        
        if (existingPlanMap.has(key)) {
          plan = existingPlanMap.get(key)!;
        } else {
          const [newPlan] = await db.insert(schema.subscriptionPlans).values({
            name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} ${role.charAt(0).toUpperCase() + role.slice(1)} Plan`,
            tier: tier,
            userRole: role,
            price: tier === 'free' ? 0 : tier === 'basic' ? 29 : tier === 'premium' ? 99 : 299,
            currency: 'USD',
          }).returning();
          plan = newPlan;
        }
        
        planIds.push(plan.id);
        if (role === 'doctor') doctorPlanIds.push(plan.id);
        if (role === 'hospital') hospitalPlanIds.push(plan.id);
      }
    }
    console.log(`✅ Using ${planIds.length} subscription plans\n`);

    // 3. Seed Specialties (30 records)
    console.log('📝 Seeding specialties...');
    const specialtyIds: string[] = [];
    
    // Get existing specialties
    const existingSpecialties = await db.select().from(schema.specialties);
    const existingSpecialtyNames = new Set(existingSpecialties.map(s => s.name));
    specialtyIds.push(...existingSpecialties.map(s => s.id));
    
    // Create new specialties if needed
    let specialtyIndex = 0;
    while (specialtyIds.length < 30) {
      const specialtyName = specialties[specialtyIndex] || `Specialty ${specialtyIndex + 1}`;
      const uniqueName = existingSpecialtyNames.has(specialtyName) 
        ? `${specialtyName} ${Date.now()}-${specialtyIndex + 1}`
        : specialtyName;
      
      try {
        const [specialty] = await db.insert(schema.specialties).values({
          name: uniqueName,
          description: `Description for ${specialtyName}`,
        }).returning();
        
        specialtyIds.push(specialty.id);
        existingSpecialtyNames.add(uniqueName);
      } catch (error: any) {
        // If still duplicate, skip
        if (error.code !== '23505') throw error;
      }
      specialtyIndex++;
    }
    console.log(`✅ Using ${specialtyIds.length} specialties\n`);

    // 3.5. Seed Enum Status and Priority (required for assignments)
    console.log('📝 Seeding enum status and priority...');
    const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    const allowedPriorities = ['low', 'medium', 'high'];
    
    // Seed enum_status
    for (const status of allowedStatuses) {
      try {
        await db.insert(schema.enumStatus).values({
          status,
          description: `Status: ${status}`,
        });
      } catch (error: any) {
        // Ignore duplicates
        const errorCode = error.cause?.code || error.code;
        if (errorCode !== '23505') throw error;
      }
    }
    
    // Seed enum_priority
    for (const priority of allowedPriorities) {
      try {
        await db.insert(schema.enumPriority).values({
          priority,
          description: `Priority: ${priority}`,
        });
      } catch (error: any) {
        // Ignore duplicates
        const errorCode = error.cause?.code || error.code;
        if (errorCode !== '23505') throw error;
      }
    }
    console.log(`✅ Seeded enum status and priority\n`);

    // 4. Seed Files (30 records)
    console.log('📝 Seeding files...');
    const fileIds: string[] = [];
    
    for (let i = 0; i < 30; i++) {
      const mimeType = randomChoice(['image/jpeg', 'image/png', 'application/pdf']);
      const [file] = await db.insert(schema.files).values({
        filename: `file-${i + 1}.jpg`,
        url: `https://example.com/files/file-${i + 1}.jpg`,
        mimetype: mimeType,
        size: BigInt(randomInt(10000, 5000000)),
        uploadedBy: randomChoice(userIds),
        createdAt: new Date(Date.now() - randomInt(0, 180 * 24 * 60 * 60 * 1000)).toISOString(),
      }).returning();
      
      fileIds.push(file.id);
    }
    console.log(`✅ Created ${fileIds.length} files\n`);

    // 5. Seed Doctors (10 records - matching doctor users)
    console.log('📝 Seeding doctors...');
    const doctorIds: string[] = [];
    
    for (let i = 0; i < 10; i++) {
      const [doctor] = await db.insert(schema.doctors).values({
        userId: doctorUserIds[i],
        firstName: firstNames[i],
        lastName: lastNames[i],
        medicalLicenseNumber: `MD-${Date.now()}-${randomInt(100000, 999999)}`,
        yearsOfExperience: randomInt(1, 30),
        bio: `Experienced ${specialties[i % specialties.length]} specialist with ${randomInt(5, 30)} years of practice.`,
        profilePhotoId: randomChoice(fileIds),
        primaryLocation: randomChoice(cities),
        latitude: randomFloat(25.0, 49.0).toString(),
        longitude: randomFloat(-125.0, -66.0).toString(),
        licenseVerificationStatus: randomChoice(['pending', 'verified', 'rejected']),
        averageRating: randomFloat(3.5, 5.0).toString(),
        totalRatings: randomInt(10, 500),
        completedAssignments: randomInt(0, 200),
      }).returning();
      
      doctorIds.push(doctor.id);
    }
    console.log(`✅ Created ${doctorIds.length} doctors\n`);

    // 6. Seed Hospitals (10 records - matching hospital users)
    console.log('📝 Seeding hospitals...');
    const hospitalIds: string[] = [];
    
    for (let i = 0; i < 10; i++) {
      try {
        const [hospital] = await db.insert(schema.hospitals).values({
          userId: hospitalUserIds[i],
          name: `${randomChoice(cities)} ${randomChoice(hospitalTypes)}`,
          registrationNumber: `REG-${Date.now()}-${randomInt(100000, 999999)}`,
          hospitalType: randomChoice(hospitalTypes),
          address: `${randomInt(100, 9999)} ${randomString(10)} Street`,
          city: randomChoice(cities),
          contactPhone: `+1${randomInt(2000000000, 9999999999)}`,
          contactEmail: `hospital${Date.now()}-${i + 1}@example.com`,
          websiteUrl: `https://hospital${i + 1}.example.com`,
          numberOfBeds: randomInt(50, 500),
          latitude: randomFloat(25.0, 49.0).toString(),
          longitude: randomFloat(-125.0, -66.0).toString(),
          logoId: randomChoice(fileIds),
          licenseVerificationStatus: randomChoice(['pending', 'verified', 'rejected']),
        }).returning();
        
        hospitalIds.push(hospital.id);
      } catch (error: any) {
        console.error(`Error creating hospital ${i + 1}:`, error.message);
        throw error;
      }
    }
    console.log(`✅ Created ${hospitalIds.length} hospitals\n`);

    // 7. Seed Doctor Specialties (30 records)
    console.log('📝 Seeding doctor specialties...');
    const doctorSpecialtyPairs = new Set<string>();
    let createdCount = 0;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (createdCount < 30 && attempts < maxAttempts) {
      attempts++;
      const doctorId = randomChoice(doctorIds);
      const specialtyId = randomChoice(specialtyIds);
      const pairKey = `${doctorId}-${specialtyId}`;
      
      if (doctorSpecialtyPairs.has(pairKey)) {
        continue; // Skip duplicate pairs
      }
      
      try {
        await db.insert(schema.doctorSpecialties).values({
          doctorId,
          specialtyId,
          isPrimary: createdCount < 10,
          yearsOfExperience: randomInt(1, 10),
        });
        doctorSpecialtyPairs.add(pairKey);
        createdCount++;
      } catch (error: any) {
        // Skip if duplicate
        if (error.code === '23505') {
          doctorSpecialtyPairs.add(pairKey);
          continue;
        }
        throw error;
      }
    }
    console.log(`✅ Created ${createdCount} doctor specialties\n`);

    // 8. Seed Hospital Departments (30 records)
    console.log('📝 Seeding hospital departments...');
    const departmentPairs = new Set<string>();
    let deptCount = 0;
    let deptAttempts = 0;
    const maxDeptAttempts = 100;
    
    while (deptCount < 30 && deptAttempts < maxDeptAttempts) {
      deptAttempts++;
      const hospitalId = randomChoice(hospitalIds);
      const specialtyId = randomChoice(specialtyIds);
      const pairKey = `${hospitalId}-${specialtyId}`;
      
      if (departmentPairs.has(pairKey)) {
        continue;
      }
      
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

    // 9. Seed Doctor Availability (30 records)
    console.log('📝 Seeding doctor availability...');
    const availabilityIds: string[] = [];
    
    for (let i = 0; i < 30; i++) {
      const slotDate = new Date(Date.now() + randomInt(1, 30) * 24 * 60 * 60 * 1000);
      const [availability] = await db.insert(schema.doctorAvailability).values({
        doctorId: randomChoice(doctorIds),
        slotDate: slotDate.toISOString().split('T')[0],
        startTime: `${randomInt(8, 10).toString().padStart(2, '0')}:00:00`,
        endTime: `${randomInt(16, 18).toString().padStart(2, '0')}:00:00`,
      }).returning();
      
      availabilityIds.push(availability.id);
    }
    console.log(`✅ Created ${availabilityIds.length} doctor availability slots\n`);

    // 10. Seed Doctor Leaves (30 records)
    console.log('📝 Seeding doctor leaves...');
    for (let i = 0; i < 30; i++) {
      const startDate = new Date(Date.now() + randomInt(-30, 90) * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000);
      
      await db.insert(schema.doctorLeaves).values({
        doctorId: randomChoice(doctorIds),
        leaveType: randomChoice(['vacation', 'sick', 'personal', 'other']),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        reason: `Leave reason ${i + 1}`,
        createdAt: new Date(Date.now() - randomInt(0, 60 * 24 * 60 * 60 * 1000)).toISOString(),
      });
    }
    console.log(`✅ Created 30 doctor leaves\n`);

    // 11. Seed Patients (30 records)
    console.log('📝 Seeding patients...');
    const patientIds: string[] = [];
    
    for (let i = 0; i < 30; i++) {
      const firstName = firstNames[i];
      const lastName = lastNames[i];
      const emergencyContactName = `${firstNames[(i + 1) % firstNames.length]} ${lastNames[(i + 1) % lastNames.length]}`;
      const emergencyContactPhone = `+1${randomInt(2000000000, 9999999999)}`;
      
      const [patient] = await db.insert(schema.patients).values({
        hospitalId: randomChoice(hospitalIds),
        fullName: `${firstName} ${lastName}`,
        dateOfBirth: new Date(1950 + randomInt(0, 70), randomInt(0, 11), randomInt(1, 28)).toISOString().split('T')[0],
        gender: randomChoice(['male', 'female', 'other']),
        phone: `+1${randomInt(2000000000, 9999999999)}`,
        emergencyContact: `${emergencyContactName} - ${emergencyContactPhone}`,
        address: `${randomInt(100, 9999)} ${randomString(10)} Street`,
        medicalCondition: `Medical condition for patient ${i + 1}`,
        roomType: randomChoice(['general', 'private', 'semi_private', 'icu', 'emergency']),
        costPerDay: randomInt(100, 1000).toString(),
        medicalNotes: i % 3 === 0 ? `Allergy ${i + 1}` : `Medical notes for patient ${i + 1}`,
        createdAt: new Date(Date.now() - randomInt(0, 60 * 24 * 60 * 60 * 1000)).toISOString(),
      }).returning();
      
      patientIds.push(patient.id);
    }
    console.log(`✅ Created ${patientIds.length} patients\n`);

    // 12. Seed Assignments (30 records)
    console.log('📝 Seeding assignments...');
    const assignmentIds: string[] = [];
    
    for (let i = 0; i < 30; i++) {
      const [assignment] = await db.insert(schema.assignments).values({
        hospitalId: randomChoice(hospitalIds),
        doctorId: randomChoice(doctorIds),
        patientId: randomChoice(patientIds),
        availabilitySlotId: randomChoice(availabilityIds),
        priority: randomChoice(priorities),
        status: randomChoice(statuses),
        requestedAt: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + randomInt(1, 7) * 24 * 60 * 60 * 1000).toISOString(),
        actualStartTime: i % 2 === 0 ? new Date(Date.now() - randomInt(0, 5) * 24 * 60 * 60 * 1000).toISOString() : null,
        actualEndTime: i % 4 === 0 ? new Date(Date.now() - randomInt(0, 2) * 24 * 60 * 60 * 1000).toISOString() : null,
        treatmentNotes: i % 3 === 0 ? `Treatment notes for assignment ${i + 1}` : null,
        consultationFee: randomFloat(50, 500).toString(),
        cancellationReason: i % 5 === 0 ? `Cancellation reason ${i + 1}` : null,
        cancelledBy: i % 5 === 0 ? randomChoice(['hospital', 'doctor', 'system']) : null,
        cancelledAt: i % 5 === 0 ? new Date(Date.now() - randomInt(0, 10) * 24 * 60 * 60 * 1000).toISOString() : null,
        completedAt: i % 4 === 0 ? new Date(Date.now() - randomInt(0, 5) * 24 * 60 * 60 * 1000).toISOString() : null,
        paidAt: i % 3 === 0 ? new Date(Date.now() - randomInt(0, 3) * 24 * 60 * 60 * 1000).toISOString() : null,
      }).returning();
      
      assignmentIds.push(assignment.id);
    }
    console.log(`✅ Created ${assignmentIds.length} assignments\n`);

    // 13.5. Seed Orders (30 records - required for payment transactions and subscriptions)
    console.log('📝 Seeding orders...');
    const orderIds: string[] = [];
    for (let i = 0; i < 30; i++) {
      const userId = randomChoice(userIds);
      const planId = randomChoice(planIds);
      const createdAt = new Date(Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000);
      const status = randomChoice(['pending', 'paid', 'failed', 'expired', 'refunded']);
      let paidAt = null;
      if (status === 'paid') {
        paidAt = new Date(createdAt.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000).toISOString();
      }
      try {
        const [order] = await db.insert(schema.orders).values({
          userId: userId,
          orderType: randomChoice(['subscription', 'consultation', 'other']),
          planId: planId,
          amount: BigInt(randomInt(1000, 50000)), // in cents
          currency: 'USD',
          description: `Order for ${randomString(10)}`,
          status: status,
          createdAt: createdAt.toISOString(),
          paidAt: paidAt,
        }).returning();
        orderIds.push(order.id);
      } catch (error: any) {
        console.error(`Error creating order ${i + 1}:`, error.message);
        throw error;
      }
    }
    console.log(`✅ Created ${orderIds.length} orders\n`);

    // 13. Seed Subscriptions (30 records)
    console.log('📝 Seeding subscriptions...');
    for (let i = 0; i < 30; i++) {
      const startDate = new Date(Date.now() - randomInt(0, 365) * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      await db.insert(schema.subscriptions).values({
        userId: randomChoice(userIds),
        planId: randomChoice(planIds),
        orderId: randomChoice(orderIds),
        status: randomChoice(subscriptionStatuses),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        autoRenew: Math.random() > 0.5,
        createdAt: startDate.toISOString(),
      });
    }
    console.log(`✅ Created 30 subscriptions\n`);

    // 14. Seed Payment Transactions (30 records)
    console.log('📝 Seeding payment transactions...');
    const paymentTransactionIds: string[] = [];
    for (let i = 0; i < 30; i++) {
      const orderId = randomChoice(orderIds);
      const createdAt = new Date(Date.now() - randomInt(0, 60) * 24 * 60 * 60 * 1000);
      const status = randomChoice(['pending', 'success', 'failed', 'refunded']);
      let verifiedAt = null;
      if (status === 'success') {
        verifiedAt = new Date(createdAt.getTime() + randomInt(0, 2) * 24 * 60 * 60 * 1000).toISOString();
      }
      try {
        const timestamp = Date.now();
        const [paymentTransaction] = await db.insert(schema.paymentTransactions).values({
          orderId: orderId,
          paymentGateway: randomChoice(['stripe', 'paypal', 'razorpay']),
          paymentId: `PAY-${timestamp}-${randomInt(100000, 999999)}`,
          paymentMethod: randomChoice(['credit_card', 'debit_card', 'net_banking']),
          amount: BigInt(randomInt(1000, 50000)),
          currency: 'USD',
          status: status,
          createdAt: createdAt.toISOString(),
          verifiedAt: verifiedAt,
        }).returning();
        paymentTransactionIds.push(paymentTransaction.id);
      } catch (error: any) {
        if (error.code === '23505') { // Unique constraint violation
          console.warn(`Skipping payment transaction for order ${orderId}: ${error.detail}`);
          continue;
        }
        console.error(`Error creating payment transaction ${i + 1}:`, error.message);
        throw error;
      }
    }
    console.log(`✅ Created ${paymentTransactionIds.length} payment transactions\n`);

    // 15. Seed Assignment Payments (30 records)
    console.log('📝 Seeding assignment payments...');
    for (let i = 0; i < 30; i++) {
      await db.insert(schema.assignmentPayments).values({
        assignmentId: randomChoice(assignmentIds),
        hospitalId: randomChoice(hospitalIds),
        doctorId: randomChoice(doctorIds),
        consultationFee: randomFloat(50, 500).toString(),
        platformCommission: randomFloat(5, 50).toString(),
        doctorPayout: randomFloat(45, 450).toString(),
        paymentStatus: randomChoice(['pending', 'processing', 'completed', 'failed']),
        paidToDoctorAt: Math.random() > 0.3 ? new Date(Date.now() - randomInt(0, 10) * 24 * 60 * 60 * 1000).toISOString() : null,
        createdAt: new Date(Date.now() - randomInt(0, 15) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    console.log(`✅ Created 30 assignment payments\n`);

    // 16. Seed Assignment Ratings (30 records)
    console.log('📝 Seeding assignment ratings...');
    for (let i = 0; i < 30; i++) {
      await db.insert(schema.assignmentRatings).values({
        assignmentId: randomChoice(assignmentIds),
        hospitalId: randomChoice(hospitalIds),
        doctorId: randomChoice(doctorIds),
        rating: randomInt(1, 5),
        comment: i % 2 === 0 ? `Rating comment ${i + 1}` : null,
        positiveTags: i % 3 === 0 ? ['professional', 'punctual', 'helpful'] : [],
        negativeTags: i % 5 === 0 ? ['delayed'] : [],
        createdAt: new Date(Date.now() - randomInt(0, 20) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    console.log(`✅ Created 30 assignment ratings\n`);

    // 17. Seed Notifications (30 records)
    console.log('📝 Seeding notifications...');
    for (let i = 0; i < 30; i++) {
      await db.insert(schema.notifications).values({
        recipientId: randomChoice(userIds),
        recipientType: randomChoice(['user', 'role', 'all']),
        title: `Notification ${i + 1}`,
        message: `This is notification message ${i + 1}`,
        channel: randomChoice(['push', 'email', 'sms', 'in_app']),
        read: Math.random() > 0.5,
        priority: randomChoice(priorities),
        assignmentId: i % 2 === 0 ? randomChoice(assignmentIds) : null,
        payload: { type: 'assignment', assignmentId: assignmentIds[i % assignmentIds.length] },
        createdAt: new Date(Date.now() - randomInt(0, 7) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    console.log(`✅ Created 30 notifications\n`);

    // 18. Seed Support Tickets (30 records)
    console.log('📝 Seeding support tickets...');
    const ticketIds: string[] = [];
    
    for (let i = 0; i < 30; i++) {
      const [ticket] = await db.insert(schema.supportTickets).values({
        userId: randomChoice(userIds),
        bookingId: i % 3 === 0 ? randomChoice(assignmentIds) : null,
        subject: `Support Ticket ${i + 1}`,
        description: `Description for support ticket ${i + 1}`,
        category: randomChoice(['technical', 'billing', 'general', 'urgent']),
        priority: randomChoice(priorities),
        status: randomChoice(['open', 'in_progress', 'resolved', 'closed']),
        assignedTo: i % 2 === 0 ? randomChoice(userIds) : null,
        createdAt: new Date(Date.now() - randomInt(0, 14) * 24 * 60 * 60 * 1000).toISOString(),
      }).returning();
      
      ticketIds.push(ticket.id);
    }
    console.log(`✅ Created ${ticketIds.length} support tickets\n`);

    // 19. Seed Analytics Events (30 records)
    console.log('📝 Seeding analytics events...');
    for (let i = 0; i < 30; i++) {
      await db.insert(schema.analyticsEvents).values({
        userId: randomChoice(userIds),
        eventType: randomChoice(['page_view', 'click', 'form_submit', 'api_call']),
        eventName: `Event ${i + 1}`,
        properties: { key: `value${i + 1}`, timestamp: new Date().toISOString() },
        createdAt: new Date(Date.now() - randomInt(0, 7) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    console.log(`✅ Created 30 analytics events\n`);

    // 20. Seed User Devices (30 records)
    console.log('📝 Seeding user devices...');
    for (let i = 0; i < 30; i++) {
      await db.insert(schema.userDevices).values({
        userId: randomChoice(userIds),
        deviceType: randomChoice(['ios', 'android', 'web']),
        deviceToken: `device-token-${randomString(20)}`,
        appVersion: `${randomInt(1, 3)}.${randomInt(0, 9)}.${randomInt(0, 9)}`,
        osVersion: `${randomInt(10, 17)}.${randomInt(0, 9)}`,
        deviceName: randomChoice(['iPhone', 'Android', 'Chrome', 'Safari', 'Firefox']),
        isActive: Math.random() > 0.3,
        lastUsedAt: new Date(Date.now() - randomInt(0, 7) * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    console.log(`✅ Created 30 user devices\n`);

    // 21. Seed Doctor Hospital Affiliations (30 records)
    console.log('📝 Seeding doctor hospital affiliations...');
    const affiliationPairs = new Set<string>();
    let affiliationCount = 0;
    let affiliationAttempts = 0;
    const maxAffiliationAttempts = 100;
    
    while (affiliationCount < 30 && affiliationAttempts < maxAffiliationAttempts) {
      affiliationAttempts++;
      const doctorId = randomChoice(doctorIds);
      const hospitalId = randomChoice(hospitalIds);
      const pairKey = `${doctorId}-${hospitalId}`;
      
      if (affiliationPairs.has(pairKey)) {
        continue;
      }
      
      try {
        await db.insert(schema.doctorHospitalAffiliations).values({
          doctorId,
          hospitalId,
          status: randomChoice(['active', 'inactive', 'pending', 'suspended']),
          isPreferred: Math.random() > 0.7,
          createdAt: new Date(Date.now() - randomInt(0, 180) * 24 * 60 * 60 * 1000).toISOString(),
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
    console.log(`✅ Created ${affiliationCount} doctor hospital affiliations\n`);

    // 22. Seed Doctor Credentials (30 records)
    console.log('📝 Seeding doctor credentials...');
    for (let i = 0; i < 30; i++) {
      await db.insert(schema.doctorCredentials).values({
        doctorId: randomChoice(doctorIds),
        credentialType: randomChoice(['degree', 'certification', 'license', 'award']),
        title: randomChoice(['MD', 'PhD', 'Board Certified', 'Fellow']),
        institution: `Institution ${i + 1}`,
        issueDate: new Date(2000 + randomInt(0, 24), randomInt(0, 11), randomInt(1, 28)).toISOString().split('T')[0],
        verificationStatus: randomChoice(['pending', 'verified', 'rejected']),
        createdAt: new Date(Date.now() - randomInt(0, 365) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    console.log(`✅ Created 30 doctor credentials\n`);

    // 23. Seed Orders (30 records)
    console.log('📝 Seeding orders...');
    for (let i = 0; i < 30; i++) {
      await db.insert(schema.orders).values({
        userId: randomChoice(userIds),
        orderType: randomChoice(['subscription', 'consultation', 'other']),
        planId: randomChoice(planIds),
        amount: BigInt(randomInt(29, 299)),
        currency: 'USD',
        description: `Order ${i + 1} description`,
        status: randomChoice(['pending', 'paid', 'failed', 'expired', 'refunded']),
        createdAt: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + randomInt(1, 7) * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: Math.random() > 0.4 ? new Date(Date.now() - randomInt(0, 20) * 24 * 60 * 60 * 1000).toISOString() : null,
        failureReason: Math.random() > 0.8 ? `Failure reason ${i + 1}` : null,
        webhookReceived: Math.random() > 0.5,
      });
    }
    console.log(`✅ Created 30 orders\n`);

    // 24. Seed Hospital Plan Features (8 records - 2 per hospital plan)
    console.log('📝 Seeding hospital plan features...');
    for (let i = 0; i < 8; i++) {
      await db.insert(schema.hospitalPlanFeatures).values({
        planId: hospitalPlanIds[i % hospitalPlanIds.length],
        maxPatientsPerMonth: randomInt(100, 10000),
        includesPremiumDoctors: Math.random() > 0.5,
        notes: `Plan feature notes ${i + 1}`,
      });
    }
    console.log(`✅ Created 8 hospital plan features\n`);

    // 25. Seed Doctor Plan Features (8 records - 2 per doctor plan)
    console.log('📝 Seeding doctor plan features...');
    for (let i = 0; i < 8; i++) {
      await db.insert(schema.doctorPlanFeatures).values({
        planId: doctorPlanIds[i % doctorPlanIds.length],
        visibilityWeight: randomInt(1, 10),
        maxAffiliations: randomInt(1, 20),
        notes: `Plan feature notes ${i + 1}`,
      });
    }
    console.log(`✅ Created 8 doctor plan features\n`);

    // 26. Seed Patient Consents (30 records)
    console.log('📝 Seeding patient consents...');
    for (let i = 0; i < 30; i++) {
      await db.insert(schema.patientConsents).values({
        patientId: randomChoice(patientIds),
        consentType: randomChoice(['treatment', 'data_sharing', 'research', 'photography', 'other']),
        granted: Math.random() > 0.3,
        grantedAt: Math.random() > 0.3 ? new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString() : null,
        revokedAt: Math.random() > 0.8 ? new Date(Date.now() - randomInt(0, 10) * 24 * 60 * 60 * 1000).toISOString() : null,
        createdAt: new Date(Date.now() - randomInt(0, 60) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    console.log(`✅ Created 30 patient consents\n`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Users: ${userIds.length}`);
    console.log(`   - Doctors: ${doctorIds.length}`);
    console.log(`   - Hospitals: ${hospitalIds.length}`);
    console.log(`   - Patients: ${patientIds.length}`);
    console.log(`   - Assignments: ${assignmentIds.length}`);
    console.log(`   - Specialties: ${specialtyIds.length}`);
    console.log(`   - And many more...\n`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seeding script
seedDatabase()
  .then(() => {
    console.log('✅ Seeding script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding script failed:', error);
    process.exit(1);
  });

