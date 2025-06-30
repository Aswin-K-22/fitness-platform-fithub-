// src/presentation/features/admin/components/Header.tsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { UserAuth as AdminAuth } from "../../../types/auth.types";
import type { AppDispatch, RootState } from "../../../store/store";
import { logoutThunk, setAuth } from "../../../store/slices/adminAuthSlice";


interface HeaderProps {
  admin :AdminAuth | null;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex-1 flex items-center">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-500 hover:text-gray-700">
          <i className="fas fa-bell"></i>
        </button>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
          >
            <img
              src="/images/admin.webp"
              alt="Admin"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm font-medium">{admin?.name || "Admin"}</span>
            <i className="fas fa-chevron-down text-xs"></i>
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Profile Settings
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
    </header>
  );
};

export default Header;