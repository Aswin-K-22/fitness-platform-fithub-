/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { UserAuth as AdminAuth } from "../../../types/auth.types";
import type { AppDispatch, RootState } from "../../../store/store";
import { logoutThunk, setAuth } from "../../../store/slices/adminAuthSlice";

interface HeaderProps {
  admin: AdminAuth | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  handleLogout: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ isOpen, setIsOpen }) => {
  const { admin } = useSelector((state: RootState) => state.adminAuth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (admin?.email) {
        await dispatch(logoutThunk(admin.email)).unwrap();
        toast.success("Logged out successfully!");
        navigate("/admin/login", { replace: true });
      } else {
        throw new Error("No admin email found");
      }
    } catch (error: any) {
      console.error("Logout failed:", error);
      if (error.response?.status === 401) {
        dispatch(setAuth({ admin: null, isAuthenticated: false }));
        toast.error("Session already expired. Please log in again.");
        navigate("/admin/login", { replace: true });
      } else {
        toast.error("Logout failed—please try again!");
      }
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <header className="h-16 bg-indigo-900 text-white border-b border-indigo-700 flex items-center justify-between px-4 sm:px-6">
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-indigo-800 border border-indigo-600 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-white placeholder-indigo-300 transition-colors duration-200"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-300"></i>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 text-indigo-300 hover:text-indigo-100 transition-colors duration-200">
          <i className="fas fa-bell text-lg"></i>
        </button>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 text-indigo-100 hover:text-white focus:outline-none transition-colors duration-200"
          >
            <img
              src="/images/admin.webp"
              alt="Admin"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-400"
            />
            <span className="hidden sm:inline text-sm font-medium">
              {admin?.name || "Admin"}
            </span>
            <i className="fas fa-chevron-down text-xs"></i>
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-indigo-800 rounded-lg shadow-xl py-2 z-50 border border-indigo-700">
              <a
                href="#"
                className="block px-4 py-2 text-sm text-indigo-100 hover:bg-indigo-700 hover:text-white transition-colors duration-200"
              >
                Profile Settings
              </a>
              <hr className="my-1 border-indigo-700" />
              <button
                onClick={handleLogout}
                className="block w  -full text-left px-4 py-2 text-sm text-red-400 hover:bg-indigo-700 hover:text-red-300 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;