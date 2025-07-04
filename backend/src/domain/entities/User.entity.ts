import { Email } from '../valueObjects/email.valueObject';
import { UserErrorType } from '../enums/userErrorType.enum';
import { ICreateUserRequestDTO } from '../dtos/createUserRequest.dto';
import { AuthErrorType } from '../enums/authErrorType.enum';

// Interface for FitnessProfile as per Prisma schema
interface FitnessProfile {
  goals: string[];
  weight?: number | null; 
  height?: number | null; 
  level?: string | null; 
  calorieGoal?: number | null; 
  updatedAt?: Date | null; 
}

// Interface for Progress as per Prisma schema
interface Progress {
  workoutDate: Date;
  planId: string;
  exercisesCompleted: ExerciseCompleted[];
  totalDuration?: number | null; // Changed from number | undefined
  totalCaloriesBurned?: number | null; // Changed from number | undefined
  dailyDifficulty?: string | null; // Changed from string | undefined
}

// Interface for ExerciseCompleted as per Prisma schema
interface ExerciseCompleted {
  exerciseId: string; // String @db.ObjectId in Prisma, non-optional
  name: string; // String in Prisma, non-optional
  sets?: number | null; // Changed from number | undefined
  reps?: number | null; // Changed from number | undefined
  weight?: number | null; // Changed from number | undefined
  duration?: number | null; // Changed from number | undefined
  difficulty?: string | null; // Changed from string | undefined
  caloriesBurned?: number | null; // Changed from number | undefined
}

// Interface for WeeklySummary as per Prisma schema
interface WeeklySummary {
  weekStart: Date;
  weekEnd: Date;
  totalCaloriesBurned?: number | null; // Changed from number | undefined
  weeklyDifficulty?: string | null; // Changed from string | undefined
}

// Interface for Membership, Booking, and Payment to match Prisma relations
interface Membership {
  id: string; // String @db.ObjectId in Prisma
}

// ... other imports and interfaces

interface Membership {
  id: string;
  plan?: { name: string } | null;
  status?: string | null;
  startDate?: Date | null;
}

interface Booking {
  id: string; // String @db.ObjectId in Prisma
}

interface Payment {
  id: string; // String @db.ObjectId in Prisma
}

interface UserProps {
  id?: string;
  name: string;
  email: Email;
  password: string | null;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
  otp?: string | null;
  otpExpires?: Date | null;
  isVerified?: boolean;
  refreshToken?: string | null;
  profilePic?: string | null;
  membershipId?: string | null;
  fitnessProfile?: FitnessProfile | null; 
  workoutPlanId?: string | null;
  progress?: Progress[] | null; 
  weeklySummary?: WeeklySummary[] | null; 
  memberships?: Membership[] | null; 
  Bookings?: Booking[] | null; 
  payments?: Payment[] | null; 
}

export class User {
  private _id?: string;
  private _name: string;
  private _email: Email;
  private _password: string | null;
  private _role: string;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _otp: string | null;
  private _otpExpires: Date | null;
  private _isVerified: boolean;
  private _refreshToken: string | null;
  private _profilePic: string | null;
  private _membershipId: string | null;
  private _fitnessProfile: FitnessProfile | null;
  private _workoutPlanId: string | null;
  private _progress: Progress[] | null; // Updated to align with null
  private _weeklySummary: WeeklySummary[] | null; // Updated to align with null
  private _memberships: Membership[] | null; // Updated to align with null
  private _Bookings: Booking[] | null; // Updated to align with null
  private _payments: Payment[] | null; // Updated to align with null

  // Static method to create a new user
  static create({ name, email, password }: ICreateUserRequestDTO): User {
    if (!name || !email) {
      throw new Error(UserErrorType.MissingRequiredFields);
    }

    try {
      const emailVO = new Email({ address: email });
      return new User({
        name,
        email: emailVO,
        password,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerified: false,
        otp: null,
        otpExpires: null,
        refreshToken: null,
        profilePic: null,
        membershipId: null,
        fitnessProfile: null,
        workoutPlanId: null,
        progress: null, // Updated to align with null
        weeklySummary: null, // Updated to align with null
        memberships: null, // Updated to align with null
        Bookings: null, // Updated to align with null
        payments: null, // Updated to align with null
      });
    } catch (error) {
      throw new Error(UserErrorType.InvalidCredentials);
    }
  }

  // Getters
  get id(): string | null {
    return this._id || null;
  }

  get name(): string {
    return this._name;
  }

  get email(): Email {
    return this._email;
  }

  get password(): string | null {
    return this._password;
  }

  get role(): string {
    return this._role;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get otp(): string | null {
    return this._otp;
  }

  get otpExpires(): Date | null {
    return this._otpExpires;
  }

  get isVerified(): boolean {
    return this._isVerified;
  }

  get refreshToken(): string | null {
    return this._refreshToken;
  }

  get profilePic(): string | null {
    return this._profilePic;
  }

  get membershipId(): string | null {
    return this._membershipId;
  }

  get fitnessProfile(): FitnessProfile | null {
    return this._fitnessProfile;
  }

  get workoutPlanId(): string | null {
    return this._workoutPlanId;
  }

  get progress(): Progress[] | null {
    return this._progress;
  }

  get weeklySummary(): WeeklySummary[] | null {
    return this._weeklySummary;
  }

  get memberships(): Membership[] | null {
    return this._memberships;
  }

  get Bookings(): Booking[] | null {
    return this._Bookings;
  }

  get payments(): Payment[] | null {
    return this._payments;
  }

  // Methods to update OTP and verification status
  updateOtp(otp: string, expires: Date): void {
    this._otp = otp;
    this._otpExpires = expires;
    this._updatedAt = new Date();
  }

  verify(): void {
    if (this._isVerified) {
      throw new Error(UserErrorType.UserAlreadyVerified);
    }
    if (this._otpExpires && this._otpExpires < new Date()) {
      throw new Error(AuthErrorType.OtpExpired);
    }
    this._isVerified = true;
    this._otp = null;
    this._otpExpires = null;
    this._updatedAt = new Date();
  }

  updateRefreshToken(token: string): void {
    this._refreshToken = token;
    this._updatedAt = new Date();
  }

  constructor(props: UserProps) {
    this._id = props.id;
    this._name = props.name;
    this._email = props.email;
    this._password = props.password;
    this._role = props.role;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
    this._otp = props.otp ?? null;
    this._otpExpires = props.otpExpires ?? null;
    this._isVerified = props.isVerified ?? false;
    this._refreshToken = props.refreshToken ?? null;
    this._profilePic = props.profilePic ?? null;
    this._membershipId = props.membershipId ?? null;
    this._fitnessProfile = props.fitnessProfile ?? null;
    this._workoutPlanId = props.workoutPlanId ?? null;
    this._progress = props.progress ?? null; // Updated to align with null
    this._weeklySummary = props.weeklySummary ?? null; // Updated to align with null
    this._memberships = props.memberships ?? null; // Updated to align with null
    this._Bookings = props.Bookings ?? null; // Updated to align with null
    this._payments = props.payments ?? null; // Updated to align with null
  }
}