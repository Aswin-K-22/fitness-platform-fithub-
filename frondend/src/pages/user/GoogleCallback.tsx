/* eslint-disable @typescript-eslint/no-explicit-any */
// src/presentation/features/auth/pages/GoogleCallback.tsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import type { AppDispatch } from "../../store/store";
import { googleAuth } from "../../services/api/userApi";
import { setAuth } from "../../store/slices/userAuthSlice";



const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get("code");
      if (!code) {
        toast.error("No authorization code received");
        navigate("/auth?type=signup"); // [Change 3 - Line 22]: Correct navigation
        return;
      }

      try {
        const { user } = await googleAuth({ code }); // [Change 4 - Line 27]: Use use case
        dispatch(setAuth({ user, isAuthenticated: true }));
        toast.success("Signed in with Google successfully!");
        navigate("/"); // [Change 5 - Line 30]: Home for all users
      } catch (error: any) {
        console.error("Google auth error:", error);
        toast.error(error.response?.data?.message || error.message || "Google Sign-In failed"); // [Change 6 - Line 33]: Enhanced errors
        navigate("/auth?type=signup");
      }
    };

    handleCallback();
  }, [navigate, dispatch, location]);

  return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
};

export default GoogleCallback;