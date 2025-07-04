export interface IGetUsersRequestDTO {
  page: number;
  limit: number;
  search?: string;
  membership?: string;
  isVerified?: string;
}