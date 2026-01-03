/**
 * Seed Hyderabad Test Data Script
 * 
 * This script seeds:
 * - 30 hospitals in Hyderabad with exact locations
 * - 200 doctors around those hospitals at different distances
 * - Each doctor has a subscription plan
 * 
 * Usage: npx tsx scripts/seed-hyderabad-test-data.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { getDb } from '../lib/db/index';
import {
  users,
  hospitals,
  doctors,
  subscriptions,
  subscriptionPlans,
  doctorPlanFeatures,
  hospitalPlanFeatures,
  doctorSpecialties,
  specialties,
} from '../src/db/drizzle/migrations/schema';
import { eq, sql } from 'drizzle-orm';

const db = getDb();

// Hyderabad center coordinates
const HYDERABAD_CENTER = {
  lat: 17.3850,
  lon: 78.4867,
};

// Helper function to generate random point around a center
function generatePointAroundCenter(
  centerLat: number,
  centerLon: number,
  radiusKm: number
): { lat: number; lon: number } {
  // Convert radius from km to degrees (approximate)
  const radiusInDegrees = radiusKm / 111.0;
  
  // Generate random angle
  const angle = Math.random() * 2 * Math.PI;
  
  // Generate random distance within radius
  const distance = Math.random() * radiusInDegrees;
  
  // Calculate new point
  const lat = centerLat + distance * Math.cos(angle);
  const lon = centerLon + distance * Math.sin(angle);
  
  return {
    lat: parseFloat(lat.toFixed(8)),
    lon: parseFloat(lon.toFixed(8)),
  };
}

// Helper function to generate point at specific distance
function generatePointAtDistance(
  centerLat: number,
  centerLon: number,
  distanceKm: number,
  angleDegrees: number = Math.random() * 360
): { lat: number; lon: number } {
  const radiusInDegrees = distanceKm / 111.0;
  const angleRadians = (angleDegrees * Math.PI) / 180;
  
  const lat = centerLat + radiusInDegrees * Math.cos(angleRadians);
  const lon = centerLon + radiusInDegrees * Math.sin(angleRadians);
  
  return {
    lat: parseFloat(lat.toFixed(8)),
    lon: parseFloat(lon.toFixed(8)),
  };
}

// Real Hyderabad hospital locations (approximate)
const HYDERABAD_HOSPITALS = [
  { name: 'Apollo Hospitals Jubilee Hills', lat: 17.4250, lon: 78.4100 },
  { name: 'Continental Hospitals', lat: 17.4500, lon: 78.3900 },
  { name: 'Yashoda Hospitals Somajiguda', lat: 17.4200, lon: 78.4500 },
  { name: 'KIMS Hospitals', lat: 17.4400, lon: 78.4000 },
  { name: 'Care Hospitals Banjara Hills', lat: 17.4150, lon: 78.4200 },
  { name: 'Global Hospitals', lat: 17.3800, lon: 78.4800 },
  { name: 'AIG Hospitals', lat: 17.4300, lon: 78.4400 },
  { name: 'Medicover Hospitals', lat: 17.4000, lon: 78.4600 },
  { name: 'Rainbow Children\'s Hospital', lat: 17.4100, lon: 78.4300 },
  { name: 'Star Hospitals', lat: 17.3900, lon: 78.4700 },
  { name: 'L V Prasad Eye Institute', lat: 17.4250, lon: 78.4150 },
  { name: 'Nizam\'s Institute of Medical Sciences', lat: 17.4350, lon: 78.4250 },
  { name: 'Osmania General Hospital', lat: 17.3750, lon: 78.4750 },
  { name: 'Gandhi Hospital', lat: 17.3650, lon: 78.4850 },
  { name: 'Image Hospitals', lat: 17.4450, lon: 78.4050 },
  { name: 'Kamineni Hospitals', lat: 17.3950, lon: 78.4550 },
  { name: 'Bharat Cancer Hospital', lat: 17.4050, lon: 78.4450 },
  { name: 'Sunshine Hospitals', lat: 17.4200, lon: 78.4000 },
  { name: 'MaxCure Hospitals', lat: 17.4500, lon: 78.4200 },
  { name: 'Omega Hospitals', lat: 17.4100, lon: 78.4100 },
  { name: 'Citizens Hospital', lat: 17.4300, lon: 78.3900 },
  { name: 'Virinchi Hospitals', lat: 17.4000, lon: 78.4800 },
  { name: 'Basavatarakam Indo American Cancer Hospital', lat: 17.4150, lon: 78.4350 },
  { name: 'Asian Institute of Gastroenterology', lat: 17.4250, lon: 78.4250 },
  { name: 'Krishna Institute of Medical Sciences', lat: 17.4400, lon: 78.4150 },
  { name: 'Narayana Health City', lat: 17.3900, lon: 78.4600 },
  { name: 'Aster Prime Hospital', lat: 17.4100, lon: 78.4500 },
  { name: 'Banjara Hills Hospital', lat: 17.4200, lon: 78.4400 },
  { name: 'Prime Hospitals', lat: 17.4000, lon: 78.4200 },
  { name: 'Sai Sanjeevani Hospital', lat: 17.4350, lon: 78.4350 },
];

// Doctor names
const FIRST_NAMES = [
  'Raj', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rohit', 'Kavita',
  'Arjun', 'Meera', 'Kiran', 'Sunita', 'Ramesh', 'Lakshmi', 'Suresh', 'Divya',
  'Ravi', 'Pooja', 'Nikhil', 'Swati', 'Manish', 'Neha', 'Sandeep', 'Anita',
  'Deepak', 'Shilpa', 'Vishal', 'Rekha', 'Gaurav', 'Kavya', 'Aditya', 'Riya',
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Reddy', 'Mehta', 'Joshi',
  'Verma', 'Malhotra', 'Agarwal', 'Kapoor', 'Chopra', 'Nair', 'Iyer', 'Rao',
  'Desai', 'Shah', 'Bhatt', 'Mishra', 'Pandey', 'Yadav', 'Jain', 'Saxena',
];

// Specialty names
const SPECIALTY_NAMES = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology',
  'Oncology', 'Psychiatry', 'Radiology', 'Surgery', 'Anesthesiology',
  'Emergency Medicine', 'Internal Medicine', 'Gynecology', 'Urology',
  'Ophthalmology', 'ENT', 'Pulmonology', 'Gastroenterology', 'Endocrinology',
  'Nephrology', 'Hematology', 'Rheumatology', 'Infectious Disease',
  'Critical Care', 'Family Medicine', 'Sports Medicine', 'Plastic Surgery',
  'Vascular Surgery', 'Neurosurgery', 'Cardiothoracic Surgery',
];

/**
 * Ensure subscription plans exist
 */
