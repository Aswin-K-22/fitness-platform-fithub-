
// src/presentation/features/admin/pages/AddGymForm.tsx
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



const gymSchema = z.object({
  name: z.string()
    .min(1, "Gym name is required")
    .regex(/^\S+$/, "Gym name cannot contain spaces only"),
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
      startTime: z.string().min(1, "Start time is required"),
      endTime: z.string().min(1, "End time is required"),
      isClosed: z.boolean(),
      slotDuration: z.number().min(45, "Slot duration must be at least 45 minutes"),
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
      address: { street: "", city: "", state: "", postalCode: "", lat: "", lng: "" },
      contact: { phone: "", email: "", website: "" },
      facilities: [],
      equipment: [],
      schedule: [{ dayOfWeek: "All Days", startTime: "", endTime: "", isClosed: false, slotDuration: 60, slotCapacity: 40 }], // Set default dayOfWeek
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
      if (key !== "images") setValue(key, state[key]);
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

  const onSubmit:SubmitHandler<GymFormData> = async (data: GymFormData) => {
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
      <main className="max-w-8xl px-4 sm:px-6 lg:px-8 py-8">
        <ToastContainer />
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Add New Gym</h1>
            <p className="mt-1 text-sm text-gray-500">Fill in the information below to create a new gym location.</p>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/admin/gyms"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-md"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid || isSubmitting}
              className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium text-white rounded-md ${
                isValid && !isSubmitting ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Saving..." : "Save Gym"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-md font-medium text-gray-700">
                    Gym Name <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
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
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700">
                    Gym Type <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={`mt-1 block w-full border p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
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
                  {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={4}
                        className={`mt-1 block p-2 w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
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
                  <p className="mt-2 text-sm text-gray-500">
                    {state.description.length}/500 characters
                    {errors.description && (
                      <span className="text-red-500 ml-2">{errors.description.message}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Location Details</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6">
                    <label className="block text-md font-medium text-gray-700">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="address.street"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
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
                      <p className="text-red-500 text-sm mt-1">{errors.address.street.message}</p>
                    )}
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <label className="block text-md font-medium text-gray-700">
                      City <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="address.city"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
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
                      <p className="text-red-500 text-sm mt-1">{errors.address.city.message}</p>
                    )}
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <label className="block text-md font-medium text-gray-700">
                      State/Province <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="address.state"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
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
                      <p className="text-red-500 text-sm mt-1">{errors.address.state.message}</p>
                    )}
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <label className="block text-md font-medium text-gray-700">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="address.postalCode"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
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
                      <p className="text-red-500 text-sm mt-1">{errors.address.postalCode.message}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={getCoordinates}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Get Coordinates
                </button>
                {state.address.lat && state.address.lng && (
                  <GoogleMap
                    mapContainerStyle={{ height: "300px", width: "100%" }}
                    center={{ lat: parseFloat(state.address.lat), lng: parseFloat(state.address.lng) }}
                    zoom={15}
                  >
                    <Marker position={{ lat: parseFloat(state.address.lat), lng: parseFloat(state.address.lng) }} />
                  </GoogleMap>
                )}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-md font-medium text-gray-700">
                      Latitude <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="address.lat"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          readOnly
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                          placeholder="40.7128"
                        />
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-md font-medium text-gray-700">
                      Longitude <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="address.lng"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          readOnly
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                          placeholder="-74.0060"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-md font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="contact.phone"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="tel"
                        className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
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
                    <p className="text-red-500 text-sm mt-1">{errors.contact.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="contact.email"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="email"
                        className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
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
                    <p className="text-red-500 text-sm mt-1">{errors.contact.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700">Website</label>
                  <Controller
                    name="contact.website"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        value={field.value || ""}
                        type="url"
                        className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
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
                    <p className="text-red-500 text-sm mt-1">{errors.contact.website.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Facilities & Equipment */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Facilities & Equipment</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-3">Available Facilities</label>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {["Showers", "Sauna", "Parking", "Lockers", "Wifi", "Cafe"].map((facility) => (
                      <label key={facility} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={state.facilities?.includes(facility) || false}
                          onChange={() => handleFacilityChange(facility)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-md text-gray-700">{facility}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-md font-medium text-gray-700">Equipment <span className="text-red-500">*</span></label>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-700">Type <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={state.newEquipment.type}
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_NEW_EQUIPMENT", field: "type", value: e.target.value.trimStart() })
                        }
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., Treadmill"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Category <span className="text-red-500">*</span></label>
                      <select
                        value={state.newEquipment.category}
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_NEW_EQUIPMENT", field: "category", value: e.target.value })
                        }
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select Category</option>
                        <option>Cardio</option>
                        <option>Strength</option>
                        <option>Flexibility</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Quantity <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={state.newEquipment.quantity}
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_NEW_EQUIPMENT",
                            field: "quantity",
                            value: parseInt(e.target.value) || 0,
                          })
                        }
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., 10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Condition <span className="text-red-500">*</span></label>
                      <select
                        value={state.newEquipment.condition}
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_NEW_EQUIPMENT", field: "condition", value: e.target.value })
                        }
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    <i className="fas fa-plus mr-2"></i> Add Equipment
                  </button>
                  <div className="overflow-x-auto mt-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Condition
                          </th>
                          <th className="px-6 py-3 bg-gray-50"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {state.equipment.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.condition}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                type="button"
                                onClick={() => dispatch({ type: "DELETE_EQUIPMENT", index })}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule & Capacity */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Schedule & Capacity</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-md font-medium text-gray-700">
                    Max Slot Capacity <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="maxCapacity"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
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
                        className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.maxCapacity ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="e.g., 100"
                      />
                    )}
                  />
                  {errors.maxCapacity && (
                    <p className="text-red-500 text-sm mt-1">{errors.maxCapacity.message}</p>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Day <span className="text-red-500">*</span>
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Time <span className="text-red-500">*</span>
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          End Time <span className="text-red-500">*</span>
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Closed <span className="text-red-500">*</span>
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Slot Duration (min) <span className="text-red-500">*</span>
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Slot Capacity <span className="text-red-500">*</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {state.schedule.map((hour, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-md text-gray-900">{hour.dayOfWeek}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Controller
                              name={`schedule.${index}.startTime`}
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="time"
                                  className={`border p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
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
                                />
                              )}
                            />
                            {errors.schedule?.[index]?.startTime && (
                              <p className="text-red-500 text-sm mt-1">{errors.schedule[index].startTime.message}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Controller
                              name={`schedule.${index}.endTime`}
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="time"
                                  className={`border p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
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
                                />
                              )}
                            />
                            {errors.schedule?.[index]?.endTime && (
                              <p className="text-red-500 text-sm mt-1">{errors.schedule[index].endTime.message}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Controller
                              name={`schedule.${index}.slotDuration`}
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    field.onChange(parseInt(e.target.value) || undefined);
                                    dispatch({
                                      type: "UPDATE_FIELD",
                                      field: "schedule",
                                      value: state.schedule.map((s, i) =>
                                        i === index ? { ...s, slotDuration: parseInt(e.target.value) || 60 } : s
                                      ),
                                    });
                                    trigger(`schedule.${index}.slotDuration`);
                                  }}
                                  className={`border p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                                    errors.schedule?.[index]?.slotDuration ? "border-red-500" : "border-gray-300"
                                  }`}
                                  placeholder="e.g., 60"
                                />
                              )}
                            />
                            {errors.schedule?.[index]?.slotDuration && (
                              <p className="text-red-500 text-sm mt-1">{errors.schedule[index].slotDuration.message}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Controller
                              name={`schedule.${index}.slotCapacity`}
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
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
                                  className={`border p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                                    errors.schedule?.[index]?.slotCapacity ? "border-red-500" : "border-gray-300"
                                  }`}
                                  placeholder="e.g., 40"
                                />
                              )}
                            />
                            {errors.schedule?.[index]?.slotCapacity && (
                              <p className="text-red-500 text-sm mt-1">{errors.schedule[index].slotCapacity.message}</p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Media & Visuals */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Media & Visuals <span className="text-red-500">*</span></h2>
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
                    <i className="fas fa-cloud-upload-alt text-4xl text-gray-500 mb-3"></i>
                    <p className="text-sm text-gray-600">Drag and drop images here, or click to select files</p>
                    <p className="text-xs text-gray-400 mt-1">Only PNG and JPEG up to 5MB</p>
                  </label>
                </div>
                {errors.images && (
                  <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>
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
                        <i className="fas fa-times text-gray-600 text-sm"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Trainer Management */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Trainer Management</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Assign Trainers</label>
                  <select
                    onChange={handleTrainerChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a trainer...</option>
                    {trainersList.map((trainer) => (
                      <option key={trainer.id} value={trainer.id}>
                        {trainer.name} ({trainer.active ? "Active" : "Inactive"})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trainer
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 bg-gray-50"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {state.trainers.map((trainer, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
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
                                <div className="text-sm text-gray-500">Personal Trainer</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                trainer.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {trainer.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => removeTrainer(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-end space-x-3 py-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-md"
              >
                Save as Draft
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={!isValid || isSubmitting}
                className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium text-white rounded-md ${
                  isValid && !isSubmitting ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "Publishing..." : "Publish Gym"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </LoadScript>
  );
};

export default AddGymForm;
