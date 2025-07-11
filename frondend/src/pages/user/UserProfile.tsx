/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, type ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux"; 
import * as echarts from "echarts";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; 
import type { AppDispatch, RootState } from "../../store/store";
import type { UserProfileData } from "../../types/user.types";
import { getUserProfile, updateUserProfile } from "../../services/api/userApi";
import { logoutThunk, setAuth } from "../../store/slices/userAuthSlice";
import Navbar from "../../components/common/user/Navbar";
import type { UserAuth } from "../../types/auth.types";

const backendUrl = import.meta.env.VITE_API_BASE_URL;

const UserProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); 
  const navigate = useNavigate(); 
  const { user } = useSelector((state: RootState) => state.userAuth); 
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [membershipPlan, setMembershipPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; profilePic?: string }>({});
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchProfileAndMembership = async () => {
      try {
        const response = await getUserProfile(); 
        setProfileData(response.user);
        setEditedName(response.user.name || "");

        //const membershipResponse = await getMembershipPlansUser(1, 1); // Fetch one plan for the current user
        // const membership = membershipResponse.memberships[0]; // Assuming first membership is the active one
        // if (membership) {
        //   setMembershipPlan({
        //     ...membership,
        //     plan: membershipResponse.plans.find((plan: any) => plan._id === membership.planId),
        //   });
        // }

      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
   fetchProfileAndMembership();
  }, []);

  useEffect(() => {
    if (!profileData || activeTab !== "analytics") return;
    
    const initChart = () => {
      const chartElement = document.getElementById("weeklyChart");
      if (!chartElement) return;
      
      const chart = echarts.init(chartElement);
      const weeklyCalories = profileData.weeklySummary?.length
        ? profileData.weeklySummary.map((summary) => summary.totalCaloriesBurned || 0).slice(-7)
        : Array(7).fill(0);
      
      const option = {
        animation: true,
        animationDuration: 1000,
        tooltip: { 
          trigger: "axis",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "transparent",
          textStyle: { color: "#fff" }
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: { 
          type: "category", 
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          axisLine: { lineStyle: { color: "#e5e7eb" } },
          axisTick: { show: false },
          axisLabel: { color: "#6b7280" }
        },
        yAxis: { 
          type: "value", 
          name: "Calories",
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: "#f3f4f6" } },
          axisLabel: { color: "#6b7280" }
        },
        series: [
          {
            data: weeklyCalories,
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 8,
            lineStyle: { 
              color: "#3b82f6",
              width: 3
            },
            itemStyle: {
              color: "#3b82f6",
              borderColor: "#fff",
              borderWidth: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(59, 130, 246, 0.2)" },
                { offset: 1, color: "rgba(59, 130, 246, 0.05)" },
              ]),
            },
          },
        ],
      };
      chart.setOption(option);
      
      const handleResize = () => chart.resize();
      window.addEventListener("resize", handleResize);
      
      return () => {
        chart.dispose();
        window.removeEventListener("resize", handleResize);
      };
    };

    const timeout = setTimeout(initChart, 100);
    return () => clearTimeout(timeout);
  }, [profileData, activeTab]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png"];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          profilePic: "Please upload a JPG, PNG, or WebP image",
        }));
        toast.error("Please upload a JPG, PNG, or WebP image");
        return;
      }
      
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          profilePic: "Image size must be less than 5MB",
        }));
        toast.error("Image size must be less than 5MB");
        return;
      }
      
      setProfilePicFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setErrors((prev) => ({ ...prev, profilePic: undefined }));
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditedName(value);
    
    // Real-time validation
    if (value.trim().length === 0) {
      setErrors((prev) => ({ ...prev, name: "Name is required" }));
    } else if (value.trim().length < 2) {
      setErrors((prev) => ({ ...prev, name: "Name must be at least 2 characters" }));
    } else if (value.length > 50) {
      setErrors((prev) => ({ ...prev, name: "Name must be less than 50 characters" }));
    } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
      setErrors((prev) => ({ ...prev, name: "Name can only contain letters and spaces" }));
    } else if (/\s{2,}/.test(value) || /^\s|\s$/.test(value)) {
      setErrors((prev) => ({ ...prev, name: "Invalid spacing in name" }));
    } else {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const validateInputs = () => {
    const newErrors: { name?: string; profilePic?: string } = {};
    let isValid = true;

    if (editedName !== profileData?.name) {
      const trimmedName = editedName.trim();
      if (!trimmedName) {
        newErrors.name = "Name is required";
        isValid = false;
      } else if (trimmedName.length < 2) {
        newErrors.name = "Name must be at least 2 characters";
        isValid = false;
      } else if (trimmedName.length > 50) {
        newErrors.name = "Name must be less than 50 characters";
        isValid = false;
      } else if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
        newErrors.name = "Name can only contain letters and spaces";
        isValid = false;
      } else if (/\s{2,}/.test(editedName) || /^\s|\s$/.test(editedName)) {
        newErrors.name = "Invalid spacing in name";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      return;
    }

    try {
      const updateData: { name?: string; profilePic?: File } = {};
      if (editedName.trim() !== profileData?.name) updateData.name = editedName.trim();
      if (profilePicFile) updateData.profilePic = profilePicFile;

      if (Object.keys(updateData).length > 0) {
        const response = await updateUserProfile(updateData); 
        setProfileData(response.user);
        const authUser: UserAuth = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
          profilePic: response.user?.profilePic || null,
          isVerified: response.user?.isVerified || true,
        };
        dispatch(setAuth({ user: authUser, isAuthenticated: true }));
        toast.success("Profile updated successfully! ✨");
      }
      setIsEditing(false);
      setProfilePicFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      if (user?.email) {
        await dispatch(logoutThunk(user.email)); 
        toast.success("See you later! 👋");
        navigate("/auth");
      }
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setProfilePicFile(null);
    setPreviewUrl(null);
    setEditedName(profileData?.name || "");
    setErrors({});
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-gray-600 text-lg">Profile not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90"></div>
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="h-32 w-32 rounded-full overflow-hidden bg-white shadow-xl border-4 border-white mx-auto relative">
                {previewUrl || profileData.profilePic ? (
                  <img
                    src={previewUrl || `${backendUrl}${profileData.profilePic}`}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">
                      {profileData.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer transition-all duration-200 transform hover:scale-110">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>
            
            {isEditing ? (
              <div className="max-w-md mx-auto">
                <input
                  type="text"
                  value={editedName}
                  onChange={handleNameChange}
                  className={`text-3xl font-bold text-center bg-white/20 backdrop-blur-sm border-2 rounded-lg px-4 py-2 text-white placeholder-white/70 w-full focus:outline-none focus:ring-2 focus:ring-white/50 ${
                    errors.name ? 'border-red-300' : 'border-white/30'
                  }`}
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="text-red-200 text-sm mt-2 bg-red-500/20 backdrop-blur-sm rounded px-3 py-1 inline-block">
                    {errors.name}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{profileData.name || "Welcome!"}</h1>
                <div className="flex items-center justify-center space-x-4">
                  <span className="bg-green-500/20 backdrop-blur-sm text-green-100 px-4 py-1 rounded-full text-sm font-medium border border-green-300/30">
                    <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified Member
                  </span>
                  <span className="text-white/80 text-sm">
                    Member since {new Date(profileData.createdAt).toLocaleDateString("default", { month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex justify-center space-x-4 mt-8">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-white/30 hover:border-white/50"
                  >
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500/80 backdrop-blur-sm hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-red-400/30 hover:border-red-400/50"
                  >
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={!!errors.name || !!errors.profilePic}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                  >
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="bg-gray-500/80 backdrop-blur-sm hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative -mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: "overview", name: "Overview", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" },
                { id: "fitness", name: "Fitness Profile", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
                { id: "progress", name: "Progress", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
                { id: "analytics", name: "Analytics", icon: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-blue-500 p-2 rounded-lg mr-3">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Workouts</p>
                          <p className="text-2xl font-bold text-gray-900">{profileData.progress?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-green-500 p-2 rounded-lg mr-3">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Fitness Level</p>
                          <p className="text-2xl font-bold text-gray-900">{profileData.fitnessProfile?.level || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
<div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Plan</h3>
                <div className="text-center">
                  {membershipPlan ? (
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-lg mb-4">
                      <svg className="w-12 h-12 text-purple-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h4 className="font-semibold text-gray-900 mb-2">{membershipPlan.plan.name}</h4>
                      <p className="text-gray-600 text-sm mb-2">{membershipPlan.plan.description}</p>
                      <p className="text-gray-600 text-sm mb-2">
                        <span className="font-medium">Status:</span> {membershipPlan.status}
                      </p>
                      <p className="text-gray-600 text-sm mb-2">
                        <span className="font-medium">Price:</span> {membershipPlan.price} {membershipPlan.currency}
                      </p>
                      <p className="text-gray-600 text-sm mb-2">
                        <span className="font-medium">Start Date:</span>{" "}
                        {new Date(membershipPlan.startDate).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600 text-sm mb-2">
                        <span className="font-medium">End Date:</span>{" "}
                        {new Date(membershipPlan.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">Features:</span>{" "}
                        {membershipPlan.plan.features.join(", ") || "N/A"}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-lg mb-4">
                      <svg className="w-12 h-12 text-purple-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h4 className="font-semibold text-gray-900 mb-2">No Plan Assigned</h4>
                      <p className="text-gray-600 text-sm">Start your fitness journey</p>
                    </div>
                  )}
                  <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200">
                    {membershipPlan ? "View Plan Details" : "Get Started"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Fitness Profile Tab */}
          {activeTab === "fitness" && (
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Fitness Profile</h3>
                <span className="text-sm text-gray-500">
                  Last updated: {profileData.fitnessProfile?.updatedAt 
                    ? new Date(profileData.fitnessProfile.updatedAt).toLocaleDateString() 
                    : "Never"}
                </span>
              </div>
              
              {profileData.fitnessProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: "Goals", value: profileData.fitnessProfile.goals?.join(", ") || "N/A", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
                    { label: "Fitness Level", value: profileData.fitnessProfile.level || "N/A", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
                    { label: "Weight", value: profileData.fitnessProfile.weight ? `${profileData.fitnessProfile.weight} kg` : "N/A", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" },
                    { label: "Height", value: profileData.fitnessProfile.height ? `${profileData.fitnessProfile.height} cm` : "N/A", icon: "M12 2l0 20" },
                    { label: "Daily Calorie Goal", value: profileData.fitnessProfile.calorieGoal || "N/A", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" }
                  ].map((item, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                        <label className="text-sm font-medium text-gray-700">{item.label}</label>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Fitness Profile</h4>
                  <p className="text-gray-600 mb-4">Complete your fitness profile to get personalized recommendations</p>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                    Create Profile
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === "progress" && (
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Recent Progress</h3>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Progress
                </button>
              </div>
              
              <div className="space-y-4">
                {profileData.progress?.length ? (
                  profileData.progress.slice(0, 3).map((entry, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {new Date(entry.workoutDate).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </h4>
                          <p className="text-gray-600">Workout Session</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end mb-1">
                            <svg className="w-5 h-5 text-orange-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                            </svg>
                            <span className="text-2xl font-bold text-gray-900">{entry.totalCaloriesBurned || 0}</span>
                            <span className="text-gray-600 ml-1">kcal</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                              {entry.dailyDifficulty || "Medium"}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {entry.exercisesCompleted.slice(0, 6).map((exercise) => (
                          <div key={exercise.exerciseId} className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-100">
                            <p className="font-medium text-gray-900 mb-1">{exercise.name || "Exercise"}</p>
                            <p className="text-sm text-gray-600">
                              {exercise.sets && exercise.reps
                                ? `${exercise.sets} sets × ${exercise.reps} reps`
                                : "Completed"}
                              {exercise.weight && ` @ ${exercise.weight}kg`}
                            </p>
                          </div>
                        ))}
                        {entry.exercisesCompleted.length > 6 && (
                          <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 text-sm font-medium">
                              +{entry.exercisesCompleted.length - 6} more
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Progress Yet</h4>
                    <p className="text-gray-600 mb-4">Start tracking your workouts to see your progress here</p>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                      Record First Workout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Weekly Calorie Burn</h3>
                <div id="weeklyChart" className="h-80 w-full"></div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Weekly Summary</h3>
                <div className="space-y-4">
                  {profileData.weeklySummary?.length ? (
                    profileData.weeklySummary.slice(0, 4).map((summary, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                        <div className="flex items-center">
                          <div className="bg-blue-500 p-2 rounded-lg mr-4">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Week of {new Date(summary.weekStart).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(summary.weekStart).toLocaleDateString()} - {new Date(summary.weekEnd).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-orange-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xl font-bold text-gray-900">{summary.totalCaloriesBurned || 0}</span>
                            <span className="text-gray-600 ml-1">kcal</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600">No weekly data available yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>

      {/* Bottom Toast for Edit Mode */}
      {isEditing && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-xl z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Editing profile - Make your changes above</span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!!errors.name || !!errors.profilePic}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </button>
              </div>
            </div>
            {(errors.name || errors.profilePic) && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-700 text-sm">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Please fix the errors above before saving</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;