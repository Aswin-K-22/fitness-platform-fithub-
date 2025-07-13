// backend/src/infrastructure/repositories/trainers.repository.ts
import { TrainerErrorType } from '@/domain/enums/trainerErrorType.enum';
import { ITrainersRepository } from '../../app/repositories/trainers.repository';
import { Trainer } from '../../domain/entities/Trainer.entity';
import { Email } from '../../domain/valueObjects/email.valueObject';
import { Prisma, PrismaClient } from '@prisma/client';
import { IUpdateTrainerProfileRequestDTO } from '@/domain/dtos/updateTrainerProfileRequest.dto';

export class TrainersRepository implements ITrainersRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<Trainer | null> {
    const trainer = await this.prisma.trainer.findUnique({
      where: { email },
      include: {
        bookings: { select: { id: true } }, // Fetch only IDs for relations
        payments: { select: { id: true } }, // Fetch only IDs for relations
      },
    });
    if (!trainer) return null;
    return new Trainer({
      id: trainer.id,
      name: trainer.name,
      email: new Email({ address: trainer.email }),
      password: trainer.password,
      role: trainer.role,
      profilePic: trainer.profilePic,
      isVerified: trainer.isVerified,
      verifiedByAdmin: trainer.verifiedByAdmin,
      otp: trainer.otp,
      otpExpires: trainer.otpExpires,
      refreshToken: trainer.refreshToken,
      personalDetails: trainer.personalDetails,
      certifications: trainer.certifications,
      bio: trainer.bio,
      specialties: trainer.specialties,
      experienceLevel: trainer.experienceLevel,
      clients: trainer.clients,
      paymentDetails: trainer.paymentDetails,
      availability: trainer.availability,
      gyms: trainer.gyms,
      phone: trainer.phone,
      ratings: trainer.ratings,
      bookings: trainer.bookings, // Booking[] with id
      payments: trainer.payments, // Payment[] with id
      createdAt: trainer.createdAt,
      updatedAt: trainer.updatedAt,
    });
  }

  async findById(id: string): Promise<Trainer | null> {
    const trainer = await this.prisma.trainer.findUnique({
      where: { id },
      include: {
        bookings: { select: { id: true } }, // Fetch only IDs for relations
        payments: { select: { id: true } }, // Fetch only IDs for relations
      },
    });
    if (!trainer) return null;
    return new Trainer({
      id: trainer.id,
      name: trainer.name,
      email: new Email({ address: trainer.email }),
      password: trainer.password,
      role: trainer.role,
      profilePic: trainer.profilePic,
      isVerified: trainer.isVerified,
      verifiedByAdmin: trainer.verifiedByAdmin,
      otp: trainer.otp,
      otpExpires: trainer.otpExpires,
      refreshToken: trainer.refreshToken,
      personalDetails: trainer.personalDetails,
      certifications: trainer.certifications,
      bio: trainer.bio,
      specialties: trainer.specialties,
      experienceLevel: trainer.experienceLevel,
      clients: trainer.clients,
      paymentDetails: trainer.paymentDetails,
      availability: trainer.availability,
      gyms: trainer.gyms,
      phone: trainer.phone,
      ratings: trainer.ratings,
      bookings: trainer.bookings, // Booking[] with id
      payments: trainer.payments, // Payment[] with id
      createdAt: trainer.createdAt,
      updatedAt: trainer.updatedAt,
    });
  }

  async signupTrainer(trainer: Trainer): Promise<Trainer> {
    const createdTrainer = await this.prisma.trainer.create({
      data: {
        name: trainer.name,
        email: trainer.email.address,
        password: trainer.password,
        role: trainer.role,
        profilePic: trainer.profilePic,
        isVerified: trainer.isVerified,
        verifiedByAdmin: trainer.verifiedByAdmin,
        otp: trainer.otp,
        otpExpires: trainer.otpExpires,
        refreshToken: trainer.refreshToken,
        personalDetails: trainer.personalDetails,
        certifications: trainer.certifications.map(cert => ({
          name: cert.name,
          issuer: cert.issuer,
          dateEarned: cert.dateEarned,
          filePath: cert.filePath,
        })),
        bio: trainer.bio,
        specialties: trainer.specialties,
        experienceLevel: trainer.experienceLevel,
        gyms: trainer.gyms,
        phone: trainer.phone,
        createdAt: trainer.createdAt,
        updatedAt: trainer.updatedAt,
        
      },
    });
    return new Trainer({
      id: createdTrainer.id,
      name: createdTrainer.name,
      email: new Email({ address: createdTrainer.email }),
      password: createdTrainer.password,
      role: createdTrainer.role,
      profilePic: createdTrainer.profilePic,
      isVerified: createdTrainer.isVerified,
      verifiedByAdmin: createdTrainer.verifiedByAdmin,
      otp: createdTrainer.otp,
      otpExpires: createdTrainer.otpExpires,
      refreshToken: createdTrainer.refreshToken,
      personalDetails: createdTrainer.personalDetails,
      certifications: createdTrainer.certifications,
      bio: createdTrainer.bio,
      specialties: createdTrainer.specialties,
      experienceLevel: createdTrainer.experienceLevel,
      clients: createdTrainer.clients,
      paymentDetails: createdTrainer.paymentDetails,
      availability: createdTrainer.availability,
      gyms: createdTrainer.gyms,
      phone: createdTrainer.phone,
      ratings: createdTrainer.ratings,
      bookings: [], // Initialize as empty, populate via relations
      payments: [], // Initialize as empty, populate via relations
      createdAt: createdTrainer.createdAt,
      updatedAt: createdTrainer.updatedAt,
    });
  }

  async updateOtp(email: string, otp: string): Promise<void> {
    await this.prisma.trainer.update({
      where: { email },
      data: { otp, otpExpires: new Date(Date.now() + 30 * 1000) }, // 30 seconds expiry
    });
  }

  async verifyTrainer(email: string): Promise<void> {
    await this.prisma.trainer.update({
      where: { email },
      data: { isVerified: true, otp: null, otpExpires: null },
    });
  }

 async updateRefreshToken(email: string, refreshToken: string | null): Promise<void> {
    try {
      await this.prisma.trainer.update({
        where: { email },
        data: { refreshToken },
      });
    } catch (error) {
      console.error(`[ERROR] Failed to update refresh token for email: ${email}`, error);
      throw new Error('Database error while updating refresh token');
    }
  }

async findAll(
    skip: number,
    take: number,
    search?: string,
    status?: string,
    specialization?: string,
  ): Promise<Trainer[]> {
    try {
      const where: Prisma.TrainerWhereInput = { role: 'trainer' };

      if (search) {
       where.name = { startsWith: search.trim(), mode: "insensitive" };
      }

      if (status) {
        where.verifiedByAdmin = status === 'Approved' ? true : status === 'Pending' ? false : undefined;
      }

      if (specialization) {
        where.specialties = { has: specialization };
      }

      const trainers = await this.prisma.trainer.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          specialties: true,
          experienceLevel: true,
          verifiedByAdmin: true,
          isVerified: true,
          profilePic: true,
          certifications: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
        },
         orderBy: {  createdAt: "desc" },

      });

      return trainers.map(
        (trainer) =>
          new Trainer({
            id: trainer.id,
            name: trainer.name,
            email: new Email({ address: trainer.email }),
            password: '', // Avoid including password
            role: 'trainer',
            profilePic: trainer.profilePic,
            isVerified: trainer.isVerified,
            verifiedByAdmin: trainer.verifiedByAdmin,
            otp: null, // Exclude sensitive fields
            otpExpires: null,
            refreshToken: null,
            personalDetails: null,
            certifications: trainer.certifications,
            bio: trainer.bio,
            specialties: trainer.specialties,
            experienceLevel: trainer.experienceLevel,
            clients: [], // Exclude relations unless needed
            paymentDetails: null,
            availability: [],
            gyms: [],
            phone: null,
            ratings: null,
            bookings: [],
            payments: [],
            createdAt: trainer.createdAt,
            updatedAt: trainer.updatedAt,
          }),
      );
    } catch (error) {
      console.error('Error fetching trainers:', error);
      throw new Error(TrainerErrorType.FailedToFetchTrainers);
    }
  }

  async toggleApproval(trainerId: string, verifiedByAdmin: boolean): Promise<Trainer> {
    try {
      const trainer = await this.prisma.trainer.findUnique({
        where: { id: trainerId, role: 'trainer' },
        select: {
          id: true,
          name: true,
          email: true,
          specialties: true,
          experienceLevel: true,
          verifiedByAdmin: true,
          isVerified: true,
          profilePic: true,
          certifications: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!trainer) {
        throw new Error(TrainerErrorType.TrainerNotFound);
      }

      const updatedTrainer = await this.prisma.trainer.update({
        where: { id: trainerId },
        data: { verifiedByAdmin, updatedAt: new Date() },
        select: {
          id: true,
          name: true,
          email: true,
          specialties: true,
          experienceLevel: true,
          verifiedByAdmin: true,
          isVerified: true,
          profilePic: true,
          certifications: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return new Trainer({
        id: updatedTrainer.id,
        name: updatedTrainer.name,
        email: new Email({ address: updatedTrainer.email }),
        password: '', // Avoid including password
        role: 'trainer',
        profilePic: updatedTrainer.profilePic,
        isVerified: updatedTrainer.isVerified,
        verifiedByAdmin: updatedTrainer.verifiedByAdmin,
        otp: null,
        otpExpires: null,
        refreshToken: null,
        personalDetails: null,
        certifications: updatedTrainer.certifications,
        bio: updatedTrainer.bio,
        specialties: updatedTrainer.specialties,
        experienceLevel: updatedTrainer.experienceLevel,
        clients: [],
        paymentDetails: null,
        availability: [],
        gyms: [],
        phone: null,
        ratings: null,
        bookings: [],
        payments: [],
        createdAt: updatedTrainer.createdAt,
        updatedAt: updatedTrainer.updatedAt,
      });
    } catch (error) {
      console.error('Error toggling trainer approval:', error);
      if (error instanceof Error && error.message === TrainerErrorType.TrainerNotFound) {
        throw error;
      }
      throw new Error(TrainerErrorType.InvalidTrainerId);
    }
  }

  async count(search?: string, status?: string, specialization?: string): Promise<number> {
    try {
      const where: Prisma.TrainerWhereInput = { role: 'trainer' };

      if (search) {
        where.OR = [
          { name: { contains: search.trim(), mode: 'insensitive' } },
          { email: { contains: search.trim(), mode: 'insensitive' } },
        ];
      }

      if (status) {
        where.verifiedByAdmin = status === 'Approved' ? true : status === 'Pending' ? false : undefined;
      }

      if (specialization) {
        where.specialties = { has: specialization };
      }

      return await this.prisma.trainer.count({ where });
    } catch (error) {
      console.error('Error counting trainers:', error);
      throw new Error(TrainerErrorType.FailedToFetchTrainers);
    }
  }

  async countPending(): Promise<number> {
    try {
      return await this.prisma.trainer.count({
        where: { role: 'trainer', verifiedByAdmin: false },
      });
    } catch (error) {
      console.error('Error counting pending trainers:', error);
      throw new Error(TrainerErrorType.FailedToFetchTrainers);
    }
  }

  async countApproved(): Promise<number> {
    try {
      return await this.prisma.trainer.count({
        where: { role: 'trainer', verifiedByAdmin: true },
      });
    } catch (error) {
      console.error('Error counting approved trainers:', error);
      throw new Error(TrainerErrorType.FailedToFetchTrainers);
    }
  }

  async countSuspended(): Promise<number> {
    try {
      return await this.prisma.trainer.count({
        where: { role: 'trainer', isVerified: false }, // Adjust if you have a specific suspended status
      });
    } catch (error) {
      console.error('Error counting suspended trainers:', error);
      throw new Error(TrainerErrorType.FailedToFetchTrainers);
    }
  }



   async findAvailableTrainers(): Promise<{ id: string; name: string; active: boolean }[]> {
    try {
      return await this.prisma.trainer.findMany({
        where: {
          gyms: { isEmpty: true },
          verifiedByAdmin: true,
        },
        select: {
          id: true,
          name: true,
          verifiedByAdmin: true,
        },
      }).then((trainers) =>
        trainers.map((trainer) => ({
          id: trainer.id,
          name: trainer.name,
          active: trainer.verifiedByAdmin,
        }))
      );
    } catch (error) {
      console.error('Error fetching available trainers:', error);
      throw new Error(TrainerErrorType.FailedToFetchTrainers);
    }
  }


   async checkTrainerAvailability(trainerIds: string[]): Promise<{ isValid: boolean; message?: string }> {
    try {
      const trainers = await this.prisma.trainer.findMany({
        where: {
          id: { in: trainerIds },
          verifiedByAdmin: true,
          gyms: { isEmpty: true },
        },
        select: { id: true },
      });

      const foundTrainerIds = trainers.map((t) => t.id);
      const invalidIds = trainerIds.filter((id) => !foundTrainerIds.includes(id));

      if (invalidIds.length > 0) {
        return { isValid: false, message: `Invalid or unavailable trainer IDs: ${invalidIds.join(', ')}` };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error checking trainer availability:', error);
      throw new Error(TrainerErrorType.FailedToFetchTrainers);
    }
  }

  async assignTrainersToGym(trainerIds: string[], gymId: string): Promise<void> {
    try {
      await this.prisma.trainer.updateMany({
        where: { id: { in: trainerIds } },
        data: { gyms: { push: gymId } },
      });
    } catch (error) {
      console.error('Error assigning trainers to gym:', error);
      throw new Error(TrainerErrorType.FailedToAssignTrainers);
    }
  }

  async updateProfile(email: string, data: IUpdateTrainerProfileRequestDTO): Promise<Trainer> {
    try {

      const existingTrainer = await this.prisma.trainer.findUnique({
        where: { email },
        select: { paymentDetails: true },
      });

      if (!existingTrainer) {
        throw new Error(TrainerErrorType.TrainerNotFound);
      }

const updateData: any = {
        updatedAt: new Date(),
      };
      if (data.name) updateData.name = data.name.trim();
      if (data.bio) updateData.bio = data.bio.trim();
      if (data.specialties) updateData.specialties = data.specialties;
      if (data.profilePic) updateData.profilePic = `/uploads/${data.profilePic.filename}`;

      // Handle paymentDetails update
      if (data.upiId || data.bankAccount || data.ifscCode) {
        // Merge existing paymentDetails with new values
        const currentPaymentDetails = existingTrainer.paymentDetails || {
          method: null,
          rate: null,
          currency: null,
          paymentHistory: [],
          upiId: null,
          bankAccount: null,
          ifscCode: null,
        };
        updateData.paymentDetails = {
          ...currentPaymentDetails,
          upiId: data.upiId !== undefined ? data.upiId : currentPaymentDetails.upiId,
          bankAccount: data.bankAccount !== undefined ? data.bankAccount : currentPaymentDetails.bankAccount,
          ifscCode: data.ifscCode !== undefined ? data.ifscCode : currentPaymentDetails.ifscCode,
        };
      }

      const updatedTrainer = await this.prisma.trainer.update({
        where: { email },
        data: updateData,
        include: {
         //paymentDetails: { include: { paymentHistory: true } },
         // availability: true,
         // clients: true,
          bookings: true, // Include bookings relation
          payments: true, // Include payments relation
        },
        
      });

      return new Trainer({
        id: updatedTrainer.id,
        name: updatedTrainer.name,
        email: new Email({ address: updatedTrainer.email }),
        password: updatedTrainer.password,
        role: updatedTrainer.role,
        profilePic: updatedTrainer.profilePic,
        isVerified: updatedTrainer.isVerified,
        verifiedByAdmin: updatedTrainer.verifiedByAdmin,
        otp: updatedTrainer.otp,
        otpExpires: updatedTrainer.otpExpires,
        refreshToken: updatedTrainer.refreshToken,
        personalDetails: updatedTrainer.personalDetails,
        certifications: updatedTrainer.certifications,
        bio: updatedTrainer.bio,
        specialties: updatedTrainer.specialties,
        experienceLevel: updatedTrainer.experienceLevel,
        clients: updatedTrainer.clients,
        paymentDetails: updatedTrainer.paymentDetails,
        availability: updatedTrainer.availability,
        gyms: updatedTrainer.gyms,
        phone: updatedTrainer.phone,
        ratings: updatedTrainer.ratings,
        bookings: updatedTrainer.bookings,
        payments: updatedTrainer.payments,
        createdAt: updatedTrainer.createdAt,
        updatedAt: updatedTrainer.updatedAt,
      });
    } catch (error) {
      console.error('[ERROR] Update trainer profile error:', error);
      throw new Error(TrainerErrorType.InternalServerError);
    }
  }
}