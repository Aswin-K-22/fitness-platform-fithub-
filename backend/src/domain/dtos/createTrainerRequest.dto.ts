import { TrainerErrorType } from '../enums/trainerErrorType.enum';

export interface ICreateTrainerRequestDTO {
  name: string;
  email: string;
  password: string;
  experienceLevel: string;
  specialties: string[];
  bio: string;
  certifications: { name: string; issuer: string; dateEarned: Date; filePath: string }[];
}

export class CreateTrainerRequestDTO {
  public name: string;
  public email: string;
  public password: string;
  public experienceLevel: string;
  public specialties: string[];
  public bio: string;
  public certifications: { name: string; issuer: string; dateEarned: Date; filePath: string }[];

  constructor(data: ICreateTrainerRequestDTO) {
    
    this.name = data.name?.trim() || '';
    this.email = data.email?.trim() || '';
    this.password = data.password?.trim() || '';
    this.experienceLevel = data.experienceLevel?.trim() || '';
   if (typeof data.specialties === 'string') {
      try {
        this.specialties = JSON.parse(data.specialties);
        if (!Array.isArray(this.specialties)) {
          this.specialties = [];
        }
      } catch (error) {
        this.specialties = [];
      }
    } else {
      this.specialties = Array.isArray(data.specialties) ? data.specialties : [];
    }
    this.bio = data.bio?.trim() || '';

    if (typeof data.certifications === 'string') {
      try {
       this.certifications = JSON.parse(data.certifications);
        if (!Array.isArray(this.certifications)) {
        this.certifications = [];
        }
      } catch (error) {
       this.certifications = [];
      }
    } else {
     this.certifications = Array.isArray(data.certifications) ? data.certifications : [];
    }

    this.validate();
  }

  private validate(): void {
    if (!this.name || !/^[a-zA-Z\s]{2,}$/.test(this.name)) {
      throw new Error(TrainerErrorType.InvalidName);
    }
    if (!this.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.email)) {
      throw new Error(TrainerErrorType.InvalidEmail);
    }
    if (!this.password || this.password.length < 5) {
      throw new Error(TrainerErrorType.InvalidPassword);
    }
    if (!this.experienceLevel) {
      throw new Error(TrainerErrorType.MissingExperienceLevel);
    }
    console.log('specilties =',this.specialties)
    if (!this.specialties.length) {
      console.log('the erro message from middlware')
      throw new Error(TrainerErrorType.MissingSpecialties);
    }
    if (!this.bio || this.bio.length < 5) {
      throw new Error(TrainerErrorType.InvalidBio);
    }
    if (!this.certifications.length) {
      throw new Error(TrainerErrorType.MissingCertifications);
    }
    this.certifications.forEach((cert, index) => {
      if (!cert.name?.trim()) throw new Error(`Certification ${index + 1}: ${TrainerErrorType.MissingCertificationName}`);
      if (!cert.issuer?.trim()) throw new Error(`Certification ${index + 1}: ${TrainerErrorType.MissingCertificationIssuer}`);
      if (!cert.dateEarned) throw new Error(`Certification ${index + 1}: ${TrainerErrorType.MissingCertificationDate}`);
    });
  }
}