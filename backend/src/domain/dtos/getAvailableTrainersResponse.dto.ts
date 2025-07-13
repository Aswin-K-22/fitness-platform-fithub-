export interface IGetAvailableTrainersResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: {
    trainers: { id: string; name: string; active: boolean }[];
  };
  error?: { code: string; message: string };
}