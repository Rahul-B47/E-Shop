import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Toast from "./Toast";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function OTPInput({ otp, setOtp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get("email");

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSuccess, setToastSuccess] = useState(true);
  const [resending, setResending] = useState(false);

  const showToastMsg = (message, success = true) => {
    setToastMessage(message);
    setToastSuccess(success);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  useEffect(() => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length === 6) {
      verifyOtp(enteredOtp);
    }
  }, [otp]);

  const verifyOtp = async (enteredOtp) => {
    try {
      const res = await fetch(`${API_BASE}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToastMsg("✅ OTP verified successfully!", true);
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        showToastMsg(data.message || "❌ Invalid OTP. Please try again.", false);
      }
    } catch {
      showToastMsg("❌ Network error. Please try again.", false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    setResending(true);
    try {
      const res = await fetch(`${API_BASE}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        showToastMsg("📩 OTP resent to your email.", true);
        setOtp(new Array(6).fill(""));
      } else {
        showToastMsg(data.message || "❌ Failed to resend OTP.", false);
      }
    } catch {
      showToastMsg("❌ Network error while resending.", false);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
      <div className="w-full max-w-sm bg-[#1a1a2e] text-white rounded-xl shadow-lg p-8 space-y-6 border border-indigo-500/20 animate-fade-in">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-indigo-400">Enter OTP</h2>
          <p className="text-sm text-gray-400 mt-1">
            A 6-digit OTP has been sent to
            <br />
            <span className="font-medium text-white">{email}</span>
          </p>
        </div>

        <div className="flex justify-center gap-2">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-${idx}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleBackspace(e, idx)}
              className="w-10 h-12 text-center text-xl bg-gray-800 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          ))}
        </div>

        <button
          onClick={handleResendOtp}
          disabled={resending}
          className="w-full text-sm text-indigo-300 hover:underline disabled:opacity-50 text-center"
        >
          {resending ? "Resending OTP..." : "Resend OTP"}
        </button>
      </div>

      <Toast show={showToast} message={toastMessage} success={toastSuccess} />
    </div>
  );
}
