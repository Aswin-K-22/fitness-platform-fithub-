// src/presentation/features/user/pages/GymSearchPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";


import debounce from "lodash/debounce";
import  { fetchGyms } from "../../services/api/userApi";
import type { IGymSearchDTO } from "../../types/dtos/IGymSearchDTO";

interface Gym {
  id: string;
  name: string;
  address?: { city?: string; state?: string };
  type?: string;
  image?: string;
  ratings?: { average?: number };
}

interface Filters {
  distance: string;
  gymType: string;
  rating: string;
}



const GymSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({
    distance: "All",
    gymType: "All Types",
    rating: "Any Rating",
  });
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGyms, setTotalGyms] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();
  const limit = 3;

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Unable to fetch your location. Filters will work without it.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, []);

  const loadGyms = useCallback(async () => {
    setLoading(true);
    try {
      const params: IGymSearchDTO = {
        page,
        limit,
        search: searchQuery,
        gymType: filters.gymType === "All Types" ? undefined : filters.gymType,
        rating: filters.rating === "Any Rating" ? undefined : filters.rating.replace("+ Stars", ""),
      };

      if (filters.distance !== "All") {
        if (!userLocation) {
          setError("Location required for distance filter. Please allow location access.");
          setLoading(false);
          return;
        }
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
        params.radius = parseInt(filters.distance);
      }

      const response = await fetchGyms(params.page, params.limit, {
      search: params.search,
      lat: params.lat,
      lng: params.lng,
      radius: params.radius,
      gymType: params.gymType,
      rating: params.rating,
    });
    console.log('fetched gyms',response)
      setGyms(response.gyms);
      setTotalPages(response.totalPages);
      setTotalGyms(response.totalGyms);
      setError(null);
    } catch (err) {
      console.error("Error fetching gyms:", err);
      setError("Failed to load gyms. Please try again later.");
      setGyms([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, filters, userLocation]);

  const debouncedLoadGyms = useCallback(debounce(loadGyms, 300), [loadGyms]);

  useEffect(() => {
    debouncedLoadGyms();
    return () => debouncedLoadGyms.cancel();
  }, [debouncedLoadGyms]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    debouncedLoadGyms();
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const handleGymClick = (gymId: string) => {
    navigate(`/gyms/${gymId}`);
  };

  const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const defaultProfilePic = "/images/user.jpg";
  const distanceOptions = ["All", 5, 10, 20, 50, 60, 100];

  return (
    <div className="font-inter bg-gray-50 min-h-screen">
      <div className="mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-center bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-lg">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Find your perfect gym..."
                  className="w-full px-6 py-4 rounded-lg border-2 border-white/20 bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent text-lg"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
              >
                Search
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 bg-white p-6 rounded-lg shadow-sm">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Distance</label>
                <select
                  name="distance"
                  value={filters.distance}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 hover:border-blue-500 transition-colors focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  disabled={loading}
                >
                  {distanceOptions.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist === "All" ? "All Distances" : `Within ${dist} km`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Gym Type</label>
                <select
                  name="gymType"
                  value={filters.gymType}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 hover:border-blue-500 transition-colors focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  disabled={loading}
                >
                  <option>All Types</option>
                  <option>Basic</option>
                  <option>Premium</option>
                  <option>Diamond</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <select
                  name="rating"
                  value={filters.rating}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 hover:border-blue-500 transition-colors focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  disabled={loading}
                >
                  <option>Any Rating</option>
                  <option>4+ Stars</option>
                  <option>3+ Stars</option>
                  <option>2+ Stars</option>
                </select>
              </div>
            </div>
          </div>

          {/* Gym Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {loading ? (
              [...Array(limit)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-8 bg-blue-600 rounded-lg w-24"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full text-center text-red-500 py-8">
                <i className="fas fa-exclamation-circle text-2xl mb-2"></i>
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : gyms.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-8">
                <i className="fas fa-dumbbell text-2xl mb-2"></i>
                <p>{filters.distance === "All" ? "No gyms found" : `No gyms found within ${filters.distance} km`}</p>
              </div>
            ) : (
              gyms.map((gym) => (
                <div
                  key={gym.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  <img
                    src={
                      gym.image
                        ? gym.image.startsWith("http")
                          ? gym.image
                          : `${backendUrl}${gym.image.startsWith("/") ? "" : "/"}${gym.image}`
                        : defaultProfilePic
                    }
                    alt={gym.name}
                    className="w-full h-48 object-cover"
                    onClick={() => handleGymClick(gym.id)} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultProfilePic;
                    }}
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{gym.name}</h3>
                      <div className="flex items-center">
                        <i className="fas fa-star text-yellow-400"></i>
                        <span className="ml-1">{gym.ratings?.average?.toFixed(1) || "N/A"}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-2">
                      <i className="fas fa-map-marker-alt"></i> {gym.address?.city || "Unknown"},{" "}
                      {gym.address?.state || "Unknown"}
                    </p>
                    <div className="mt-4 flex justify-between">
                      <button
                        onClick={() => navigate("/user/membership")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Plans
                      </button>
                      <button
                        onClick={() => handleGymClick(gym.id)} // View Details button
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-colors"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <span className="text-gray-700">
                Page {page} of {totalPages} ({totalGyms} total)
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-colors"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GymSearchPage;