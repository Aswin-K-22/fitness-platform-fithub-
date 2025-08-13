/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";
import { fetchGyms } from "../../services/api/userApi";
import type { IGymSearchDTO } from "../../types/dtos/IGymSearchDTO";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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

const locationOptions = [
  { value: "current", label: "📍 Use Current Location" },
  { value: "custom", label: "✏️ Enter Custom Location" },
];

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
  const [customLat, setCustomLat] = useState<number | null>(null);
  const [customLng, setCustomLng] = useState<number | null>(null);
  const [customLocationError, setCustomLocationError] = useState<string | null>(null);
  const [showCustomLocationInput, setShowCustomLocationInput] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  const autocompleteRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const limit = 3;

  const getLocationCoordinates = useCallback(() => {
    if (filters.location === "current") return userLocation;
    if (filters.location === "custom" && customLat !== null && customLng !== null)
      return { lat: customLat, lng: customLng };
    return null;
  }, [filters.location, userLocation, customLat, customLng]);

  const loadGyms = useCallback(
    async (force = false) => {
      console.log("🚀 loadGyms called", {
        page,
        force,
        filters,
        searchQuery,
        customLat,
        customLng,
        userLocation,
      });
      setLoading(true);
      try {
        const params: IGymSearchDTO = {
          page,
          limit,
          search: searchQuery,
          gymType: filters.gymType === "All Types" ? undefined : filters.gymType,
          rating: filters.rating === "Any Rating" ? undefined : filters.rating.replace("+ Stars", ""),
        };

        const coordinates = getLocationCoordinates();
        console.log("📍 coordinates to send in API =", coordinates);

        // FIX: Always send lat/lng if coords exist
        if (coordinates) {
          params.lat = coordinates.lat;
          params.lng = coordinates.lng;
          if (filters.distance !== "All") {
            params.radius = parseInt(filters.distance);
          }
        }

        console.log("📡 Final API params =", params);

        const response = await fetchGyms(params.page, params.limit, {
          search: params.search,
          lat: params.lat,
          lng: params.lng,
          radius: params.radius,
          gymType: params.gymType,
          rating: params.rating,
        });

        console.log("✅ API Response =", response);

        setGyms(response.gyms);
        setTotalPages(response.totalPages);
        setTotalGyms(response.totalGyms);

        if (response.gyms.length === 0 && filters.location === "custom" && customLocation) {
          setError(`No gyms found in ${customLocation} within ${filters.distance} km.`);
        } else {
          setError(null);
        }
      } catch (err) {
        console.error("❌ Error fetching gyms:", err);
        setError("Failed to load gyms. Please try again later.");
        setGyms([]);
      } finally {
        setLoading(false);
      }
    },
    [page, searchQuery, filters, customLocation, customLat, customLng, userLocation, getLocationCoordinates]
  );

  const debouncedLoadGyms = useCallback(debounce(() => loadGyms(), 800), [loadGyms]);

  // Only auto-fetch when lat/lng ready for custom
  useEffect(() => {
    if (filters.location === "custom" && (customLat === null || customLng === null)) {
      console.log("⏭ Skipping auto-fetch — waiting for custom location selection");
      return;
    }
    debouncedLoadGyms();
    return () => debouncedLoadGyms.cancel();
  }, [debouncedLoadGyms, filters, customLat, customLng]);

  // Load Google Maps API
  useEffect(() => {
    if ((window as any).google && (window as any).google.maps) {
      setMapsLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => setMapsLoaded(true);
    script.onerror = () => setError("Failed to load Google Maps");
    document.head.appendChild(script);
  }, []);

  // Setup Autocomplete with gmp-select
  useEffect(() => {
    if (mapsLoaded && showCustomLocationInput && autocompleteRef.current) {
      autocompleteRef.current.innerHTML = "";
      const autocompleteElement = document.createElement("gmp-place-autocomplete");
      autocompleteElement.setAttribute("placeholder", "Enter location...");
      autocompleteElement.setAttribute("country", "IN");
      autocompleteElement.style.width = "100%";
      autocompleteElement.style.padding = "12px 16px";
      autocompleteElement.style.borderRadius = "12px";

      autocompleteElement.addEventListener("gmp-select", async (event: any) => {
        console.log("📌 gmp-select event:", event);
        try {
          const prediction = event.placePrediction;
          if (!prediction) {
            console.error("❌ No placePrediction in event");
            return;
          }
          const place = prediction.toPlace();
          await place.fetchFields({ fields: ["formattedAddress", "location"] });
          if (!place.location) {
            console.error("❌ No location found");
            return;
          }
          const lat = place.location.lat();
          const lng = place.location.lng();
          const address = place.formattedAddress || "";
          console.log("📍 Selected custom location:", { lat, lng, address });

          setCustomLat(lat);
          setCustomLng(lng);
          setCustomLocation(address);
          setCustomLocationError(null);
          setPage(1);
        } catch (err) {
          console.error("❌ Error in gmp-select:", err);
        }
      });

      autocompleteRef.current.appendChild(autocompleteElement);
    }
  }, [mapsLoaded, showCustomLocationInput]);

  // Trigger gyms fetch when coords ready for custom
  useEffect(() => {
    if (filters.location === "custom" && customLat !== null && customLng !== null) {
      console.log("⏳ Custom lat/lng ready, loading gyms...");
      loadGyms(true);
    }
  }, [customLat, customLng, filters.location, loadGyms]);

  // Get current location if filter = current
  useEffect(() => {
    if (navigator.geolocation && filters.location === "current") {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log("📍 Current location detected:", pos.coords);
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationPermissionDenied(false);
          setError(null);
        },
        () => {
          console.warn("❌ Location permission denied");
          setLocationPermissionDenied(true);
          setError("Location access denied. Please select a location manually.");
        }
      );
    }
  }, [filters.location]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`🔄 Filter changed: ${name} = ${value}`);
    setFilters((prev) => ({ ...prev, [name]: value }));
    if (name === "location") {
      setShowCustomLocationInput(value === "custom");
      if (value !== "custom") {
        setCustomLocation("");
        setCustomLat(null);
        setCustomLng(null);
        setCustomLocationError(null);
      }
      setUserLocation(null);
      setLocationPermissionDenied(false);
    }
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadGyms(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const handleGymClick = (id: string) => navigate(`/user/gym/${id}`);

  const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const defaultProfilePic = "/images/user.jpg";
  const distanceOptions = ["All", 5, 10, 20, 50, 100];

  const getGymTypeColor = (type: string) => {
    switch (type) {
      case "Basic":
        return "bg-green-100 text-green-800";
      case "Premium":
        return "bg-purple-100 text-purple-800";
      case "Diamond":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="font-inter min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section with Search */}
      <div className="relative pt-20 pb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Find Your Perfect Gym
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover premium fitness centers near you with advanced search and filtering
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative flex items-center bg-white/80 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl p-2">
                <div className="flex-1 relative">
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for gyms, trainers, or equipment..."
                    className="w-full pl-12 pr-6 py-4 bg-transparent text-lg placeholder-gray-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        {/* Enhanced Filters */}
        <div className="mb-12">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Filters
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Location Filter */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location
                </label>
                <select
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  {locationOptions.map((loc) => (
                    <option key={loc.value} value={loc.value}>{loc.label}</option>
                  ))}
                </select>
                {showCustomLocationInput && mapsLoaded && (
                  <div className="mt-3 p-1 bg-white rounded-xl border border-gray-200" ref={autocompleteRef}></div>
                )}
                {filters.location === "current" && (
                  <div className="text-sm mt-2">
                    {userLocation ? (
                      <span className="flex items-center text-green-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Location detected
                      </span>
                    ) : locationPermissionDenied ? (
                      <span className="flex items-center text-red-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Access denied
                      </span>
                    ) : (
                      <span className="flex items-center text-amber-600">
                        <svg className="w-4 h-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Getting location...
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Distance Filter */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Distance
                </label>
                <select
                  name="distance"
                  value={filters.distance}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
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
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Gym Type
                </label>
                <select
                  name="gymType"
                  value={filters.gymType}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                >
                  <option>All Types</option>
                  <option>Basic</option>
                  <option>Premium</option>
                  <option>Diamond</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Rating
                </label>
                <select
                  name="rating"
                  value={filters.rating}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                >
                  <option>Any Rating</option>
                  <option>4+ Stars</option>
                  <option>3+ Stars</option>
                  <option>2+ Stars</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="mb-8">
          {!loading && !error && gyms.length > 0 && (
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Found {totalGyms} gyms
              </h2>
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
            </div>
          )}
        </div>

        {/* Gym Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {loading ? (
            [...Array(limit)].map((_, i) => (
              <div key={i} className="group">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 overflow-hidden animate-pulse">
                  <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-300 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-1/4"></div>
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full">
              <div className="text-center py-16 bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30">
                <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-xl text-red-600 font-semibold mb-2">Something went wrong</p>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          ) : gyms.length === 0 ? (
            <div className="col-span-full">
              <div className="text-center py-16 bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-xl text-gray-600 font-semibold mb-2">No gyms found</p>
                <p className="text-gray-500">Try adjusting your search filters</p>
              </div>
            </div>
          ) : (
            gyms.map((gym) => (
              <div
                key={gym.id}
                className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-2"
                onClick={() => handleGymClick(gym.id)}
              >
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 overflow-hidden group-hover:shadow-2xl transition-all duration-300">
                  <div className="relative overflow-hidden">
                    <img
                      src={
                        gym.image?.startsWith("http") ? gym.image :
                        gym.image ? `${backendUrl}${gym.image.startsWith("/") ? "" : "/"}${gym.image}` :
                        defaultProfilePic
                      }
                      alt={gym.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    {gym.type && (
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getGymTypeColor(gym.type)} backdrop-blur-sm`}>
                          {gym.type}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {gym.name}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-4">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm">
                        {gym.address?.city || "Unknown"}, {gym.address?.state || "Unknown"}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < (gym.ratings?.average || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-sm text-gray-600 ml-2">
                          ({gym.ratings?.average?.toFixed(1) || "New"})
                        </span>
                      </div>
                      
                      <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                        <span className="text-sm font-semibold mr-1">View Details</span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 text-blue-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (page <= 4) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = page - 3 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                          page === pageNum
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 text-blue-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GymSearchPage;