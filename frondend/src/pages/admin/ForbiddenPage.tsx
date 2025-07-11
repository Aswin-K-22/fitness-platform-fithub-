import React, { useEffect } from "react";
import { useLocation, useNavigate ,type Location} from "react-router-dom";
import type { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
// Define the shape of the location state
interface LocationState {
  from?: string;
}

// Extend Location to include typed state
interface CustomLocation extends Location {
  state: LocationState | null;
}


const AdminForbiddenPage: React.FC = () => {
    

    const { isAuthenticated, admin } = useSelector((state: RootState) => state.adminAuth);
    const navigate = useNavigate();
    const location = useLocation() as CustomLocation; // Type as CustomLocation
  
    useEffect(() => {
      console.log("ForbiddenPage useEffect triggered", { isAuthenticated, admin });
      if (isAuthenticated && admin?.role === "admin") {
   
          const from = location.state?.from || localStorage.getItem("lastAttemptedUrl") || "/admin/dashboard";
          toast.success(`Welcome back, ${admin.name}! Redirecting to your last page.`, {
            position: "top-right",
            autoClose: 3000,
          });
          navigate(from, { replace: true });
      }
      
    }, [isAuthenticated, admin, navigate, location.state]);

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

export default AdminForbiddenPage;