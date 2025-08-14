/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getMembershipPlansUser,
  subscribeToPlan,
  verifyPayment,
  getUserCurrentPlans,
} from "../../services/api/userApi";
import type { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import type { MembershipPlanDTO as MembershipPlan } from "../../types/dtos/MembershipPlanDTO";
import type { MembershipDTO } from "../../types/dtos/IGetUserCurrentPlansResponseDTO";

const MembershipPage: React.FC = () => {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.userAuth
  );
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPlans, setTotalPlans] = useState(0);
  const plansPerPage = 3;

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activePlanIds, setActivePlanIds] = useState<string[]>([]);
  const navigate = useNavigate();

  // FAQ toggle
  const handleFaqToggle = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Fetch membership plans
  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const response = await getMembershipPlansUser(currentPage, plansPerPage);
        if (response && typeof response === "object" && "plans" in response) {
          setPlans(response.plans as MembershipPlan[]);
          setTotalPlans(response.totalPlans as number);
        }
      } catch (error: any) {
        console.error("Error fetching plans:", error);
        toast.error(
          error?.response?.data?.message || "Failed to load membership plans"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [currentPage]);

  // Fetch active memberships for button disable
  useEffect(() => {
    const fetchActive = async () => {
      if (!isAuthenticated) return;
      try {
        const memberships: MembershipDTO[] = await getUserCurrentPlans();
        setActivePlanIds(memberships.map((m) => m.planId));
      } catch (err) {
        console.error("Failed to fetch active memberships:", err);
      }
    };
    fetchActive();
  }, [isAuthenticated]);

  const getDisplayPrice = (plan: MembershipPlan) => plan.price / plan.duration;
  const totalPages = Math.ceil(totalPlans / plansPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // Payment flow
  const handlePayment = async (plan: MembershipPlan) => {
    if (!isAuthenticated || user?.role !== "user") {
      navigate("/auth");
      return;
    }
    setPaymentLoading(plan.id);

    try {
      const response = await subscribeToPlan(plan.id);

      if (!response.success) {
        if (response.error?.code === "MEMBERSHIP_ALREADY_ACTIVE") {
          toast.info(
            response.error.message || "You already have this active membership"
          );
        } else {
          toast.error(response.error?.message || "Error initiating payment");
        }
        return;
      }

      const { orderId, amount, currency } = response.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: currency || "INR",
        name: "FitHub",
        description: `Subscription to ${plan.name} Plan`,
        order_id: orderId,
        handler: async (rzpResponse: any) => {
          try {
            const verifyRes = await verifyPayment({
              razorpay_payment_id: rzpResponse.razorpay_payment_id,
              razorpay_order_id: rzpResponse.razorpay_order_id,
              razorpay_signature: rzpResponse.razorpay_signature,
              planId: plan.id,
            });

            if (!verifyRes.success) {
              if (verifyRes.error?.code === "MEMBERSHIP_ALREADY_ACTIVE") {
                toast.info(
                  verifyRes.error.message ||
                    "You already have this active membership"
                );
              } else {
                toast.error(
                  verifyRes.error?.message || "Payment verification failed."
                );
              }
              return;
            }

            toast.success("Payment successful! Subscription activated.");
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
      const code = error.response?.data?.error?.code;
      if (code === "MEMBERSHIP_ALREADY_ACTIVE") {
        toast.info(
          error.response.data.error.message ||
            "You already have this active membership"
        );
        return;
      }
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

  const featureLabels: Record<string, string> = {
    "24/7-access": "24/7 Gym Access",
    "personal-trainer": "Personal Trainer Session",
    "group-classes": "Group Fitness Classes",
    "spa-access": "Spa Access",
  };

  const getPlanBadge = (planType: string) => {
    switch (planType) {
      case "Basic":
        return (
          <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
            Popular
          </span>
        );
      case "Premium":
        return (
          <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
            Best Value
          </span>
        );
      case "Diamond":
        return (
          <span className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
            Premium
          </span>
        );
      default:
        return null;
    }
  };

  const getPlanStyle = (planType: string) => {
    switch (planType) {
      case "Premium":
        return "border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white shadow-lg";
      case "Diamond":
        return "border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white shadow-lg";
      default:
        return "border border-gray-200 bg-white";
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 font-inter min-h-screen">
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Choose Your Path to Fitness
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Flexible plans designed to fit your lifestyle and fitness goals.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              <span className="ml-4">Loading plans...</span>
            </div>
          ) : (
            <>
              {/* Plans */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`${getPlanStyle(
                      plan.type
                    )} rounded-2xl p-8 transition-all duration-300`}
                  >
                    <div className="flex justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        <p className="text-gray-500">
                          {plan.type} - {plan.duration}-month
                        </p>
                      </div>
                      {getPlanBadge(plan.type)}
                    </div>
                    <div className="mb-8">
                      <div className="flex items-baseline">
                        <span className="text-5xl font-bold">
                          ₹{getDisplayPrice(plan).toFixed(0)}
                        </span>
                        <span className="text-lg text-gray-500 ml-2">/month</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Total: ₹{plan.price} for {plan.duration} months
                      </p>
                    </div>
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center">
                          <span>✔ {featureLabels[feat] || feat}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      className="w-full py-4 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      onClick={() => handlePayment(plan)}
                      disabled={
                        paymentLoading === plan.id ||
                        activePlanIds.includes(plan.id)
                      }
                    >
                      {activePlanIds.includes(plan.id)
                        ? "Already Active"
                        : paymentLoading === plan.id
                        ? "Processing..."
                        : "Select Plan"}
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination - original style */}
              {totalPages > 1 && (
                <div className="flex justify-center mb-16">
                  <nav className="flex items-center space-x-1 bg-white rounded-xl shadow-sm p-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-3 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-3 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </nav>
                </div>
              )}

              {/* FAQ Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-center mb-8">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4 max-w-3xl mx-auto">
                  {[
                    {
                      question: "What's included in the trial period?",
                      answer:
                        "Our trial includes full access to gym facilities, basic equipment, and one complimentary group fitness class.",
                    },
                    {
                      question: "Can I freeze my membership?",
                      answer:
                        "Yes, you can freeze your membership for up to 3 months per year.",
                    },
                    {
                      question: "What's your cancellation policy?",
                      answer:
                        "You can cancel anytime with a 30-day notice. Refunds according to our terms.",
                    },
                  ].map((faq, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-xl overflow-hidden"
                    >
                      <button
                        className="flex justify-between w-full text-left p-6 hover:bg-gray-50"
                        onClick={() => handleFaqToggle(idx)}
                      >
                        <span className="font-semibold">{faq.question}</span>
                        <i
                          className={`fas fa-chevron-down transition-transform ${
                            openFaq === idx ? "rotate-180" : ""
                          }`}
                        ></i>
                      </button>
                      {openFaq === idx && (
                        <div className="px-6 pb-6">{faq.answer}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default MembershipPage;
