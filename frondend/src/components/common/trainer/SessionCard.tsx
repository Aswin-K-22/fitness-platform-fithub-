// src/components/common/trainer/SessionCard.tsx
import React from 'react';
import type { IClientSession } from '../../../types/dtos/IClientInteractionDTO';

interface SessionCardProps {
  session: IClientSession;
}

const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">{session.title}</p>
          <p className="text-xs text-gray-500">{session.time}</p>
        </div>
        <button className="!rounded-button p-2 text-gray-400 hover:text-custom">
          <i className="fas fa-edit"></i>
        </button>
      </div>
    </div>
  );
};

export default SessionCard;