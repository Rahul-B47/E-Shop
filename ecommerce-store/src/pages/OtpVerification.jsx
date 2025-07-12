// pages/OtpVerification.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OTPInput from "../components/OTPInput";
import Toast from "../components/Toast";

export default function OtpVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSuccess, setToastSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const email = new URLSearchParams(location.search).get("email");

  const handleVerify = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      setToastMessage("Please enter all 6 digits of the OTP.");
      setToastSuccess(false);
      setShowToast(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });

      const data = await res.json();
      if (data.success) {
        setToastMessage("✅ OTP verified. Redirecting...");
        setToastSuccess(true);
        setShowToast(true);
        setTimeout(() => navigate(`/reset-password?email=${email}`), 1500);
      } else {
        setToastMessage("❌ Invalid OTP. Please try again.");
        setToastSuccess(false);
        setShowToast(true);
      }
    } catch (err) {
      setToastMessage("❌ Server error. Please try again later.");
      setToastSuccess(false);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#CADCFC] via-[#7BAAF7] to-[#00246B] px-4">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full space-y-6">
        <h2 className="text-2xl font-bold text-center text-blue-700">Enter OTP</h2>
        <OTPInput otp={otp} setOtp={setOtp} />
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-semibold"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
      <Toast show={showToast} message={toastMessage} success={toastSuccess} />
    </div>
  );
}
