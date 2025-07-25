// src/components/common/trainer/MessageBubble.tsx
import React from 'react';
import type { IMessage } from '../../../types/dtos/IClientInteractionDTO';

interface MessageBubbleProps {
  message: IMessage;
  isTrainer: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isTrainer }) => {
  return (
    <div className={`flex items-start ${isTrainer ? 'justify-end' : ''} space-x-3`}>
      {!isTrainer && (
        <img
          src="/images/trainer.png"
          className="h-10 w-10 rounded-full object-cover"
          alt="Client"
        />
      )}
      <div className="flex-1 space-y-1">
        <div className="flex items-end">
          <div
            className={`rounded-lg p-3 max-w-xl ${
              isTrainer ? 'bg-custom text-white' : 'bg-gray-100 text-gray-900'
            }`}
          >
            <p className="text-sm">{message.content}</p>
          </div>
          <span className="ml-2 text-xs text-gray-500">{message.timestamp}</span>
        </div>
      </div>
      {isTrainer && (
        <img
          src="/images/trainer.png"
          className="h-10 w-10 rounded-full object-cover"
          alt="Trainer"
        />
      )}
    </div>
  );
};

export default MessageBubble;