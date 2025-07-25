// backend/src/domain/entities/Trainer.entity.ts
import { Email } from '../valueObjects/email.valueObject';
import { TrainerErrorType } from '../enums/trainerErrorType.enum';
import { ICreateTrainerRequestDTO } from '../dtos/createTrainerRequest.dto';
import { AuthErrorType } from '../enums/authErrorType.enum';
import { TrainerResponseDTO } from '../dtos/getTrainersResponse.dto';

// Interface definitions (unchanged from your original)
interface Certification {
  name: string;
  issuer: string;
  dateEarned: Date;
  filePath: string;
}

interface Client {
  userId: string;
  membershipId: string | null;
  startDate: Date;
  active: boolean;
}

interface PaymentDetails {
  method: string | null;
  rate: number | null;
  currency: string | null;
  paymentHistory: PaymentHistory[];
  upiId: string | null;
  bankAccount: string | null;
  ifscCode: string | null;
}

interface PaymentHistory {
  paymentId: string;
  amount: number;
  date: Date;
  periodStart: Date | null;
  periodEnd: Date | null;
  clientCount: number | null;
  hoursWorked: number | null;
}

interface Availability {
  day: string;
  startTime: string;
  endTime: string;
}

interface Ratings {
  average: number | null;
  count: number | null;
  reviews: Review[];
}

interface Review {
  userId: string;
  rating: number;
  comment: string | null;
  date: Date;
}

interface Booking {
  id: string;
}

interface Payment {
  id: string;
}

interface TrainerProps {
  id?: string;
  name: string;
  email: Email;
  password: string;
  role: string;
  profilePic: string | null;
  isVerified: boolean;
  verifiedByAdmin: boolean;
  otp: string | null;
  otpExpires: Date | null;
  refreshToken: string | null;
  personalDetails: any | null;
  certifications: Certification[];
  bio: string | null;
  specialties: string[];
  experienceLevel: string | null;
  clients: Client[];
  paymentDetails: PaymentDetails | null;
  availability: Availability[];
  gyms: string[];
  phone: string | null;
  ratings: Ratings | null;
  bookings: Booking[];
  payments: Payment[];
  createdAt: Date;
  updatedAt: Date;
}

export class Trainer {
  private _id?: string;
  private _name: string;
  private _email: Email;
  private _password: string;
  private _role: string;
  private _profilePic: string | null;
  private _isVerified: boolean;
  private _verifiedByAdmin: boolean;
  private _otp: string | null;
  private _otpExpires: Date | null;
  private _refreshToken: string | null;
  private _personalDetails: any | null;
  private _certifications: Certification[];
  private _bio: string | null;
  private _specialties: string[];
  private _experienceLevel: string | null;
  private _clients: Client[];
  private _paymentDetails: PaymentDetails | null;
  private _availability: Availability[];
  private _gyms: string[];
  private _phone: string | null;
  private _ratings: Ratings | null;
  private _bookings: Booking[];
  private _payments: Payment[];
  private _createdAt: Date;
  private _updatedAt: Date;

  static create(props: ICreateTrainerRequestDTO): Trainer {
    if (!props.name?.trim() || !/^[a-zA-Z\s]{2,}$/.test(props.name.trim())) {
      throw new Error(TrainerErrorType.InvalidName);
    }
    if (!props.password?.trim() || props.password.trim().length < 5) {
      throw new Error(TrainerErrorType.InvalidPassword);
    }
    if (!props.experienceLevel?.trim()) {
      throw new Error(TrainerErrorType.MissingExperienceLevel);
    }
    if (!props.specialties?.length) {
      throw new Error(TrainerErrorType.MissingSpecialties);
    }
    if (!props.bio?.trim() || props.bio.trim().length < 5) {
      throw new Error(TrainerErrorType.InvalidBio);
    }
    if (!props.certifications?.length) {
      throw new Error(TrainerErrorType.MissingCertifications);
    }
    props.certifications.forEach((cert, i) => {
      if (!cert.name?.trim()) throw new Error(`Certification ${i + 1}: ${TrainerErrorType.MissingCertificationName}`);
      if (!cert.issuer?.trim()) throw new Error(`Certification ${i + 1}: ${TrainerErrorType.MissingCertificationIssuer}`);
      if (!cert.dateEarned) throw new Error(`Certification ${i + 1}: ${TrainerErrorType.MissingCertificationDate}`);
      if (!cert.filePath) throw new Error(`Certification ${i + 1}: ${TrainerErrorType.MissingCertificationFile}`);
    });

    try {
      const email = new Email({ address: props.email });
      return new Trainer({
        name: props.name.trim(),
        email,
        password: props.password.trim(),
        role: 'trainer',
        specialties: props.specialties,
        experienceLevel: props.experienceLevel.trim(),
        bio: props.bio.trim(),
        certifications: props.certifications,
        isVerified: false,
        verifiedByAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        profilePic: null,
        personalDetails: null,
        clients: [],
        paymentDetails: null,
        availability: [],
        gyms: [],
        phone: null,
        ratings: null,
        bookings: [],
        payments: [],
        otp: null,
        otpExpires: null,
        refreshToken: null,
      });
    } catch (error) {
      throw new Error(TrainerErrorType.InvalidEmail);
    }
  }

