/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, type FormEvent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import throttle from "lodash.throttle";
import { signup } from "../../../../services/api/userApi";
import type { SignupFormData, FormErrors } from "../../../../types/auth";

interface SignupFormProps {
  onToggle: (type: "login" | "signup") => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onToggle }) => {
  const navigate = useNavigate();
  const [signupData, setSignupData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({ email: "", password: "", confirmPassword: "", name: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | "">("");

  const updatePasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength("");
    } else if (password.length < 6) {
      setPasswordStrength("weak");
    } else if (/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\dズ]{6,}$/.test(password)) {
      setPasswordStrength("medium");
    } else if (/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      setPasswordStrength("strong");
    } else {
      setPasswordStrength("weak");
    }
  };

  const validateSignup = () => {
    let valid = true;
    const newErrors: FormErrors = { email: "", password: "", confirmPassword: "", name: "" };

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

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const trimmedValue = value.trim();
    setSignupData((prev) => ({ ...prev, [name]: trimmedValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "password") {
      updatePasswordStrength(trimmedValue);
    }
  };

  const handleSignupSubmit = useCallback(
    throttle(async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validateSignup()) {
        toast.error("Please fix form errors");
        return;
      }
      try {
        await signup(signupData.name, signupData.email, signupData.password);
        toast.success("OTP sent to your email!");
        navigate("/user/verify-otp", { state: { email: signupData.email } });
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to send OTP");
      }
    }, 1000) as (e: FormEvent<HTMLFormElement>) => Promise<void>,
    [navigate, signupData]
  );

  return (
    <form className="space-y-6 opacity-100 translate-x-0 animate-fade-in" onSubmit={handleSignupSubmit}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          name="name"
          value={signupData.name}
          onChange={handleSignupChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
          placeholder="Enter your full name"
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <p id="name-error" className="text-red-500 text-sm mt-1">
            {errors.name}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={signupData.email}
          onChange={handleSignupChange}
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
            value={signupData.password}
            onChange={handleSignupChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10 text-gray-900"
            placeholder="Create password"
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
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={signupData.confirmPassword}
            onChange={handleSignupChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10 text-gray-900"
            placeholder="Confirm password"
            aria-invalid={errors.confirmPassword ? "true" : "false"}
            aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
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
        {errors.confirmPassword && (
          <p id="confirmPassword-error" className="text-red-500 text-sm mt-1">
            {errors.confirmPassword}
          </p>
        )}
      </div>
      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform hover:scale-[1.02] transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Submit signup form"
      >
        Sign Up
      </button>
    </form>
  );
};

export default SignupForm;