// src/presentation/features/user/pages/GymDetailsPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchGymDetails } from "../../services/api/userApi";


interface GymDetails {
  id: string;
  name: string;
  type: string;
  description: string | null;
  maxCapacity: number;
  membershipCompatibility: string[];
  address: {
    street: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    lat: number | null;
    lng: number | null;
  };
  contact: {
    phone: string | null;
    email: string | null;
    website: string | null;
  };
  equipment: { type: string; category: string; quantity: number; condition: string }[];
  schedule: { dayOfWeek: string; startTime: string; endTime: string; isClosed: boolean }[];
  trainers: { trainerId: string; active: boolean }[];
  facilities: {
    hasPool: boolean | null;
    hasSauna: boolean | null;
    hasParking: boolean | null;
    hasLockerRooms: boolean | null;
    hasWifi: boolean | null;
    hasShowers: boolean | null;
  };
  images: { url: string; uploadedAt: string }[];
  ratings?: { average?: number; count?: number };
}

const GymDetailsPage: React.FC = () => {
  const { gymId } = useParams<{ gymId: string }>();
  const navigate = useNavigate();
  const [gym, setGym] = useState<GymDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGymDetail = async () => {
      try {
        const response = await  fetchGymDetails(gymId!); // We'll define this API call
        setGym(response);
        setError(null);
      } catch (err) {
        console.error("Error fetching gym details:", err);
        setError("Failed to load gym details.");
      } finally {
        setLoading(false);
      }
    };
    fetchGymDetail();
  }, [gymId]);

  const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error || !gym) return <div className="text-center text-red-500 py-8">{error || "Gym not found"}</div>;

  return (
    <div className="font-inter bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {/* Image Slider */}
        <div className="h-[480px] mb-8 rounded-lg overflow-hidden relative">
          {gym.images.length > 0 ? (
            gym.images.map((img, index) => (
              <img
                key={index}
                src={`${backendUrl}${img.url}`}
                alt={`${gym.name} Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ))
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Images Available</span>
            </div>
          )}
        </div>

        {/* Gym Info */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{gym.name}</h1>
              <div className="mt-2 flex items-center">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star ${i < Math.floor(gym.ratings?.average || 0) ? "text-yellow-400" : "text-gray-300"}`}
                    ></i>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {gym.ratings?.average?.toFixed(1) || "N/A"} ({gym.ratings?.count || 0} reviews)
                </span>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <i className="fas fa-map-marker-alt mr-2"></i>
                <span>
                  {gym.address.street || "N/A"}, {gym.address.city || "N/A"}, {gym.address.state || "N/A"},{" "}
                  {gym.address.postalCode || "N/A"}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Open Now
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            {/* Booking Section (Static for now) */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Book Your Session</h2>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <button className="p-4 text-center border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg">
                  <span className="block font-medium">Today</span>
                  <span className="text-sm">Apr 9</span>
                </button>
                <button className="p-4 text-center border-2 border-gray-200 hover:border-blue-600 rounded-lg">
                  <span className="block font-medium">Tomorrow</span>
                  <span className="text-sm">Apr 10</span>
                </button>
                {/* Add more dates as needed */}
              </div>
              <div className="grid grid-cols-4 gap-4">
                {gym.schedule[0]?.startTime && (
                  <button className="py-3 text-center border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg">
                    {gym.schedule[0].startTime}
                  </button>
                )}
                {/* Add more time slots dynamically */}
              </div>
            </div>

            {/* Facilities & Amenities */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Facilities & Amenities</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Equipment</h3>
                  <ul className="space-y-2">
                    {gym.equipment.length > 0 ? (
                      gym.equipment.map((eq, index) => (
                        <li key={index} className="flex items-center text-gray-600">
                          <i className="fas fa-dumbbell mr-2"></i>
                          <span>{eq.type} ({eq.quantity})</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-600">N/A</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-3">Amenities</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <i className="fas fa-shower mr-2"></i>
                      Showers: {gym.facilities.hasShowers ? "Yes" : "N/A"}
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-hot-tub mr-2"></i>
                      Sauna: {gym.facilities.hasSauna ? "Yes" : "N/A"}
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-parking mr-2"></i>
                      Parking: {gym.facilities.hasParking ? "Yes" : "N/A"}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Pricing (Static for now) */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Pricing</h2>
              <div className="space-y-4">
                <div className="p-4 border-2 border-blue-600 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Day Pass</h3>
                    <span className="text-xl font-bold">$25</span>
                  </div>
                  <button
                    onClick={() => navigate("/user/membership")}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>

            {/* Trainers */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Personal Trainers</h2>
              {gym.trainers.length > 0 ? (
                gym.trainers.map((trainer, index) => (
                  <div key={index} className="flex items-center space-x-4 mb-4">
                    <img
                      src="/images/trainer.jpg" // Replace with actual trainer image if available
                      alt="Trainer"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium">Trainer {index + 1}</h3>
                      <p className="text-sm text-gray-600">N/A</p>
                      <div className="flex items-center mt-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <i key={i} className="fas fa-star text-yellow-400 text-sm"></i>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">N/A</p>
              )}
              <button className="w-full border-2 border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-600 hover:text-white">
                Book Trainer
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GymDetailsPage;