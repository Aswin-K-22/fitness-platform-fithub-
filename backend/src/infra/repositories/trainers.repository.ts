// backend/src/infra/repositories/trainers.repository.ts
import { Prisma, PrismaClient } from '@prisma/client';
import { Trainer } from '@/domain/entities/Trainer.entity';
import { ITrainersRepository } from '@/app/repositories/trainers.repository';
import { BaseRepository } from './base.repository';
import { Email } from '@/domain/valueObjects/email.valueObject';
import { IUpdateTrainerProfileUseCaseDTO } from '@/domain/dtos/updateTrainerProfileResponse.dto';

export class TrainersRepository
  extends BaseRepository<Trainer>
  implements ITrainersRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma, 'trainer');
  }

  protected toDomain(record: any): Trainer {
    return new Trainer({
      id: record.id,
      name: record.name,
      email:new Email({ address: record.email }),
      password: record.password,
      role: record.role,
      profilePic: record.profilePic,
      isVerified: record.isVerified,
      verifiedByAdmin: record.verifiedByAdmin,
      otp: record.otp,
      otpExpires: record.otpExpires,
      refreshToken: record.refreshToken,
      personalDetails: record.personalDetails,
      certifications: record.certifications,
      bio: record.bio,
      specialties: record.specialties,
      experienceLevel: record.experienceLevel,
      clients: record.clients,
      paymentDetails: record.paymentDetails,
      availability: record.availability,
      gyms: record.gyms,
      phone: record.phone,
      ratings: record.ratings,
      bookings: record.bookings,
      payments: record.payments,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<Trainer | null> {
    const trainer = await this.prisma.trainer.findUnique({ where: { email } });
    console.log('[DEBUG] Trainer email from DB:infra/repostry/traienerrepo - findByEmail', trainer?.email);
    return trainer ? this.toDomain(trainer) : null;
  }

  async signupTrainer(trainer: Trainer): Promise<Trainer> {
    const created =await this.prisma.trainer.create({
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

    return this.toDomain(created);
  }

  async updateOtp(email: string, otp: string): Promise<void> {
    await this.prisma.trainer.update({
      where: { email },
      data: { otp, otpExpires: new Date(Date.now() + 30 * 1000) },
    });
  }

  async verifyTrainer(email: string): Promise<void> {
    await this.prisma.trainer.update({
      where: { email },
      data: { isVerified: true, otp: null, otpExpires: null },
    });
  }

  async updateRefreshToken(email: string, refreshToken: string | null): Promise<void> {
    await this.prisma.trainer.update({ where: { email }, data: { refreshToken } });
  }


  async findAllWithFilters(
    skip: number,
    take: number,
    search?: string,
    status?: string,
    specialization?: string
  ): Promise<Trainer[]> {
    try {
      console.log('findAllWithFilters - Input parameters:', { skip, take, search, status, specialization });

      if (skip < 0 || take <= 0) {
        console.error('Invalid pagination parameters:', { skip, take });
        throw new Error('Invalid skip or take values');
      }

      const where: Prisma.TrainerWhereInput = { role: 'trainer' };

      // Apply status filter
      if (status) {
        if (status === 'Approved') {
          where.verifiedByAdmin = true;
          where.isVerified = true;
        } else if (status === 'Pending') {
          where.verifiedByAdmin = false;
          where.isVerified = true;
        } else if (status === 'Suspended') {
          where.isVerified = false;
        }
      }

      // Apply specialization filter
      if (specialization) {
        where.specialties = { has: specialization };
      }

      let trainers: any[] = [];
      if (search) {
        // Fetch trainers with name starting with search term
        const startsWithTrainers = await this.prisma.trainer.findMany({
          where: {
            ...where,
            name: { startsWith: search, mode: 'insensitive' },
          },
          orderBy: { name: 'asc' },
          skip,
          take,
        }).catch((error: any) => {
          console.error('Error fetching startsWith trainers:', error);
          throw new Error(`StartsWith query failed: ${error.message}`);
        });
        console.log('StartsWith trainers:', startsWithTrainers.length);

        // Fetch trainers with name containing search term, excluding those in startsWith
        const containsTrainers = await this.prisma.trainer.findMany({
          where: {
            ...where,
            name: { contains: search, mode: 'insensitive' },
            NOT: startsWithTrainers.map((trainer: any) => ({ id: trainer.id })),
          },
          orderBy: { name: 'asc' },
          skip: startsWithTrainers.length >= take ? 0 : skip,
          take: take - startsWithTrainers.length,
        }).catch((error: any) => {
          console.error('Error fetching contains trainers:', error);
          throw new Error(`Contains query failed: ${error.message}`);
        });
        console.log('Contains trainers:', containsTrainers.length);

        trainers = [...startsWithTrainers, ...containsTrainers].slice(0, take);
      } else {
        trainers = await this.prisma.trainer.findMany({
          where,
          orderBy: { name: 'asc' },
          skip,
          take,
        }).catch((error: any) => {
          console.error('Error fetching all trainers:', error);
          throw new Error(`Prisma query failed: ${error.message}`);
        });
        console.log('All trainers (no search):', trainers.length);
      }

      const transformedTrainers = trainers.map((trainer) => {
        try {
          const transformed = this.toDomain(trainer);
          console.log('Transformed trainer:', transformed);
          return transformed;
        } catch (transformError) {
          console.error('Error transforming trainer record:', trainer, transformError);
          throw transformError;
        }
      });

      console.log('Final trainers returned:', transformedTrainers.length);
      return transformedTrainers;
    } catch (error) {
      console.error('findAllWithFilters failed:', error);
      throw new Error(`Failed to fetch trainers: ${error}`);
    }
  }
  
async findAll(skip: number, take: number, search?: string, status?: string, specialization?: string): Promise<Trainer[]> {
    // Call the new method to respect filters
    return this.findAllWithFilters(skip, take, search, status, specialization);
  }

  async findAvailableTrainers() {
    const trainers = await this.prisma.trainer.findMany({
      where: { gyms: { isEmpty: true }, verifiedByAdmin: true },
      select: { id: true, name: true, verifiedByAdmin: true },
    });
   return trainers.map((t: { id: string; name: string; verifiedByAdmin: boolean }) => ({
    id: t.id,
    name: t.name,
    active: t.verifiedByAdmin,
  }));
  }

  async checkTrainerAvailability(trainerIds: string[]) {
    const trainers = await this.prisma.trainer.findMany({
      where: { id: { in: trainerIds }, verifiedByAdmin: true, gyms: { isEmpty: true } },
      select: { id: true },
    });
const validIds = trainers.map((t: { id: string }) => t.id);

    const invalid = trainerIds.filter((id) => !validIds.includes(id));
    return { isValid: invalid.length === 0, message: invalid.length ? `Invalid IDs: ${invalid.join(',')}` : undefined };
  }

  async assignTrainersToGym(trainerIds: string[], gymId: string): Promise<void> {
    await this.prisma.trainer.updateMany({ where: { id: { in: trainerIds } }, data: { gyms: { push: gymId } } });
  }

  async toggleApproval(trainerId: string, verifiedByAdmin: boolean): Promise<Trainer> {
    const updated = await this.prisma.trainer.update({ where: { id: trainerId }, data: { verifiedByAdmin } });
    return this.toDomain(updated);
  }

async count(search?: string, status?: string, specialization?: string): Promise<number> {
    const where: Prisma.TrainerWhereInput = { role: 'trainer' };

    // Apply status filter
    if (status) {
      if (status === 'Approved') {
        where.verifiedByAdmin = true;
        where.isVerified = true;
      } else if (status === 'Pending') {
        where.verifiedByAdmin = false;
        where.isVerified = true;
      } else if (status === 'Suspended') {
        where.isVerified = false;
      }
    }

    // Apply specialization filter
    if (specialization) {
      where.specialties = { has: specialization };
    }

    // Apply search filter
    if (search) {
      where.OR = [
        { name: { startsWith: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.trainer.count({ where });
  }

  async countPending(): Promise<number> {
    return this.prisma.trainer.count({ where: { role: 'trainer', verifiedByAdmin: false } });
  }

  async countApproved(): Promise<number> {
    return this.prisma.trainer.count({ where: { role: 'trainer', verifiedByAdmin: true } });
  }

  async countSuspended(): Promise<number> {
    return this.prisma.trainer.count({ where: { role: 'trainer', isVerified: false } });
  }

 async updateProfile(trainerId: string, data: IUpdateTrainerProfileUseCaseDTO): Promise<Trainer> {
  const existingTrainer = await this.prisma.trainer.findUnique({
      where: { id: trainerId },
      select: { paymentDetails: true },
    });

    // Merge existing paymentDetails (if any) with new values
    const updatedPaymentDetails = {
      method: existingTrainer?.paymentDetails?.method ?? null,
      rate: existingTrainer?.paymentDetails?.rate ?? null,
      currency: existingTrainer?.paymentDetails?.currency ?? null,
      paymentHistory: existingTrainer?.paymentDetails?.paymentHistory ?? [],
      upiId: data.upiId,
      bankAccount: data.bankAccount,
      ifscCode: data.ifscCode,
    };

    const updated = await this.prisma.trainer.update({
      where: { id: trainerId },
      data: {
        name: data.name,
        bio: data.bio,
        specialties: data.specialties,
        profilePic: data.profilePic,
        paymentDetails: updatedPaymentDetails,
        updatedAt: new Date(),
      },
    });

    return this.toDomain(updated);
  }
}