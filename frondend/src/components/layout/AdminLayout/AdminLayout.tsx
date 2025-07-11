/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Outlet } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store/store";
import { logoutThunk, setAuth } from "../../../store/slices/adminAuthSlice";
import Header from "../../common/admin/Header";
import Sidebar from "../../common/admin/Sidebar";

const AdminLayout: React.FC<{ children?: React.ReactNode }> = () => {
  const { admin } = useSelector((state: RootState) => state.adminAuth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      if (admin?.email) {
        await dispatch(logoutThunk(admin.email)).unwrap();
        dispatch(setAuth({ admin: null, isAuthenticated: false }));
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
    <div className="min-h-screen flex bg-gray-100 font-[Inter]">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out bg-indigo-900 text-white ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:w-64`}
      >
        <Sidebar />
      </div>
      {/* Mobile Sidebar Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 text-indigo-100 bg-indigo-800 rounded-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <i className={`fas ${isSidebarOpen ? "fa-times" : "fa-bars"} text-lg`}></i>
      </button>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header admin={admin} isOpen={isOpen} setIsOpen={setIsOpen} handleLogout={handleLogout} />
        <main className="flex-1 p-4 sm:p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;