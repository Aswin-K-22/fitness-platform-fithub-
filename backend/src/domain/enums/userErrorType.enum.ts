export enum UserErrorType {
  MissingRequiredFields = 'Name, email, password, and role are required',
  UserAlreadyExists = 'User already exists',
  UserNotFound = 'User not found',
  UserAlreadyVerified = 'User already verified',
  InvalidCredentials = 'Invalid email or password',
}