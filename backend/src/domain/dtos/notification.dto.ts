export interface INotificationDTO {
  id: string;
  userId: string;
  message: string;
  type: 'success' | 'error' | 'info';
  createdAt: Date;
  read: boolean;
}

export interface INotificationResponseDTO {
  success: boolean;
  status: number;
  message: string;
  data: INotificationDTO;
}