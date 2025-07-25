// backend/src/infra/repositories/users.repository.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { User } from '@/domain/entities/User.entity';
import { IUsersRepository } from '@/app/repositories/users.repository';
import { BaseRepository } from './base.repository';
import { Email } from '@/domain/valueObjects/email.valueObject';

export class UsersRepository extends BaseRepository<User> implements IUsersRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'user');
  }

  protected toDomain(record: any): User {
    return new User({
      id: record.id,
      name: record.name,
      email: new Email({ address: record.email }),
      password: record.password,
      role: record.role,
      profilePic: record.profilePic,
      isVerified: record.isVerified,
      otp: record.otp,
      otpExpires: record.otpExpires,
      refreshToken: record.refreshToken,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async createWithOtp(user: User, otp: string): Promise<User> {
 return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.user.create({
        data: {
          name: user.name,
          email: user.email.address,
          password : user.password,
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
      return this.toDomain(created);
    });
  }

  async updateOtp(email: string, otp: string): Promise<void> {
    await this.prisma.user.update({
      where: { email },
      data: { otp, otpExpires: new Date(Date.now() + 30 * 1000) },
    });
  }

  async verifyUser(email: string): Promise<void> {
    await this.prisma.user.update({
      where: { email },
      data: { isVerified: true, otp: null, otpExpires: null },
    });
  }

  async updateRefreshToken(email: string, refreshToken: string | null): Promise<void> {
    await this.prisma.user.update({ where: { email }, data: { refreshToken } });
  }

  async updatePassword(email: string, newPassword: string): Promise<void> {
    await this.prisma.user.update({ where: { email }, data: { password: newPassword } });
  }

  async updateMembership(userId: string, membershipId: string): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { membershipId } });
  }

  async updateProfile(email: string, data: any): Promise<User> {
    const updated = await this.prisma.user.update({ where: { email }, data });
    return this.toDomain(updated);
  }

  async findAllUsers(params: any): Promise<User[]> {
    const skip = (params.page - 1) * params.limit;
    const where: any = { role: 'user' };
    if (params.search) where.name = { contains: params.search.trim(), mode: 'insensitive' };
    if (params.membership) {
      if (params.membership === 'None') {
        where.membershipId = null;
      } else {
        where.memberships = {
          some: { plan: { name: params.membership }, status: 'Active' },
        };
      }
    }
    if (params.isVerified !== undefined) where.isVerified = params.isVerified === 'true';

    const users = await this.prisma.user.findMany({ where, skip, take: params.limit });
    return users.map(this.toDomain);
  }

  async countUsers(params: any): Promise<number> {
    const where: any = { role: 'user' };
    if (params.search) where.name = { contains: params.search.trim(), mode: 'insensitive' };
    if (params.membership) {
      if (params.membership === 'None') {
        where.membershipId = null;
      } else {
        where.memberships = {
          some: { plan: { name: params.membership }, status: 'Active' },
        };
      }
    }
    if (params.isVerified !== undefined) where.isVerified = params.isVerified === 'true';
    return this.prisma.user.count({ where });
  }

  async toggleUserVerification(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isVerified: !user.isVerified },
    });
    return this.toDomain(updated);
  }
}