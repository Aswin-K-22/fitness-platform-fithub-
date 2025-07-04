import React from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import SocialAuthButtons from "./SocialAuthButtons";

interface AuthCardProps {
  isLogin: boolean;
  onToggle: (type: "login" | "signup") => void;
}

const AuthCard: React.FC<AuthCardProps> = ({ isLogin, onToggle }) => {
  return (
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg overflow-hidden transform transition-all duration-300 animate-fade-in">
      <div className="flex items-center justify-center p-6 border-b border-gray-200">
        <img
          src="https://ai-public.creatie.ai/gen_page/logo_placeholder.png"
          alt="FitHub Logo"
          className="h-10"
        />
      </div>
      <div className="p-6 sm:p-8">
        <div className="flex justify-center space-x-4 mb-6">
          <button
            className={`px-6 py-2 font-medium transition-all duration-300 text-sm sm:text-base ${
              isLogin
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-blue-600 hover:border-b-2 hover:border-blue-600"
            }`}
            onClick={() => onToggle("login")}
            aria-label="Switch to login form"
          >
            Login
          </button>
          <button
            className={`px-6 py-2 font-medium transition-all duration-300 text-sm sm:text-base ${
              !isLogin
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-blue-600 hover:border-b-2 hover:border-blue-600"
            }`}
            onClick={() => onToggle("signup")}
            aria-label="Switch to signup form"
          >
            Sign Up
          </button>
        </div>
        <div className="transition-all duration-300 ease-in-out transform-gpu">
          {isLogin ? <LoginForm onToggle={onToggle} /> : <SignupForm onToggle={onToggle} />}
        </div>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        <SocialAuthButtons />
        <div className="mt-6">
          <button
            className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transform hover:scale-[1.02] transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Try AI Trainer as Guest"
          >
            Try AI Trainer as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;