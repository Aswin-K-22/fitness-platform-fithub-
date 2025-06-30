/* eslint-disable no-misleading-character-class */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";
import { fetchGyms } from "../../services/api/userApi";
import type { IGymSearchDTO } from "../../types/dtos/IGymSearchDTO";
import { locationOptions, locationMap } from "../../constants/locations";

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
  location: string;
}

const GymSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({
    distance: "All",
    gymType: "All Types",
    rating: "Any Rating",
    location: "current",
  });
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGyms, setTotalGyms] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [customLocation, setCustomLocation] = useState("");
  const [showCustomLocationInput, setShowCustomLocationInput] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [customLocationError, setCustomLocationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const limit = 3;

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation && filters.location === "current") {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationPermissionDenied(false);
          setError(null);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLocationPermissionDenied(true);
          setError("Location access denied. Please select a location manually.");
        }
      );
    }
  }, [filters.location]);

  // Location suggestion logic
  const getLocationSuggestions = useCallback((input: string) => {
    const normalizedInput = input.toLowerCase().trim();
    if (!normalizedInput) return [];
    
    return Object.keys(locationMap).filter(city =>
      city.toLowerCase().includes(normalizedInput) ||
      normalizedInput.includes(city.toLowerCase())
    );
  }, []);

  // Update suggestions when custom location input changes
  useEffect(() => {
    if (filters.location === "custom" && customLocation) {
      setLocationSuggestions(getLocationSuggestions(customLocation));
    } else {
      setLocationSuggestions([]);
    }
  }, [customLocation, filters.location, getLocationSuggestions]);

  // Geocode custom location
  const geocodeLocation = useCallback(async (locationName: string): Promise<{ lat: number; lng: number } | null> => {
    const normalizedLocation = locationName.toLowerCase().trim();
    return locationMap[normalizedLocation] || null;
  }, []);

  // Get coordinates for selected location
  const getLocationCoordinates = useCallback(async () => {
    if (filters.location === "current") {
      return userLocation;
    } else if (filters.location === "custom" && customLocation.trim()) {
      if (!customLocation.trim()) {
        setCustomLocationError("Please enter a valid location");
        return null;
      }
      const coordinates = await geocodeLocation(customLocation);
      if (!coordinates) {
        setCustomLocationError("This location is not supported. Please select a location from Kerala or Tamil Nadu.");
      } else {
        setCustomLocationError(null);
      }
      return coordinates;
    } else {
      return locationOptions.find(loc => loc.value === filters.location)?.coordinates || null;
    }
  }, [filters.location, userLocation, customLocation, geocodeLocation]);

  const loadGyms = useCallback(async () => {
    setLoading(true);
    try {
      if (filters.location === "custom" && !customLocation.trim()) {
        setCustomLocationError("Please enter a location to search");
        setLoading(false);
        return;
      }

      const params: IGymSearchDTO = {
        page,
        limit,
        search: searchQuery,
        gymType: filters.gymType === "All Types" ? undefined : filters.gymType,
        rating: filters.rating === "Any Rating" ? undefined : filters.rating.replace("+ Stars", ""),
      };

      if (filters.distance !== "All") {
        const coordinates = await getLocationCoordinates();
        if (!coordinates) {
          setError(
            filters.location === "current"
              ? "Location required for distance filter. Please allow location access or select a location."
              : customLocationError || "This location is not supported. Please select a location from Kerala or Tamil Nadu."
          );
          setLoading(false);
          return;
        }
        params.lat = coordinates.lat;
        params.lng = coordinates.lng;
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

      if (response.gyms.length === 0 && filters.location === "custom" && customLocation) {
        setError(`No gyms found in ${customLocation.charAt(0).toUpperCase() + customLocation.slice(1)} within the Distance . Try a different location or adjust the distance filter.`);
      } else {
        setError(null);
      }

      setGyms(response.gyms);
      setTotalPages(response.totalPages);
      setTotalGyms(response.totalGyms);
    } catch (err) {
      console.error("Error fetching gyms:", err);
      setError("Failed to load gyms. Please try again later.");
      setGyms([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, filters, getLocationCoordinates, customLocationError, customLocation]);

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
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    if (name === "location") {
      setShowCustomLocationInput(value === "custom");
      if (value !== "custom") {
        setCustomLocation("");
        setCustomLocationError(null);
        setLocationSuggestions([]);
      }
      setUserLocation(null);
      setLocationPermissionDenied(false);
    }
    setPage(1);
  };

  const handleCustomLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomLocation(e.target.value);
    setCustomLocationError(null);
    setPage(1);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setCustomLocation(suggestion);
    setLocationSuggestions([]);
    setCustomLocationError(null);
    setPage(1);
    debouncedLoadGyms();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const handleGymClick = (gymId: string) => {
    navigate(`/user/gym/${gymId}`);
  };

  const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const defaultProfilePic = "/images/user.jpg";
  const distanceOptions = ["All", 5, 10, 20, 50, 60, 100];

  

  return (
    <div className="font-inter bg-gray-50 min-h-screen">
      <div className="mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-center bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-xl">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Find your perfect gym..."
                  className="w-full px-6 py-4 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent text-lg backdrop-blur-sm"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Search
              </button>
            </form>

            {/* Filter Section */}
            <div className="mt-8 bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Location Filter */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <span className="mr-2">📍</span>
                    Location
                  </label>
                  <select
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white shadow-sm"
                    disabled={loading}
                  >
                    {locationOptions.map((location) => (
                      <option key={location.value} value={location.value}>
                        {location.label}
                      </option>
                    ))}
                  </select>
                  {showCustomLocationInput && (
                    <div className="mt-3 transition-all duration-300">
                      <input
                        type="text"
                        value={customLocation}
                        onChange={handleCustomLocationChange}
                        placeholder="Enter city (e.g., Alappuzha, Chennai)"
                        className={`w-full px-4 py-3 rounded-xl border-2 ${
                          customLocationError ? "border-red-500" : "border-gray-200"
                        } hover:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm`}
                      />
                      {customLocationError && (
                        <p className="text-red-500 text-xs mt-1">{customLocationError}</p>
                      )}
                      {locationSuggestions.length > 0 && (
                        <ul className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                          {locationSuggestions.map((suggestion) => (
                            <li
                              key={suggestion}
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700"
                              onClick={() => handleSuggestionSelect(suggestion)}
                            >
                              {suggestion.charAt(0).toUpperCase() + suggestion.slice(1)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  {filters.location === "current" && (
                    <div className="text-xs mt-2">
                      {userLocation ? (
                        <span className="text-green-600 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                          Location detected
                        </span>
                      ) : locationPermissionDenied ? (
                        <span className="text-red-600 flex items-center">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                          Location access denied
                        </span>
                      ) : (
                        <span className="text-yellow-600 flex items-center">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                          Getting location...
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Distance Filter */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <span className="mr-2">📏</span>
                    Distance
                  </label>
                  <select
                    name="distance"
                    value={filters.distance}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white shadow-sm"
                    disabled={loading}
                  >
                    {distanceOptions.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist === "All" ? "All Distances" : `Within ${dist} km`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gym Type Filter */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <span className="mr-2">🏋️</span>
                    Gym Type
                  </label>
                  <select
                    name="gymType"
                    value={filters.gymType}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white shadow-sm"
                    disabled={loading}
                  >
                    <option>All Types</option>
                    <option>Basic</option>
                    <option>Premium</option>
                    <option>Diamond</option>
                  </select>
                </div>

                {/* Rating Filter */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <span className="mr-2">⭐</span>
                    Rating
                  </label>
                  <select
                    name="rating"
                    value={filters.rating}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white shadow-sm"
                    disabled={loading}
                  >
                    <option>Any Rating</option>
                    <option>4+ Stars</option>
                    <option>3+ Stars</option>
                    <option>2+ Stars</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Display */}
              <div className="mt-6 flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (value && value !== "All" && value !== "All Types" && value !== "Any Rating" && value !== "current") {
                    const displayValue = key === "location" && value === "custom"
                      ? customLocation || "Custom Location"
                      : locationOptions.find(loc => loc.value === value)?.label.replace(/[📍🏙️🏛️🌆🏖️🎓💎🏭✏️🌊⛵⛪🌴🌾🙏🌲🎨⛰️]/g, '').trim() || value;
                    return (
                      <span key={key} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200">
                        <span className="capitalize">{key}:</span>
                        <span className="ml-1 font-medium">{displayValue}</span>
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>

          {/* Gym Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {loading ? (
              [...Array(limit)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
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
              <div className="col-span-full text-center text-red-500 py-12 bg-white rounded-xl shadow-lg">
                <i className="fas fa-exclamation-circle text-4xl mb-4 text-red-400"></i>
                <p className="text-lg mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <i className="fas fa-redo mr-2"></i>
                  Try Again
                </button>
              </div>
            ) : gyms.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-12 bg-white rounded-xl shadow-lg">
                <i className="fas fa-dumbbell text-4xl mb-4 text-gray-400"></i>
                <p className="text-lg">
                  {filters.distance === "All"
                    ? "No gyms found matching your criteria"
                    : `No gyms found within ${filters.distance} km of selected location`}
                </p>
                <p className="text-sm mt-2 text-gray-400">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              gyms.map((gym) => (
                <div
                  key={gym.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={
                        gym.image
                          ? gym.image.startsWith("http")
                            ? gym.image
                            : `${backendUrl}${gym.image.startsWith("/") ? "" : "/"}${gym.image}`
                          : defaultProfilePic
                      }
                      alt={gym.name}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                      onClick={() => handleGymClick(gym.id)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = defaultProfilePic;
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                      <i className="fas fa-star text-yellow-400 mr-1"></i>
                      <span className="font-semibold text-sm">{gym.ratings?.average?.toFixed(1) || "N/A"}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{gym.name}</h3>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                        {gym.type || "Standard"}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 flex items-center">
                      <i className="fas fa-map-marker-alt text-red-500 mr-2"></i>
                      {gym.address?.city || "Unknown"}, {gym.address?.state || "Unknown"}
                    </p>
                    <div className="flex justify-between gap-3">
                      <button
                        onClick={() => navigate("/user/membership")}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                      >
                        View Plans
                      </button>
                      <button
                        onClick={() => handleGymClick(gym.id)}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-3 bg-white rounded-xl shadow-lg p-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl disabled:opacity-50 hover:bg-gray-200 transition-all duration-300 disabled:cursor-not-allowed flex items-center"
              >
                <i className="fas fa-chevron-left mr-2"></i>
                Previous
              </button>
              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-xl transition-all duration-300 ${
                        page === pageNum
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <span className="text-gray-600 px-4 py-2 bg-gray-50 rounded-xl">
                <span className="font-semibold">{totalGyms}</span> gyms total
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl disabled:opacity-50 hover:bg-gray-200 transition-all duration-300 disabled:cursor-not-allowed flex items-center"
              >
                Next
                <i className="fas fa-chevron-right ml-2"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GymSearchPage;