import React, { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import type { AppDispatch, RootState } from "../../store/store";
import type { TrainerProfileData } from "../../types/trainer.type";
import type { ITrainerProfileResponseDTO } from "../../types/dtos/ITrainerProfileResponseDTO";
import { getTrainerProfile, updateTrainerProfile } from "../../services/api/trainerApi";
import type { IUpdateTrainerProfileRequestDTO } from "../../types/dtos/IUpdateTrainerProfileRequestDTO";
import { setAuth } from "../../store/slices/trainerAuthSlice";
import Navbar from "../../components/common/trainer/Navbar";

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  bio: Yup.string()
    .required("Bio is required")
    .max(500, "Bio cannot exceed 500 characters"),
  specialties: Yup.array()
    .of(Yup.string())
    .required("At least one specialty is required")
    .min(1, "At least one specialty is required")
    .max(5, "Maximum 5 specialties allowed"),
  profilePic: Yup.mixed<File>()
    //.required("Profile picture is required")
    .test(
      "fileFormat",
      "Only JPEG or PNG images are allowed",
      function (value): boolean {
        if (!value) return false;
        return value instanceof File && ["image/jpeg", "image/png"].includes(value.type);
      }
    )
    .test(
      "fileSize",
      "Image size must be less than 5MB",
      function (value): boolean {
        if (!value) return false;
        return value instanceof File && value.size <= 5 * 1024 * 1024;
      }
    ),
  upiId: Yup.string()
    .matches(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, "Invalid UPI ID format (e.g., user@bank)")
    .optional(),
  bankAccount: Yup.string()
    .matches(/^\d{9,18}$/, "Bank account number must be 9-18 digits")
    .optional(),
  ifscCode: Yup.string()
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format (e.g., SBIN0001234)")
    .optional(),
}).test(
  "payment-details",
  "At least one payment method (UPI ID or bank details) is required",
  function (value): boolean {
    return Boolean(value.upiId || (value.bankAccount && value.ifscCode));
  }
).test(
  "bank-details",
  "Both bank account and IFSC code must be provided together",
  function (value): boolean {
    const bothEmpty = !value.bankAccount && !value.ifscCode;
    const bothProvided = Boolean(value.bankAccount && value.ifscCode);
    return bothEmpty || bothProvided;
  }
);

const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, error, placeholder, disabled, type = "text" }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 transition-colors duration-200`}
      placeholder={placeholder}
      disabled={disabled}
      aria-label={label}
    />
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
);

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, value, onChange, error, placeholder }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y min-h-[100px] transition-colors duration-200`}
      placeholder={placeholder}
      aria-label={label}
    />
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
);

interface SpecialtyTagProps {
  specialty: string;
  onRemove?: (specialty: string) => void;
  isEditing: boolean;
}

