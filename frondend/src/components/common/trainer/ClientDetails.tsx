// src/components/common/trainer/ClientDetails.tsx
import React from 'react';
import SessionCard from './SessionCard';
import type { IClientFeedback, IClientSession } from '../../../types/dtos/IClientInteractionDTO';

interface ClientDetailsProps {
  feedback: IClientFeedback | null;
  sessions: IClientSession[];
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ feedback, sessions }) => {
  return (
    <aside className="w-full lg:w-80 border-l border-gray-200 bg-white p-4">
      <h3 className="text-lg font-medium text-gray-900">Client Feedback</h3>
      <div className="mt-4 space-y-4">
        {feedback && (
          <>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Recent Workout Rating</h4>
              <div className="flex items-center space-x-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`fas fa-star ${i < feedback.rating ? '' : 'far'}`}
                  ></i>
                ))}
                <span className="ml-2 text-sm text-gray-600">{feedback.rating}.0</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Progress Notes</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Weight: {feedback.weightChange}</p>
                <p className="text-sm text-gray-600">Strength: {feedback.strengthNote}</p>
                <p className="text-sm text-gray-600">Energy: {feedback.energyNote}</p>
              </div>
            </div>
          </>
        )}
        <div className="space-y-2">
          <h4 className="text-sm font-medium louise-gray-700">Quick Responses</h4>
          <div className="space-y-2">
            <button className="!rounded-button w-full px-3 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 text-gray-700">
              Great work today! Keep it up! 💪
            </button>
            <button className="!rounded-button w-full px-3 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 text-gray-700">
              Remember to stay hydrated! 💧
            </button>
            <button className="!rounded-button w-full px-3 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 text-gray-700">
              Let's schedule your next session 📅
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Upcoming Sessions</h4>
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default ClientDetails;