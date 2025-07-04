// backend/src/domain/enums/gymErrorType.enum.ts

export enum GymErrorType {
  MissingRequiredFields = 'Missing required fields',
  GymNotFound = 'Gym not found',
  InvalidFilters = 'Invalid filter parameters',
  FailedToFetchGyms = 'Failed to fetch gyms',
  DuplicateGymName = 'A gym with this name already exists',
  FailedToCreateGym = 'Failed to create gym',
  FailedToFetchTrainers = 'Failed to fetch available trainers',
  InvalidTrainerIds = 'One or more trainer IDs are invalid or unavailable',
  InvalidImageFormat = 'Only JPEG and PNG images are allowed',
  MissingImages = 'At least one image is required',
}