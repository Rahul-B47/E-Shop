import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

export default function OtpLogin() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: ask email, 2: verify OTP
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const showToastMsg = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSendOtp = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      showToastMsg(data.message);
      setStep(2);
    } catch (err) {
      showToastMsg("❌ Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        showToastMsg(data.message);
        setTimeout(() => navigate("/"), 1500);
      } else {
        showToastMsg("❌ " + data.message);
      }
    } catch {
      showToastMsg("❌ OTP verification failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 px-4">
      <div className="max-w-md w-full bg-[#1a1a2e] text-white p-8 rounded-2xl shadow-xl space-y-6 border border-indigo-500/30">
        <h1 className="text-2xl font-bold text-center text-indigo-400">🔐 OTP Login</h1>

        {step === 1 && (
          <>
            <label className="block text-sm mb-2">Enter your Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSendOtp}
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition font-semibold"
            >
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-gray-400">📩 OTP sent to <strong>{email}</strong></p>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleVerifyOtp}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition font-semibold"
            >
              Verify OTP & Login
            </button>
          </>
        )}
      </div>

      <Toast message={toastMessage} show={showToast} />
    </div>
  );
}
