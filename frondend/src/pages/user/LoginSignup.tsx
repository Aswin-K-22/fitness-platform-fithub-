/* eslint-disable @typescript-eslint/no-explicit-any */
// src/presentation/features/user/pages/LoginSignup.tsx
import React, { useState, type FormEvent, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "../../store/store";
import { loginThunk } from "../../store/slices/userAuthSlice";
import { signup } from "../../services/api/userApi";

interface GoogleWindow extends Window {
  google?: {
    accounts: {
      oauth2: {
        initCodeClient: (config: {
          client_id: string;
          scope: string;
          ux_mode: string;
          redirect_uri: string;
          callback?: (response: { code: string }) => void;
        }) => { requestCode: () => void };
      };
    };
  };
}

const LoginSignup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>(); // [Change 2 - Line 28]: Use AppDispatch
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
const { isAuthenticated, user, } = useSelector((state: RootState) => state.userAuth);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({ email: "", password: "", confirmPassword: "", name: "" });
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | "">("");

 useEffect(() => {
    console.log("UserLogin: Checking auth state - isAuthenticated:", isAuthenticated, "user", user);
    if (isAuthenticated && user?.role === "user") {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  const handleToggle = (type: "login" | "signup") => {
    setIsLogin(type === "login");
    navigate(`/auth?type=${type}`, { replace: true });
    setErrors({ email: "", password: "", confirmPassword: "", name: "" });
    setPasswordStrength("");
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value.trim() }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const trimmedValue = value.trim();
    setSignupData((prev) => ({ ...prev, [name]: trimmedValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "password") {
      updatePasswordStrength(trimmedValue);
    }
  };

  const updatePasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength("");
    } else if (password.length < 6) {
      setPasswordStrength("weak");
    } else if (/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password)) {
      setPasswordStrength("medium");
    } else if (/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      setPasswordStrength("strong");
    } else {
      setPasswordStrength("weak");
    }
  };

  const validateLogin = () => {
    
    let valid = true;
    const newErrors = { email: "", password: "", confirmPassword: "", name: "" };

    if (!loginData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(loginData.email)) {
      newErrors.email = "Invalid email format";
      valid = false;
    }

    if (!loginData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (loginData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const validateSignup = () => {
    let valid = true;
    const newErrors = { email: "", password: "", confirmPassword: "", name: "" };

    if (!signupData.name) {
      newErrors.name = "Name is required";
      valid = false;
    } else if (!/^[a-zA-Z\s]{2,}$/.test(signupData.name)) {
      newErrors.name = "Name must be 2+ letters, no numbers or special characters";
      valid = false;
    }

    if (!signupData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(signupData.email)) {
      newErrors.email = "Invalid email format";
      valid = false;
    }

    if (!signupData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (signupData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(signupData.password)) {
      newErrors.password = "Password must include letters and numbers";
      valid = false;
    }

    if (!signupData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
      valid = false;
    } else if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don’t match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(' submit button clicked');
    
    if (!validateLogin()) {
      toast.error("Please fix form errors");
      return;
    }
    try {
      const result = await dispatch(loginThunk(loginData)); 
      if (loginThunk.fulfilled.match(result)) {
        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.error("password or email are invalid ");
        throw new Error(result.payload as string);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed—check credentials");
    }
  };

  const handleSignupSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateSignup()) {
      toast.error("Please fix form errors");
      return;
    }
    try {
      await signup(signupData.name, signupData.email, signupData.password);
      toast.success("OTP sent to your email!");
      navigate("/verify-otp", { state: { email: signupData.email } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleGoogleLogin = useCallback(() => {
    const googleWindow = window as unknown as GoogleWindow;
    if (googleWindow.google && googleWindow.google.accounts) {
      const client = googleWindow.google.accounts.oauth2.initCodeClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: "email profile",
        ux_mode: "redirect",
        redirect_uri: import.meta.env.VITE_GOOGLE_CALLBACK_URL,
      });
      client.requestCode();
    } else {
      toast.error("Google SDK not loaded. Please try again later.");
    }
  }, []);

  return (
    <div className="font-inter bg-gray-50">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900 p-6 pt-16">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300">
          <div className="flex items-center justify-center p-6 border-b border-gray-200">
            <img
              src="https://ai-public.creatie.ai/gen_page/logo_placeholder.png"
              alt="FitHub"
              className="h-8"
            />
          </div>
          <div className="p-8">
            <div className="flex justify-center space-x-4 mb-6">
              <button
                className={`px-6 py-2 font-medium transition-all duration-300 ${
                  isLogin
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-blue-600 hover:border-b-2 hover:border-blue-600"
                }`}
                onClick={() => handleToggle("login")}
              >
                Login
              </button>
              <button
                className={`px-6 py-2 font-medium transition-all duration-300 ${
                  !isLogin
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-blue-600 hover:border-b-2 hover:border-blue-600"
                }`}
                onClick={() => handleToggle("signup")}
              >
                Sign Up
              </button>
            </div>

            <div className="transition-all duration-300 ease-in-out transform-gpu">
              {isLogin ? (
                <form className="space-y-6 opacity-100 translate-x-0" onSubmit={handleLoginSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      >
                        <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>
                  <div className="text-sm text-right">
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform hover:scale-[1.02] transition-all duration-200"
                  >
                    Login
                  </button>
                </form>
              ) : (
                <form className="space-y-6 opacity-100 translate-x-0" onSubmit={handleSignupSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={signupData.name}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={signupData.password}
                        onChange={handleSignupChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10"
                        placeholder="Create password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      >
                        <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    {signupData.password && (
                      <div className="mt-1 text-sm">
                        Password Strength:{" "}
                        <span
                          className={
                            passwordStrength === "weak"
                              ? "text-red-500"
                              : passwordStrength === "medium"
                              ? "text-yellow-500"
                              : "text-green-500"
                          }
                        >
                          {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={signupData.confirmPassword}
                        onChange={handleSignupChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10"
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      >
                        <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform hover:scale-[1.02] transition-all duration-200"
                  >
                    Sign Up
                  </button>
                </form>
              )}
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={handleGoogleLogin}
                className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-600 transition-all duration-200"
              >
                <i className="fab fa-google text-xl"></i>
              </button>
              {/* <button className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-600 transition-all duration-200">
                <i className="fab fa-facebook-f text-xl"></i>
              </button>
              <button className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-600 transition-all duration-200">
                <i className="fab fa-apple text-xl"></i>
              </button> */}
            </div>
            <div className="mt-6">
              <button className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transform hover:scale-[1.02] transition-all duration-200">
                Try AI Trainer as Guest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;