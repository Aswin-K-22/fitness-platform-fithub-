import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store/store";
import { logoutThunk } from "../../store/slices/trainerAuthSlice";
import { toast } from "react-toastify";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// Types
interface Trainer {
  email?: string;
}

interface TrainerAuthState {
  trainer: Trainer | null;
  isAuthenticated: boolean;
}

const PendingApproval: React.FC = () => {
  const { trainer, isAuthenticated } = useSelector((state: RootState) => state.trainerAuth) as TrainerAuthState;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log('trainer =',trainer)
      if (trainer?.email) {
        await dispatch(logoutThunk(trainer.email));
        toast.success("Logged out successfully!");
        navigate("/trainer/login");
      }
    } catch (error) {
      console.error("Trainer logout failed:", error);
      toast.error("Logout failed—try again!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-[Inter] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
          Pending Admin Approval
        </h1>
        <p className="text-gray-600 text-sm sm:text-base text-center leading-relaxed">
          Your account has been verified, but it’s still awaiting approval from the FitHub admin team. You’ll be able to
          access your dashboard once approved.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-700">
            Please check back later or contact support if this takes longer than expected.
          </p>
        </div>
        <div className="flex justify-center">
          {!isAuthenticated ? (
            <Link
              to="/trainer/login"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-colors duration-200"
            >
              Go to Login
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition-colors duration-200"
            >
              Logout
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 text-center">
          Need assistance? Reach out to{" "}
          <a
            href="mailto:support@fithub.com"
            className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200"
          >
            support@fithub.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default PendingApproval;