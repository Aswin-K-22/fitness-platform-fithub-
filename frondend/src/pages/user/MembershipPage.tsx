/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { getMembershipPlans } from "../../services/api/adminApi";
import { toast } from "react-toastify";
import { subscribeToPlan, verifyPayment } from "../../services/api/userApi";
import Navbar from "../../components/common/user/Navbar";



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
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(false);
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
        const { plans: fetchedPlans, total } = await getMembershipPlans(
          currentPage,
           plansPerPage,
        );
        setPlans(fetchedPlans);
        setTotalPlans(total);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load membership plans");
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
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePayment = async (plan: MembershipPlan) => {
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
          navigate("/payment-success")
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3B82F6",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

      razorpay.on("payment.failed", (error: any) => {
        console.log("Payment failed:", error);
        toast.error("Payment failed. Please try again.");
        navigate("/payment-failed")
      });
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      toast.error(error.response?.data?.message || "Error initiating payment. Please try again.");
      navigate("/payment-failed")
    }
  };

  const featureLabels: { [key: string]: string } = {
    "24/7-access": "24/7 Gym Access",
    "personal-trainer": "Personal Trainer Session",
    "group-classes": "Group Fitness Classes",
    "spa-access": "Spa Access",
  };

  return (
    <div className="bg-gray-50 font-inter min-h-screen">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Path to Fitness</h1>
            <p className="text-xl text-gray-600">Flexible plans designed to fit your lifestyle and fitness goals</p>
          </div>

          {loading ? (
            <div className="text-center text-gray-600">Loading plans...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-xl shadow-sm p-8 border transition-all duration-200 hover:shadow-md focus-within:shadow-md focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 ${
                    plan.name === "Premium" ? "border-2 border-gray-200" : "border-gray-200"
                  }`}
                  tabIndex={0}
                  role="button"
                  aria-label={`Select ${plan.name} plan`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-gray-500">{plan.duration}-month membership</p>
                    </div>
                    {plan.name === "Basic" && (
                      <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                        Popular
                      </span>
                    )}
                    {plan.name === "Premium" && (
                      <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                        Best Value
                      </span>
                    )}
                  </div>
                  <div className="mb-6">
                    <p className="text-4xl font-bold text-gray-900">
                      ₹{getDisplayPrice(plan).toFixed(2)}
                      <span className="text-lg font-normal text-gray-500">/mo</span>
                    </p>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <i className="fas fa-check text-blue-600 mr-3"></i>
                        <span className="text-gray-600">{featureLabels[feature] || feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                    onClick={() => handlePayment(plan)}
                    aria-label={`Select ${plan.name} plan`}
                  >
                    Select Plan
                  </button>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mb-16">
              <nav className="flex items-center space-x-2" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border border-gray-300 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 ${
                      currentPage === page
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-700 hover:bg-gray-50"
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
                  className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </nav>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <button
                  className="flex justify-between items-center w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                  onClick={() => handleFaqToggle(0)}
                  aria-expanded={openFaq === 0}
                  aria-controls="faq-0"
                >
                  <span className="text-lg font-medium text-gray-900">What's included in the trial period?</span>
                  <i
                    className={`fas fa-chevron-down text-gray-400 transition-transform ${
                      openFaq === 0 ? "rotate-180" : ""
                    }`}
                  ></i>
                </button>
                {openFaq === 0 && (
                  <div id="faq-0" className="mt-3">
                    <p className="text-gray-600">
                      Our trial includes full access to gym facilities, basic equipment, and one complimentary group fitness class. Personal training sessions are available at an additional cost.
                    </p>
                  </div>
                )}
              </div>
              <div className="border-b border-gray-200 pb-6">
                <button
                  className="flex justify-between items-center w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                  onClick={() => handleFaqToggle(1)}
                  aria-expanded={openFaq === 1}
                  aria-controls="faq-1"
                >
                  <span className="text-lg font-medium text-gray-900">Can I freeze my membership?</span>
                  <i
                    className={`fas fa-chevron-down text-gray-400 transition-transform ${
                      openFaq === 1 ? "rotate-180" : ""
                    }`}
                  ></i>
                </button>
                {openFaq === 1 && (
                  <div id="faq-1" className="mt-3">
                    <p className="text-gray-600">Yes, you can freeze your membership for up to 3 months per year with prior notice.</p>
                  </div>
                )}
              </div>
              <div className="border-b border-gray-200 pb-6">
                <button
                  className="flex justify-between items-center w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                  onClick={() => handleFaqToggle(2)}
                  aria-expanded={openFaq === 2}
                  aria-controls="faq-2"
                >
                  <span className="text-lg font-medium text-gray-900">What's your cancellation policy?</span>
                  <i
                    className={`fas fa-chevron-down text-gray-400 transition-transform ${
                      openFaq === 2 ? "rotate-180" : ""
                    }`}
                  ></i>
                </button>
                {openFaq === 2 && (
                  <div id="faq-2" className="mt-3">
                    <p className="text-gray-600">You can cancel anytime with a 30-day notice. No long-term commitments required.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MembershipPage;