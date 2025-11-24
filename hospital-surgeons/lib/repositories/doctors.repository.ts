import { getDb } from '@/lib/db';
import { 
  doctors, 
  doctorCredentials, 
  doctorSpecialties, 
  doctorAvailability, 
  doctorLeaves, // Use doctorLeaves instead of doctorUnavailability
  doctorProfilePhotos,
  specialties,
  users,
  availabilityTemplates,,
  files,
} from '@/src/db/drizzle/migrations/schema';
import { eq, and, desc, asc, sql, lte, gte, or, isNull, lt, gt, ne } from 'drizzle-orm';

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
  fileId: string;
  credentialType: string;
  title: string;
  institution: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
}

export interface CreateDoctorSpecialtyData {
  specialtyId: string;
  isPrimary?: boolean;
  yearsOfExperience?: number;
}

export interface CreateDoctorAvailabilityData {
  slotDate: string;
  startTime: string;
  endTime: string;
  templateId?: string;
  status?: string;
  isManual?: boolean;
  notes?: string;
}

export interface CreateDoctorUnavailabilityData {
  startDate: string;
  endDate: string;
  leaveType?: 'sick' | 'vacation' | 'personal' | 'emergency' | 'other';
  reason?: string;
}

export interface CreateAvailabilityTemplateData {
  templateName: string;
  startTime: string;
  endTime: string;
  recurrencePattern: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrenceDays?: string[];
  validFrom: string;
  validUntil?: string;
}

export type UpdateAvailabilityTemplateData = Partial<CreateAvailabilityTemplateData>;

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

type AvailabilityTemplateRow = typeof availabilityTemplates.$inferSelect;

export class DoctorsRepository {
  private db = getDb();