async function ensureSubscriptionPlans() {
  console.log('📋 Ensuring subscription plans exist...');
  
  const doctorPlans = [
    { name: 'Free Doctor Plan', tier: 'free', userRole: 'doctor' },
    { name: 'Basic Doctor Plan', tier: 'basic', userRole: 'doctor' },
    { name: 'Premium Doctor Plan', tier: 'premium', userRole: 'doctor' },
    { name: 'Enterprise Doctor Plan', tier: 'enterprise', userRole: 'doctor' },
  ];
  
  const hospitalPlans = [
    { name: 'Free Hospital Plan', tier: 'free', userRole: 'hospital' },
    { name: 'Basic Hospital Plan', tier: 'basic', userRole: 'hospital' },
    { name: 'Premium Hospital Plan', tier: 'premium', userRole: 'hospital' },
    { name: 'Enterprise Hospital Plan', tier: 'enterprise', userRole: 'hospital' },
  ];
  
  const allPlans = [...doctorPlans, ...hospitalPlans];
  const planIds: string[] = [];
  
  for (const plan of allPlans) {
    const existing = await db
      .select()
      .from(subscriptionPlans)
      .where(
        sql`${subscriptionPlans.tier} = ${plan.tier} AND ${subscriptionPlans.userRole} = ${plan.userRole}`
      )
      .limit(1);
    
    if (existing.length === 0) {
      const [inserted] = await db
        .insert(subscriptionPlans)
        .values({
          name: plan.name,
          tier: plan.tier as any,
          userRole: plan.userRole as any,
          description: `${plan.tier} plan for ${plan.userRole}s`,
        })
        .returning({ id: subscriptionPlans.id });
      planIds.push(inserted.id);
    } else {
      planIds.push(existing[0].id);
    }
  }
  
  console.log(`  ✓ Found/created ${planIds.length} subscription plans\n`);
  return planIds;
}

/**
 * Seed 30 hospitals in Hyderabad
 */
