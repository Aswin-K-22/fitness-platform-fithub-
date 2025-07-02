// backend/src/domain/enums/authErrorType.enum.ts
export enum AuthErrorType {
  MissingRefreshToken = 'No refresh token provided',
  InvalidRefreshToken = 'Invalid refresh token',
  InvalidRefreshTokenStructure = 'Invalid refresh token structure',
  UserNotAuthenticated = 'User not authenticated',
  NotVerified = 'User email not verified',
  InvalidOtp = 'Invalid OTP',
  OtpExpired = 'OTP expired',
  MissingRequiredFields = 'All fields are required',
  EmailSendFailed = 'Failed to send OTP. Try again later.',
  UserNotFound = 'User not found',
  MissingEmail = 'Email is required.',
  MissingOtp = 'OTP is required.',
  InvalidEmail = 'Invalid email format',
  MissingPassword = 'Password is required',
  InvalidCredentials = 'Invalid email or password',
  EmailNotVerified = 'Email not verified. Please verify your email with OTP',
  TrainerNotFound = 'Trainer not found',
  
}