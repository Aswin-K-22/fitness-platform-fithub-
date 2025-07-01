export enum MembershipErrorType {
  MissingRequiredFields = 'User ID, plan ID, status, start date, and end date are required',
  InvalidStatus = 'Invalid membership status',
  InvalidDateRange = 'Start date must be before end date',
  AlreadyActive = 'Membership is already active',
  PlanNotFound = 'PLAN_NOT_FOUND',
  InvalidPaginationParams = 'INVALID_PAGINATION',
  InternalServerError = 'INTERNAL_SERVER_ERROR',
}