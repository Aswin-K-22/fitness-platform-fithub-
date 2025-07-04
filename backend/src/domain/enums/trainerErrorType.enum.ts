export enum TrainerErrorType {
  InvalidEmail ='Invalid email',
  InvalidName = 'Name must be 2+ letters, no numbers or special characters',
  InvalidPassword = 'Password must be at least 5 characters',
  MissingExperienceLevel = 'Experience level is required',
  MissingSpecialties = 'At least one specialty is required',
  InvalidBio = 'Bio must be at least 5 characters',
  MissingCertifications = 'At least one certification is required',
  MissingCertificationName = 'Certification name is required',
  MissingCertificationIssuer = 'Certification issuer is required',
  MissingCertificationDate = 'Certification date earned is required',
  MissingCertificationFile = 'Certification file is required',
  TrainerAlreadyExists = 'Trainer with this email already exists',
  TrainerNotFound = 'Trainer not found',
  AlreadyVerified = 'Trainer already verified',
  AlreadyVerifiedByAdmin = 'Trainer already verified by admin',
  InvalidCredentials = 'Invalid email or password',
  NotVerified = 'Email not verified',
  NotApproved = 'Pending admin approval',
  NOT_AUTHENTICATED = 'Trainer not authenticated',
  FIND_BY_EMAIL_FAILED = 'Failed to find trainer by email',
  
  EmailNotVerified = 'EMAIL_NOT_VERIFIED',
  NotApprovedByAdmin = 'NOT_APPROVED_BY_ADMIN',
  InvalidOtp = 'INVALID_OTP',
  InvalidRefreshToken = "Invalid Refresh Token",
  NoRefreshTokenProvided = "NoRefreshTokenProvided",
  InvalidAccessToken = "InvalidAccessToken",
  NoAccessTokenProvided = "NoAccessTokenProvided",
  InvalidRequest = "InvalidRequest",
  InvalidTrainerId = 'Invalid trainer ID', // New
  FailedToFetchTrainers = 'Failed to fetch trainers',
  FailedToAssignTrainers = "FailedToAssignTrainers", // New
  

}