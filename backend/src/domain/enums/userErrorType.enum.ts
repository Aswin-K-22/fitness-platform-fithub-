export enum UserErrorType {
  MissingRequiredFields = 'Name, email, password, and role are required',
  UserAlreadyExists = 'User already exists',
  UserNotFound = 'User not found',
  UserAlreadyVerified = 'User already verified',
  InvalidCredentials = 'Invalid email or password',
  InvalidOTP = 'Invalid OTP',
  InvalidName = 'INVALID_NAME',  
  InvalidNameFormat = 'INVALID_NAME_FORMAT',  
  NoValidFieldsProvided = 'NO_VALID_FIELDS_PROVIDED',  
  UpdateProfileFailed = 'UPDATE_PROFILE_FAILED',  
  UserNotVerified = 'User Not Verified',
  InvalidPassword  ='Invalid Password ',
  InvalidRole = "InvalidRole",
  NoAccessToken = "NoAccessToken",
  NoRefreshToken = "NoRefreshToken"
}