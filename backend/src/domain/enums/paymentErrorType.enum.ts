export enum PaymentErrorType {
  MissingRequiredFields = 'Type, amount, currency, and status are required',
  InvalidAmount = 'Amount must be greater than zero',
  InvalidStatus = 'Invalid payment status',
  PlanNotFound = 'Membership plan not found',
  UserNotFound = 'User not found',
  PaymentNotFound = 'Payment not found',
  InvalidPaymentSignature = 'Invalid payment signature',
  PaymentInitiationFailed = 'Failed to initiate payment',
  PaymentVerificationFailed = 'Failed to verify payment',
}