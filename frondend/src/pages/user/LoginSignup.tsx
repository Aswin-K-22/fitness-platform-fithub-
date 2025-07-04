/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store/store";
import AuthCard from "../../components/feature/user/auth/AuthCard";

const LoginSignup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.userAuth);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    console.log("UserLogin: Checking auth state - isAuthenticated:", isAuthenticated, "user", user);
    if (isAuthenticated && user?.role === "user") {
      navigate("/");
    }
    const queryType = new URLSearchParams(location.search).get("type");
    setIsLogin(queryType !== "signup");
  }, [isAuthenticated, user, navigate, location.search]);

  const handleToggle = (type: "login" | "signup") => {
    setIsLogin(type === "login");
    navigate(`/auth?type=${type}`, { replace: true });
  };

  return (
 <div className="font-inter bg-gray-50 min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900 px-4 sm:px-6 pt-[80px] md:pt-[88px] pb-16 sm:pb-20">
      <AuthCard isLogin={isLogin} onToggle={handleToggle} />
    </div>
  );
};

export default LoginSignup;