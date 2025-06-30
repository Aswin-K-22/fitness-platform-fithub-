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

// Utility functions
const formatAddress = (address: GymDetails['address']): string => {
  const parts = [address.street, address.city, address.state, address.postalCode].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Address not available';
};

const formatPhoneNumber = (phone: string | null): string => {
  if (!phone) return 'Not available';
  // Basic phone formatting - can be enhanced based on your needs
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
};

const isGymOpen = (schedule: GymDetails['schedule']): boolean => {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const todaySchedule = schedule.find(s => s.dayOfWeek === currentDay);
  if (!todaySchedule || todaySchedule.isClosed) return false;
  
  return currentTime >= todaySchedule.startTime && currentTime <= todaySchedule.endTime;
};

const GymDetailsPage: React.FC = () => {
  const { gymId } = useParams<{ gymId: string }>();
  const navigate = useNavigate();
  const [gym, setGym] = useState<GymDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(0);

  useEffect(() => {
    if (!gymId) {
      setError("Gym ID is required");
      setLoading(false);
      return;
    }

    const fetchGymDetail = async () => {
      try {
        setLoading(true);
        const response = await fetchGymDetails(gymId);
        console.log('Fetched gym details:', response);
        setGym(response);
        setError(null);
      } catch (err) {
        console.error("Error fetching gym details:", err);
        setError("Failed to load gym details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchGymDetail();
  }, [gymId]);

  const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Generate next 7 days for booking
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = generateDates();

  // Handle image navigation
  const nextImage = () => {
    if (gym?.images && gym.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % gym.images.length);
    }
  };

  const prevImage = () => {
    if (gym?.images && gym.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + gym.images.length) % gym.images.length);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="font-inter bg-gray-50 min-h-screen">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-300 rounded-lg mb-8"></div>
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || !gym) {
    return (
      <div className="font-inter bg-gray-50 min-h-screen">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
          <div className="text-center py-12">
            <div className="mb-4">
              <i className="fas fa-exclamation-triangle text-red-500 text-6xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error || "Gym not found"}</p>
            <button
              onClick={() => navigate('/user/gyms')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Gyms
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="font-inter bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back
        </button>

        {/* Image Slider */}
        <div className="h-96 md:h-[480px] mb-8 rounded-lg overflow-hidden relative group">
          {gym.images?.length > 0 ? (
            <>
              <img
                src={`${backendUrl}${gym.images[currentImageIndex].url}`}
                alt={`${gym.name} Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              
              {/* Image Navigation */}
              {gym.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-75"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-75"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                  
                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {gym.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-image text-gray-400 text-6xl mb-4"></i>
                <span className="text-gray-500">No Images Available</span>
              </div>
            </div>
          )}
        </div>

        {/* Gym Info Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{gym.name}</h1>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {gym.type}
                </span>
              </div>
              
              {/* Rating */}
              <div className="flex items-center mb-3">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star text-sm ${
                        i < Math.floor(gym.ratings?.average || 0) ? "text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {gym.ratings?.average?.toFixed(1) || "N/A"} ({gym.ratings?.count || 0} reviews)
                </span>
              </div>

              {/* Address */}
              <div className="flex items-start text-gray-600 mb-3">
                <i className="fas fa-map-marker-alt mr-2 text-red-500 mt-1"></i>
                <span>{formatAddress(gym.address)}</span>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {gym.contact.phone && (
                  <div className="flex items-center">
                    <i className="fas fa-phone mr-2 text-green-500"></i>
                    <a href={`tel:${gym.contact.phone}`} className="hover:text-blue-600 transition-colors">
                      {formatPhoneNumber(gym.contact.phone)}
                    </a>
                  </div>
                )}
                {gym.contact.email && (
                  <div className="flex items-center">
                    <i className="fas fa-envelope mr-2 text-blue-500"></i>
                    <a href={`mailto:${gym.contact.email}`} className="hover:text-blue-600 transition-colors">
                      {gym.contact.email}
                    </a>
                  </div>
                )}
                {gym.contact.website && (
                  <div className="flex items-center">
                    <i className="fas fa-globe mr-2 text-purple-500"></i>
                    <a 
                      href={gym.contact.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors"
                    >
                      Website
                    </a>
                  </div>
                )}
              </div>

              {/* Description */}
              {gym.description && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{gym.description}</p>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="flex flex-col items-end gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isGymOpen(gym.schedule) 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  isGymOpen(gym.schedule) ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                {isGymOpen(gym.schedule) ? 'Open Now' : 'Closed'}
              </span>
              <div className="text-right text-sm text-gray-500">
                <div>Max Capacity: {gym.maxCapacity}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Booking Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <i className="fas fa-calendar-alt mr-2 text-blue-600"></i>
                Book Your Session
              </h2>
              
              {/* Date Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
                {dates.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(index)}
                    className={`p-3 text-center rounded-lg border-2 transition-colors ${
                      selectedDate === index
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <span className="block font-medium text-sm">
                      {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-xs text-gray-500">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </button>
                ))}
              </div>

              {/* Time Slots */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {gym.schedule
                  .filter(s => !s.isClosed)
                  .slice(0, 8)
                  .map((slot, index) => (
                    <button
                      key={index}
                      className="py-3 text-center border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                    >
                      {slot.startTime}
                    </button>
                  ))}
              </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <i className="fas fa-clock mr-2 text-green-600"></i>
                Operating Hours
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gym.schedule.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium text-gray-700">{schedule.dayOfWeek}</span>
                    <span className={`text-sm ${schedule.isClosed ? 'text-red-500' : 'text-gray-600'}`}>
                      {schedule.isClosed ? 'Closed' : `${schedule.startTime} - ${schedule.endTime}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Facilities & Equipment */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <i className="fas fa-dumbbell mr-2 text-purple-600"></i>
                Facilities & Equipment
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Equipment */}
                <div>
                  <h3 className="font-semibold mb-4 text-gray-800">Equipment</h3>
                  {gym.equipment.length > 0 ? (
                    <div className="space-y-3">
                      {gym.equipment.map((eq, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <i className="fas fa-dumbbell mr-3 text-blue-600"></i>
                            <div>
                              <span className="font-medium">{eq.type}</span>
                              <div className="text-sm text-gray-500">Category: {eq.category}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{eq.quantity}</div>
                            <div className={`text-xs px-2 py-1 rounded ${
                              eq.condition === 'Good' ? 'bg-green-100 text-green-700' :
                              eq.condition === 'Fair' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {eq.condition}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No equipment information available</p>
                  )}
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="font-semibold mb-4 text-gray-800">Amenities</h3>
                  <div className="space-y-3">
                    {Object.entries(gym.facilities).map(([key, value]) => {
                      const amenityIcons: { [key: string]: string } = {
                        hasPool: 'fas fa-swimming-pool',
                        hasSauna: 'fas fa-hot-tub',
                        hasParking: 'fas fa-parking',
                        hasLockerRooms: 'fas fa-lock',
                        hasWifi: 'fas fa-wifi',
                        hasShowers: 'fas fa-shower'
                      };
                      
                      const amenityNames: { [key: string]: string } = {
                        hasPool: 'Swimming Pool',
                        hasSauna: 'Sauna',
                        hasParking: 'Parking',
                        hasLockerRooms: 'Locker Rooms',
                        hasWifi: 'WiFi',
                        hasShowers: 'Showers'
                      };

                      return (
                        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <i className={`${amenityIcons[key]} mr-3 text-blue-600`}></i>
                            <span>{amenityNames[key]}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {value ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white shadow rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <i className="fas fa-tag mr-2 text-green-600"></i>
                Pricing
              </h2>
              <div className="space-y-4">
                <div className="p-4 border-2 border-blue-600 rounded-lg bg-blue-50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-800">Day Pass</h3>
                    <span className="text-2xl font-bold text-blue-600">$25</span>
                  </div>
                  <ul className="text-sm text-gray-600 mb-4 space-y-1">
                    <li className="flex items-center">
                      <i className="fas fa-check text-green-500 mr-2"></i>
                      Full gym access
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-check text-green-500 mr-2"></i>
                      Equipment usage
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-check text-green-500 mr-2"></i>
                      Locker room access
                    </li>
                  </ul>
                  <button
                    onClick={() => navigate("/user/membership")}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Book Now
                  </button>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-800">Monthly Pass</h3>
                    <span className="text-2xl font-bold text-gray-800">$89</span>
                  </div>
                  <button className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>

            {/* Personal Trainers */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <i className="fas fa-user-friends mr-2 text-orange-600"></i>
                Personal Trainers
              </h2>
              {gym.trainers.length > 0 ? (
                <div className="space-y-4">
                  {gym.trainers.slice(0, 3).map((trainer, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                      <img
                        src="/images/trainer-placeholder.jpg"
                        alt={`Trainer ${index + 1}`}
                        className="w-16 h-16 rounded-full object-cover bg-gray-200"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">Trainer {index + 1}</h3>
                        <p className="text-sm text-gray-600">Personal Trainer</p>
                        <div className="flex items-center mt-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <i key={i} className="fas fa-star text-yellow-400 text-xs"></i>
                          ))}
                          <span className="ml-1 text-xs text-gray-500">5.0</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="w-full border-2 border-orange-600 text-orange-600 py-3 rounded-lg hover:bg-orange-600 hover:text-white transition-colors font-medium">
                    View All Trainers
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-user-slash text-gray-400 text-3xl mb-2"></i>
                  <p className="text-gray-500">No trainers available</p>
                </div>
              )}
            </div>

            {/* Contact Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <i className="fas fa-phone mr-2 text-blue-600"></i>
                Get in Touch
              </h2>
              <div className="space-y-3">
                {gym.contact.phone && (
                  <a
                    href={`tel:${gym.contact.phone}`}
                    className="flex items-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <i className="fas fa-phone mr-3"></i>
                    <span>Call Now</span>
                  </a>
                )}
                {gym.contact.email && (
                  <a
                    href={`mailto:${gym.contact.email}`}
                    className="flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <i className="fas fa-envelope mr-3"></i>
                    <span>Send Email</span>
                  </a>
                )}
                <button className="w-full flex items-center justify-center p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <i className="fas fa-directions mr-2"></i>
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GymDetailsPage;