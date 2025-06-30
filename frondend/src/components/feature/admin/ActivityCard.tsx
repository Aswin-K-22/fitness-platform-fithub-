// src/presentation/features/admin/components/ActivityCard.tsx
import React from "react";

interface ActivityCardProps {
  icon: string;
  title: string;
  desc: string;
  time: string;
  color: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ icon, title, desc, time, color }) => (
  <div className="flex items-start">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${color}`}>
      <i className={`fas ${icon} text-sm`}></i>
    </div>
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-gray-500">{desc}</p>
      <p className="text-xs text-gray-400 mt-1">{time}</p>
    </div>
  </div>
);

export default ActivityCard;