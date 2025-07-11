export interface IUpdateTrainerProfileRequestDTO {
  name?: string;
  bio?: string;
  specialties?: string[];
  profilePic?: Express.Multer.File; // Multer file object for profile picture
  upiId?: string;
  bankAccount?: string;
  ifscCode?: string;
}