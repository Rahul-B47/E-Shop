import React, { useState, useEffect, useRef } from "react";
import Toast from "../components/Toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState("email");
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const inputsRef = useRef([]);
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    let interval;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  const showToastMsg = (msg, success = true) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      showToastMsg(data.message || "📩 OTP sent to your email!");
      setStep("otp");
      setTimer(60);
    } catch (err) {
      showToastMsg("❌ Failed to send OTP", false);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, idx) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpArray];
    newOtp[idx] = value;
    setOtpArray(newOtp);
    if (value && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otp = otpArray.join("");
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      showToastMsg(data.message, data.success);
      if (data.success) {
        setTimeout(() => {
          window.location.href = `/reset-password?email=${email}`;
        }, 2000);
      }
    } catch {
      showToastMsg("❌ Failed to verify OTP", false);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = () => {
    setTimer(60);
    handleSendOTP({ preventDefault: () => {} });
  };

  const goBackToEmailStep = () => {
    setStep("email");
    setOtpArray(["", "", "", "", "", ""]);
    setToastMessage("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-[#2C3E50] via-[#4CA1AF] to-[#2C3E50]">
      <div className="w-full max-w-md bg-white/10 text-white backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-indigo-200">
          Forgot Password
        </h1>
        <p className="text-sm text-indigo-100 text-center">
          {step === "email"
            ? "Enter your email to receive a 6-digit OTP"
            : "Enter the OTP sent to your email"}
        </p>

        {/* EMAIL STEP */}
        {step === "email" && (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white/20 border border-white/30 text-white placeholder-gray-200 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-semibold transition-all"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* OTP STEP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="flex justify-between gap-2">
              {otpArray.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  className="w-10 h-12 text-center text-lg border border-white/30 bg-white/20 rounded focus:ring-2 focus:ring-indigo-400 outline-none sm:w-12 sm:h-14"
                />
              ))}
            </div>

            <div className="text-sm text-indigo-100 text-center">
              Didn’t receive it?{" "}
              <button
                type="button"
                onClick={resendOTP}
                className="text-yellow-300 font-semibold hover:underline disabled:opacity-40"
                disabled={timer > 0}
              >
                Resend {timer > 0 && `(${timer}s)`}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={goBackToEmailStep}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-md font-semibold transition"
              >
                ⬅ Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-semibold transition"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </form>
        )}
      </div>

      <Toast
        message={toastMessage}
        show={showToast}
        success={!toastMessage?.startsWith("❌")}
      />
    </div>
  );
}
