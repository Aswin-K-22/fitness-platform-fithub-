
import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import { initializeAuth } from "./hooks/initializeAuth";
import { useAuthSession } from "./hooks/useAuthSession";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store/store";


import { initUserSocket, connectUserSocket, disconnectUserSocket } from "./services/sockets/userSocket";
import { connectTrainerSocket, disconnectTrainerSocket, initTrainerSocket } from "./services/sockets/trainerSocket";

// Lazy-loaded components
const HomePage = lazy(() => import("./pages/user/HomePage"));
const ForbiddenPage = lazy(() => import("./pages/auth/ForbiddenPage"));
const TrainerForbiddenPage = lazy(() => import("./pages/trainer/ForbiddenPage"));
const GymSearchPage = lazy(() => import("./pages/user/GymSearchPage"));
const GymDetailsPage = lazy(() => import("./pages/user/GymDetailsPage"));
const MembershipPage = lazy(() => import("./pages/user/MembershipPage"));
const UserProfile = lazy(() => import("./pages/user/UserProfile"));
const LoginSignup = lazy(() => import("./pages/user/LoginSignup"));
const GoogleCallback = lazy(() => import("./pages/user/GoogleCallback"));
const VerifyOtp = lazy(() => import("./pages/user/auth/VerifyOtp"));
const ForgotPassword = lazy(() => import("./pages/user/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/user/auth/ResetPassword"));
const PaymentSuccess = lazy(() => import("./pages/user/PaymentSuccess"));
const PaymentFailed = lazy(() => import("./pages/user/PaymentFailed"));
const TrainerDashboard = lazy(() => import("./pages/trainer/TrainerDashboard"));
const TrainerProfile = lazy(() => import("./pages/trainer/TrainerProfile"));
const TrainerLogin = lazy(() => import("./pages/trainer/TrainerLogin"));
const TrainerSignup = lazy(() => import("./pages/trainer/TrainerSignup"));
const TrainerVerifyOtp = lazy(() => import("./pages/trainer/TrainerVerifyOtp"));
const PendingApproval = lazy(() => import("./pages/trainer/PendingApproval"));
const CreatePTPlan = lazy(() => import("./pages/trainer/CreatePTPlan"));
const ClientInteraction = lazy(() => import("./pages/trainer/ClientInteraction"));
const ClientPlan = lazy(() => import("./pages/trainer/ClientPlan"));
const PTPlanList = lazy(() => import("./pages/trainer/PTPlanList")); 
const PTPlanManagement = lazy(() => import("./pages/admin/PTPlanManagement"));
const UserPTPlanList = lazy(()=>import("./pages/user/UserPTPlanList"));
const DashboardView = lazy(() => import("./pages/admin/DashboardView"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const TrainerDetails = lazy(() => import("./pages/admin/TrainerDetails"));
const Gyms = lazy(() => import("./pages/admin/GymsManagement"));
const AddGymForm = lazy(() => import("./pages/admin/AddGymForm"));
const MembershipPlans = lazy(() => import("./pages/admin/MembershipPlans"));
const AddMembershipPlan = lazy(() => import("./pages/admin/AddMembershipPlan"));
const TrainerManagement = lazy(() => import("./pages/admin/TrainersManagement"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminForbiddenPage = lazy(() => import("./pages/admin/ForbiddenPage"));
const UserTrainerChat = lazy(() => import("./pages/user/UserTrainerChat"));

const UserLayout = lazy(() => import("./components/layout/UserLayout/UserLayout"));
const TrainerLayout = lazy(() => import("./components/layout/TrainerLayout/TrainerLayout"));
const AdminLayout = lazy(() => import("./components/layout/AdminLayout/AdminLayout"));

const ErrorBoundary = lazy(() => import("./components/common/ErrorBoundary"));

interface ProtectedRouteProps {
  element: React.ReactElement;
  allowedRole: "admin" | "trainer" | "user";
  isPublic?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  allowedRole,
  isPublic = false,
}) => {
  const {
    isAdminAuthenticated,
    isTrainerAuthenticated,
    isUserAuthenticated,
    isAdminLoading,
    isTrainerLoading,
    isUserLoading,
  } = useAuthSession();
  const location = useLocation();
  const navigate = useNavigate();

  const isRoleAuthenticated =
    allowedRole === "admin"
      ? isAdminAuthenticated
      : allowedRole === "trainer"
      ? isTrainerAuthenticated
      : isUserAuthenticated;

  const isRoleLoading =
    allowedRole === "admin"
      ? isAdminLoading
      : allowedRole === "trainer"
      ? isTrainerLoading
      : isUserLoading;

  const isAnyAuthenticated = isAdminAuthenticated || isTrainerAuthenticated || isUserAuthenticated;

  const getRedirectPath = () => {
    switch (allowedRole) {
      case "admin":
        return "/admin/login";
      case "trainer":
        return "/trainer/login";
      default:
        return "/auth";
    }
  };

  const getForbiddenPath = () => {
    const currentPath = location.pathname;
    if (currentPath.startsWith("/trainer")) {
      return "/trainer/forbidden";
    } else if (currentPath.startsWith("/admin")) {
      return "/admin/forbidden";
    } else {
      return "/forbidden";
    }
  };

  useEffect(() => {
    if (!isRoleAuthenticated && !isPublic && !location.pathname.includes("auth") && !isRoleLoading) {
      navigate(getRedirectPath(), { replace: true, state: { from: location } });
    } else if (isAnyAuthenticated && !isRoleAuthenticated && !isPublic) {
      navigate(getForbiddenPath(), { replace: true, state: { from: location.pathname } });
    }
  }, [isRoleAuthenticated, isAnyAuthenticated, location, navigate, isPublic, isRoleLoading]);

  if (isRoleLoading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (isPublic || isRoleAuthenticated) return element;
  if (isAnyAuthenticated && !isRoleAuthenticated) return <ForbiddenPage />;
  return null;
};

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
const { isAuthenticated: isUserAuthenticated } = useSelector((state: RootState) => state.userAuth);
  const { isAuthenticated: isTrainerAuthenticated } = useSelector((state: RootState) => state.trainerAuth);


  useEffect(() => {
    console.log("useEffect in App.tsx is running");
    dispatch(initializeAuth());

  }, []);

  useEffect(() => {
    if (isUserAuthenticated) {
      initUserSocket();
      connectUserSocket();
    } else {
      disconnectUserSocket();
    }
  }, [isUserAuthenticated]);


   useEffect(() => {
    if (isTrainerAuthenticated) {
      initTrainerSocket();
      connectTrainerSocket();
    } else {
      disconnectTrainerSocket();
    }
  }, [isTrainerAuthenticated]);


  return (
    <div className="min-h-screen bg-gray-100">
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <ErrorBoundary>
          <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
            <Routes>
              <Route element={<UserLayout />}>
                <Route path="/" element={<ProtectedRoute element={<HomePage />} allowedRole="user" isPublic={true} />} />
                <Route path="/user/gyms" element={<ProtectedRoute element={<GymSearchPage />} allowedRole="user" isPublic={true} />} />
                <Route path="/user/gym/:gymId" element={<ProtectedRoute element={<GymDetailsPage />} allowedRole="user" isPublic={true} />} />
                <Route path="/user/membership" element={<ProtectedRoute element={<MembershipPage />} allowedRole="user" isPublic={true} />} />
                <Route path="/user/profile" element={<ProtectedRoute element={<UserProfile />} allowedRole="user" />} />
                <Route path="/auth" element={<LoginSignup />} />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />
                <Route path="/user/verify-otp" element={<VerifyOtp />} />
                <Route path="/user/forgot-password" element={<ForgotPassword />} />
                <Route path="/user/reset-password" element={<ResetPassword />} />
                <Route path="/user/payment-success" element={<ProtectedRoute element={<PaymentSuccess />} allowedRole="user" />} />
                <Route path="/user/payment-failed" element={<ProtectedRoute element={<PaymentFailed />} allowedRole="user" />} />
                <Route path="/user/pt-plans" element={<ProtectedRoute element={<UserPTPlanList />} allowedRole="user" isPublic={true} />} />
                                <Route path="/user/chat" element={<ProtectedRoute element={<UserTrainerChat />} allowedRole="user" />} />

                <Route path="/forbidden" element={<ForbiddenPage />} />
              </Route>

              <Route element={<TrainerLayout />}>
                <Route path="/trainer/dashboard" element={<ProtectedRoute element={<TrainerDashboard />} allowedRole="trainer" />} />
                <Route path="/trainer/profile" element={<ProtectedRoute element={<TrainerProfile />} allowedRole="trainer" />} />
                <Route path="/trainer/create-pt-plan" element={<ProtectedRoute element={<CreatePTPlan />} allowedRole="trainer" />} />
                <Route path="/trainer/create-pt-plan/:planId" element={<ProtectedRoute element={<CreatePTPlan />} allowedRole="trainer" />} />
                <Route path="/trainer/client-interaction" element={<ProtectedRoute element={<ClientInteraction />} allowedRole="trainer" />} />
                <Route path="/trainer/client-plan/:clientId" element={<ProtectedRoute element={<ClientPlan />} allowedRole="trainer" />} />
                <Route path="/trainer/pt-plans" element={<ProtectedRoute element={<PTPlanList />} allowedRole="trainer" />} /> {/* New route */}
              </Route>

              <Route path="/trainer/login" element={<TrainerLogin />} />
              <Route path="/trainer/signup" element={<TrainerSignup />} />
              <Route path="/trainer/verify-otp" element={<TrainerVerifyOtp />} />
              <Route path="/trainer/pending-approval" element={<PendingApproval />} />
              <Route path="/trainer/forbidden" element={<TrainerForbiddenPage />} />

              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<ProtectedRoute element={<DashboardView />} allowedRole="admin" />} />
                <Route path="/admin/users" element={<ProtectedRoute element={<UserManagement />} allowedRole="admin" />} />
                <Route path="/admin/reports" element={<ProtectedRoute element={<Reports />} allowedRole="admin" />} />
                <Route path="/admin/trainers" element={<ProtectedRoute element={<TrainerManagement />} allowedRole="admin" />} />
                <Route path="/admin/trainers/:id" element={<ProtectedRoute element={<TrainerDetails />} allowedRole="admin" />} />
                <Route path="/admin/gyms" element={<ProtectedRoute element={<Gyms />} allowedRole="admin" />} />
                <Route path="/admin/gym/add" element={<ProtectedRoute element={<AddGymForm />} allowedRole="admin" />} />
                <Route path="/admin/membership-plans" element={<ProtectedRoute element={<MembershipPlans />} allowedRole="admin" />} />
                <Route path="/admin/membership/add" element={<ProtectedRoute element={<AddMembershipPlan />} allowedRole="admin" />} />
                <Route path="/admin/pt-plans" element={<ProtectedRoute element={<PTPlanManagement />} allowedRole="admin" />} /> 
                <Route path="/admin/forbidden" element={<AdminForbiddenPage />} />
              </Route>

              <Route
                path="/admin/login"
                element={
                  <ProtectedRoute
                    element={<AdminLogin />}
                    allowedRole="admin"
                    isPublic={true}
                  />
                }
              />
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} />
          </Suspense>
        </ErrorBoundary>
      </GoogleOAuthProvider>
      <ToastContainer />
    </div>
  );
};

export default App;
