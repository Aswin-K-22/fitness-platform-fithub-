//src/pages/user/UserPTPlanList.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Range } from "react-range";
import {
  fetchPTPlans,
  getUserCurrentPTPlans,
  subscribeToPTPlan,
  verifyPTPayment,
} from "../../services/api/userApi";
import type { PTPlan } from "../../types/pTPlan";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../store/store";

const UserPTPlanList: React.FC = () => {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.userAuth
  );
  const navigate = useNavigate();

  const [filteredPlans, setFilteredPlans] = useState<PTPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlans, setTotalPlans] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [maxPrice] = useState<number>(100000);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    0, 100000,
  ]);
  const [activePlanIds, setActivePlanIds] = useState<Set<string | null>>(new Set());


  const plansPerPage = 3;

  // Debounced API fetch for plans
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const loadPlans = async () => {
        setLoading(true);
        try {
          const response = await fetchPTPlans(
            currentPage,
            plansPerPage,
            categoryFilter,
            priceRange[1],
            priceRange[0]
          );

          setFilteredPlans(response.plans);
          setTotalPages(response.pagination.totalPages);
          setTotalPlans(response.pagination.total);

           if (isAuthenticated && user) {
            const userActivePlans = await getUserCurrentPTPlans();
            const activeIds = new Set(userActivePlans.map((plan) => plan.plan.id));
            setActivePlanIds(activeIds);
          } else {
            // Clear activePlanIds if user is not authenticated
            setActivePlanIds(new Set());
          }
        } catch (error) {
          toast.error("Failed to load plans");
          console.error("Failed to fetch PT plans:", error);
        } finally {
          setLoading(false);
        }
      };

      loadPlans();
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimer);
  }, [currentPage, categoryFilter, priceRange]);

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Razorpay PT Plan payment flow
  const handlePay = async (plan: PTPlan) => {
    if (!isAuthenticated || user?.role !== "user") {
      navigate("/auth");
      return;
    }

    setPaymentLoading(plan.id);

    try {
      const response = await subscribeToPTPlan(plan.id);

      if (!response.success) {
        toast.error(response.error?.message || "Error initiating payment");
        return;
      }

      const { orderId, amount, currency } = response.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: currency || "INR",
        name: "FitHub",
        description: `PT Plan: ${plan.title}`,
        order_id: orderId,
        handler: async (rzpResponse: any) => {
          try {
            const verifyRes = await verifyPTPayment({
              razorpay_payment_id: rzpResponse.razorpay_payment_id,
              razorpay_order_id: rzpResponse.razorpay_order_id,
              razorpay_signature: rzpResponse.razorpay_signature,
              planId: plan.id,
            });

            if (!verifyRes.success) {
              toast.error(
                verifyRes.error?.message || "Payment verification failed."
              );
              navigate("/user/payment-failed");
              return;
            }

            toast.success("Payment successful! PT Plan activated.");
            navigate("/user/payment-success");
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            toast.error("Payment verification failed. Please contact support.");
            navigate("/user/payment-failed");
          }
        },
        theme: { color: "#2563EB" },
        modal: { ondismiss: () => setPaymentLoading(null) },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      razorpay.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        navigate("/user/payment-failed");
      });
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      toast.error(
        error.response?.data?.message ||
          "Error initiating payment. Please try again."
      );
      navigate("/user/payment-failed");
    } finally {
      setPaymentLoading(null);
    }
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
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Personal Training Plans
              </h1>
              <p className="text-gray-600">
                Explore and choose your perfect training program
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Filter Plans
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Price Range */}
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
                  onChange={(values) => {
                    const [minVal, maxVal] = values;
                    if (minVal > maxVal) {
                      setPriceRange([maxVal, minVal]);
                    } else {
                      setPriceRange([minVal, maxVal]);
                    }
                  }}
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
                          width: `${
                            ((priceRange[1] - priceRange[0]) / maxPrice) * 100
                          }%`,
                        }}
                      />
                      {children}
                    </div>
                  )}
                  renderThumb={({ props }) => (
                    <div
                      {...props}
                      className="h-5 w-5 bg-indigo-600 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      style={{ ...props.style }}
                    ></div>
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

      {/* Cards */}
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No plans found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your filters to find plans
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Plan Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
                >
                  {/* Image */}
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

                    {/* Status */}
                    <div className="absolute top-4 right-4">
                      {plan.verifiedByAdmin ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {plan.title}
                    </h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(
                          plan.category
                        )}`}
                      >
                        {plan.category.charAt(0).toUpperCase() +
                          plan.category.slice(1)}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                        {getModeIcon(plan.mode)}
                        <span className="ml-1">
                          {plan.mode.charAt(0).toUpperCase() +
                            plan.mode.slice(1)}
                        </span>
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {plan.description}
                    </p>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm">
                        🎯 {plan.goal}
                      </div>
                      <div className="flex items-center text-sm">
                        ⏳ {plan.duration} months
                      </div>
                      <div className="flex items-center text-sm">
                        💰{" "}
                        <span className="font-semibold text-gray-900">
                          ₹{plan.totalPrice}
                        </span>
                      </div>
                    </div>
                 <button onClick={() => handlePay(plan)}
  className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg ${
    !plan.isActive || activePlanIds.has(plan.id) ? "opacity-50 cursor-not-allowed hover:none" : ""
  }`}
  disabled={!plan.isActive || activePlanIds.has(plan.id)}
>
  {activePlanIds.has(plan.id)
    ? "Already Active"
    : paymentLoading === plan.id
    ? "Processing..."
    : plan.isActive
    ? "Pay Now"
    : "Plan Inactive"}
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
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                    (page) => (
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
                    )
                  )}
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
                {Math.min(currentPage * plansPerPage, totalPlans)} of{" "}
                {totalPlans} plans
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserPTPlanList;