const SpecialtyTag: React.FC<SpecialtyTagProps> = ({ specialty, onRemove, isEditing }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
    {specialty}
    {isEditing && onRemove && (
      <button
        onClick={() => onRemove(specialty)}
        className="ml-2 text-indigo-600 hover:text-indigo-800 focus:outline-none"
        aria-label={`Remove ${specialty} specialty`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </span>
);

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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
        if (trainerProfile.profilePic) {
          setPreviewUrl(`${backendUrl}${trainerProfile.profilePic}`);
        }
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

  useEffect(() => {
    return () => {
      if (previewUrl && !previewUrl.startsWith(backendUrl)) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, profilePic: "Only JPEG or PNG images are allowed" }));
        e.target.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, profilePic: "Image size must be less than 5MB" }));
        e.target.value = "";
        return;
      }
      setEditedData((prev) => ({ ...prev, profilePic: file }));
      setErrors((prev) => ({ ...prev, profilePic: "" }));
      if (previewUrl && !previewUrl.startsWith(backendUrl)) {
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
      setErrors((prev) => ({ ...prev, specialties: "" }));
    }
    e.target.value = "";
  }, [editedData.specialties]);

  const removeSpecialty = useCallback((specialty: string) => {
    setEditedData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((s) => s !== specialty),
    }));
  }, []);

  const validateInputs = useCallback(async () => {
    try {
      await validationSchema.validate(editedData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const errorMap: { [key: string]: string } = {};
        error.inner.forEach((err) => {
          if (err.path) errorMap[err.path] = err.message;
        });
        setErrors(errorMap);
        error.errors.forEach((err) => toast.error(err));
        return false;
      }
      toast.error("Validation failed");
      return false;
    }
  }, [editedData]);

  const handleSave = useCallback(async () => {
    if (!(await validateInputs())) {
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
      if (previewUrl && !previewUrl.startsWith(backendUrl)) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(updatedTrainer.profilePic ? `${backendUrl}${updatedTrainer.profilePic}` : null);
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
    setErrors({});
    if (previewUrl && !previewUrl.startsWith(backendUrl)) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(profileData?.profilePic ? `${backendUrl}${profileData.profilePic}` : null);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"></path>
        </svg>
        <p className="mt-4 text-gray-600 text-sm">Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-50 text-red-600 text-sm">Profile not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <div className="autumn-shadow rounded-2xl bg-white overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-indigo-400 sm:h-40"></div>
          <div className="relative -mt-16 px-4 sm:px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-5">
              <div className="relative flex-shrink-0">
                <img
                  className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white bg-white object-cover"
                  src={previewUrl || (profileData.profilePic ? `${backendUrl}${profileData.profilePic}` : "/images/trainer.png")}
                  alt="Profile picture"
                  onError={(e) => (e.currentTarget.src = "/images/trainer.png")}
                  loading="lazy"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 rounded-full bg-indigo-600 text-white p-2 shadow-lg hover:bg-indigo-700 cursor-pointer transition-colors duration-200">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6h6v6" />
                    </svg>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={handleFileChange}
                      aria-label="Upload profile picture"
                    />
                  </label>
                )}
                {errors.profilePic && <p className="text-red-500 text-xs mt-2 text-center">{errors.profilePic}</p>}
              </div>
              <div className="flex-1 min-w-0 mt-4 sm:mt-0">
                {isEditing ? (
                  <InputField
                    label="Name"
                    value={editedData.name}
                    onChange={(value) => setEditedData((prev) => ({ ...prev, name: value }))}
                    error={errors.name}
                    placeholder="Enter your name"
                  />
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">{profileData.name || "N/A"}</h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2 sm:mt-0">
                      {profileData.verifiedByAdmin ? (
                        <>
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Verified
                        </>
                      ) : (
                        "Pending Approval"
                      )}
                    </span>
                  </div>
                )}
                <p className="text-gray-500 text-sm mt-1">{profileData.experienceLevel || "N/A"}</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="mt-4 sm:mt-0 rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                aria-label={isEditing ? "Cancel editing" : "Edit profile"}
              >
                {isEditing ? "Cancel" : (
                  <>
                    <svg className="h-4 w-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="autumn-shadow rounded-2xl bg-white p-6">
              <h3 className="text-lg font-medium text-gray-900">Bio</h3>
              {isEditing ? (
                <TextAreaField
                  label="Bio"
                  value={editedData.bio}
                  onChange={(value) => setEditedData((prev) => ({ ...prev, bio: value }))}
                  error={errors.bio}
                  placeholder="Write your bio here..."
                />
              ) : (
                <p className="mt-4 text-gray-700 text-sm">{profileData.bio || "No bio available"}</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="autumn-shadow rounded-2xl bg-white p-6">
              <h3 className="text-lg font-medium text-gray-900">Specialties</h3>
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(isEditing ? editedData.specialties : profileData.specialties || []).map((specialty) => (
                    <SpecialtyTag
                      key={specialty}
                      specialty={specialty}
                      onRemove={isEditing ? removeSpecialty : undefined}
                      isEditing={isEditing}
                    />
                  ))}
                  {(isEditing ? editedData.specialties : profileData.specialties || []).length === 0 && (
                    <p className="text-gray-500 text-sm">No specialties added</p>
                  )}
                </div>
                {isEditing && (
                  <div>
                    <select
                      onChange={handleSpecialtyChange}
                      className={`w-full rounded-lg border ${errors.specialties ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200`}
                      aria-label="Add a specialty"
                    >
                      <option value="">Add specialty...</option>
                      <option value="Strength Training">Strength Training</option>
                      <option value="Cardio">Cardio</option>
                      <option value="Yoga">Yoga</option>
                      <option value="Pilates">Pilates</option>
                      <option value="CrossFit">CrossFit</option>
                    </select>
                    {errors.specialties && <p className="text-red-500 text-xs mt-1">{errors.specialties}</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="autumn-shadow rounded-2xl bg-white p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rate (Admin Set)</label>
                  <p className="mt-1 text-gray-700 text-sm">
                    {profileData.paymentDetails?.rate
                      ? `${profileData.paymentDetails.rate} ${profileData.paymentDetails.currency || "N/A"}`
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method (Admin Set)</label>
                  <p className="mt-1 text-gray-700 text-sm">{profileData.paymentDetails?.method || "Not set"}</p>
                </div>
                {isEditing ? (
                  <>
                    <InputField
                      label="UPI ID"
                      value={editedData.upiId}
                      onChange={(value) => setEditedData((prev) => ({ ...prev, upiId: value }))}
                      error={errors.upiId || errors['payment-details']}
                      placeholder="e.g., trainer@upi"
                    />
                    <InputField
                      label="Bank Account Number"
                      value={editedData.bankAccount}
                      onChange={(value) => setEditedData((prev) => ({ ...prev, bankAccount: value }))}
                      error={errors.bankAccount || errors['bank-details']}
                      placeholder="e.g., 1234567890"
                    />
                    <InputField
                      label="IFSC Code"
                      value={editedData.ifscCode}
                      onChange={(value) => setEditedData((prev) => ({ ...prev, ifscCode: value }))}
                      error={errors.ifscCode || errors['bank-details']}
                      placeholder="e.g., SBIN0001234"
                    />
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">UPI ID</label>
                      <p className="mt-1 text-gray-700 text-sm">{profileData.paymentDetails?.upiId || "Not set"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bank Account Number</label>
                      <p className="mt-1 text-gray-700 text-sm">{profileData.paymentDetails?.bankAccount || "Not set"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                      <p className="mt-1 text-gray-700 text-sm">{profileData.paymentDetails?.ifscCode || "Not set"}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="fixed bottom-0 inset-x-0 bg-white border-t shadow-lg z-50 sm:static sm:mt-6 sm:border-t-0 sm:shadow-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between">
              <div className="text-sm text-gray-500 mb-2 sm:mb-0">Editing profile</div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="rounded-lg border border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
                  disabled={isSaving}
                  aria-label="Cancel editing"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white flex items-center ${isSaving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200`}
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
      </main>
    </div>
  );
};

export default TrainerProfile;