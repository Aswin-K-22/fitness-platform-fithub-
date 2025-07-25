// src/types/dtos/IClientInteractionDTO.ts
export interface IClient {
  id: string;
  name: string;
  avatar: string;
  status: 'Active' | 'Pending' | 'Inactive';
  lastSession: string;
  progress: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface IMessage {
  id: string;
  sender: 'trainer' | 'client';
  content: string;
  timestamp: string;
}

export interface IClientFeedback {
  rating: number;
  weightChange: string;
  strengthNote: string;
  energyNote: string;
}

export interface IClientSession {
  id: string;
  title: string;
  time: string;
}

export interface IClientInteractionDTO {
  clients: IClient[];
  selectedClient: IClient | null;
  messages: IMessage[];
  feedback: IClientFeedback | null;
  sessions: IClientSession[];
}