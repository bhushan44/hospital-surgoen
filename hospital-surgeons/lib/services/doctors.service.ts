import bcrypt from 'bcrypt';
import { DoctorsRepository, CreateDoctorData, CreateDoctorCredentialData, CreateDoctorSpecialtyData, CreateDoctorAvailabilityData, CreateDoctorUnavailabilityData, DoctorQuery } from '@/lib/repositories/doctors.repository';
import { UsersService } from '@/lib/services/users.service';

export interface CreateDoctorDto {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  medicalLicenseNumber: string;
  yearsOfExperience?: number;
  bio?: string;
  profilePhotoId?: string; // UUID reference to files table
  // consultationFee is in assignments table, not doctors table
  // isAvailable should be checked via doctorAvailability table
}

export interface UpdateDoctorDto {
  firstName?: string;
  lastName?: string;
  profilePhotoId?: string; // UUID reference to files table
  medicalLicenseNumber?: string;
  yearsOfExperience?: number;
  bio?: string;
  // consultationFee is in assignments table, not doctors table
  // isAvailable should be checked via doctorAvailability table
}

export class DoctorsService {
  private doctorsRepository = new DoctorsRepository();
  private usersService = new UsersService();

  async createDoctor(createDoctorDto: CreateDoctorDto) {
    try {
      // Check if user already exists
      const { UsersRepository } = await import('@/lib/repositories/users.repository');
      const usersRepository = new UsersRepository();
      const existingUser = await usersRepository.findUserByEmail(createDoctorDto.email);
      
      if (existingUser.length > 0) {
        return {
          success: false,
          message: 'User with this email already exists',
        };
      }

      // Create user first
      const hashedPassword = await bcrypt.hash(createDoctorDto.password, 10);
      const userResult = await this.usersService.create({
        email: createDoctorDto.email,
        phone: createDoctorDto.phone,
        password_hash: hashedPassword,
        device: {
          device_token: 'temp_token',
          device_type: 'web',
          app_version: '1.0.0',
          os_version: '1.0.0',
          is_active: true,
        },
      }, 'doctor');

      if (!userResult.success || !userResult.data) {
        return {
          success: false,
          message: userResult.message || 'Failed to create user',
        };
      }

      const userId = userResult.data[0].id;

      // Create doctor profile
      const doctor = await this.doctorsRepository.createDoctor({
        firstName: createDoctorDto.firstName,
        lastName: createDoctorDto.lastName,
        profilePhotoId: createDoctorDto.profilePhotoId,
        medicalLicenseNumber: createDoctorDto.medicalLicenseNumber,
        yearsOfExperience: createDoctorDto.yearsOfExperience,
        bio: createDoctorDto.bio,
      }, userId);

      return {
        success: true,
        message: 'Doctor created successfully',
        data: {
          doctor: doctor[0],
          user: userResult.data[0],
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create doctor',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async findDoctors(query: DoctorQuery) {
    try {
      const doctors = await this.doctorsRepository.findDoctors(query);
      
      return {
        success: true,
        message: 'Doctors retrieved successfully',
        data: doctors,
        pagination: {
          page: query.page || 1,
          limit: query.limit || 10,
          total: doctors.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve doctors',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async findDoctorById(id: string) {
    try {
      const doctor = await this.doctorsRepository.findDoctorById(id);
      
      if (!doctor) {
        return {
          success: false,
          message: 'Doctor not found',
        };
      }

      return {
        success: true,
        message: 'Doctor retrieved successfully',
        data: doctor,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve doctor',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async findDoctorByUserId(userId: string) {
    try {
      const doctor = await this.doctorsRepository.findDoctorByUserId(userId);
      
      if (!doctor) {
        return {
          success: false,
          message: 'Doctor profile not found',
        };
      }

      return {
        success: true,
        message: 'Doctor profile retrieved successfully',
        data: doctor,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve doctor profile',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async createDoctorProfile(userId: string, createDoctorProfileDto: {
    medicalLicenseNumber: string;
    yearsOfExperience?: number;
    bio?: string;
    profilePhotoId?: string;
  }) {
    try {
      // Check if doctor profile already exists
      const existingDoctor = await this.doctorsRepository.findDoctorByUserId(userId);
      if (existingDoctor) {
        return {
          success: false,
          message: 'Doctor profile already exists for this user',
        };
      }

      // Get user details
      const { UsersRepository } = await import('@/lib/repositories/users.repository');
      const usersRepository = new UsersRepository();
      const user = await usersRepository.getUserById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Note: firstName and lastName are stored in doctors table, not users table
      // They should be provided in the DTO or retrieved from user profile
      // For now, we'll accept them as optional parameters
      const firstName = (createDoctorProfileDto as any).firstName || '';
      const lastName = (createDoctorProfileDto as any).lastName || '';
      
      // Create doctor profile
      const doctor = await this.doctorsRepository.createDoctor({
        firstName,
        lastName,
        medicalLicenseNumber: createDoctorProfileDto.medicalLicenseNumber,
        yearsOfExperience: createDoctorProfileDto.yearsOfExperience,
        bio: createDoctorProfileDto.bio,
        profilePhotoId: createDoctorProfileDto.profilePhotoId,
      }, userId);

      return {
        success: true,
        message: 'Doctor profile created successfully',
        data: doctor[0],
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create doctor profile',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async updateDoctor(id: string, updateDoctorDto: UpdateDoctorDto) {
    try {
      const doctor = await this.doctorsRepository.findDoctorById(id);
      if (!doctor) {
        return {
          success: false,
          message: 'Doctor not found',
        };
      }

      const updatedDoctor = await this.doctorsRepository.updateDoctor(id, updateDoctorDto);

      return {
        success: true,
        message: 'Doctor updated successfully',
        data: updatedDoctor[0],
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update doctor',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async deleteDoctor(id: string) {
    try {
      const doctor = await this.doctorsRepository.findDoctorById(id);
      if (!doctor) {
        return {
          success: false,
          message: 'Doctor not found',
        };
      }

      await this.doctorsRepository.deleteDoctor(id);

      return {
        success: true,
        message: 'Doctor deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete doctor',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Doctor Credentials
  async addCredential(doctorId: string, credentialDto: CreateDoctorCredentialData) {
    try {
      const doctor = await this.doctorsRepository.findDoctorById(doctorId);
      if (!doctor) {
        return {
          success: false,
          message: 'Doctor not found',
        };
      }

      const credential = await this.doctorsRepository.createCredential(credentialDto, doctorId);

      return {
        success: true,
        message: 'Credential added successfully',
        data: credential[0],
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add credential',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getDoctorCredentials(doctorId: string) {
    try {
      const credentials = await this.doctorsRepository.getDoctorCredentials(doctorId);

      return {
        success: true,
        message: 'Credentials retrieved successfully',
        data: credentials,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve credentials',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Doctor Specialties
  async addSpecialty(doctorId: string, specialtyDto: CreateDoctorSpecialtyData) {
    try {
      const doctor = await this.doctorsRepository.findDoctorById(doctorId);
      if (!doctor) {
        return {
          success: false,
          message: 'Doctor not found',
        };
      }

      const specialty = await this.doctorsRepository.addSpecialty(specialtyDto, doctorId);

      return {
        success: true,
        message: 'Specialty added successfully',
        data: specialty[0],
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add specialty',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getDoctorSpecialties(doctorId: string) {
    try {
      const specialties = await this.doctorsRepository.getDoctorSpecialties(doctorId);

      return {
        success: true,
        message: 'Specialties retrieved successfully',
        data: specialties,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve specialties',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async removeSpecialty(doctorId: string, specialtyId: string) {
    try {
      const result = await this.doctorsRepository.removeSpecialty(doctorId, specialtyId);
      
      if (result.length === 0) {
        return {
          success: false,
          message: 'Specialty not found',
        };
      }

      return {
        success: true,
        message: 'Specialty removed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove specialty',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Doctor Availability
  async addAvailability(doctorId: string, availabilityDto: CreateDoctorAvailabilityData) {
    try {
      const doctor = await this.doctorsRepository.findDoctorById(doctorId);
      if (!doctor) {
        return {
          success: false,
          message: 'Doctor not found',
        };
      }

      const availability = await this.doctorsRepository.createAvailability(availabilityDto, doctorId);

      return {
        success: true,
        message: 'Availability added successfully',
        data: availability[0],
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add availability',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getDoctorAvailability(doctorId: string) {
    try {
      const availability = await this.doctorsRepository.getDoctorAvailability(doctorId);

      return {
        success: true,
        message: 'Availability retrieved successfully',
        data: availability,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve availability',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async updateAvailability(availabilityId: string, updateData: Partial<CreateDoctorAvailabilityData>) {
    try {
      const availability = await this.doctorsRepository.updateAvailability(availabilityId, updateData);

      return {
        success: true,
        message: 'Availability updated successfully',
        data: availability[0],
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update availability',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async deleteAvailability(availabilityId: string) {
    try {
      await this.doctorsRepository.deleteAvailability(availabilityId);

      return {
        success: true,
        message: 'Availability deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete availability',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Doctor Unavailability
  async addUnavailability(doctorId: string, unavailabilityDto: CreateDoctorUnavailabilityData) {
    try {
      const doctor = await this.doctorsRepository.findDoctorById(doctorId);
      if (!doctor) {
        return {
          success: false,
          message: 'Doctor not found',
        };
      }

      const unavailability = await this.doctorsRepository.createUnavailability(unavailabilityDto, doctorId);

      return {
        success: true,
        message: 'Unavailability added successfully',
        data: unavailability[0],
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add unavailability',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getDoctorUnavailability(doctorId: string) {
    try {
      const unavailability = await this.doctorsRepository.getDoctorUnavailability(doctorId);

      return {
        success: true,
        message: 'Unavailability retrieved successfully',
        data: unavailability,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve unavailability',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async deleteUnavailability(unavailabilityId: string) {
    try {
      await this.doctorsRepository.deleteUnavailability(unavailabilityId);

      return {
        success: true,
        message: 'Unavailability deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete unavailability',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Statistics
  async getDoctorStats(doctorId: string) {
    try {
      const stats = await this.doctorsRepository.getDoctorStats(doctorId);

      return {
        success: true,
        message: 'Doctor statistics retrieved successfully',
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve doctor statistics',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}


