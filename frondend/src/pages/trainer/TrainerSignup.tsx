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
    setFormData((prev) => ({ ...prev, [name]: value }));
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
  setFormData((prev) => {
    const updatedSpecialties = prev.specialties.filter((s) => s !== specialty);
    console.log('Updated Specialties:', updatedSpecialties);
    return { ...prev, specialties: updatedSpecialties };
  });
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
    console.log('Form Data Before Submission:', formData);
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Become a FitHub Trainer</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md p-2"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md p-2"
              placeholder="trainer@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full border rounded-md p-2 pr-10"
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Experience Level</label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md p-2"
            >
              <option value="">Select Experience Level</option>
              <option value="Beginner">Beginner (0-2 years)</option>
              <option value="Intermediate">Intermediate (2-5 years)</option>
              <option value="Expert">Expert (5+ years)</option>
            </select>
            {errors.experienceLevel && <p className="text-red-500 text-sm">{errors.experienceLevel}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Specialties</label>
            <select onChange={handleSpecialtyChange} className="mt-1 block w-full border rounded-md p-2">
              <option value="">Add Specialty</option>
              <option value="Strength Training">Strength Training</option>
              <option value="Cardio">Cardio</option>
              <option value="Yoga">Yoga</option>
              <option value="Pilates">Pilates</option>
              <option value="CrossFit">CrossFit</option>
            </select>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800"
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
            {errors.specialties && <p className="text-red-500 text-sm">{errors.specialties}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md p-2"
              placeholder="Tell us about yourself and your training philosophy..."
              rows={4}
            />
            {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Certifications</label>
            {formData.certifications.map((cert, index) => (
              <div key={index} className="mt-2 space-y-2 border p-4 rounded-md">
                <input
                  type="text"
                  placeholder="Certification Name (e.g., NASM CPT)"
                  value={cert.name}
                  onChange={(e) => handleCertificationChange(index, "name", e.target.value)}
                  className="block w-full border rounded-md p-2"
                />
                <input
                  type="text"
                  placeholder="Issuer (e.g., NASM)"
                  value={cert.issuer}
                  onChange={(e) => handleCertificationChange(index, "issuer", e.target.value)}
                  className="block w-full border rounded-md p-2"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date Earned</label>
                  <input
                    type="date"
                    value={cert.dateEarned}
                    onChange={(e) => handleCertificationChange(index, "dateEarned", e.target.value)}
                    className="block w-full border rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Upload Certificate (JPG/PNG)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => handleFileChange(e, index)}
                    className="block w-full"
                  />
                </div>
                {formData.certifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCertificationSlot(index)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addCertificationSlot}
              className="mt-2 text-indigo-600 hover:text-indigo-800"
            >
              + Add Certification
            </button>
            {errors.certifications && <p className="text-red-500 text-sm">{errors.certifications}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-indigo-600 text-white rounded-md ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"
            }`}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already a trainer?{" "}
          <Link to="/trainer/login" className="text-indigo-600 hover:text-indigo-800">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default TrainerSignup;