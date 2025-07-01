// src/presentation/features/user/components/Navbar.tsx
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "../../../store/store";
import { logoutThunk } from "../../../store/slices/userAuthSlice";

const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.userAuth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth"; // [Change 2 - Line 15]: Update to /auth
  const [isOpen, setIsOpen] = useState(false);
  const defaultProfilePic = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32";


  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "#" },
    { name: "Find Gym", path: "/user/gyms" },
    { name: "Gym Membership", path: "/user/membership" },
    { name: "Trainers", path: "#" },
    { name: "Contact", path: "#" },
  ];


  const handleLogout = async () => {
      console.log(user?.email)
    try {
      if (user?.email) {
            console.log('logout button clicked user')
        await dispatch(logoutThunk(user.email)); 
        toast.success("Logged out successfully!");
        navigate("/"); 
      }
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed—try again!");
    }
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/user/profile");
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-100">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center mr-4">
              <img
                className="h-8 w-auto"
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32"
                alt="FitHub"
              />
            </div>
            <div className="hidden sm:flex sm:ml-8 sm:space-x-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href="#"
                  onClick={() => navigate(link.path)}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname === link.path
                      ? "border-blue-500 text-blue-500"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                <button type="button" className="relative text-gray-600 hover:text-gray-900">
                  <i className="fas fa-bell text-xl"></i>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                </button>
                <button type="button" className="text-gray-600 hover:text-gray-900">
                  <i className="fas fa-comment-alt text-xl"></i>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                  >
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={user?.profilePic ? `${backendUrl}${user.profilePic}` : defaultProfilePic}
                      alt={user?.name || "Profile"}
                    />
                    <span className="text-sm font-medium">{user?.name || user?.role || "User"}</span>
                    <i className="fas fa-chevron-down text-xs"></i>
                  </button>
                  {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
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
                        Account Settings
                      </a>
                      <a
                        href="#"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Subscription
                      </a>
                      <a
                        href="#"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Workout History
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
            ) : !isAuthPage ? (
              <>
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-600 px-4 py-2 text-sm font-medium border border-gray-300 hover:bg-gray-50"
                  onClick={() => navigate("/auth?type=login")} // [Change 6 - Line 167]: Update to /auth
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/auth?type=signup")} // [Change 7 - Line 174]: Update to /auth
                  className="rounded-md bg-blue-500 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
                >
                  Register
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;