/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/features/auth/pages/ForgotPassword.tsx
import React, { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../../components/common/user/Navbar";
import Footer from "../../../components/common/Footer";
import { forgotPassword } from "../../../services/api/userApi";


const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validateEmail = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setError("Invalid email format");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateEmail()) {
      toast.error(error);
      return;
    }

    try {
      await forgotPassword(email); 
      toast.success("OTP sent to your email!");
      navigate("/user/verify-otp", { state: { email, purpose: "forgot-password" } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
      console.error("Forgot password error:", error);
    }
  };

  return (
    <div className="font-inter bg-gray-50">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900 p-6 pt-16">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="flex items-center justify-center p-6 border-b border-gray-200">
            <img
              src="https://ai-public.creatie.ai/gen_page/logo_placeholder.png"
              alt="FitHub"
              className="h-8"
            />
          </div>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-center text-gray-900">Forgot Password</h2>
            <p className="mt-2 text-sm text-center text-gray-600">
              Enter your registered email to receive an OTP
            </p>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value.trim());
                    setError("");
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Send OTP
              </button>
            </form>
            <p className="mt-2 text-center text-sm text-gray-600">
              Back to{" "}
              <button
                onClick={() => navigate("/auth?type=login")}
                className="text-blue-600 hover:text-blue-700"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;