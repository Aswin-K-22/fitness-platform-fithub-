import { Email } from "../valueObjects/email.valueObject";

interface FitnessProfile {
  goals: string[];
  weight?: number | null; // Changed from number | undefined
  height?: number | null; // Changed from number | undefined
  level?: string | null; // Changed from string | undefined
  calorieGoal?: number | null; // Changed from number | undefined
  updatedAt?: Date | null; // Changed from Date | undefined
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

interface Booking {
  id: string; // String @db.ObjectId in Prisma
}

interface Payment {
  id: string; // String @db.ObjectId in Prisma
}

export interface UserProfileDataDTO {
  id: string | null;
  name: string;
  email: string| null;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
  otp?: string | null;
  otpExpires?: Date | null;
  isVerified?: boolean;
  refreshToken?: string | null;
  profilePic?: string | null;
  membershipId?: string | null;
  fitnessProfile: FitnessProfile | {}; // Updated to align with null
  workoutPlanId?: string | null;
  progress?: Progress[] | null; // Updated to align with null
  weeklySummary?: WeeklySummary[] | null; // Updated to align with null
  memberships?: Membership[] | null; // Updated to align with null
  Bookings?: Booking[] | null; // Updated to align with null
  payments?: Payment[] | null; // Updated to align with null
}
