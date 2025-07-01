/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getMembershipPlansUser, subscribeToPlan, verifyPayment } from "../../services/api/userApi";
import Navbar from "../../components/common/user/Navbar";
import type { RootState } from "../../store/store";
import { useSelector } from "react-redux";

interface MembershipPlan {
  id: string;
  name: "Premium" | "Basic" | "Diamond";
  description: string;
  price: number;
  duration: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

const MembershipPage: React.FC = () => {
  const { isAuthenticated, user, } = useSelector((state: RootState) => state.userAuth);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPlans, setTotalPlans] = useState(0);
  const plansPerPage = 3;
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleFaqToggle = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const response = await getMembershipPlansUser(currentPage, plansPerPage);
        console.log('fetched plans', response);
        
        // Handle the actual API response structure
        if (response && typeof response === 'object') {
          // Your API returns: { success, plans, page, totalPages, totalPlans }
          if ('plans' in response && 'totalPlans' in response) {
            setPlans(response.plans as MembershipPlan[]);
            setTotalPlans(response.totalPlans as number);
          } 
          // Fallback for different response structures
          
        
        }
      } catch (error: any) {
        console.error("Error fetching plans:", error);
        toast.error(error?.response?.data?.message || "Failed to load membership plans");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, [currentPage]);

  const getDisplayPrice = (plan: MembershipPlan) => {
    return plan.price / plan.duration;
  };

  const totalPages = Math.ceil(totalPlans / plansPerPage);
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handlePayment = async (plan: MembershipPlan) => {
     if (!isAuthenticated || user?.role === "user") {
      navigate("/auth");
      return ;
    }
    setPaymentLoading(plan.id);
    try {
      const response = await subscribeToPlan(plan.id);
      const { orderId, amount, currency } = response;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: currency || "INR",
        name: "FitHub",
        description: `Subscription to ${plan.name} Plan`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            console.log("Payment success:", response);
            const paymentData = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id,
            };
            await verifyPayment(paymentData);
            localStorage.setItem(
              "paymentSuccessData",
              JSON.stringify({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                planName: plan.name,
                amount: amount,
              })
            );
            toast.success("Payment successful! Subscription activated.");
            navigate("/user/payment-success");
          } catch (verifyError: any) {
            console.error("Payment verification error:", verifyError);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#2563EB",
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(null);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

      razorpay.on("payment.failed", (error: any) => {
        console.log("Payment failed:", error);
        toast.error("Payment failed. Please try again.");
        navigate("/user/payment-failed");
        setPaymentLoading(null);
      });
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      toast.error(error.response?.data?.message || "Error initiating payment. Please try again.");
      navigate("/user/payment-failed");
    } finally {
      setPaymentLoading(null);
    }
  };

  const featureLabels: { [key: string]: string } = {
    "24/7-access": "24/7 Gym Access",
    "personal-trainer": "Personal Trainer Session",
    "group-classes": "Group Fitness Classes",
    "spa-access": "Spa Access",
  };

  const getPlanBadge = (planName: string) => {
    switch (planName) {
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

  const getPlanStyle = (planName: string) => {
    switch (planName) {
      case "Premium":
        return "border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white shadow-lg hover:shadow-xl transform hover:-translate-y-1";
      case "Diamond":
        return "border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white shadow-lg hover:shadow-xl transform hover:-translate-y-1";
      default:
        return "border border-gray-200 bg-white hover:shadow-lg transform hover:-translate-y-1";
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 font-inter min-h-screen">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Choose Your Path to Fitness
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Flexible plans designed to fit your lifestyle and fitness goals. Start your transformation today.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-lg text-gray-600">Loading plans...</span>
            </div>
          ) : (
            <>
              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`${getPlanStyle(plan.name)} rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl focus-within:shadow-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 relative overflow-hidden`}
                    tabIndex={0}
                    role="button"
                    aria-label={`Select ${plan.name} plan`}
                  >
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 rounded-full transform translate-x-8 -translate-y-8"></div>
                    </div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                          <p className="text-gray-500 font-medium">{plan.duration}-month membership</p>
                        </div>
                        {getPlanBadge(plan.name)}
                      </div>

                      <div className="mb-8">
                        <div className="flex items-baseline">
                          <span className="text-5xl font-bold text-gray-900">
                            ₹{getDisplayPrice(plan).toFixed(0)}
                          </span>
                          <span className="text-lg font-medium text-gray-500 ml-2">/month</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Total: ₹{plan.price} for {plan.duration} months
                        </p>
                      </div>

                      <ul className="space-y-4 mb-8">
                        {plan.features.map((feature, index) => (
                          <li key={`${feature}-${index}`} className="flex items-center group">
                            <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                              <i className="fas fa-check text-green-600 text-xs"></i>
                            </div>
                            <span className="text-gray-700 font-medium">
                              {featureLabels[feature] || feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <button
                        className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                          plan.name === "Premium"
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
                            : plan.name === "Diamond"
                            ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl"
                            : "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 shadow-lg hover:shadow-xl"
                        }`}
                        onClick={() => handlePayment(plan)}
                        disabled={paymentLoading === plan.id}
                        aria-label={`Select ${plan.name} plan`}
                      >
                        {paymentLoading === plan.id ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Processing...
                          </div>
                        ) : (
                          "Select Plan"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mb-16">
                  <nav className="flex items-center space-x-1 bg-white rounded-xl shadow-sm p-1" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-3 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      aria-label="Previous page"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentPage === page
                            ? "bg-blue-600 text-white shadow-md"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                        aria-current={currentPage === page ? "page" : undefined}
                        aria-label={`Page ${page}`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-3 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      aria-label="Next page"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}

          {/* Enhanced FAQ Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {[
                {
                  question: "What's included in the trial period?",
                  answer: "Our trial includes full access to gym facilities, basic equipment, and one complimentary group fitness class. Personal training sessions are available at an additional cost."
                },
                {
                  question: "Can I freeze my membership?",
                  answer: "Yes, you can freeze your membership for up to 3 months per year with 7 days prior notice. This feature is available for all membership tiers."
                },
                {
                  question: "What's your cancellation policy?",
                  answer: "You can cancel anytime with a 30-day notice. No long-term commitments required. Refunds are processed according to our terms and conditions."
                }
              ].map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    className="flex justify-between items-center w-full text-left p-6 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors duration-200"
                    onClick={() => handleFaqToggle(index)}
                    aria-expanded={openFaq === index}
                    aria-controls={`faq-${index}`}
                  >
                    <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                    <i
                      className={`fas fa-chevron-down text-gray-400 transition-transform duration-200 ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    ></i>
                  </button>
                  {openFaq === index && (
                    <div id={`faq-${index}`} className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MembershipPage;