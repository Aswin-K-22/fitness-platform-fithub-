import React from "react";

interface NotificationCardProps {
  icon: string;
  text: string;
  time: string;
  color: string;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ icon, text, time, color }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0">
      <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${color === "text-indigo-600" ? "bg-indigo-100" : "bg-green-100"}`}>
        <i className={`fas ${icon} ${color}`}></i>
      </span>
    </div>
    <div className="ml-3">
      <p className="text-sm text-gray-900">{text}</p>
      <p className="text-sm text-gray-500">{time}</p>
    </div>
  </div>
);

export default NotificationCard;