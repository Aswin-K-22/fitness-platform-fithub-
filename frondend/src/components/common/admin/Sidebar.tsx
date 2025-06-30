// src/presentation/features/admin/components/Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar: React.FC = () => {
  const navItems = [
    { icon: "fa-chart-line", label: "Dashboard", path: "/admin/dashboard" },
    { icon: "fa-users", label: "Users", path: "/admin/users" },
    { icon: "fa-dumbbell", label: "Trainers", path: "/admin/trainers" },
    { icon: "fa-building", label: "Gyms", path: "/admin/gyms" },
    { icon: "fa-dollar-sign", label: "Earnings", path: "/admin/earnings" },
    { icon: "fa-credit-card", label: "Subscriptions-Plans", path: "/admin/subscriptions" },
    { icon: "fa-robot", label: "AI Training", path: "/admin/ai-training" },
    { icon: "fa-bell", label: "Notifications", path: "/admin/notifications" },
    { icon: "fa-headset", label: "Support", path: "/admin/support" },
    { icon: "fa-cog", label: "Settings", path: "/admin/settings" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <img src="/images/admin.webp"  alt="FitHub Logo" className="w-12 h-12 rounded-full object-cover" />
      </div>
      <nav className="mt-6">
        <div className="px-3 space-y-1">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              onClick={() => console.log(`Navigating to: ${item.path}`)}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              <i className={`fas ${item.icon} w-6`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;