// components/EditPTPlanModal.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { updatePTPlan } from "../../../services/api/trainerApi";
import type { PTPlan } from "../../../types/pTPlan";
import type { RootState } from "../../../store/store";

// Reuse the same Zod schema as in CreatePTPlan
const ptPlanSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters long" })
    .max(100, { message: "Title cannot exceed 100 characters" })
    .nonempty({ message: "Title is required" })
    .trim(),
  category: z.enum(["beginner", "intermediate", "advanced"], {
    errorMap: () => ({ message: "Please select a category" }),
  }),
  mode: z.literal("online", { errorMap: () => ({ message: "Please select a mode" }) }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters long" })
    .max(1000, { message: "Description cannot exceed 1000 characters" })
    .nonempty({ message: "Description is required" })
    .trim(),
  goal: z
    .string()
    .min(5, { message: "Goal must be at least 5 characters long" })
    .max(100, { message: "Goal cannot exceed 100 characters" })
    .nonempty({ message: "Goal is required" })
    .trim(),
  features: z
    .array(z.string())
    .min(1, { message: "At least one feature must be selected" }),
  duration: z
    .number({ invalid_type_error: "Duration must be a number" })
    .min(1, { message: "Duration must be at least 1 month" })
    .max(12, { message: "Duration cannot exceed 12 months" }),
  image: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) => !files || files.length === 0 || ["image/jpeg", "image/png"].includes(files[0]?.type),
      { message: "Only .jpg and .png files are allowed" }
    )
    .refine(
      (files) => !files || files.length === 0 || files[0]?.size <= 5 * 1024 * 1024,
      { message: "Image size must not exceed 5MB" }
    ),
  trainerPrice: z
    .number({ invalid_type_error: "Price must be a number" })
    .min(0, { message: "Price cannot be negative" })
    .max(100000, { message: "Price cannot exceed 100,000" }),
});

type PTPlanFormData = z.infer<typeof ptPlanSchema>;

interface EditPTPlanModalProps {
  plan: PTPlan;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedPlan: PTPlan) => void;
}

const EditPTPlanModal: React.FC<EditPTPlanModalProps> = ({ plan, isOpen, onClose, onUpdate }) => {
  const { trainer } = useSelector((state: RootState) => state.trainerAuth);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PTPlanFormData>({
    resolver: zodResolver(ptPlanSchema),
    defaultValues: {
      title: plan.title,
      category: plan.category,
      mode: plan.mode as "online",
      description: plan.description,
      goal: plan.goal,
      features: plan.features,
      duration: plan.duration,
      trainerPrice: plan.trainerPrice,
    },
  });

  useEffect(() => {
    reset({
      title: plan.title,
      category: plan.category,
      mode: plan.mode as "online",
      description: plan.description,
      goal: plan.goal,
      features: plan.features,
      duration: plan.duration,
      trainerPrice: plan.trainerPrice,
    });
  }, [plan, reset]);

  const onSubmit = async (data: PTPlanFormData) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("category", data.category);
      formData.append("mode", data.mode);
      formData.append("description", data.description);
      formData.append("goal", data.goal);
      formData.append("features", JSON.stringify(data.features));
      formData.append("duration", data.duration.toString());
      if (data.image && data.image[0]) {
        formData.append("image", data.image[0]);
      }
      formData.append("trainerPrice", data.trainerPrice.toString());
      if (trainer?.id) formData.append("createBy", trainer.id);

      await updatePTPlan(plan.id, formData);

      // Update the plan in the parent component
      onUpdate({
        ...plan,
        title: data.title,
        category: data.category,
        mode: data.mode,
        description: data.description,
        goal: data.goal,
        features: data.features,
        duration: data.duration,
        trainerPrice: data.trainerPrice,
        // Note: Image URL update depends on backend response; you may need to handle this
      });

      toast.success("PT Plan updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating PT plan:", error);
      toast.error("Failed to update PT plan. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Personal Training Plan</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Plan Title
            </label>
            <input
              id="title"
              type="text"
              {...register("title")}
              className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4"
              placeholder="e.g., I will guide you to a Six Pack"
            />
            {errors.title?.message && (
              <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              {...register("category")}
              className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4"
            >
              <option value="" disabled>
                Select a category
              </option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            {errors.category?.message && (
              <p className="mt-2 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Mode */}
          <div>
            <label htmlFor="mode" className="block text-sm font-medium text-gray-700">
              Training Mode
            </label>
            <select
              id="mode"
              {...register("mode")}
              className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4"
              disabled
            >
              <option value="online">Online</option>
            </select>
            {errors.mode?.message && (
              <p className="mt-2 text-sm text-red-600">{errors.mode.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              {...register("description")}
              rows={6}
              className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4"
              placeholder="Describe your training plan in detail"
            />
            {errors.description?.message && (
              <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Goal */}
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700">
              Goal
            </label>
            <input
              id="goal"
              type="text"
              {...register("goal")}
              className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4"
              placeholder="e.g., Weight Loss, Weight Gain"
            />
            {errors.goal?.message && (
              <p className="mt-2 text-sm text-red-600">{errors.goal.message}</p>
            )}
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Features</label>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {["Custom Workout Plan", "Custom Diet Plan", "24/7 Availability", "Weekly Check-ins"].map(
                (feature) => (
                  <div key={feature} className="flex items-center">
                    <input
                      id={feature}
                      type="checkbox"
                      value={feature}
                      {...register("features")}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={feature} className="ml-3 text-sm text-gray-600">
                      {feature}
                    </label>
                  </div>
                )
              )}
            </div>
            {errors.features?.message && (
              <p className="mt-2 text-sm text-red-600">{errors.features.message}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
              Duration (Months)
            </label>
            <input
              id="duration"
              type="number"
              {...register("duration", { valueAsNumber: true })}
              className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4"
              placeholder="e.g., 3"
            />
            {errors.duration?.message && (
              <p className="mt-2 text-sm text-red-600">{errors.duration.message}</p>
            )}
          </div>

          {/* Image */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Plan Image (Optional)
            </label>
            <input
              id="image"
              type="file"
              accept="image/jpeg,image/png"
              {...register("image")}
              className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {errors.image?.message && (
              <p className="mt-2 text-sm text-red-600">{errors.image.message}</p>
            )}
            {plan.image && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Current Image:</p>
                <img src={plan.image} alt="Current plan" className="mt-2 h-32 w-auto rounded-lg" />
              </div>
            )}
          </div>

          {/* Price */}
          <div>
            <label htmlFor="trainerPrice" className="block text-sm font-medium text-gray-700">
              Price (INR)
            </label>
            <input
              id="trainerPrice"
              type="number"
              step="0.01"
              {...register("trainerPrice", { valueAsNumber: true })}
              className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4"
              placeholder="e.g., 99.99"
            />
            {errors.trainerPrice?.message && (
              <p className="mt-2 text-sm text-red-600">{errors.trainerPrice.message}</p>
            )}
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? "Updating..." : "Update Plan"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPTPlanModal;