// src/presentation/features/user/pages/UserProfile.tsx
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


const backendUrl = import.meta.env.VITE_API_BASE_URL ;
console.log("back end usrl :",backendUrl)

const UserProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); 
  const navigate = useNavigate(); 
  const { user } = useSelector((state: RootState) => state.userAuth); 
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; profilePic?: string }>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile(); 
        setProfileData(response.user);
        setEditedName(response.user.name || "");
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!profileData) return;
    const chart = echarts.init(document.getElementById("weeklyChart") as HTMLDivElement);
    const weeklyCalories = profileData.weeklySummary.length
      ? profileData.weeklySummary.map((summary) => summary.totalCaloriesBurned || 0).slice(-7)
      : Array(7).fill(0);
    const option = {
      animation: false,
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
      yAxis: { type: "value", name: "Calories" },
      series: [
        {
          data: weeklyCalories,
          type: "line",
          smooth: true,
          lineStyle: { color: "#4F46E5" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(79, 70, 229, 0.3)" },
              { offset: 1, color: "rgba(79, 70, 229, 0.1)" },
            ]),
          },
        },
      ],
    };
    chart.setOption(option);
    window.addEventListener("resize", () => chart.resize());
    return () => {
      chart.dispose();
      window.removeEventListener("resize", () => chart.resize());
    };
  }, [profileData]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          profilePic: "Profile picture must be in JPG or PNG format",
        }));
        toast.error("Profile picture must be in JPG or PNG format");
        return;
      }
      setProfilePicFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setErrors((prev) => ({ ...prev, profilePic: undefined }));
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setEditedName(value);
    setErrors((prev) => ({ ...prev, name: undefined }));
  };

  const validateInputs = () => {
    const newErrors: { name?: string; profilePic?: string } = {};
    let isValid = true;

    if (editedName !== profileData?.name) {
      if (!editedName) {
        newErrors.name = "Name cannot be empty";
        isValid = false;
      } else if (editedName.length < 2) {
        newErrors.name = "Name must be at least 2 characters";
        isValid = false;
      } else if (/\s{2,}/.test(editedName) || /^\s|\s$/.test(editedName)) {
        newErrors.name = "Name cannot have multiple spaces or start/end with a space";
        isValid = false;
      }
    }

    if (profilePicFile) {
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(profilePicFile.type)) {
        newErrors.profilePic = "Profile picture must be in JPG or PNG format";
        isValid = false;
      }
    }

    setErrors(newErrors);
    if (!isValid) {
      Object.values(newErrors).forEach((error) => toast.error(error));
    }
    return isValid;
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      return;
    }

    try {
      const updateData: { name?: string; profilePic?: File } = {};
      if (editedName !== profileData?.name) updateData.name = editedName;
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
        };
        dispatch(setAuth({ user: authUser, isAuthenticated: true }));
        toast.success("Profile updated successfully");
      }
      setIsEditing(false);
      setProfilePicFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleLogout = async () => {
    try {
      if (user?.email) {
        await dispatch(logoutThunk(user.email)); 
        toast.success("Logged out successfully!");
        navigate("/auth");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Logout failed—try again!");
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!profileData) {
    return <div className="text-center py-10">Profile not found</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 relative">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {previewUrl || profileData.profilePic ? (
                      <img
                        src={previewUrl || `${backendUrl}${profileData.profilePic}`}
                        alt="Profile picture"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <i className="fas fa-user text-gray-400 text-3xl"></i>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-lg cursor-pointer">
                      <i className="fas fa-camera text-sm"></i>
                      <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} />
                    </label>
                  )}
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editedName}
                        onChange={handleNameChange}
                        className="text-2xl font-bold text-gray-900 mb-2 border rounded px-2 py-1 w-full"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </>
                  ) : (
                    <div className="flex items-center mb-2">
                      <h1 className="text-2xl font-bold text-gray-900 mr-3">{profileData.name || "N/A"}</h1>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                        <i className="fas fa-check-circle mr-1"></i>Verified
                      </span>
                    </div>
                  )}
                  <p className="text-gray-500">
                    Member since{" "}
                    {new Date(profileData.createdAt).toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex space-x-4"> {/* [Change 10 - Line 208]: Add button group */}
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="rounded-md bg-gray-100 hover:bg-gray-200 px-4 py-2 text-gray-700"
                  >
                    <i className="fas fa-pen mr-2"></i>{isEditing ? "Cancel" : "Edit Profile"}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="rounded-md bg-red-500 hover:bg-red-600 px-4 py-2 text-white"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Fitness Profile</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
                    <p className="text-gray-900">
                      {profileData.fitnessProfile.goals?.join(", ") || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Level</label>
                    <p className="text-gray-900">{profileData.fitnessProfile.level || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                    <p className="text-gray-900">{profileData.fitnessProfile.weight || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                    <p className="text-gray-900">{profileData.fitnessProfile.height || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Daily Calorie Goal</label>
                    <p className="text-gray-900">{profileData.fitnessProfile.calorieGoal || "N/A"}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Last updated:{" "}
                  {profileData.fitnessProfile.updatedAt
                    ? new Date(profileData.fitnessProfile.updatedAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Progress</h2>
                  <button className="rounded-md bg-blue-500 px-4 py-2 text-white text-sm font-medium">
                    <i className="fas fa-plus mr-2"></i>Add Progress
                  </button>
                </div>
                <div className="space-y-4">
                  {profileData.progress.length ? (
                    profileData.progress.slice(0, 1).map((entry, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {new Date(entry.workoutDate).toLocaleDateString()}
                            </h3>
                            <p className="text-sm text-gray-500">Workout</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{entry.totalCaloriesBurned || 0} kcal</p>
                            <div className="flex items-center">
                              <i className="fas fa-fire text-orange-500 mr-1"></i>
                              <span className="text-sm text-gray-500">{entry.dailyDifficulty || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          {entry.exercisesCompleted.map((exercise) => (
                            <div key={exercise.exerciseId} className="bg-gray-50 p-3 rounded">
                              <p className="font-medium">{exercise.name || "N/A"}</p>
                              <p className="text-gray-500">
                                {exercise.sets && exercise.reps
                                  ? `${exercise.sets} x ${exercise.reps} reps @ ${exercise.weight || 0}kg`
                                  : "N/A"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="border rounded-lg p-4">
                      <p className="text-gray-500">No progress recorded yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Weekly Summary</h2>
                <div id="weeklyChart" className="h-64"></div>
                <div className="mt-6 space-y-4">
                  {profileData.weeklySummary.length ? (
                    profileData.weeklySummary.slice(0, 2).map((summary, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="text-sm text-gray-500">
                            {new Date(summary.weekStart).toLocaleDateString()} -{" "}
                            {new Date(summary.weekEnd).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total Calories</p>
                          <p className="font-medium">{summary.totalCaloriesBurned || "N/A"} kcal</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-500">No data</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Calories</p>
                        <p className="font-medium">N/A</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Current Workout Plan</h2>
                <div className="text-center p-6 border rounded-lg">
                  <h3 className="font-medium text-lg mb-2">
                    {profileData.workoutPlanId ? "Custom Plan" : "No Plan Assigned"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {profileData.workoutPlanId
                      ? "Focus on your goals"
                      : "Assign a plan to get started"}
                  </p>
                  <button className="rounded-md w-full bg-blue-500 text-white py-2 px-4">
                    View Full Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {isEditing && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t shadow-lg">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Editing profile</p>
              <div className="space-x-4">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setProfilePicFile(null);
                    setPreviewUrl(null);
                    setEditedName(profileData.name || "");
                    setErrors({});
                  }}
                  className="rounded-md bg-gray-100 hover:bg-gray-200 px-4 py-2 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="rounded-md bg-blue-500 px-4 py-2 text-white"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;