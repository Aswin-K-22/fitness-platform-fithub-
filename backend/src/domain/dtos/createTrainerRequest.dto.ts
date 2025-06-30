export interface ICreateTrainerRequestDTO {
  name: string;
  email: string;
  password: string;
  specialties: string[];
  experienceLevel: string;
  bio: string;
  certifications: {
    name: string;
    issuer: string;
    dateEarned: Date;
    filePath: string;
  }[];
}