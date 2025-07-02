import React, { useState, useEffect, type ChangeEvent, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import { toast } from "react-toastify";
import { AxiosError } from "axios";
import type { AppDispatch, RootState } from "../../store/store";
import type { TrainerProfileData } from "../../types/trainer.type";
import type { ITrainerProfileResponseDTO } from "../../types/dtos/ITrainerProfileResponseDTO";
import { getTrainerProfile, updateTrainerProfile } from "../../services/api/trainerApi";
import type { IUpdateTrainerProfileRequestDTO } from "../../types/dtos/IUpdateTrainerProfileRequestDTO";
import { setAuth } from "../../store/slices/trainerAuthSlice";
import Navbar from "../../components/common/trainer/Navbar";

// Initialize repository and use cases

const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const TrainerProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { trainer } = useSelector((state: RootState) => state.trainerAuth);
  const [profileData, setProfileData] = useState<TrainerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState({
    name: "",
    bio: "",
    specialties: [] as string[],
    profilePic: null as File | null,
    upiId: "",
    bankAccount: "",
    ifscCode: "",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response: ITrainerProfileResponseDTO = await getTrainerProfile();
        const trainerProfile = response.trainer;
        setProfileData(trainerProfile);
        setEditedData({
          name: trainerProfile.name || "",
          bio: trainerProfile.bio || "",
          specialties: trainerProfile.specialties || [],
          profilePic: null,
          upiId: trainerProfile.paymentDetails?.upiId || "",
          bankAccount: trainerProfile.paymentDetails?.bankAccount || "",
          ifscCode: trainerProfile.paymentDetails?.ifscCode || "",
        });
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage = axiosError.response?.data?.message || "Failed to load profile data";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        toast.error("Only JPEG or PNG images are allowed. Files like PDF or DOC are not permitted.");
        e.target.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        e.target.value = "";
        return;
      }
      setEditedData((prev) => ({ ...prev, profilePic: file }));
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, [previewUrl]);

  const handleSpecialtyChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value && !editedData.specialties.includes(value)) {
      setEditedData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, value],
      }));
    }
  }, [editedData.specialties]);

  const removeSpecialty = useCallback((specialty: string) => {
    setEditedData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((s) => s !== specialty),
    }));
  }, []);

  const validateInputs = useCallback(() => {
    if (!editedData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (editedData.name.length < 2 || editedData.name.length > 50) {
      toast.error("Name must be between 2 and 50 characters");
      return false;
    }

    if (editedData.bio && editedData.bio.length > 500) {
      toast.error("Bio cannot exceed 500 characters");
      return false;
    }
    if (!editedData.bio.trim()) {
      toast.error("Give Bio descriotion");
      return false;
    }

    if (editedData.specialties.length === 0) {
      toast.error("At least one specialty is required");
      return false;
    }
    if (editedData.specialties.length > 5) {
      toast.error("Maximum 5 specialties allowed");
      return false;
    }

    if (editedData.upiId) {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test(editedData.upiId)) {
        toast.error("Invalid UPI ID format (e.g., user@bank)");
        return false;
      }
    }

    if (editedData.bankAccount) {
      const bankAccountRegex = /^\d{9,18}$/;
      if (!bankAccountRegex.test(editedData.bankAccount)) {
        toast.error("Bank account number must be 9-18 digits");
        return false;
      }
      if (!editedData.ifscCode) {
        toast.error("IFSC code is required when bank account is provided");
        return false;
      }
    }

    if (editedData.ifscCode) {
      if (editedData.ifscCode.trim()) {
        toast.error("Invalid IFSC code format1 (e.g., SBIN0001234)");
        return false;
      }
      if (!editedData.bankAccount) {
        toast.error("Bank account number is required when IFSC code is provided");
        return false;
      }
    }

    if (!editedData.upiId && !editedData.bankAccount && !editedData.ifscCode) {
      toast.error("At least one payment method (UPI ID or Bank Details) is required");
      return false;
    }

    return true;
  }, [editedData]);

  const handleSave = useCallback(async () => {
    if (!validateInputs()) {
      return;
    }

    setIsSaving(true);
    try {
      const updateData: IUpdateTrainerProfileRequestDTO = {};
      if (editedData.name !== profileData?.name) updateData.name = editedData.name;
      if (editedData.bio !== profileData?.bio) updateData.bio = editedData.bio;
      if (JSON.stringify(editedData.specialties) !== JSON.stringify(profileData?.specialties))
        updateData.specialties = editedData.specialties;
      if (editedData.profilePic) updateData.profilePic = editedData.profilePic;
      if (editedData.upiId !== profileData?.paymentDetails?.upiId) updateData.upiId = editedData.upiId;
      if (editedData.bankAccount !== profileData?.paymentDetails?.bankAccount)
        updateData.bankAccount = editedData.bankAccount;
      if (editedData.ifscCode !== profileData?.paymentDetails?.ifscCode)
        updateData.ifscCode = editedData.ifscCode;

      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        setPreviewUrl(null);
        toast.info("No changes to save");
        return;
      }

      const response: ITrainerProfileResponseDTO = await updateTrainerProfile(updateData);
      const updatedTrainer = response.trainer;
      setProfileData(updatedTrainer);
      if (trainer) {
        dispatch(setAuth({
          trainer: {
            ...trainer,
            name: updatedTrainer.name,
            profilePic: updatedTrainer.profilePic || trainer.profilePic,
          },
          isAuthenticated: true,
        }));
      }
      toast.success("Profile updated successfully");
      setIsEditing(false);
      setPreviewUrl(null);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [dispatch, trainer, profileData, editedData, validateInputs]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setPreviewUrl(null);
    setEditedData({
      name: profileData?.name || "",
      bio: profileData?.bio || "",
      specialties: profileData?.specialties || [],
      profilePic: null,
      upiId: profileData?.paymentDetails?.upiId || "",
      bankAccount: profileData?.paymentDetails?.bankAccount || "",
      ifscCode: profileData?.paymentDetails?.ifscCode || "",
    });
  }, [profileData]);

  if (loading) {
    return (
      <div className="text-center py-10">
        <svg className="animate-spin h-8 w-8 mx-auto text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"></path>
        </svg>
        <p className="mt-2 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return <div className="text-center py-10 text-red-600">Profile not found</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 pb-20">
        <div className="relative rounded-lg bg-white shadow overflow-hidden mb-8">
          <div className="h-48 w-full bg-gradient-to-r from-indigo-600 to-green-400"></div>
          <div className="relative -mt-24 px-6 pb-6">
            <div className="flex items-end space-x-5">
              <div className="relative">
                <img
                  className="h-40 w-40 rounded-full border-4 border-white bg-white object-cover"
                  src={previewUrl || (profileData.profilePic ? `${backendUrl}${profileData.profilePic}` : "/images/user.jpg")}
                  alt="Profile picture"
                  onError={(e) => (e.currentTarget.src = "/images/user.jpg")}
                  loading="lazy"
                />
                {isEditing && (
                  <label className="absolute bottom-2 right-2 rounded-full bg-indigo-600 text-white p-2 shadow-md hover:bg-indigo-700 cursor-pointer">
                    <i className="fas fa-camera text-sm" aria-hidden="true"></i>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={handleFileChange}
                      aria-label="Upload profile picture"
                    />
                  </label>
                )}
              </div>
              <div className="flex-1 min-w-0 mb-6">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.name}
                    onChange={(e) => setEditedData((prev) => ({ ...prev, name: e.target.value }))}
                    className="text-2xl font-bold text-gray-900 mb-2 border rounded px-2 py-1 w-full"
                    placeholder="Enter your name"
                    aria-label="Trainer name"
                  />
                ) : (
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-gray-900">{profileData.name || "N/A"}</h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <i className="fas fa-check-circle mr-1" aria-hidden="true"></i>
                      {profileData.verifiedByAdmin ? "Verified" : "Pending Approval"}
                    </span>
                  </div>
                )}
                <p className="text-gray-500">{profileData.experienceLevel || "N/A"}</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-md bg-gray-100 hover:bg-gray-200 px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                aria-label={isEditing ? "Cancel editing" : "Edit profile"}
              >
                <i className="fas fa-pen mr-2" aria-hidden="true"></i>{isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Bio</h3>
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={editedData.bio}
                    onChange={(e) => setEditedData((prev) => ({ ...prev, bio: e.target.value }))}
                    className="mt-4 block w-full rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                    placeholder="Write your bio here..."
                    aria-label="Trainer bio"
                  />
                ) : (
                  <p className="mt-4 text-gray-900">{profileData.bio || "No bio available"}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Specialties</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(isEditing ? editedData.specialties : profileData.specialties || []).map((specialty) => (
                      <span
                        key={specialty}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                      >
                        {specialty}
                        {isEditing && (
                          <button
                            onClick={() => removeSpecialty(specialty)}
                            className="ml-1 text-green-600 hover:text-green-800 focus:outline-none"
                            aria-label={`Remove ${specialty} specialty`}
                          >
                            <i className="fas fa-times" aria-hidden="true"></i>
                          </button>
                        )}
                      </span>
                    ))}
                    {(isEditing ? editedData.specialties : profileData.specialties || []).length === 0 && (
                      <p className="text-gray-500">No specialties added</p>
                    )}
                  </div>
                  {isEditing && (
                    <select
                      onChange={handleSpecialtyChange}
                      className="w-full rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                      aria-label="Add a specialty"
                    >
                      <option value="">Add specialty...</option>
                      <option value="Strength Training">Strength Training</option>
                      <option value="Cardio">Cardio</option>
                      <option value="Yoga">Yoga</option>
                      <option value="Pilates">Pilates</option>
                      <option value="CrossFit">CrossFit</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
                <div className="mt-4 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rate (Admin Set)</label>
                    <p className="mt-1 text-gray-900">
                      {profileData.paymentDetails?.rate
                        ? `${profileData.paymentDetails.rate} ${profileData.paymentDetails.currency || "N/A"}`
                        : "Not set"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method (Admin Set)</label>
                    <p className="mt-1 text-gray-900">{profileData.paymentDetails?.method || "Not set"}</p>
                  </div>
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">UPI ID</label>
                        <input
                          type="text"
                          value={editedData.upiId}
                          onChange={(e) => setEditedData((prev) => ({ ...prev, upiId: e.target.value }))}
                          className="mt-1 block w-full rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm px-3 py-2 transition duration-150 ease-in-out"
                          placeholder="e.g., trainer@upi"
                          aria-label="UPI ID"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bank Account Number</label>
                        <input
                          type="text"
                          value={editedData.bankAccount}
                          onChange={(e) => setEditedData((prev) => ({ ...prev, bankAccount: e.target.value }))}
                          className="mt-1 block w-full rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm px-3 py-2 transition duration-150 ease-in-out"
                          placeholder="e.g., 1234567890"
                          aria-label="Bank account number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                        <input
                          type="text"
                          value={editedData.ifscCode}
                          onChange={(e) => setEditedData((prev) => ({ ...prev, ifscCode: e.target.value }))}
                          className="mt-1 block w-full rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm px-3 py-2 transition duration-150 ease-in-out"
                          placeholder="e.g., SBIN0001234"
                          aria-label="IFSC code"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">UPI ID</label>
                        <p className="mt-1 text-gray-900">{profileData.paymentDetails?.upiId || "Not set"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bank Account Number</label>
                        <p className="mt-1 text-gray-900">{profileData.paymentDetails?.bankAccount || "Not set"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                        <p className="mt-1 text-gray-900">{profileData.paymentDetails?.ifscCode || "Not set"}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {isEditing && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t z-50">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">Editing profile</div>
            <div className="flex space-x-4">
              <button
                onClick={handleCancel}
                className="rounded-md px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                disabled={isSaving}
                aria-label="Cancel editing"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={`rounded-md px-4 py-2 text-sm font-medium text-white flex items-center ${
                  isSaving ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                } focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                disabled={isSaving}
                aria-label="Save profile changes"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerProfile;