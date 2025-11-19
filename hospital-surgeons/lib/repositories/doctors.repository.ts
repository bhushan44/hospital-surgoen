import { getDb } from '@/lib/db';
import { 
  doctors, 
  doctorCredentials, 
  doctorSpecialties, 
  doctorAvailability, 
  doctorLeaves, // Use doctorLeaves instead of doctorUnavailability
  specialties,
  users
} from '@/src/db/drizzle/migrations/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

export interface CreateDoctorData {
  firstName: string;
  lastName: string;
  profilePhotoId?: string; // UUID reference to files table
  medicalLicenseNumber: string;
  yearsOfExperience?: number;
  bio?: string;
  // consultationFee is in assignments table, not doctors table
  // isAvailable should be checked via doctorAvailability table
}

export interface CreateDoctorCredentialData {
  credentialType: string;
  title: string;
  institution: string;
  issueDate?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
}

export interface CreateDoctorSpecialtyData {
  specialtyId: string;
  isPrimary?: boolean;
  yearsOfExperience?: number;
}

export interface CreateDoctorAvailabilityData {
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  isRecurring?: boolean;
  effectiveFrom?: string;
  effectiveUntil?: string;
  isActive?: boolean;
}

export interface CreateDoctorUnavailabilityData {
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface DoctorQuery {
  search?: string;
  specialtyId?: string;
  city?: string;
  minRating?: number;
  maxFee?: number;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'fee' | 'experience' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export class DoctorsRepository {
  private db = getDb();

  async createDoctor(doctorData: CreateDoctorData, userId: string) {
    // Note: consultationFee and isAvailable are not in doctors table
    // consultationFee is in assignments table
    // isAvailable should be checked via doctorAvailability table
    const values: any = {
      userId,
      firstName: doctorData.firstName,
      lastName: doctorData.lastName,
      medicalLicenseNumber: doctorData.medicalLicenseNumber,
      yearsOfExperience: doctorData.yearsOfExperience || 0,
      bio: doctorData.bio,
    };
    
    // Map profilePhotoId - schema now maps profilePhotoUrl to profile_photo_id column
    if (doctorData.profilePhotoId) {
      values.profilePhotoUrl = doctorData.profilePhotoId;
    }
    
    return await this.db
      .insert(doctors)
      .values(values)
      .returning();
  }

  async findDoctorById(id: string) {
    const result = await this.db
      .select({
        doctor: doctors,
        user: users,
      })
      .from(doctors)
      .leftJoin(users, eq(doctors.userId, users.id))
      .where(eq(doctors.id, id))
      .limit(1);

    return result[0] || null;
  }

  async findDoctorByUserId(userId: string) {
    const result = await this.db
      .select()
      .from(doctors)
      .where(eq(doctors.userId, userId))
      .limit(1);

    return result[0] || null;
  }

  async findDoctors(query: DoctorQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    return await this.db
      .select({
        doctor: doctors,
        user: users,
      })
      .from(doctors)
      .leftJoin(users, eq(doctors.userId, users.id))
      .orderBy(desc(doctors.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async updateDoctor(id: string, updateData: Partial<CreateDoctorData>) {
    const updateFields: any = {};
    
    if (updateData.firstName) updateFields.firstName = updateData.firstName;
    if (updateData.lastName) updateFields.lastName = updateData.lastName;
    // Map profilePhotoId - schema maps profilePhotoUrl to profile_photo_id column
    if (updateData.profilePhotoId) {
      updateFields.profilePhotoUrl = updateData.profilePhotoId;
    }
    if (updateData.medicalLicenseNumber) updateFields.medicalLicenseNumber = updateData.medicalLicenseNumber;
    if (updateData.yearsOfExperience !== undefined) updateFields.yearsOfExperience = updateData.yearsOfExperience;
    if (updateData.bio) updateFields.bio = updateData.bio;
    // Remove consultationFee and isAvailable - not in doctors table

    return await this.db
      .update(doctors)
      .set(updateFields)
      .where(eq(doctors.id, id))
      .returning();
  }

  async deleteDoctor(id: string) {
    return await this.db
      .delete(doctors)
      .where(eq(doctors.id, id))
      .returning();
  }

  // Doctor Credentials
  async createCredential(credentialData: CreateDoctorCredentialData, doctorId: string) {
    return await this.db
      .insert(doctorCredentials)
      .values({
        doctorId,
        credentialType: credentialData.credentialType,
        title: credentialData.title,
        institution: credentialData.institution,
        issueDate: credentialData.issueDate,
        verificationStatus: credentialData.verificationStatus || 'pending',
      })
      .returning();
  }

  async getDoctorCredentials(doctorId: string) {
    return await this.db
      .select()
      .from(doctorCredentials)
      .where(eq(doctorCredentials.doctorId, doctorId))
      .orderBy(desc(doctorCredentials.createdAt));
  }

  // Doctor Specialties
  async addSpecialty(specialtyData: CreateDoctorSpecialtyData, doctorId: string) {
    return await this.db
      .insert(doctorSpecialties)
      .values({
        doctorId,
        specialtyId: specialtyData.specialtyId,
        isPrimary: specialtyData.isPrimary || false,
        yearsOfExperience: specialtyData.yearsOfExperience || 0,
      })
      .returning();
  }

  async getDoctorSpecialties(doctorId: string) {
    return await this.db
      .select({
        doctorSpecialty: doctorSpecialties,
        specialty: specialties,
      })
      .from(doctorSpecialties)
      .leftJoin(specialties, eq(doctorSpecialties.specialtyId, specialties.id))
      .where(eq(doctorSpecialties.doctorId, doctorId))
      .orderBy(desc(doctorSpecialties.isPrimary), asc(doctorSpecialties.createdAt));
  }

  async removeSpecialty(doctorId: string, specialtyId: string) {
    return await this.db
      .delete(doctorSpecialties)
      .where(and(
        eq(doctorSpecialties.doctorId, doctorId),
        eq(doctorSpecialties.specialtyId, specialtyId)
      ))
      .returning();
  }

  // Doctor Availability
  async createAvailability(availabilityData: CreateDoctorAvailabilityData, doctorId: string) {
    return await this.db
      .insert(doctorAvailability)
      .values({
        doctorId,
        dayOfWeek: availabilityData.dayOfWeek,
        startTime: availabilityData.startTime,
        endTime: availabilityData.endTime,
        isRecurring: availabilityData.isRecurring ?? true,
        effectiveFrom: availabilityData.effectiveFrom,
        effectiveUntil: availabilityData.effectiveUntil,
        isActive: availabilityData.isActive ?? true,
      })
      .returning();
  }

  async getDoctorAvailability(doctorId: string) {
    return await this.db
      .select()
      .from(doctorAvailability)
      .where(and(
        eq(doctorAvailability.doctorId, doctorId),
        eq(doctorAvailability.isActive, true)
      ))
      .orderBy(asc(doctorAvailability.dayOfWeek), asc(doctorAvailability.startTime));
  }

  async updateAvailability(id: string, updateData: Partial<CreateDoctorAvailabilityData>) {
    return await this.db
      .update(doctorAvailability)
      .set(updateData)
      .where(eq(doctorAvailability.id, id))
      .returning();
  }

  async deleteAvailability(id: string) {
    return await this.db
      .delete(doctorAvailability)
      .where(eq(doctorAvailability.id, id))
      .returning();
  }

  // Doctor Leaves (replaces doctorUnavailability)
  async createUnavailability(unavailabilityData: CreateDoctorUnavailabilityData, doctorId: string) {
    // Use doctorLeaves table instead of doctorUnavailability
    return await this.db
      .insert(doctorLeaves)
      .values({
        doctorId,
        startDate: unavailabilityData.startDate,
        endDate: unavailabilityData.endDate,
        reason: unavailabilityData.reason,
        leaveType: 'other', // Default leave type
      })
      .returning();
  }

  async getDoctorUnavailability(doctorId: string) {
    // Use doctorLeaves table instead of doctorUnavailability
    return await this.db
      .select()
      .from(doctorLeaves)
      .where(eq(doctorLeaves.doctorId, doctorId))
      .orderBy(desc(doctorLeaves.startDate));
  }

  async deleteUnavailability(id: string) {
    // Use doctorLeaves table instead of doctorUnavailability
    return await this.db
      .delete(doctorLeaves)
      .where(eq(doctorLeaves.id, id))
      .returning();
  }

  // Statistics
  async getDoctorStats(doctorId: string) {
    // Schema maps totalBookings to completed_assignments column
    const result = await this.db
      .select({
        totalBookings: doctors.totalBookings, // Maps to completed_assignments in DB
        averageRating: doctors.averageRating,
        totalRatings: doctors.totalRatings,
      })
      .from(doctors)
      .where(eq(doctors.id, doctorId))
      .limit(1);

    return result[0] || null;
  }
}


