import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation, type Location } from "react-router-dom";
import { toast } from "react-toastify";
import type { RootState } from "../../store/store";

// Define the shape of the location state
interface LocationState {
  from?: string;
}

// Extend Location to include typed state
interface CustomLocation extends Location {
  state: LocationState | null;
}

const ForbiddenPage: React.FC = () => {
  const { isAuthenticated, trainer } = useSelector((state: RootState) => state.trainerAuth);
  const navigate = useNavigate();
  const location = useLocation() as CustomLocation; // Type as CustomLocation

  useEffect(() => {
    console.log("ForbiddenPage useEffect triggered", { isAuthenticated, trainer });
    if (isAuthenticated && trainer?.role === "trainer") {
      console.log("Navigating based on verifiedByAdmin:", trainer.verifiedByAdmin);
      if (trainer.verifiedByAdmin) {
        // Get the last attempted URL from location.state or localStorage
        const from = location.state?.from || localStorage.getItem("lastAttemptedUrl") || "/trainer/dashboard";
        toast.success(`Welcome back, ${trainer.name}! Redirecting to your last page.`, {
          position: "top-right",
          autoClose: 3000,
        });
        navigate(from, { replace: true });
      } else {
        toast.info("Your account is pending admin approval.", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/trainer/pending-approval", { replace: true });
      }
    }
  }, [isAuthenticated, trainer, navigate, location.state]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">403 - Access Denied</h1>
        <p className="mt-4 text-lg">You don’t have permission to access this page.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ForbiddenPage;