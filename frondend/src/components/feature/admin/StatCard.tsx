// src/presentation/features/admin/components/StatCard.tsx
import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  percentage?: string;
  color?: string;
  bgColor?: string;
  textColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  percentage,
  color,
  bgColor,
  textColor,
}) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="px-4 py-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <h3 className="text-lg font-semibold text-gray-900 mt-1">{value}</h3>
        </div>
        <div
          className={`flex-shrink-0 ${
            bgColor || `${color || "bg-indigo-600"} bg-opacity-10`
          } ${bgColor ? "rounded-md p-3" : "w-12 h-12 rounded-full"} flex items-center justify-center`}
        >
          <i className={`fas ${icon} ${textColor || color || "text-indigo-600"} text-xl`}></i>
        </div>
      </div>
      {percentage && (
        <div className="mt-4 flex items-center">
          <span className="text-green-500 text-sm flex items-center">
            <i className="fas fa-arrow-up mr-1"></i>
            {percentage}
          </span>
          <span className="text-gray-400 text-sm ml-2">vs last month</span>
        </div>
      )}
    </div>
  </div>
);

export default StatCard;