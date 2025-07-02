// src/presentation/features/admin/pages/AdminLogin.tsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "../../store/store";
import type { ILoginRequestDTO } from "../../types/dtos/ILoginRequestDTO";
import { loginThunk } from "../../store/slices/adminAuthSlice";

const AdminLogin: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, admin, isLoading, error: authError } = useSelector((state: RootState) => state.adminAuth);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    console.log("AdminLogin: Checking auth state - isAuthenticated:", isAuthenticated, "admin:", admin);
    if (isAuthenticated && admin?.role === "admin") {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, admin, navigate]);

  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrors((prev) => ({ ...prev, email: undefined }));
  };

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrors((prev) => ({ ...prev, password: undefined }));
  };

  const validateForm = (): boolean => {
    console.log("AdminLogin: Validating form with email:", email, "password length:", password.length);
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      newErrors.password = "Password must contain letters and numbers";
    }
    setErrors(newErrors);
    console.log("AdminLogin: Validation errors:", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("AdminLogin: Form submitted with email:", email);
    if (!validateForm()) {
      return;
    }
    const loginData: ILoginRequestDTO = { email, password };
    try {
      console.log("AdminLogin: Dispatching loginThunk with:", loginData);
      const result = await dispatch(loginThunk(loginData)).unwrap();
      console.log("AdminLogin: loginThunk result:", result);
      if (result) {
        toast.success("Login successful!");
        //navigate("/admin/dashboard");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      console.error("AdminLogin: Login error:", authError);
      toast.error(authError || "Login failed—please try again!");
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white font-[Inter]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto w-24 h-24 rounded-full object-cover"
          src="/images/admin.webp"
          alt="FitHub"
        />
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Admin Login
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-envelope text-gray-400"></i>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleChangeEmail}
                  disabled={isLoading}
                  className={`block w-full py-2 pl-10 border rounded-md sm:text-sm placeholder-gray-400 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } focus:border-indigo-600 focus:ring-indigo-600 ${isLoading ? "opacity-50" : ""}`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400"></i>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={handleChangePassword}
                  disabled={isLoading}
                  className={`block w-full py-2 pl-10 pr-10 border rounded-md sm:text-sm placeholder-gray-400 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } focus:border-indigo-600 focus:ring-indigo-600 ${isLoading ? "opacity-50" : ""}`}
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {authError && <p className="text-red-500 text-sm mt-1">{authError}</p>}

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-700">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <footer className="mt-8 text-center">
        <p className="text-sm text-gray-500">© 2024 FitHub. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AdminLogin;