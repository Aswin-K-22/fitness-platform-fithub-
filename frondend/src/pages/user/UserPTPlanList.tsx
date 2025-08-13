import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Range } from "react-range";
import { fetchPTPlans } from "../../services/api/userApi";
import type { PTPlan } from "../../types/pTPlan";



const UserPTPlanList: React.FC = () => {
  const [filteredPlans, setFilteredPlans] = useState<PTPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlans, setTotalPlans] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const plansPerPage = 3;

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      try {
        const response = await fetchPTPlans(
          currentPage,
          plansPerPage,
          categoryFilter,
          priceRange[1]
        );
        
        setFilteredPlans(response.plans);
        setTotalPages(response.pagination.totalPages);
        setTotalPlans(response.pagination.total);

        // Calculate max price from all plans (fetch without price filter to get full range)
        if (currentPage === 1 && categoryFilter === "all" && priceRange[1] === maxPrice) {
          const allPlansResponse = await fetchPTPlans(1, 1000, "all"); // Fetch large limit to get all plans
          const newMaxPrice = Math.max(...allPlansResponse.plans.map((plan) => plan.totalPrice || 0));
          setMaxPrice(newMaxPrice);
          setPriceRange([0, newMaxPrice]);
        }
      } catch (error) {
        toast.error("Failed to load plans");
        console.error("Failed to fetch PT plans:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [currentPage, categoryFilter, priceRange[1]]);

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handlePay = (planId: string) => {
    toast.info(`Initiating payment for plan ${planId}...`);
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "beginner":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "intermediate":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "advanced":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "online":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
      case "in-person":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        );
      case "hybrid":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const DefaultImagePlaceholder = () => (
    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
      <div className="text-center">
        <svg
          className="w-16 h-16 mx-auto text-gray-400 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-sm text-gray-500 font-medium">No Image</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading plans...</p>
        </div>
      </div>
    );
  }

  const displayedPlans = filteredPlans;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Personal Training Plans</h1>
              <p className="text-gray-600">Explore and choose your perfect training program</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Plans</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="relative">
                <select
                  className="appearance-none w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 hover:border-indigo-300"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Price Range Filter with react-range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range (₹{priceRange[0]} - ₹{priceRange[1]})
              </label>
              <div className="px-2">
                <Range
                  step={100}
                  min={0}
                  max={maxPrice}
                  values={priceRange}
                  onChange={(values) => setPriceRange([values[0], values[1]])}
                  renderTrack={({ props, children }) => (
                    <div
                      {...props}
                      className="h-2 w-full bg-gray-200 rounded-lg relative"
                      style={{ ...props.style }}
                    >
                      <div
                        className="absolute h-2 bg-indigo-600 rounded-lg"
                        style={{
                          left: `${(priceRange[0] / maxPrice) * 100}%`,
                          width: `${((priceRange[1] - priceRange[0]) / maxPrice) * 100}%`,
                        }}
                      />
                      {children}
                    </div>
                  )}
                  renderThumb={({ props, index }) => (
                    <div
                      {...props}
                      className="h-5 w-5 bg-indigo-600 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      style={{ ...props.style }}
                    >
                      <div className="absolute top-6 text-xs text-gray-600">
                        ₹{priceRange[index]}
                      </div>
                    </div>
                  )}
                />
                <div className="flex justify-between mt-6 text-sm text-gray-500">
                  <span>₹0</span>
                  <span>₹{maxPrice}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            className="mt-4 w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200"
            onClick={() => {
              setCategoryFilter("all");
              setPriceRange([0, maxPrice]);
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {displayedPlans.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <svg
                className="w-24 h-24 mx-auto text-gray-300 mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No plans found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters to find plans</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
                >
                  {/* Image Section */}
                  <div className="relative overflow-hidden">
                    {plan.image ? (
                      <img
                        src={plan.image}
                        alt={plan.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML =
                              '<div class="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"><div class="text-center"><svg class="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="text-sm text-gray-500 font-medium">Image not found</p></div></div>';
                          }
                        }}
                      />
                    ) : (
                      <DefaultImagePlaceholder />
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {plan.verifiedByAdmin ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{plan.title}</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(
                          plan.category
                        )}`}
                      >
                        {plan.category.charAt(0).toUpperCase() + plan.category.slice(1)}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                        {getModeIcon(plan.mode)}
                        <span className="ml-1">{plan.mode.charAt(0).toUpperCase() + plan.mode.slice(1)}</span>
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{plan.description}</p>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                          />
                        </svg>
                        <span className="text-gray-600">{plan.goal}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-gray-600">{plan.duration} months</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                        <span className="font-semibold text-gray-900">₹{plan.totalPrice}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePay(plan.id)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                      disabled={!plan.isActive}
                    >
                      {plan.isActive ? "Pay Now" : "Plan Inactive"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        currentPage === page
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-indigo-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  Next
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * plansPerPage + 1} to{" "}
                {Math.min(currentPage * plansPerPage, totalPlans)} of {totalPlans} plans
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserPTPlanList;