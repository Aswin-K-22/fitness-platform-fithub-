import React from "react";

interface SessionCardProps {
  name: string;
  type: string;
  time: string;
  avatar: string;
}

const SessionCard: React.FC<SessionCardProps> = ({ name, type, time, avatar }) => (
  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
    <img className="h-12 w-12 rounded-full object-cover" src={avatar} alt={name} />
    <div className="ml-4 flex-1">
      <h3 className="text-sm font-medium text-gray-900">{name}</h3>
      <p className="text-sm text-gray-500">{`${type} • ${time}`}</p>
    </div>
    <button className="bg-indigo-600 text-white px-4 py-2 rounded-md">Start</button>
  </div>
);

export default SessionCard;