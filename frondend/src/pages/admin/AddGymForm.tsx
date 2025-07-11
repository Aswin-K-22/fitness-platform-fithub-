/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useReducer, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ToastContainer, toast } from "react-toastify";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import type { IAddGymRequestDTO } from "../../types/dtos/IAddGymRequestDTO";
import { addGym, getAvailableTrainers } from "../../services/api/adminApi";

// Validation schema with updated schedule constraints
const gymSchema = z.object({
  name: z.string()
    .min(1, "Gym name is required")
    .regex(/^(?!\s*$).+/, "Gym name cannot contain spaces only"),
  type: z.enum(["Premium", "Basic", "Diamond"]),
  description: z.string()
    .min(1, "Description is required")
    .max(500, "Description must be 500 characters or less")
    .regex(/^\S+/, "Description cannot start with spaces"),
  address: z.object({
    street: z.string()
      .min(1, "Street address is required")
      .regex(/^\S+/, "Street cannot start with spaces"),
    city: z.string()
      .min(1, "City is required")
      .regex(/^\S+$/, "City cannot contain spaces only"),
    state: z.string()
      .min(1, "State is required")
      .regex(/^\S+$/, "State cannot contain spaces only"),
    postalCode: z.string()
      .min(1, "Postal code is required")
      .regex(/^\S+$/, "Postal code cannot contain spaces only"),
    lat: z.string().min(1, "Latitude is required"),
    lng: z.string().min(1, "Longitude is required"),
  }),
  contact: z.object({
    phone: z.string()
      .min(1, "Phone number is required")
      .regex(/^\S+$/, "Phone number cannot contain spaces only"),
    email: z.string()
      .email("Invalid email address")
      .min(1, "Email is required")
      .regex(/^\S+$/, "Email cannot contain spaces"),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
  }),
  facilities: z.array(z.string()).optional(),
  equipment: z.array(
    z.object({
      type: z.string()
        .min(1, "Equipment type is required")
        .regex(/^\S+/, "Equipment type cannot start with spaces"),
      category: z.string().min(1, "Category is required"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      condition: z.string().min(1, "Condition is required"),
    })
  ),
  schedule: z.array(
    z.object({
      dayOfWeek: z.string().min(1, "Day of week is required"),
      startTime: z.string().min(1, "Start time is required").regex(/^\d{2}:00$/, "Start time must be in hour format (e.g., 08:00)"),
      endTime: z.string().min(1, "End time is required").regex(/^\d{2}:00$/, "End time must be in hour format (e.g., 08:00)"),
      isClosed: z.boolean(),
      slotDuration: z.literal(60, { errorMap: () => ({ message: "Slot duration must be exactly 60 minutes" }) }),
      slotCapacity: z.number().min(1, "Slot capacity must be at least 1"),
    })
  ).min(1, "At least one schedule entry is required"),
  maxCapacity: z.number().min(1, "Max capacity must be at least 1"),
  trainers: z.array(
    z.object({
      trainerId: z.string(),
      active: z.boolean(),
    })
  ),
images: z.array(z.instanceof(File))
  .min(1, "At least one image is required")
  .refine((files) => files.every(file => 
    ['image/png', 'image/jpeg'].includes(file.type)
  ), "Only PNG and JPEG images are allowed"),
});

type GymFormData = z.infer<typeof gymSchema>;

type FormState = Omit<IAddGymRequestDTO, "images"> & {
  images: File[];
  newEquipment: { type: string; category: string; quantity: number; condition: string };
  imageFiles: File[];
};

type FormAction =
  | { type: "UPDATE_FIELD"; field: keyof FormState; value: any }
  | { type: "ADD_EQUIPMENT" }
  | { type: "DELETE_EQUIPMENT"; index: number }
  | { type: "ADD_IMAGE"; images: File[]; files: File[] }
  | { type: "REMOVE_IMAGE"; index: number }
  | { type: "ADD_TRAINER"; trainer: { trainerId: string; active: boolean } }
  | { type: "REMOVE_TRAINER"; index: number }
  | { type: "UPDATE_NEW_EQUIPMENT"; field: keyof FormState["newEquipment"]; value: string | number };

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
    case "ADD_EQUIPMENT":
      return {
        ...state,
        equipment: [...state.equipment, state.newEquipment],
        newEquipment: { type: "", category: "", quantity: 0, condition: "" },
      };
    case "DELETE_EQUIPMENT":
      return { ...state, equipment: state.equipment.filter((_, i) => i !== action.index) };
    case "ADD_IMAGE":
      return {
        ...state,
        images: [...state.images, ...action.images],
        imageFiles: [...state.imageFiles, ...action.files],
      };
    case "REMOVE_IMAGE":
      return {
        ...state,
        images: state.images.filter((_, i) => i !== action.index),
        imageFiles: state.imageFiles.filter((_, i) => i !== action.index),
      };
    case "ADD_TRAINER":
      return { ...state, trainers: [...state.trainers, action.trainer] };
    case "REMOVE_TRAINER":
      return { ...state, trainers: state.trainers.filter((_, i) => i !== action.index) };
    case "UPDATE_NEW_EQUIPMENT":
      return { ...state, newEquipment: { ...state.newEquipment, [action.field]: action.value } };
    default:
      return state;
  }
};