async function seedHospitals(): Promise<{ hospitalIds: string[]; hospitalUserIds: string[] }> {
  console.log('🏥 Seeding 30 hospitals in Hyderabad...');
  
  const hospitalIds: string[] = [];
  const hospitalUserIds: string[] = [];
  
  // Create users for hospitals (check if exists first)
  for (let i = 0; i < 30; i++) {
    const email = `hospital${i + 1}@hyderabad.test`;
    
    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (existing.length > 0) {
      hospitalUserIds.push(existing[0].id);
    } else {
      const [user] = await db
        .insert(users)
        .values({
          email: email,
          passwordHash: '$2a$10$dummyhash', // Dummy hash
          role: 'hospital',
        })
        .returning({ id: users.id });
      
      hospitalUserIds.push(user.id);
    }
  }
  
  // Create or update hospitals (ensure verified status)
  for (let i = 0; i < 30; i++) {
    const hospitalData = HYDERABAD_HOSPITALS[i] || {
      name: `Hyderabad Hospital ${i + 1}`,
      lat: HYDERABAD_CENTER.lat + (Math.random() - 0.5) * 0.1,
      lon: HYDERABAD_CENTER.lon + (Math.random() - 0.5) * 0.1,
    };
    
    // Check if hospital already exists for this user
    const existing = await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.userId, hospitalUserIds[i]))
      .limit(1);
    
    if (existing.length > 0) {
      // Update existing hospital to verified
      await db
        .update(hospitals)
        .set({
          licenseVerificationStatus: 'verified' as any,
          latitude: hospitalData.lat,
          longitude: hospitalData.lon,
        } as any)
        .where(eq(hospitals.id, existing[0].id));
      hospitalIds.push(existing[0].id);
    } else {
      // Create new hospital
      const [hospital] = await db
        .insert(hospitals)
        .values({
          userId: hospitalUserIds[i],
          name: hospitalData.name,
          hospitalType: 'general' as any,
          registrationNumber: `HYD${String(i + 1).padStart(6, '0')}`,
          address: `${Math.floor(Math.random() * 100)} Street`,
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500001',
          latitude: hospitalData.lat,
          longitude: hospitalData.lon,
          numberOfBeds: Math.floor(Math.random() * 500) + 50,
          contactEmail: `hospital${i + 1}@hyderabad.test`,
          contactPhone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          licenseVerificationStatus: 'verified' as any,
          fullAddress: `${Math.floor(Math.random() * 100)} Street, Hyderabad, Telangana 500001`,
        } as any)
        .returning({ id: hospitals.id });
      
      hospitalIds.push(hospital.id);
    }
  }
  
  console.log(`  ✓ Seeded ${hospitalIds.length} hospitals\n`);
  return { hospitalIds, hospitalUserIds };
}

/**
 * Seed 200 doctors around hospitals at different distances
 */
