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
  UserNotFound = 'User not found'
}