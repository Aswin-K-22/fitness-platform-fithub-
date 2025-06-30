import { IUsersRepository } from '../../app/repositories/users.repository';
import { User } from '../../domain/entities/User.entity';
import { Email } from '../../domain/valueObjects/email.valueObject';
import { PrismaClient } from '@prisma/client';

export class UsersRepository implements IUsersRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return new User({
      id: user.id,
      name: user.name,
      email: new Email({ address: user.email }),
      password: user.password,
      role: user.role,
      profilePic: user.profilePic,
      isVerified: user.isVerified,
      otp: user.otp,
      otpExpires: user.otpExpires,
      refreshToken: user.refreshToken,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return new User({
      id: user.id,
      name: user.name,
      email: new Email({ address: user.email }),
      password: user.password,
      role: user.role,
      profilePic: user.profilePic,
      isVerified: user.isVerified,
      otp: user.otp,
      otpExpires: user.otpExpires,
      refreshToken: user.refreshToken,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async create(user: User): Promise<User> {
    const createdUser = await this.prisma.user.create({
      data: {
       
        name: user.name,
        email: user.email.address,
        password: user.password,
        role: user.role,
        profilePic: user.profilePic,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
    return new User({
      id: createdUser.id,
      name: createdUser.name,
      email: new Email({ address: createdUser.email }),
      password: createdUser.password,
      role: createdUser.role,
      profilePic: createdUser.profilePic,
      isVerified: createdUser.isVerified,
      otp: createdUser.otp,
      otpExpires: createdUser.otpExpires,
      refreshToken: createdUser.refreshToken,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    });
  }


  async createWithOtp(user: User, otp: string): Promise<User> {
    return this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: user.name,
          email: user.email.address,
          password: user.password,
          role: user.role,
          profilePic: user.profilePic,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });

      await tx.user.update({
        where: { email: user.email.address },
        data: { otp, otpExpires: new Date(Date.now() + 30 * 1000) },
      });

      return new User({
        id: createdUser.id,
        name: createdUser.name,
        email: new Email({ address: createdUser.email }),
        password: createdUser.password,
        role: createdUser.role,
        profilePic: createdUser.profilePic,
        isVerified: createdUser.isVerified,
        otp: createdUser.otp,
        otpExpires: createdUser.otpExpires,
        refreshToken: createdUser.refreshToken,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
      });
    });
  }
  async updateOtp(email: string, otp: string): Promise<void> {
    await this.prisma.user.update({
      where: { email },
      data: { otp, otpExpires: new Date(Date.now() + 30 * 1000) }, // 30 seconds expiry
    });
  }

  async verifyUser(email: string): Promise<void> {
    await this.prisma.user.update({
      where: { email },
      data: { isVerified: true, otp: null, otpExpires: null },
    });
  }

  async updateRefreshToken(email: string, refreshToken: string | null): Promise<void> {
    await this.prisma.user.update({
      where: { email },
      data: { refreshToken },
    });
  }

  async updatePassword(email: string, newPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { email },
      data: { password: newPassword },
    });
  }
}