import { IUpdateUserProfileRequestDTO } from '@/domain/dtos/updateUserProfileRequest.dto';
import { IUsersRepository } from '../../app/repositories/users.repository';
import { User } from '../../domain/entities/User.entity';
import { Email } from '../../domain/valueObjects/email.valueObject';
import { PrismaClient } from '@prisma/client';
import { IGetUsersRequestDTO } from '@/domain/dtos/getUsersRequest.dto';
import { UserErrorType } from '@/domain/enums/userErrorType.enum';

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

  async updateMembership(userId: string, membershipId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { membershipId },
    });
  }

async updateProfile(email: string, data: IUpdateUserProfileRequestDTO): Promise<User> {
  const updatedUser = await this.prisma.user.update({
    where: { email },
    data: {
      name: data.name,
      profilePic: data.profilePic,
      updatedAt: new Date(),
    },
    include: {
     memberships: true,
        Bookings: true,
        payments: true,
    },
  });

 return new User({
      id: updatedUser.id,
      name: updatedUser.name,
      email: new Email({ address: updatedUser.email }),
      password: updatedUser.password,
      role: updatedUser.role,
      profilePic: updatedUser.profilePic,
      isVerified: updatedUser.isVerified,
      otp: updatedUser.otp,
      otpExpires: updatedUser.otpExpires,
      refreshToken: updatedUser.refreshToken,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      fitnessProfile: updatedUser.fitnessProfile ?? null,
      progress: updatedUser.progress ?? null,
      weeklySummary: updatedUser.weeklySummary ?? null,
      memberships: updatedUser.memberships ?? null,
      Bookings: updatedUser.Bookings ?? null,
      payments: updatedUser.payments ?? null,
    });
  }

async findAllUsers({
    page,
    limit,
    search,
    membership,
    isVerified,
  }: IGetUsersRequestDTO): Promise<User[]> {
    const skip = (page - 1) * limit;
    const where: any = { role: 'user' }; // Only fetch users, not admins or trainers

    if (search) {
      where.name = { contains: search.trim(), mode: 'insensitive' };
    }
    if (membership) {
      if (membership === 'None') {
        where.membershipId = null;
        where.memberships = { none: {} };
      } else {
        where.memberships = {
          some: {
            plan: { name: membership },
            status: 'Active',
          },
        };
      }
    }
    if (isVerified !== undefined) {
      where.isVerified = isVerified === 'true';
    }

    const users = await this.prisma.user.findMany({
      where,
      skip,
      take: limit,
      include: {
        memberships: {
          select: {
            id: true,
            plan: { select: { name: true } },
            status: true,
            startDate: true,
          },
          where: {
            status: 'Active',
            ...(membership && membership !== 'None' ? { plan: { name: membership } } : {}),
          },
          orderBy: { startDate: 'desc' },
          take: 1,
        },
        
        payments: true,
        Bookings: true,
      },
    });

    return users.map(
      (user) =>
        new User({
          id: user.id,
          name: user.name,
          email: new Email({ address: user.email }),
          password: user.password,
          role: user.role,
          profilePic: user.profilePic ?? null,
          isVerified: user.isVerified ?? false,
          otp: user.otp ?? null,
          otpExpires: user.otpExpires ?? null,
          refreshToken: user.refreshToken ?? null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          membershipId: user.membershipId ?? null,
          fitnessProfile: user.fitnessProfile ?? null,
          workoutPlanId: user.workoutPlanId ?? null,
          progress: user.progress ?? null,
          weeklySummary: user.weeklySummary ?? null,
          memberships: user.memberships ?? null,
          Bookings: user.Bookings ?? null,
          payments: user.payments ?? null,
        }),
    );
  }

  async countUsers({
    search,
    membership,
    isVerified,
  }: IGetUsersRequestDTO): Promise<number> {
    const where: any = { role: 'user' };

    if (search) {
      where.name = { contains: search.trim(), mode: 'insensitive' };
    }
    if (membership) {
      if (membership === 'None') {
        where.membershipId = null;
        where.memberships = { none: {} };
      } else {
        where.memberships = {
          some: {
            plan: { name: membership },
            status: 'Active',
          },
        };
      }
    }
    if (isVerified !== undefined) {
      where.isVerified = isVerified === 'true';
    }

    return this.prisma.user.count({ where });
  }

  async toggleUserVerification(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error(UserErrorType.UserNotFound);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: !user.isVerified,
        updatedAt: new Date(),
      },
      include: {
        memberships: {
          select: {
            id: true,
            plan: { select: { name: true } },
            status: true,
            startDate: true,
          },
          where: { status: 'Active' },
          orderBy: { startDate: 'desc' },
          take: 1,
        },
      
        payments: true,
        Bookings: true,
      },
    });

    return new User({
      id: updatedUser.id,
      name: updatedUser.name,
      email: new Email({ address: updatedUser.email }),
      password: updatedUser.password,
      role: updatedUser.role,
      profilePic: updatedUser.profilePic ?? null,
      isVerified: updatedUser.isVerified ?? false,
      otp: updatedUser.otp ?? null,
      otpExpires: updatedUser.otpExpires ?? null,
      refreshToken: updatedUser.refreshToken ?? null,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      membershipId: updatedUser.membershipId ?? null,
      fitnessProfile: updatedUser.fitnessProfile ?? null,
      workoutPlanId: updatedUser.workoutPlanId ?? null,
      progress: updatedUser.progress ?? null,
      weeklySummary: updatedUser.weeklySummary ?? null,
      memberships: updatedUser.memberships ?? null,
      Bookings: updatedUser.Bookings ?? null,
      payments: updatedUser.payments ?? null,
    });
  }

}