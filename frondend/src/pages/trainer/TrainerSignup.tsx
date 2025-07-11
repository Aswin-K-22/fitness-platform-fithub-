/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import type { ITrainerSignupRequestDTO } from "../../types/dtos/ITrainerSignupRequestDTO";
import { signupTrainer } from "../../services/api/trainerApi";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  experienceLevel?: string;
  specialties?: string;
  bio?: string;
  certifications?: string;
}

const TrainerSignup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ITrainerSignupRequestDTO>({
    name: "",
    email: "",
    password: "",
    experienceLevel: "",
    specialties: [],
    bio: "",
    certifications: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (!/^[a-zA-Z\s]{2,}$/.test(formData.name.trim()))
      newErrors.name = "Name must be 2+ letters, no numbers or special characters";
    else if (formData.name !== formData.name.trim()) newErrors.name = "Name cannot have leading/trailing spaces";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim()))
      newErrors.email = "Invalid email format";
    else if (formData.email !== formData.email.trim()) newErrors.email = "Email cannot have leading/trailing spaces";

    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.trim().length < 5)
      newErrors.password = "Password must be 8+ characters with an uppercase letter and a number";
    else if (formData.password !== formData.password.trim())
      newErrors.password = "Password cannot have leading/trailing spaces";

    if (!formData.experienceLevel.trim()) newErrors.experienceLevel = "Experience level is required";

    if (formData.specialties.length === 0) newErrors.specialties = "At least one specialty is required";

    if (!formData.bio.trim()) newErrors.bio = "Bio is required";
    else if (formData.bio.trim().length < 5) newErrors.bio = "Bio must be at least 20 characters";
    else if (formData.bio !== formData.bio.trim()) newErrors.bio = "Bio cannot have leading/trailing spaces";

    if (formData.certifications.length === 0) {
      newErrors.certifications = "At least one certification is required";
    } else {
      formData.certifications.forEach((cert, index) => {
        if (!cert.name.trim()) newErrors.certifications = `Certification ${index + 1}: Name is required`;
        else if (cert.name !== cert.name.trim())
          newErrors.certifications = `Certification ${index + 1}: Name cannot have leading/trailing spaces`;

        if (!cert.issuer.trim()) newErrors.certifications = `Certification ${index + 1}: Issuer is required`;
        else if (cert.issuer !== cert.issuer.trim())
          newErrors.certifications = `Certification ${index + 1}: Issuer cannot have leading/trailing spaces`;

        if (!cert.dateEarned) newErrors.certifications = `Certification ${index + 1}: Date earned is required`;
        else {
          const selectedDate = new Date(cert.dateEarned);
          const today = new Date();
          if (selectedDate > today) {
            newErrors.certifications = `Certification ${index + 1}: Date earned cannot be in the future`;
          }
        }

        if (!cert.file) {
          newErrors.certifications = `Certification ${index + 1}: File is required`;
        } else if (!["image/jpeg", "image/png"].includes(cert.file.type)) {
          newErrors.certifications = `Certification ${index + 1}: Only JPG or PNG files are allowed`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSpecialtyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value && !formData.specialties.includes(value)) {
      setFormData((prev) => ({ ...prev, specialties: [...prev.specialties, value] }));
      setErrors((prev) => ({ ...prev, specialties: undefined }));
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((s) => s !== specialty),
    }));
  };

  const handleCertificationChange = (
    index: number,
    field: keyof ITrainerSignupRequestDTO["certifications"][0],
    value: string | File
  ) => {
    const newCertifications = [...formData.certifications];
    newCertifications[index] = { ...newCertifications[index], [field]: value };
    setFormData((prev) => ({ ...prev, certifications: newCertifications }));
    setErrors((prev) => ({ ...prev, certifications: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCertificationChange(index, "file", file);
    }
  };

  const addCertificationSlot = () => {
    setFormData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, { name: "", issuer: "", dateEarned: "", file: null as any }],
    }));
  };

  const removeCertificationSlot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signupTrainer(formData);
      toast.success("Signup successful! Please verify your email.");
      navigate("/trainer/verify-otp", { state: { email: formData.email, purpose: "trainer-signup" } });
    } catch (error) {
      toast.error("Signup failed. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
          Become a FitHub Trainer
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
              placeholder="John Doe"
            />
            {errors.name && <p className="mt-1 text-red-500 text-xs sm:text-sm">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="trainer@example.com"
            />
            {errors.email && <p className="mt-1 text-red-500 text-xs sm:text-sm">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {showPassword ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  ) : (
                    <>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                    </>

                  )}
                </svg>
              </button>
            </div>
            {errors.password && <p className="mt-1 text-red-500 text-xs sm:text-sm">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
            >
              <option value="">Select Experience Level</option>
              <option value="Beginner">Beginner (0-2 years)</option>
              <option value="Intermediate">Intermediate (2-5 years)</option>
              <option value="Expert">Expert (5+ years)</option>
            </select>
            {errors.experienceLevel && (
              <p className="mt-1 text-red-500 text-xs sm:text-sm">{errors.experienceLevel}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
            <select
              onChange={handleSpecialtyChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
            >
              <option value="">Add Specialty</option>
              <option value="Strength Training">Strength Training</option>
              <option value="Cardio">Cardio</option>
              <option value="Yoga">Yoga</option>
              <option value="Pilates">Pilates</option>
              <option value="CrossFit">CrossFit</option>
            </select>
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm"
                >
                  {specialty}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(specialty)}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {errors.specialties && <p className="mt-1 text-red-500 text-xs sm:text-sm">{errors.specialties}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
              placeholder="Tell us about yourself and your training philosophy..."
              rows={5}
            />
            {errors.bio && <p className="mt-1 text-red-500 text-xs sm:text-sm">{errors.bio}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
            {formData.certifications.map((cert, index) => (
              <div
                key={index}
                className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4"
              >
                <input
                  type="text"
                  placeholder="Certification Name (e.g., NASM CPT)"
                  value={cert.name}
                  onChange={(e) => handleCertificationChange(index, "name", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                />
                <input
                  type="text"
                  placeholder="Issuer (e.g., NASM)"
                  value={cert.issuer}
                  onChange={(e) => handleCertificationChange(index, "issuer", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Earned</label>
                  <input
                    type="date"
                    value={cert.dateEarned}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => handleCertificationChange(index, "dateEarned", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Certificate (JPG/PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => handleFileChange(e, index)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
                {formData.certifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCertificationSlot(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove Certification
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addCertificationSlot}
              className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              + Add Another Certification
            </button>
            {errors.certifications && (
              <p className="mt-1 text-red-500 text-xs sm:text-sm">{errors.certifications}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium text-sm sm:text-base transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"
            }`}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already a trainer?{" "}
          <Link to="/trainer/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default TrainerSignup;