  private mapTemplateRow(row: AvailabilityTemplateRow | null | undefined) {
    if (!row) return null;
    return {
      ...row,
      recurrenceDays: row.recurrenceDays
        ? row.recurrenceDays.split(',').map((day) => day.trim()).filter(Boolean)
        : [],
    } as AvailabilityTemplateRow & { recurrenceDays: string[] };
  }

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
      .orderBy(desc(users.createdAt))
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
        fileId: credentialData.fileId,
        credentialType: credentialData.credentialType,
        title: credentialData.title,
        institution: credentialData.institution,
        verificationStatus: credentialData.verificationStatus || 'pending',
      })
      .returning();
  }

  async getDoctorCredentials(doctorId: string) {
    return await this.db
      .select({
        credential: doctorCredentials,
        file: files,
      })
      .from(doctorCredentials)
      .leftJoin(files, eq(doctorCredentials.fileId, files.id))
      .where(eq(doctorCredentials.doctorId, doctorId))
      .orderBy(desc(doctorCredentials.uploadedAt));
  }

  async updateCredentialStatus(
    credentialId: string,
    verificationStatus: 'pending' | 'verified' | 'rejected'
  ) {
    return await this.db
      .update(doctorCredentials)
      .set({ verificationStatus })
      .where(eq(doctorCredentials.id, credentialId))
      .returning();
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
      .orderBy(desc(doctorSpecialties.isPrimary));
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

  // Availability templates
  async createAvailabilityTemplate(templateData: CreateAvailabilityTemplateData, doctorId: string) {
    const [template] = await this.db
      .insert(availabilityTemplates)
      .values({
        doctorId,
        templateName: templateData.templateName,
        startTime: templateData.startTime,
        endTime: templateData.endTime,
        recurrencePattern: templateData.recurrencePattern,
        recurrenceDays: templateData.recurrenceDays?.length ? templateData.recurrenceDays.join(',') : null,
        validFrom: templateData.validFrom,
        validUntil: templateData.validUntil ?? null,
      })
      .returning();

    return this.mapTemplateRow(template);
  }

  async getAvailabilityTemplates(doctorId: string) {
    const templates = await this.db
      .select()
      .from(availabilityTemplates)
      .where(eq(availabilityTemplates.doctorId, doctorId))
      .orderBy(asc(availabilityTemplates.validFrom), asc(availabilityTemplates.startTime));

    return templates
      .map((row) => this.mapTemplateRow(row))
      .filter(Boolean) as Array<AvailabilityTemplateRow & { recurrenceDays: string[] }>;
  }

  async getAvailabilityTemplateById(templateId: string) {
    const [template] = await this.db
      .select()
      .from(availabilityTemplates)
      .where(eq(availabilityTemplates.id, templateId))
      .limit(1);

    return this.mapTemplateRow(template);
  }

  async updateAvailabilityTemplate(templateId: string, doctorId: string, updateData: UpdateAvailabilityTemplateData) {
    const updateFields: Record<string, any> = {};

    if (updateData.templateName !== undefined) updateFields.templateName = updateData.templateName;
    if (updateData.startTime !== undefined) updateFields.startTime = updateData.startTime;
    if (updateData.endTime !== undefined) updateFields.endTime = updateData.endTime;
    if (updateData.recurrencePattern !== undefined) updateFields.recurrencePattern = updateData.recurrencePattern;
    if (updateData.recurrenceDays !== undefined) {
      updateFields.recurrenceDays = updateData.recurrenceDays.length ? updateData.recurrenceDays.join(',') : null;
    }
    if (updateData.validFrom !== undefined) updateFields.validFrom = updateData.validFrom;
    if (updateData.validUntil !== undefined) updateFields.validUntil = updateData.validUntil ?? null;

    const [template] = await this.db
      .update(availabilityTemplates)
      .set(updateFields)
      .where(and(
        eq(availabilityTemplates.id, templateId),
        eq(availabilityTemplates.doctorId, doctorId)
      ))
      .returning();

    return this.mapTemplateRow(template);
  }

  async deleteAvailabilityTemplate(templateId: string, doctorId: string) {
    const [template] = await this.db
      .delete(availabilityTemplates)
      .where(and(
        eq(availabilityTemplates.id, templateId),
        eq(availabilityTemplates.doctorId, doctorId)
      ))
      .returning();

    return this.mapTemplateRow(template);
  }

  async getTemplatesActiveBetween(startDate: string, endDate: string) {
    const templates = await this.db
      .select()
      .from(availabilityTemplates)
      .where(and(
        lte(availabilityTemplates.validFrom, endDate),
        or(
          isNull(availabilityTemplates.validUntil),
          gte(availabilityTemplates.validUntil, startDate)
        )
      ));

    return templates
      .map((row) => this.mapTemplateRow(row))
      .filter(Boolean) as Array<AvailabilityTemplateRow & { recurrenceDays: string[] }>;
  }

  // Doctor Availability
  async createAvailability(availabilityData: CreateDoctorAvailabilityData, doctorId: string) {
    return await this.db
      .insert(doctorAvailability)
      .values({
        doctorId,
        slotDate: availabilityData.slotDate,
        startTime: availabilityData.startTime,
        endTime: availabilityData.endTime,
        templateId: availabilityData.templateId,
        status: availabilityData.status || 'available',
        isManual: availabilityData.isManual ?? false,
        notes: availabilityData.notes,
      })
      .returning();
  }

  async getDoctorAvailability(doctorId: string) {
    return await this.db
      .select()
      .from(doctorAvailability)
      .where(eq(doctorAvailability.doctorId, doctorId))
      .orderBy(asc(doctorAvailability.slotDate), asc(doctorAvailability.startTime));
  }

  async getAvailabilityById(id: string) {
    const [slot] = await this.db
      .select()
      .from(doctorAvailability)
      .where(eq(doctorAvailability.id, id))
      .limit(1);
    return slot || null;
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

  async hasAvailabilityOverlap(
    doctorId: string,
    slotDate: string,
    startTime: string,
    endTime: string,
    excludeAvailabilityId?: string
  ) {
    let condition = and(
      eq(doctorAvailability.doctorId, doctorId),
      eq(doctorAvailability.slotDate, slotDate),
      lt(doctorAvailability.startTime, endTime),
      gt(doctorAvailability.endTime, startTime)
    );

    if (excludeAvailabilityId) {
      condition = and(condition, ne(doctorAvailability.id, excludeAvailabilityId));
    }

    const [result] = await this.db
      .select({ id: doctorAvailability.id })
      .from(doctorAvailability)
      .where(condition)
      .limit(1);

    return !!result;
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
        leaveType: unavailabilityData.leaveType || 'other',
      })
      .returning();
  }

  async updateUnavailability(id: string, doctorId: string, updateData: Partial<CreateDoctorUnavailabilityData>) {
    const updateFields: Record<string, any> = {};
    
    if (updateData.startDate !== undefined) updateFields.startDate = updateData.startDate;
    if (updateData.endDate !== undefined) updateFields.endDate = updateData.endDate;
    if (updateData.leaveType !== undefined) updateFields.leaveType = updateData.leaveType;
    if (updateData.reason !== undefined) updateFields.reason = updateData.reason;

    const [leave] = await this.db
      .update(doctorLeaves)
      .set(updateFields)
      .where(and(
        eq(doctorLeaves.id, id),
        eq(doctorLeaves.doctorId, doctorId)
      ))
      .returning();

    return leave;
  }

  async isDateOnLeave(doctorId: string, date: string): Promise<boolean> {
    const [leave] = await this.db
      .select({ id: doctorLeaves.id })
      .from(doctorLeaves)
      .where(and(
        eq(doctorLeaves.doctorId, doctorId),
        lte(doctorLeaves.startDate, date),
        gte(doctorLeaves.endDate, date)
      ))
      .limit(1);

    return !!leave;
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
        totalBookings: doctors.completedAssignments, // Maps to completed_assignments in DB
        averageRating: doctors.averageRating,
        totalRatings: doctors.totalRatings,
      })
      .from(doctors)
      .where(eq(doctors.id, doctorId))
      .limit(1);

    return result[0] || null;
  }

  // Doctor Profile Photos
  async getDoctorProfilePhotos(doctorId: string) {
    return await this.db
      .select({
        id: doctorProfilePhotos.id,
        doctorId: doctorProfilePhotos.doctorId,
        fileId: doctorProfilePhotos.fileId,
        isPrimary: doctorProfilePhotos.isPrimary,
        uploadedAt: doctorProfilePhotos.uploadedAt,
        file: {
          id: files.id,
          filename: files.filename,
          url: files.url,
          mimetype: files.mimetype,
          size: files.size,
        },
      })
      .from(doctorProfilePhotos)
      .leftJoin(files, eq(doctorProfilePhotos.fileId, files.id))
      .where(eq(doctorProfilePhotos.doctorId, doctorId))
      .orderBy(desc(doctorProfilePhotos.isPrimary), desc(doctorProfilePhotos.uploadedAt));
  }

  async addProfilePhoto(doctorId: string, fileId: string, isPrimary: boolean = false) {
    // If setting as primary, unset all other primary photos
    if (isPrimary) {
      await this.db
        .update(doctorProfilePhotos)
        .set({ isPrimary: false })
        .where(eq(doctorProfilePhotos.doctorId, doctorId));
    }

    return await this.db
      .insert(doctorProfilePhotos)
      .values({
        doctorId,
        fileId,
        isPrimary,
      })
      .returning();
  }

  async setPrimaryPhoto(doctorId: string, photoId: string) {
    // Unset all primary photos
    await this.db
      .update(doctorProfilePhotos)
      .set({ isPrimary: false })
      .where(eq(doctorProfilePhotos.doctorId, doctorId));

    // Set the selected photo as primary
    return await this.db
      .update(doctorProfilePhotos)
      .set({ isPrimary: true })
      .where(and(
        eq(doctorProfilePhotos.id, photoId),
        eq(doctorProfilePhotos.doctorId, doctorId)
      ))
      .returning();
  }

  async deleteProfilePhoto(photoId: string, doctorId: string) {
    return await this.db
      .delete(doctorProfilePhotos)
      .where(and(
        eq(doctorProfilePhotos.id, photoId),
        eq(doctorProfilePhotos.doctorId, doctorId)
      ))
      .returning();
  }
}


