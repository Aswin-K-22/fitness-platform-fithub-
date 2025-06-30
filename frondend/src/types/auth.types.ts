
export interface UserAuth {
  id: string;
  email?: string;
  name?: string;
  role?: 'user' | 'admin' | 'trainer';
  profilePic?: string | null;
  isVerified?: boolean;
}
export interface TrainerAuth extends UserAuth {
  verifiedByAdmin?: boolean;
}