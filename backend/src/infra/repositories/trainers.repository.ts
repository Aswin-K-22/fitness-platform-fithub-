// backend/src/infrastructure/repositories/trainers.repository.ts
import { ITrainersRepository } from '../../app/repositories/trainers.repository';
import { Trainer } from '../../domain/entities/Trainer.entity';
import { Email } from '../../domain/valueObjects/email.valueObject';
import { PrismaClient } from '@prisma/client';

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
}