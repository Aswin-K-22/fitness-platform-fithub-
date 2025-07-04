/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, type FormEvent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import throttle from "lodash.throttle";
import type { AppDispatch } from "../../../../store/store";
import { loginThunk } from "../../../../store/slices/userAuthSlice";
import type { LoginFormData, FormErrors } from "../../../../types/auth";

interface LoginFormProps {
  onToggle: (type: "login" | "signup") => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggle }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [loginData, setLoginData] = useState<LoginFormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({ email: "", password: "", confirmPassword: "", name: "" });
  const [showPassword, setShowPassword] = useState(false);

  const validateLogin = () => {
    let valid = true;
    const newErrors: FormErrors = { email: "", password: "", confirmPassword: "", name: "" };

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

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value.trim() }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleLoginSubmit = useCallback(
    throttle(async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
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
    }, 1000) as (e: FormEvent<HTMLFormElement>) => Promise<void>,
    [dispatch, loginData, navigate]
  );

  return (
    <form className="space-y-6 opacity-100 translate-x-0 animate-fade-in" onSubmit={handleLoginSubmit}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={loginData.email}
          onChange={handleLoginChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
          placeholder="Enter your email"
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-red-500 text-sm mt-1">
            {errors.email}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={loginData.password}
            onChange={handleLoginChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10 text-gray-900"
            placeholder="Enter your password"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-red-500 text-sm mt-1">
            {errors.password}
          </p>
        )}
      </div>
      <div className="text-sm text-right">
        <button
          type="button"
          onClick={() => navigate("/user/forgot-password")}
          className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
          aria-label="Navigate to forgot password page"
        >
          Forgot Password?
        </button>
      </div>
      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform hover:scale-[1.02] transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Submit login form"
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm;