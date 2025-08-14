export interface INotification {
  id: string;
  userId: string;
  message: string;
  type: 'success' | 'error' | 'info';
  createdAt: string;
  read: boolean;
}

