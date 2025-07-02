// src/presentation/features/trainer/components/Navbar.tsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "../../../store/store";
import { logoutThunk } from "../../../store/slices/trainerAuthSlice";

const Navbar: React.FC = () => {
  const { trainer } = useSelector((state: RootState) => state.trainerAuth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      if (trainer?.email) {
       
         await dispatch(logoutThunk(trainer.email));
        toast.success("Logged out successfully!");
        navigate("/trainer/login");
      }
    } catch (error) {
      console.error("Trainer logout failed:", error);
      toast.error("Logout failed—try again!");
    }
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/trainer/profile");
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src="https://ai-public.creatie.ai/gen_page/logo_placeholder.png"
                alt="FitHub"
              />
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a
                href="/trainer/dashboard"
                className="border-indigo-600 text-indigo-600 border-b-2 inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Clients
              </a>
              <a
                href="#"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Schedule
              </a>
              <a
                href="#"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Analytics
              </a>
            </div>
          </div>
          <div className="flex items-center">
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-600 relative">
              <i className="fas fa-bell text-xl"></i>
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
            </button>
            <div className="ml-4 flex items-center relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex rounded-full bg-white focus:outline-none items-center space-x-2"
              >
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={
                    trainer?.profilePic
                      ? `${import.meta.env.VITE_API_BASE_URL}${trainer.profilePic}`
                      : "/images/trainer.png"
                  }
                  alt="Trainer"
                />
                <span className="text-sm font-medium text-gray-700">
                  {trainer?.name || "Trainer"}
                </span>
                <i className="fas fa-chevron-down text-xs"></i>
              </button>
              {isOpen && (
                <div className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <button
                    onClick={handleProfileClick}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  <a
                    href="#"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </a>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
