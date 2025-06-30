export enum PaymentErrorType {
  MissingRequiredFields = 'Type, amount, currency, and status are required',
  InvalidAmount = 'Amount must be greater than zero',
  InvalidStatus = 'Invalid payment status',
}