// Generate hour options (00:00 to 23:00)
const hourOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

const AddGymForm: React.FC = () => {
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(formReducer, {
    name: "",
    type: "Basic" as "Premium" | "Basic" | "Diamond",
    description: "",
    address: { street: "", city: "", state: "", postalCode: "", lat: "", lng: "" },
    contact: { phone: "", email: "", website: "" },
    facilities: [],
    equipment: [],
    schedule: [{ dayOfWeek: "All Days", startTime: "", endTime: "", isClosed: false, slotDuration: 60, slotCapacity: 40 }],
    maxCapacity: 0,
    trainers: [],
    images: [],
    newEquipment: { type: "", category: "", quantity: 0, condition: "" },
    imageFiles: [],
  });

  const [trainersList, setTrainersList] = useState<{ id: string; name: string; active: boolean }[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    getValues,
    setValue,
    trigger,
  } = useForm<GymFormData>({
    resolver: zodResolver(gymSchema),
    defaultValues: {
      name: "",
      type: "Basic",
      description: "",
      address: { street: "", city: "", state: "", postalCode: "", lat: "11.152967", lng: "75.8229835" },
      contact: { phone: "", email: "", website: "" },
      facilities: [],
      equipment: [],
      schedule: [{ dayOfWeek: "All Days", startTime: "", endTime: "", isClosed: false, slotDuration: 60, slotCapacity: 40 }],
      maxCapacity: 0,
      trainers: [],
      images: [],
    },
    mode: "onChange",
  });

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const trainers = await getAvailableTrainers();
        setTrainersList(trainers);
      } catch (error) {
        console.error("Error fetching trainers:", error);
        toast.error("Failed to fetch trainers");
      }
    };
    fetchTrainers();
  }, []);

  useEffect(() => {
    const gymFormDataKeys = Object.keys(gymSchema.shape) as (keyof GymFormData)[];
    gymFormDataKeys.forEach((key) => {
     if (key !== "images") {
      setValue(key, state[key] as any); // Type assertion to bypass strict type checking
    }
    });
  }, [state, setValue]);

  const getCoordinates = async () => {
    const addressData = getValues("address");
    const { street, city, state: stateAddr, postalCode } = addressData;
    const address = `${street}, ${city}, ${stateAddr} ${postalCode}`.trim();

    if (!street || !city || !stateAddr || !postalCode) {
      toast.error("Please fill in all address fields before fetching coordinates.");
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      toast.error("Google Maps API key is missing!");
      return;
    }

    toast.info("Fetching coordinates...");
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.status === "OK") {
        const { lat, lng } = data.results[0].geometry.location;
        const latStr = lat.toString();
        const lngStr = lng.toString();

        setValue("address.lat", latStr);
        setValue("address.lng", lngStr);
        dispatch({
          type: "UPDATE_FIELD",
          field: "address",
          value: { ...addressData, lat: latStr, lng: lngStr },
        });
        toast.success("Coordinates fetched successfully!");
      } else {
        toast.error("Could not find coordinates for this address.");
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      toast.error("Error fetching coordinates.");
    }
  };

  const handleFacilityChange = (facility: string) => {
    const currentFacilities = state.facilities || [];
    const newFacilities = currentFacilities.includes(facility)
      ? currentFacilities.filter((f) => f !== facility)
      : [...currentFacilities, facility];
    dispatch({ type: "UPDATE_FIELD", field: "facilities", value: newFacilities });
    setValue("facilities", newFacilities);
    trigger("facilities");
  };

  const addEquipment = () => {
    const { newEquipment } = state;
    if (newEquipment.type && newEquipment.category && newEquipment.quantity > 0 && newEquipment.condition) {
      dispatch({ type: "ADD_EQUIPMENT" });
      setValue("equipment", [...state.equipment, newEquipment]);
      trigger("equipment");
      toast.success("Equipment added!");
    } else {
      toast.error("Please fill all equipment fields.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles = Array.from(files).filter(file => 
        ['image/png', 'image/jpeg'].includes(file.type)
      );
      
      const invalidFiles = Array.from(files).filter(file => 
        !['image/png', 'image/jpeg'].includes(file.type)
      );

      if (invalidFiles.length > 0) {
        toast.error("Some files were rejected. Only PNG and JPEG formats are allowed.");
      }

      if (validFiles.length > 0) {
        dispatch({ type: "ADD_IMAGE", images: validFiles, files: validFiles });
        setValue("images", [...state.imageFiles, ...validFiles]); 
        trigger("images");
        toast.success("Valid images uploaded!");
      }
    }
  };

  const removeImage = (index: number) => {
    dispatch({ type: "REMOVE_IMAGE", index });
    setValue("images", state.imageFiles.filter((_, i) => i !== index));
    trigger("images");
    toast.success("Image removed!");
  };

  const handleTrainerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTrainerId = e.target.value;
    const selectedTrainer = trainersList.find((trainer) => trainer.id === selectedTrainerId);
    if (selectedTrainer && !state.trainers.some((t) => t.trainerId === selectedTrainer.id)) {
      dispatch({ type: "ADD_TRAINER", trainer: { trainerId: selectedTrainer.id, active: selectedTrainer.active } });
      setValue("trainers", [...state.trainers, { trainerId: selectedTrainer.id, active: selectedTrainer.active }]);
      trigger("trainers");
      toast.success("Trainer added!");
    }
  };

  const removeTrainer = (index: number) => {
    dispatch({ type: "REMOVE_TRAINER", index });
    setValue("trainers", state.trainers.filter((_, i) => i !== index));
    trigger("trainers");
    toast.success("Trainer removed!");
  };

  const onSubmit: SubmitHandler<GymFormData> = async (data: GymFormData) => {
    if (!isValid) {
      toast.error("Please fix all validation errors before submitting.");
      return;
    }

    const invalidImages = state.imageFiles.filter(file => 
      !['image/png', 'image/jpeg'].includes(file.type)
    );
    
    if (invalidImages.length > 0) {
      toast.error("Please remove invalid image files (only PNG and JPEG allowed) before submitting.");
      return;
    }

    toast.info("Saving gym...");
    const formDataToSend = new FormData();
    const gymData = { ...data, images: undefined };
    formDataToSend.append("gymData", JSON.stringify(gymData));
    state.imageFiles.forEach((file) => formDataToSend.append("images", file));

    try {
      await addGym(formDataToSend);
      toast.success("Gym saved successfully!");
      navigate("/admin/gyms");
    } catch (error) {
      console.error("Error saving gym:", error);
      toast.error("Error saving gym.");
    }
  };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}>
      <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Gym</h1>
            <p className="mt-2 text-sm text-gray-600">Complete the form below to create a new gym location.</p>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/admin/gyms"
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid || isSubmitting}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                isValid && !isSubmitting
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Saving..." : "Save Gym"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gym Name <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter gym name"
                      onChange={(e) => {
                        const trimmedValue = e.target.value.trimStart();
                        field.onChange(trimmedValue);
                        dispatch({ type: "UPDATE_FIELD", field: "name", value: trimmedValue });
                        trigger("name");
                      }}
                      onBlur={() => {
                        const trimmedValue = field.value.trim();
                        field.onChange(trimmedValue);
                        dispatch({ type: "UPDATE_FIELD", field: "name", value: trimmedValue });
                        trigger("name");
                      }}
                    />
                  )}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gym Type <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        errors.type ? "border-red-500" : "border-gray-300"
                      }`}
                      onChange={(e) => {
                        field.onChange(e);
                        dispatch({ type: "UPDATE_FIELD", field: "type", value: e.target.value as "Premium" | "Basic" | "Diamond" });
                        trigger("type");
                      }}
                    >
                      <option value="">Select gym type</option>
                      <option value="Premium">Premium</option>
                      <option value="Basic">Basic</option>
                      <option value="Diamond">Diamond</option>
                    </select>
                  )}
                />
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={4}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        errors.description ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter gym description"
                      onChange={(e) => {
                        const trimmedValue = e.target.value.trimStart();
                        field.onChange(trimmedValue);
                        dispatch({ type: "UPDATE_FIELD", field: "description", value: trimmedValue });
                        trigger("description");
                      }}
                      onBlur={() => {
                        const trimmedValue = field.value.trim();
                        field.onChange(trimmedValue);
                        dispatch({ type: "UPDATE_FIELD", field: "description", value: trimmedValue });
                        trigger("description");
                      }}
                    />
                  )}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {state.description.length}/500 characters
                  {errors.description && (
                    <span className="text-red-500 ml-2">{errors.description.message}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Location Details</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="address.street"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                          errors.address?.street ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter street address"
                        onChange={(e) => {
                          const trimmedValue = e.target.value.trimStart();
                          field.onChange(trimmedValue);
                          dispatch({
                            type: "UPDATE_FIELD",
                            field: "address",
                            value: { ...state.address, street: trimmedValue },
                          });
                          trigger("address.street");
                        }}
                        onBlur={() => {
                          const trimmedValue = field.value.trim();
                          field.onChange(trimmedValue);
                          dispatch({
                            type: "UPDATE_FIELD",
                            field: "address",
                            value: { ...state.address, street: trimmedValue },
                          });
                          trigger("address.street");
                        }}
                      />
                    )}
                  />
                  {errors.address?.street && (
                    <p className="text-red-500 text-xs mt-1">{errors.address.street.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="address.city"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                          errors.address?.city ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter city"
                        onChange={(e) => {
                          const trimmedValue = e.target.value.trimStart();
                          field.onChange(trimmedValue);
                          dispatch({
                            type: "UPDATE_FIELD",
                            field: "address",
                            value: { ...state.address, city: trimmedValue },
                          });
                          trigger("address.city");
                        }}
                        onBlur={() => {
                          const trimmedValue = field.value.trim();
                          field.onChange(trimmedValue);
                          dispatch({
                            type: "UPDATE_FIELD",
                            field: "address",
                            value: { ...state.address, city: trimmedValue },
                          });
                          trigger("address.city");
                        }}
                      />
                    )}
                  />
                  {errors.address?.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.address.city.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="address.state"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                          errors.address?.state ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter state"
                        onChange={(e) => {
                          const trimmedValue = e.target.value.trimStart();
                          field.onChange(trimmedValue);
                          dispatch({
                            type: "UPDATE_FIELD",
                            field: "address",
                            value: { ...state.address, state: trimmedValue },
                          });
                          trigger("address.state");
                        }}
                        onBlur={() => {
                          const trimmedValue = field.value.trim();
                          field.onChange(trimmedValue);
                          dispatch({
                            type: "UPDATE_FIELD",
                            field: "address",
                            value: { ...state.address, state: trimmedValue },
                          });
                          trigger("address.state");
                        }}
                      />
                    )}
                  />
                  {errors.address?.state && (
                    <p className="text-red-500 text-xs mt-1">{errors.address.state.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="address.postalCode"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                          errors.address?.postalCode ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter postal code"
                        onChange={(e) => {
                          const trimmedValue = e.target.value.trimStart();
                          field.onChange(trimmedValue);
                          dispatch({
                            type: "UPDATE_FIELD",
                            field: "address",
                            value: { ...state.address, postalCode: trimmedValue },
                          });
                          trigger("address.postalCode");
                        }}
                        onBlur={() => {
                          const trimmedValue = field.value.trim();
                          field.onChange(trimmedValue);
                          dispatch({
                            type: "UPDATE_FIELD",
                            field: "address",
                            value: { ...state.address, postalCode: trimmedValue },
                          });
                          trigger("address.postalCode");
                        }}
                      />
                    )}
                  />
                  {errors.address?.postalCode && (
                    <p className="text-red-500 text-xs mt-1">{errors.address.postalCode.message}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={getCoordinates}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Get Coordinates
              </button>
              {state.address.lat && state.address.lng && (
                <div className="mt-4 rounded-lg overflow-hidden">
                  <GoogleMap
                    mapContainerStyle={{ height: "300px", width: "100%" }}
                    center={{ lat: parseFloat(state.address.lat), lng: parseFloat(state.address.lng) }}
                    zoom={15}
                  >
                    <Marker position={{ lat: parseFloat(state.address.lat), lng: parseFloat(state.address.lng) }} />
                  </GoogleMap>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="address.lat"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                        placeholder="40.7128"
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="address.lng"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                        placeholder="-74.0060"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="contact.phone"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="tel"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        errors.contact?.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="+1 (555) 000-0000"
                      onChange={(e) => {
                        const trimmedValue = e.target.value.trimStart();
                        field.onChange(trimmedValue);
                        dispatch({
                          type: "UPDATE_FIELD",
                          field: "contact",
                          value: { ...state.contact, phone: trimmedValue },
                        });
                        trigger("contact.phone");
                      }}
                      onBlur={() => {
                        const trimmedValue = field.value.trim();
                        field.onChange(trimmedValue);
                        dispatch({
                          type: "UPDATE_FIELD",
                          field: "contact",
                          value: { ...state.contact, phone: trimmedValue },
                        });
                        trigger("contact.phone");
                      }}
                    />
                  )}
                />
                {errors.contact?.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.contact.phone.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="contact.email"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        errors.contact?.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="gym@example.com"
                      onChange={(e) => {
                        const trimmedValue = e.target.value.trimStart();
                        field.onChange(trimmedValue);
                        dispatch({
                          type: "UPDATE_FIELD",
                          field: "contact",
                          value: { ...state.contact, email: trimmedValue },
                        });
                        trigger("contact.email");
                      }}
                      onBlur={() => {
                        const trimmedValue = field.value.trim();
                        field.onChange(trimmedValue);
                        dispatch({
                          type: "UPDATE_FIELD",
                          field: "contact",
                          value: { ...state.contact, email: trimmedValue },
                        });
                        trigger("contact.email");
                      }}
                    />
                  )}
                />
                {errors.contact?.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.contact.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <Controller
                  name="contact.website"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      value={field.value || ""}
                      type="url"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        errors.contact?.website ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="https://www.example.com"
                      onChange={(e) => {
                        const trimmedValue = e.target.value.trimStart();
                        field.onChange(trimmedValue || undefined);
                        dispatch({
                          type: "UPDATE_FIELD",
                          field: "contact",
                          value: { ...state.contact, website: trimmedValue || undefined },
                        });
                        trigger("contact.website");
                      }}
                      onBlur={() => {
                        const trimmedValue = (field.value || "").trim();
                        field.onChange(trimmedValue || undefined);
                        dispatch({
                          type: "UPDATE_FIELD",
                          field: "contact",
                          value: { ...state.contact, website: trimmedValue || undefined },
                        });
                        trigger("contact.website");
                      }}
                    />
                  )}
                />
                {errors.contact?.website && (
                  <p className="text-red-500 text-xs mt-1">{errors.contact.website.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Facilities & Equipment */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Facilities & Equipment</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Available Facilities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {["Showers", "Sauna", "Parking", "Lockers", "Wifi", "Cafe"].map((facility) => (
                    <label key={facility} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={state.facilities?.includes(facility) || false}
                        onChange={() => handleFacilityChange(facility)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{facility}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Equipment <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={state.newEquipment.type}
                      onChange={(e) =>
                        dispatch({ type: "UPDATE_NEW_EQUIPMENT", field: "type", value: e.target.value.trimStart() })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Treadmill"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                    <select
                      value={state.newEquipment.category}
                      onChange={(e) =>
                        dispatch({ type: "UPDATE_NEW_EQUIPMENT", field: "category", value: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Category</option>
                      <option>Cardio</option>
                      <option>Strength</option>
                      <option>Flexibility</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quantity <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="1"
                      value={state.newEquipment.quantity || ""}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_NEW_EQUIPMENT",
                          field: "quantity",
                          value: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Condition <span className="text-red-500">*</span></label>
                    <select
                      value={state.newEquipment.condition}
                      onChange={(e) =>
                        dispatch({ type: "UPDATE_NEW_EQUIPMENT", field: "condition", value: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Condition</option>
                      <option>Excellent</option>
                      <option>Good</option>
                      <option>Fair</option>
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addEquipment}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Equipment
                </button>
                {state.equipment.length > 0 && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                          <th className="px-4 py-3 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {state.equipment.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.type}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.category}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.condition}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => dispatch({ type: "DELETE_EQUIPMENT", index })}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Schedule & Capacity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule & Capacity</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Slot Capacity <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="maxCapacity"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min="1"
                      value={field.value || ""}
                      onChange={(e) => {
                        field.onChange(parseInt(e.target.value) || undefined);
                        dispatch({
                          type: "UPDATE_FIELD",
                          field: "maxCapacity",
                          value: parseInt(e.target.value) || 100,
                        });
                        trigger("maxCapacity");
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        errors.maxCapacity ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., 100"
                    />
                  )}
                />
                {errors.maxCapacity && (
                  <p className="text-red-500 text-xs mt-1">{errors.maxCapacity.message}</p>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day <span className="text-red-500">*</span></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time <span className="text-red-500">*</span></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time <span className="text-red-500">*</span></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closed <span className="text-red-500">*</span></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot Duration (min) <span className="text-red-500">*</span></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot Capacity <span className="text-red-500">*</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {state.schedule.map((hour, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{hour.dayOfWeek}</td>
                        <td className="px-4 py-3">
                          <Controller
                            name={`schedule.${index}.startTime`}
                            control={control}
                            render={({ field }) => (
                              <select
                                {...field}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                  errors.schedule?.[index]?.startTime ? "border-red-500" : "border-gray-300"
                                }`}
                                onChange={(e) => {
                                  field.onChange(e);
                                  dispatch({
                                    type: "UPDATE_FIELD",
                                    field: "schedule",
                                    value: state.schedule.map((s, i) =>
                                      i === index ? { ...s, startTime: e.target.value } : s
                                    ),
                                  });
                                  trigger(`schedule.${index}.startTime`);
                                }}
                              >
                                <option value="">Select Start Time</option>
                                {hourOptions.map((time) => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                            )}
                          />
                          {errors.schedule?.[index]?.startTime && (
                            <p className="text-red-500 text-xs mt-1">{errors.schedule[index].startTime.message}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Controller
                            name={`schedule.${index}.endTime`}
                            control={control}
                            render={({ field }) => (
                              <select
                                {...field}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                  errors.schedule?.[index]?.endTime ? "border-red-500" : "border-gray-300"
                                }`}
                                onChange={(e) => {
                                  field.onChange(e);
                                  dispatch({
                                    type: "UPDATE_FIELD",
                                    field: "schedule",
                                    value: state.schedule.map((s, i) =>
                                      i === index ? { ...s, endTime: e.target.value } : s
                                    ),
                                  });
                                  trigger(`schedule.${index}.endTime`);
                                }}
                              >
                                <option value="">Select End Time</option>
                                {hourOptions.map((time) => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                            )}
                          />
                          {errors.schedule?.[index]?.endTime && (
                            <p className="text-red-500 text-xs mt-1">{errors.schedule[index].endTime.message}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Controller
                            name={`schedule.${index}.isClosed`}
                            control={control}
                            render={({ field }) => (
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={(e) => {
                                  field.onChange(e.target.checked);
                                  dispatch({
                                    type: "UPDATE_FIELD",
                                    field: "schedule",
                                    value: state.schedule.map((s, i) =>
                                      i === index ? { ...s, isClosed: e.target.checked } : s
                                    ),
                                  });
                                  trigger(`schedule.${index}.isClosed`);
                                }}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                            )}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Controller
                            name={`schedule.${index}.slotDuration`}
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="number"
                                value="60"
                                readOnly
                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                                placeholder="60"
                              />
                            )}
                          />
                          {errors.schedule?.[index]?.slotDuration && (
                            <p className="text-red-500 text-xs mt-1">{errors.schedule[index].slotDuration.message}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Controller
                            name={`schedule.${index}.slotCapacity`}
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="number"
                                min="1"
                                value={field.value || ""}
                                onChange={(e) => {
                                  field.onChange(parseInt(e.target.value) || undefined);
                                  dispatch({
                                    type: "UPDATE_FIELD",
                                    field: "schedule",
                                    value: state.schedule.map((s, i) =>
                                      i === index ? { ...s, slotCapacity: parseInt(e.target.value) || 40 } : s
                                    ),
                                  });
                                  trigger(`schedule.${index}.slotCapacity`);
                                }}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                  errors.schedule?.[index]?.slotCapacity ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder="e.g., 40"
                              />
                            )}
                          />
                          {errors.schedule?.[index]?.slotCapacity && (
                            <p className="text-red-500 text-xs mt-1">{errors.schedule[index].slotCapacity.message}</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Media & Visuals */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Media & Visuals <span className="text-red-500">*</span></h2>
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="imageUpload"
                />
                <label htmlFor="imageUpload" className="cursor-pointer">
                  <svg className="mx-auto w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V8m0 0l-4 4m4-4l4 4m6-4v8m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <p className="text-sm text-gray-600">Drag and drop images here, or click to select files</p>
                  <p className="text-xs text-gray-400 mt-1">Only PNG and JPEG up to 5MB</p>
                </label>
              </div>
              {errors.images && (
                <p className="text-red-500 text-xs mt-1">{errors.images.message}</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {state.images.map((file, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Gym Image ${index + 1}`}
                      className="w-full h-40 object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-white/80 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trainer Management */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Trainer Management</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Trainers</label>
                <select
                  onChange={handleTrainerChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a trainer...</option>
                  {trainersList.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name} ({trainer.active ? "Active" : "Inactive"})
                    </option>
                  ))}
                </select>
              </div>
              {state.trainers.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {state.trainers.map((trainer, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src="https://creatie.ai/ai/api/search-image?query=A professional headshot of a male fitness trainer in athletic wear, looking confident and friendly&width=40&height=40&flag=0d47143f-0f24-4161-be94-48c6ba9cd396"
                                  alt=""
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {trainersList.find((t) => t.id === trainer.trainerId)?.name}
                                </div>
                                <div className="text-xs text-gray-500">Personal Trainer</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                trainer.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {trainer.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => removeTrainer(index)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              Save as Draft
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid || isSubmitting}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                isValid && !isSubmitting
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Publishing..." : "Publish Gym"}
            </button>
          </div>
        </div>
      </main>
    </LoadScript>
  );
};

export default AddGymForm;