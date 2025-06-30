// src/domain/dtos/ITrainerDashboardResponseDTO.ts
export interface ITrainerDashboardResponseDTO {
    stats: {
      todaysSessions: string;
      activeClients: string;
      monthlyEarnings: string;
      averageRating: string;
    };
    sessions: {
      name: string;
      type: string;
      time: string;
      avatar: string;
    }[];
    notifications: {
      icon: string;
      text: string;
      time: string;
      color: string;
    }[];
    chats: {
      name: string;
      status: string;
      avatar: string;
    }[];
    performance: {
      days: string[];
      sessions: number[];
      revenue: number[];
    };
  }