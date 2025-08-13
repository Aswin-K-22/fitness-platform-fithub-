import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "../../../store/store";
import { logoutThunk } from "../../../store/slices/userAuthSlice";
import { getNotifications, markNotificationRead } from "../../../services/api/userApi";
const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";


export interface INotification {
  id: string;
  userId: string;
  message: string;
  type: 'success' | 'error' | 'info';
  createdAt: string;
  read: boolean;
}



const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.userAuth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const defaultProfilePic = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32";
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "#" },
    { name: "Find Gym", path: "/user/gyms" },
    { name: "Gym Membership", path: "/user/membership" },
    { name: "PT-Plans", path: "/user/pt-plans" },
    { name: "Contact", path: "#" },
  ];

  const profileMenuItems = [
    { 
      name: "Profile", 
      icon: "fas fa-user", 
      action: () => navigate("/user/profile"),
      color: "text-gray-700 hover:text-blue-600"
    },
    { 
      name: "Account Settings", 
      icon: "fas fa-cog", 
      action: () => navigate("/user/settings"),
      color: "text-gray-700 hover:text-blue-600"
    },
    { 
      name: "My Subscription", 
      icon: "fas fa-crown", 
      action: () => navigate("/user/subscription"),
      color: "text-gray-700 hover:text-blue-600"
    },
    { 
      name: "Workout History", 
      icon: "fas fa-dumbbell", 
      action: () => navigate("/user/history"),
      color: "text-gray-700 hover:text-blue-600"
    },
    { 
      name: "Help & Support", 
      icon: "fas fa-question-circle", 
      action: () => navigate("/support"),
      color: "text-gray-700 hover:text-blue-600"
    },
  ];


  // Fetch notifications on mount and after payment verification
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const fetchNotifications = async () => {
        try {
          const { notifications } = await getNotifications(1, 10);
          setNotifications(notifications);
          setUnreadCount(notifications.filter((n) => !n.read).length);
        } catch (error) {
          console.error('[Navbar] Failed to fetch notifications:', error);
          //toast.error("Failed to load notifications");
        }
      };
      fetchNotifications();

      // Poll for new notifications every 30 seconds
      // const interval = setInterval(fetchNotifications, 30000);
      // return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.id]);



// Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error('[Navbar] Failed to mark notification as read:', error);
      toast.error("Failed to mark notification as read");
    }
  };


  const handleLogout = async () => {
    try {
      if (user?.email) {
        await dispatch(logoutThunk(user.email));
        toast.success("Logged out successfully!");
        navigate("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed—try again!");
    }
  setIsMenuOpen(false);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
  };

const handleMenuItemClick = (action: () => void) => {
    action();
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img
              className="h-8 w-auto"
              src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32"
              alt="FitHub"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className={`text-sm font-medium transition-all duration-200 py-2 px-3 rounded-lg ${
                  location.pathname === link.path
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
                aria-label={`Navigate to ${link.name}`}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    type="button"
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-all duration-200"
                    aria-label="View notifications"
                    aria-expanded={isNotificationsOpen}
                  >
                    <i className="fas fa-bell text-lg"></i>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 fade-in-0 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">Notifications</p>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="px-4 py-2 text-sm text-gray-500">No notifications</p>
                        ) : (
                          notifications.map((notification) => (
                            <button
                              key={notification.id}
                              onClick={() => !notification.read && handleMarkNotificationRead(notification.id)}
                              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-all duration-200 ${
                                notification.read
                                  ? "text-gray-500"
                                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                              }`}
                            >
                              <i
                                className={`fas fa-${notification.type === 'success' ? 'check-circle' : notification.type === 'error' ? 'exclamation-circle' : 'info-circle'} text-base w-5`}
                              ></i>
                              <div className="text-left">
                                <p className="font-medium">{notification.message}</p>
                                <p className="text-xs text-gray-400">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <button
                  type="button"
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-all duration-200"
                  aria-label="View messages"
                >
                  <i className="fas fa-comment-alt text-lg"></i>
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                    aria-label="Toggle profile menu"
                    aria-expanded={isProfileOpen}
                  >
                    <div className="relative">
                      <img
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-200 transition-all duration-200"
                        src={user?.profilePic ? `${backendUrl}${user.profilePic}` : defaultProfilePic}
                        alt={user?.name || "Profile"}
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full ring-2 ring-white"></div>
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-500">{user?.email || user?.role}</p>
                    </div>
                    <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}></i>
                  </button>

                  {/* Enhanced Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 fade-in-0 duration-200">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user?.profilePic ? `${backendUrl}${user.profilePic}` : defaultProfilePic}
                            alt={user?.name || "Profile"}
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{user?.name || "User"}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email || user?.role}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {profileMenuItems.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleMenuItemClick(item.action)}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-all duration-200 ${item.color} hover:bg-gray-50 group`}
                            aria-label={item.name}
                          >
                            <i className={`${item.icon} text-base w-5 group-hover:scale-110 transition-transform duration-200`}></i>
                            <span className="font-medium">{item.name}</span>
                          </button>
                        ))}
                      </div>

                      {/* Logout Section */}
                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 group"
                          aria-label="Logout"
                        >
                          <i className="fas fa-sign-out-alt text-base w-5 group-hover:scale-110 transition-transform duration-200"></i>
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : !isAuthPage ? (
              <>
                <button
                  type="button"
                  className="rounded-xl bg-white text-gray-600 px-6 py-2.5 text-sm font-medium border border-gray-200 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200"
                  onClick={() => navigate("/auth?type=login")}
                  aria-label="Sign in"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/auth?type=signup")}
                  className="rounded-xl bg-blue-600 text-white px-6 py-2.5 text-sm font-medium hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  aria-label="Register"
                >
                  Register
                </button>
              </>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-all duration-200"
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  navigate(link.path);
                  setIsMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  location.pathname === link.path
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
                aria-label={`Navigate to ${link.name}`}
              >
                {link.name}
              </button>
            ))}
            {isAuthenticated ? (
              <>
                <div className="border-t border-gray-100 pt-2 mt-2">
                  {profileMenuItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleMenuItemClick(item.action)}
                      className="flex items-center space-x-3 w-full text-left px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                      aria-label={item.name}
                    >
                      <i className={`${item.icon} text-base w-5`}></i>
                      <span>{item.name}</span>
                    </button>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                    aria-label="Logout"
                  >
                    <i className="fas fa-sign-out-alt text-base w-5"></i>
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : !isAuthPage ? (
              <>
                <div className="border-t border-gray-100 pt-2 mt-2 space-y-2">
                  <button
                    onClick={() => {
                      navigate("/auth?type=login");
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                    aria-label="Sign in"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      navigate("/auth?type=signup");
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200"
                    aria-label="Register"
                  >
                    Register
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;