  // Getters
  get id(): string | null {
    return this._id ?? null;
  }

  get name(): string {
    return this._name;
  }

  get email(): Email {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get role(): string {
    return this._role;
  }

  get profilePic(): string | null {
    return this._profilePic;
  }

  get isVerified(): boolean {
    return this._isVerified;
  }

  get verifiedByAdmin(): boolean {
    return this._verifiedByAdmin;
  }

  get otp(): string | null {
    return this._otp;
  }

  get otpExpires(): Date | null {
    return this._otpExpires;
  }

  get refreshToken(): string | null {
    return this._refreshToken;
  }

  get personalDetails(): any | null {
    return this._personalDetails;
  }

  get certifications(): Certification[] {
    return this._certifications;
  }

  get bio(): string | null {
    return this._bio;
  }

  get specialties(): string[] {
    return this._specialties;
  }

  get experienceLevel(): string | null {
    return this._experienceLevel;
  }

  get clients(): Client[] {
    return this._clients;
  }

  get paymentDetails(): PaymentDetails | null {
    return this._paymentDetails;
  }

  get availability(): Availability[] {
    return this._availability;
  }

  get gyms(): string[] {
    return this._gyms;
  }

  get phone(): string | null {
    return this._phone;
  }

  get ratings(): Ratings | null {
    return this._ratings;
  }

  get bookings(): Booking[] {
    return this._bookings;
  }

  get payments(): Payment[] {
    return this._payments;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Enhanced toJSON() method for robust serialization
  toJSON(): TrainerResponseDTO {
    return {
      id: this.id ?? '',
      name: this.name,
      email: this.email.address,
      specialties: this.specialties,
      experienceLevel: this.experienceLevel,
      verifiedByAdmin: this.verifiedByAdmin,
      isVerified: this.isVerified,
      profilePic: this.profilePic,
      certifications: this.certifications,
      bio: this.bio,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
        
  
    };
  }

  // Methods
  updateOtp(otp: string, expires: Date): void {
    this._otp = otp;
    this._otpExpires = expires;
    this._updatedAt = new Date();
  }

  verify(): void {
    if (this._isVerified) {
      throw new Error(TrainerErrorType.AlreadyVerified);
    }
    if (this._otpExpires && this._otpExpires < new Date()) {
      throw new Error(AuthErrorType.OtpExpired);
    }
    this._isVerified = true;
    this._otp = null;
    this._otpExpires = null;
    this._updatedAt = new Date();
  }

  verifyByAdmin(): void {
    if (this._verifiedByAdmin) {
      throw new Error(TrainerErrorType.AlreadyVerifiedByAdmin);
    }
    this._verifiedByAdmin = true;
    this._updatedAt = new Date();
  }

  updateRefreshToken(token: string): void {
    this._refreshToken = token;
    this._updatedAt = new Date();
  }

  constructor(props: TrainerProps) {
    this._id = props.id;
    this._name = props.name;
    this._email = props.email;
    this._password = props.password;
    this._role = props.role;
    this._profilePic = props.profilePic ?? null;
    this._isVerified = props.isVerified ?? false;
    this._verifiedByAdmin = props.verifiedByAdmin ?? false;
    this._otp = props.otp ?? null;
    this._otpExpires = props.otpExpires ?? null;
    this._refreshToken = props.refreshToken ?? null;
    this._personalDetails = props.personalDetails ?? null;
    this._certifications = props.certifications ?? [];
    this._bio = props.bio ?? null;
    this._specialties = props.specialties ?? [];
    this._experienceLevel = props.experienceLevel ?? null;
    this._clients = props.clients ?? [];
    this._paymentDetails = props.paymentDetails ?? null;
    this._availability = props.availability ?? [];
    this._gyms = props.gyms ?? [];
    this._phone = props.phone ?? null;
    this._ratings = props.ratings ?? null;
    this._bookings = props.bookings ?? [];
    this._payments = props.payments ?? [];
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }
}