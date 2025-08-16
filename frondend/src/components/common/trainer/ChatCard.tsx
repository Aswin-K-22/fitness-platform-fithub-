// src/components/common/trainer/ChatCard.tsx
import React from 'react';
export interface IClientCardDTO {
  id: string;
  name: string;
  avatar: string;
  isOnline?: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  lastSession?: string;
}

interface ChatCardProps {
  client: IClientCardDTO;
  isSelected: boolean;
  onSelect: () => void;
}

const ChatCard: React.FC<ChatCardProps> = ({ client, isSelected, onSelect }) => {
  return (
    <button
      className={`w-full p-4 flex items-center space-x-3 ${
        isSelected ? 'bg-gray-50 border-l-4 border-custom' : 'hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      <div className="relative">
    <img
  src={client.avatar}
  className="h-12 w-12 rounded-full object-cover"
  alt={client.name}
/>

        {client.isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 truncate">{client.name}</p>
          <span className="text-xs text-gray-500">{client.lastMessageTime}</span>
        </div>
        <p className="text-sm text-gray-500 truncate">{client.lastMessage}</p>
      </div>
     
    </button>
  );
};

export default ChatCard;