async function seedDoctors(
  hospitalIds: string[],
  planIds: string[]
): Promise<{ doctorIds: string[]; doctorUserIds: string[] }> {
  console.log('👨‍⚕️ Seeding 200 doctors around hospitals...');
  
  const doctorIds: string[] = [];
  const doctorUserIds: string[] = [];
  
  // Get doctor plan IDs (first 4 plans)
  const doctorPlanIds = planIds.slice(0, 4);
  const tiers = ['free', 'basic', 'premium', 'enterprise'];
  
  // Create users for doctors (check if exists first)
  for (let i = 0; i < 200; i++) {
    const email = `doctor${i + 1}@hyderabad.test`;
    
    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (existing.length > 0) {
      doctorUserIds.push(existing[0].id);
    } else {
      const [user] = await db
        .insert(users)
        .values({
          email: email,
          passwordHash: '$2a$10$dummyhash',
          role: 'doctor',
        })
        .returning({ id: users.id });
      
      doctorUserIds.push(user.id);
    }
  }
  
  // Create doctors at different distances from hospitals
  for (let i = 0; i < 200; i++) {
    // Pick a random hospital
    const hospitalIndex = Math.floor(Math.random() * hospitalIds.length);
    const hospital = await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.id, hospitalIds[hospitalIndex]))
      .limit(1);
    
    if (hospital.length === 0) continue;
    
    const hospitalLat = Number(hospital[0].latitude);
    const hospitalLon = Number(hospital[0].longitude);
    
    // Generate distance: 0-50km (distribute evenly)
    const distanceKm = (i % 50) * 1; // 0, 1, 2, ..., 49 km
    const angle = (i * 7.2) % 360; // Distribute around circle
    
    // Generate doctor location
    const doctorLocation = generatePointAtDistance(
      hospitalLat,
      hospitalLon,
      distanceKm,
      angle
    );
    
    // Assign plan (distribute evenly: 25% each tier)
    const planIndex = Math.floor(i / 50) % 4; // 0-3
    const tier = tiers[planIndex];
    const planId = doctorPlanIds[planIndex];
    
    // Check if doctor already exists for this user
    const existingDoctor = await db
      .select()
      .from(doctors)
      .where(eq(doctors.userId, doctorUserIds[i]))
      .limit(1);
    
    let doctorId: string;
    
    if (existingDoctor.length > 0) {
      // Update existing doctor to verified and update location
      await db
        .update(doctors)
        .set({
          licenseVerificationStatus: 'verified' as any,
          latitude: doctorLocation.lat,
          longitude: doctorLocation.lon,
        } as any)
        .where(eq(doctors.id, existingDoctor[0].id));
      doctorId = existingDoctor[0].id;
    } else {
      // Create new doctor
      const [doctor] = await db
        .insert(doctors)
        .values({
          userId: doctorUserIds[i],
          firstName: FIRST_NAMES[i % FIRST_NAMES.length],
          lastName: LAST_NAMES[i % LAST_NAMES.length],
          medicalLicenseNumber: `HYD${String(i + 1).padStart(6, '0')}`,
          yearsOfExperience: Math.floor(Math.random() * 30) + 1,
          bio: `Experienced doctor with ${Math.floor(Math.random() * 30) + 1} years of practice`,
          primaryLocation: 'Hyderabad',
          latitude: doctorLocation.lat,
          longitude: doctorLocation.lon,
          licenseVerificationStatus: 'verified' as any,
          averageRating: parseFloat((Math.random() * 2 + 3).toFixed(2)), // 3.0-5.0
          totalRatings: Math.floor(Math.random() * 100),
          completedAssignments: Math.floor(Math.random() * 50),
        } as any)
        .returning({ id: doctors.id });
      
      doctorId = doctor.id;
    }
    
    doctorIds.push(doctorId);
    
    // Check if subscription already exists
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, doctorUserIds[i]))
      .limit(1);
    
    if (existingSubscription.length === 0) {
      // Create subscription for doctor
      await db.insert(subscriptions).values({
        userId: doctorUserIds[i],
        planId: planId,
        status: 'active' as any,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      });
    }
  }
  
  console.log(`  ✓ Seeded ${doctorIds.length} doctors with subscriptions\n`);
  return { doctorIds, doctorUserIds };
}

/**
 * Seed doctor specialties
 */
async function seedDoctorSpecialties(doctorIds: string[]) {
  console.log('🏷️  Seeding doctor specialties...');
  
  // Get specialty IDs
  const specialtyList = await db.select().from(specialties);
  if (specialtyList.length === 0) {
    console.log('  ⚠️  No specialties found. Please seed specialties first.\n');
    return;
  }
  
  let count = 0;
  for (const doctorId of doctorIds) {
    // Each doctor gets 1-3 specialties
    const numSpecialties = Math.floor(Math.random() * 3) + 1;
    const selectedSpecialties = specialtyList
      .sort(() => Math.random() - 0.5)
      .slice(0, numSpecialties);
    
    for (const specialty of selectedSpecialties) {
      try {
        await db.insert(doctorSpecialties).values({
          doctorId,
          specialtyId: specialty.id,
        });
        count++;
      } catch (error) {
        // Ignore duplicates
      }
    }
  }
  
  console.log(`  ✓ Seeded ${count} doctor-specialty relationships\n`);
}

/**
 * Main seeding function
 */
async function seedHyderabadTestData() {
  console.log('🚀 Starting Hyderabad test data seeding...\n');
  
  try {
    // Step 1: Ensure subscription plans exist
    const planIds = await ensureSubscriptionPlans();
    
    // Step 2: Seed hospitals
    const { hospitalIds, hospitalUserIds } = await seedHospitals();
    
    // Step 3: Seed doctors
    const { doctorIds, doctorUserIds } = await seedDoctors(hospitalIds, planIds);
    
    // Step 4: Seed doctor specialties
    await seedDoctorSpecialties(doctorIds);
    
    console.log('✅ Hyderabad test data seeding completed!\n');
    console.log('Summary:');
    console.log(`  - Hospitals: ${hospitalIds.length}`);
    console.log(`  - Doctors: ${doctorIds.length}`);
    console.log(`  - All doctors have subscription plans`);
    console.log(`  - Doctors distributed at 0-50km from hospitals\n`);
  } catch (error) {
    console.error('❌ Error seeding Hyderabad test data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedHyderabadTestData()
    .then(() => {
      console.log('✅ Process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Process failed:', error);
      process.exit(1);
    });
}

export { seedHyderabadTestData };

