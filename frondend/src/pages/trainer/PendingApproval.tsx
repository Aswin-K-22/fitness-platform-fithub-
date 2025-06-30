// src/presentation/features/trainer/pages/PendingApproval.tsx
import React from "react";
import { Link } from "react-router-dom";

const PendingApproval: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-[Inter] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Pending Admin Approval</h1>
        <p className="text-gray-600 mb-6">
          Your account has been verified, but it’s still awaiting approval from the FitHub admin team. You’ll be able to
          access your dashboard once approved.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-triangle text-yellow-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please check back later or contact support if this takes longer than expected.
              </p>
            </div>
          </div>
        </div>
        <Link
          to="/trainer/login"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
        >
          Go to Login
        </Link>
        <p className="mt-6 text-sm text-gray-600">
          Need assistance? Reach out to{" "}
          <a href="mailto:support@fithub.com" className="text-indigo-600 hover:text-indigo-500">
            support@fithub.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default PendingApproval;