import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface PaymentData {
  paymentId: string;
  orderId: string;
  planName: string;
  amount: number;
}

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("paymentSuccessData");
    if (data) {
      setPaymentData(JSON.parse(data));
      localStorage.removeItem("paymentSuccessData"); // Clean up
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-green-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-4">
          Your subscription has been activated successfully. Enjoy your fitness journey with FitHub!
        </p>
        {paymentData && (
          <div className="text-left mb-6 bg-gray-50 p-4 rounded-lg">
            <p><strong>Payment ID:</strong> {paymentData.paymentId}</p>
          
            <p><strong>Plan:</strong> {paymentData.planName}</p>
            <p><strong>Amount:</strong> ₹{paymentData.amount}</p>
          </div>
        )}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Move to Home
          </button>
          <button
            onClick={() => navigate("/user/membership")}
            className="bg-gray-200 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Membership Plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;