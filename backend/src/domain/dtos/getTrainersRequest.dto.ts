export interface IGetTrainersRequestDTO {
  page?: number;
  limit?: number;
  search?: string;
  status?: string; // 'Pending' or 'Approved'
  specialization?: string;
}