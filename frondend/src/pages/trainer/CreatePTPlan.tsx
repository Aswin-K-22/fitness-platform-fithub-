import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPTPlan } from "../../services/api/trainerApi";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

// Define Zod schema
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

const CreatePTPlan: React.FC = () => {
   const { trainer } = useSelector((state: RootState) => state.trainerAuth);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PTPlanFormData>({
    resolver: zodResolver(ptPlanSchema),
    defaultValues: {
      mode: "online",
      features: [],
      goal: "",
      title: "",
      description: "",
      duration: undefined,
      trainerPrice: undefined,
    },
  });

  const onSubmit = async (data: PTPlanFormData) => {
    try {
      // Prepare form data after validation
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
      if(trainer?.id)  formData.append("createBy", trainer.id)

    
      // Simulate API call
      console.log("Form Data:", Object.fromEntries(formData));

      // Uncomment for actual API call
      await createPTPlan(formData);

      toast.success("PT Plan created successfully!");
      navigate("/trainer/dashboard");
    } catch (error) {
      console.error("Error creating PT plan:", error);
      toast.error("Failed to create PT plan. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
            Create Personal Training Plan
          </h2>
          <p className="mt-3 text-lg text-gray-500">
            Design a new training plan tailored for your clients.
          </p>
        </div>

        <div className="space-y-8">
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

          {/* Submit Button */}
          <div>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? "Creating..." : "Create Plan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePTPlan;