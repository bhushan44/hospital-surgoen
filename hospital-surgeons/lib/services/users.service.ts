import bcrypt from 'bcrypt';
import { UsersRepository } from '@/lib/repositories/users.repository';
import { signToken } from '@/lib/auth/jwt';
import { verifyToken } from '@/lib/auth/jwt';

export interface CreateUserDto {
  email: string;
  password_hash: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  device?: {
    device_token: string;
    device_type: 'ios' | 'android' | 'web';
    app_version?: string;
    os_version?: string;
    device_name?: string;
    is_active?: boolean;
  };
}

export interface LoginUserDto {
  email: string;
  password: string;
  accountType?: 'doctor' | 'hospital' | 'admin'; // Optional: expected account type for validation
  device?: {
    device_token: string;
    device_type: 'ios' | 'android' | 'web';
    app_version?: string;
    os_version?: string;
    device_name?: string;
    is_active?: boolean;
  };
}

export interface RefreshTokenDto {
  token: string;
  device?: {
    device_token: string;
    device_type: 'ios' | 'android' | 'web';
    app_version?: string;
    os_version?: string;
    device_name?: string;
    is_active?: boolean;
  };
}

export interface UpdateUserDto {
  email?: string;
  phone?: string;
}

export class UsersService {
  private userRepository = new UsersRepository();

  async create(createUserDto: CreateUserDto, role: 'doctor' | 'hospital' | 'admin' = 'doctor') {
    try {
      // Validate password_hash is provided
      if (!createUserDto.password_hash || typeof createUserDto.password_hash !== 'string' || createUserDto.password_hash.trim() === '') {
        return {
          success: false,
          message: 'Password is required',
          data: null,
        };
      }

      const existingUser = await this.userRepository.findUserByEmail(createUserDto.email);

      if (existingUser.length > 0) {
        return {
          success: false,
          message: 'User with this email already exists',
          data: null,
        };
      }

      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(createUserDto.password_hash, 10);

      const newUser = await this.userRepository.createUser({
        ...createUserDto,
        password_hash: hashedPassword,
      }, role);

      if (createUserDto.device) {
        await this.userRepository.createDevice(
          {
            device_token: createUserDto.device.device_token,
            device_type: createUserDto.device.device_type,
            app_version: createUserDto.device.app_version,
            os_version: createUserDto.device.os_version,
            device_name: createUserDto.device.device_name,
            is_active: createUserDto.device.is_active,
          },
          newUser[0].id,
        );
      }

      return {
        success: true,
        message: 'User created successfully',
        data: newUser,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails = error instanceof Error && (error as any).cause ? (error as any).cause.message : '';
      return {
        success: false,
        message: 'Failed to create user',
        error: errorMessage + (errorDetails ? ` - ${errorDetails}` : ''),
        data: null,
      };
    }
  }

  async login(body: LoginUserDto) {
    try {
      const user = await this.userRepository.findUserByEmail(body.email);

      if (user.length === 0) {
        return {
          success: false,
          message: 'User not found',
          data: null,
        };
      }

      const isPasswordValid = await bcrypt.compare(
        body.password,
        user[0].passwordHash!,
      );

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid password',
          data: null,
        };
      }

      // Validate account type if provided (for security - ensure user is logging in with correct role)
      if (body.accountType && body.accountType !== 'admin') {
        const roleToAccountType: Record<string, 'doctor' | 'hospital' | 'admin'> = {
          'doctor': 'doctor',
          'hospital': 'hospital',
          'admin': 'admin',
        };
        
        const expectedAccountType = roleToAccountType[user[0].role];
        
        if (expectedAccountType && body.accountType !== expectedAccountType) {
          return {
            success: false,
            message: `This account is registered as a ${user[0].role}. Please use the ${expectedAccountType} login.`,
            data: null,
          };
        }
      }

      const payload = { userId: user[0].id, userRole: user[0].role };
      const accessToken = signToken(
        payload,
        process.env.JWT_ACCESS_TOKEN_SECRET!,
        process.env.JWT_ACCESS_TOKEN_EXPIRATION || '900s'
      );

      const refreshToken = signToken(
        payload,
        process.env.JWT_REFRESH_TOKEN_SECRET!,
        process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d'
      );

      if (body.device?.device_token && body.device?.device_type) {
        const existingDevice = await this.userRepository.findDeviceByToken(
          body.device.device_token,
          user[0].id,
        );

        if (existingDevice) {
          await this.userRepository.updateDeviceUsage(existingDevice.id);
        } else {
          await this.userRepository.createDevice(
            {
              device_token: body.device.device_token,
              device_type: body.device.device_type,
              app_version: body.device.app_version,
              os_version: body.device.os_version,
              device_name: body.device.device_name,
              is_active: body.device.is_active,
            },
            user[0].id,
          );
        }
      }

      return {
        success: true,
        message: 'Login successful',
        data: { accessToken, refreshToken },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Login failed',
        error: error instanceof Error ? error.message : String(error),
        data: null,
      };
    }
  }

  async refreshToken(body: RefreshTokenDto) {
    try {
      // Verify refresh token
      const payload = verifyToken(
        body.token,
        process.env.JWT_REFRESH_TOKEN_SECRET!
      );

      // Create new access token
      const accessToken = signToken(
        { userId: payload.userId, userRole: payload.userRole },
        process.env.JWT_ACCESS_TOKEN_SECRET!,
        process.env.JWT_ACCESS_TOKEN_EXPIRATION || '900s'
      );

      // Update or insert device usage
      if (body.device?.device_token) {
        const existingDevice = await this.userRepository.findDeviceByToken(
          body.device.device_token,
          payload.userId,
        );

        if (existingDevice) {
          await this.userRepository.updateDeviceUsage(existingDevice.id);
        } else if (body.device.device_type) {
          await this.userRepository.createDevice(
            {
              device_token: body.device.device_token,
              device_type: body.device.device_type,
              app_version: body.device.app_version,
              os_version: body.device.os_version,
              device_name: body.device.device_name,
              is_active: body.device.is_active,
            },
            payload.userId,
          );
        }
      }

      return { success: true, data: { accessToken } };
    } catch (err) {
      return { success: false, message: 'Invalid refresh token' };
    }
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        data: null,
      };
    }
    return {
      success: true,
      message: 'User profile fetched successfully',
      data: user,
    };
  }

  async findAll() {
    return await this.userRepository.findAll();
  }

  async findOne(id: string) {
    return await this.userRepository.getUserById(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const result = await this.userRepository.updateUser(id, updateUserDto);
    if (result && result.length > 0) {
      return { success: true, data: result[0], message: 'User updated successfully' };
    }
    return { success: false, message: 'User not found' };
  }

  async remove(id: string) {
    return await this.userRepository.deleteUser(id);
  }
}

