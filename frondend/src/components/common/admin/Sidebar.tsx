import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar: React.FC = () => {
  const navItems = [
    { icon: "fa-chart-line", label: "Dashboard", path: "/admin/dashboard" },
    { icon: "fa-users", label: "Users", path: "/admin/users" },
    { icon: "fa-dumbbell", label: "Trainers", path: "/admin/trainers" },
    { icon: "fa-building", label: "Gyms", path: "/admin/gyms" },
    { icon: "fa-dollar-sign", label: "Earnings", path: "/admin/earnings" },
    { icon: "fa-credit-card", label: "Membership-Plans", path: "/admin/membership-plans" },
    { icon: "fa-robot", label: "AI Training", path: "/admin/ai-training" },
    { icon: "fa-bell", label: "Notifications", path: "/admin/notifications" },
    { icon: "fa-headset", label: "Support", path: "/admin/support" },
    { icon: "fa-cog", label: "Settings", path: "/admin/settings" },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-indigo-900 text-white transform transition-transform duration-300 ease-in-out md:static md:w-64 flex flex-col h-screen">
      <div className="flex items-center justify-center h-16 border-b border-indigo-700">
        <img
          src="/images/admin.webp"
          alt="FitHub Logo"
          className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-400"
        />
      </div>
      <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            onClick={() => console.log(`Navigating to: ${item.path}`)}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
              }`
            }
          >
            <i className={`fas ${item.icon} w-6 mr-3`}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;