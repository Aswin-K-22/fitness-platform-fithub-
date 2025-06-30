// src/presentation/features/trainer/pages/TrainerVerifyOtp.tsx
import React, { useState, type FormEvent, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { resendTrainerOtp, verifyTrainerOtp } from "../../services/api/trainerApi";



const TrainerVerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, purpose } = location.state || {};
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email || !purpose) {
      navigate("/trainer/signup");
    }

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, purpose, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("OTP cannot be empty");
      return;
    }
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      await verifyTrainerOtp({ email, otp });
      toast.success("OTP verified! Awaiting admin approval.");
      navigate("/trainer/pending-approval");
    } catch (error) {
      setError("Invalid OTP or verification failed.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      await resendTrainerOtp({ email });
      toast.success("OTP resent to your email.");
      setResendCooldown(30);
      setCanResend(false);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error("Failed to resend OTP.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Verify Your Email</h2>
        <p className="text-gray-600 mb-6">Enter the 6-digit OTP sent to {email}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
              placeholder="123456"
              maxLength={6}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 bg-indigo-600 text-white rounded-md ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"}`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
        <button
          onClick={handleResendOtp}
          disabled={!canResend || loading}
          className={`mt-4 w-full py-2 bg-gray-200 text-gray-700 rounded-md ${!canResend || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"}`}
        >
          {canResend ? "Resend OTP" : `Resend OTP (${resendCooldown}s)`}
        </button>
      </div>
    </div>
  );
};

export default TrainerVerifyOtp;