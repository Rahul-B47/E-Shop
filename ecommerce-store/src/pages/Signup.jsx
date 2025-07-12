import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import Toast from "../components/Toast";

export default function Signup() {
  const { emailSignup, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [timer, setTimer] = useState(60);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    let interval;
    if (otpSent && !otpVerified && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer, otpSent, otpVerified]);

  const handleSendOtp = async () => {
    setError("");
    if (!email) return setError("📧 Please enter your email first!");

    try {
      const res = await fetch("http://localhost:8000/api/send-register-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success === false) {
        return setError(data.message || "OTP sending failed.");
      }

      setOtpSent(true);
      setTimer(60);
      setToastMessage(data.message || "📤 OTP sent!");
    } catch {
      setToastMessage("❌ Failed to send OTP");
    } finally {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleOtpChange = (val, index) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) return setError("⚠️ Enter full OTP.");

    try {
      const res = await fetch("http://localhost:8000/api/verify-register-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpVerified(true);
        setToastMessage("✅ OTP Verified!");
      } else {
        setToastMessage(data.message || "❌ Invalid OTP");
      }
    } catch {
      setToastMessage("❌ Verification failed");
    } finally {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!otpVerified) return setError("⚠️ Please verify your email OTP first.");
    if (password !== confirm) return setError("⚠️ Passwords do not match!");

    try {
      await emailSignup(email, password);
      setToastMessage("🎉 Signup successful!");
      setShowToast(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError("❌ " + err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await googleLogin();
      navigate("/");
    } catch (err) {
      setError("❌ " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <div className="w-full max-w-md bg-white/10 text-white p-6 sm:p-8 rounded-2xl shadow-xl backdrop-blur-xl border border-white/10 space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-indigo-200">🚀 Create Account</h1>

        {error && (
          <p className="bg-red-600/20 text-red-300 px-4 py-2 rounded text-sm text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          {/* Email + OTP Send */}
          <div>
            <label className="text-sm mb-1 block">Email 📧</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2 rounded-md bg-white/20 border border-white/30 focus:ring-2 focus:ring-indigo-400 placeholder:text-gray-200 w-full"
                placeholder="you@example.com"
              />
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition w-full sm:w-auto"
                >
                  Send
                </button>
              ) : (
                <span className="text-green-400 font-medium mt-2 sm:mt-1">✅ Sent</span>
              )}
            </div>
          </div>

          {/* OTP Section */}
          {otpSent && !otpVerified && (
            <>
              <label className="text-sm mb-1 block">Enter OTP 🔐</label>
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    ref={(el) => (inputsRef.current[index] = el)}
                    className="w-10 h-12 text-center text-lg bg-white/20 border border-white/30 rounded focus:ring-2 focus:ring-indigo-400"
                  />
                ))}
              </div>
              <div className="text-sm mt-1 text-indigo-100">
                Didn’t receive?{" "}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={timer > 0}
                  className="text-yellow-300 font-semibold hover:underline disabled:opacity-40"
                >
                  Resend OTP {timer > 0 && `(${timer}s)`}
                </button>
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md mt-3"
              >
                Verify OTP
              </button>
            </>
          )}

          {/* Password Fields */}
          {otpVerified && (
            <>
              <div>
                <label className="text-sm mb-1 block">Password 🔒</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-white/20 border border-white/30 focus:ring-2 focus:ring-indigo-400"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-sm mb-1 block">Confirm Password 🔁</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-white/20 border border-white/30 focus:ring-2 focus:ring-indigo-400"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md"
              >
                Sign Up
              </button>
            </>
          )}
        </form>

        {/* Divider */}
        <div className="flex items-center gap-2 my-6">
          <div className="flex-1 border-t border-white/20" />
          <span className="text-white/70 text-sm">or</span>
          <div className="flex-1 border-t border-white/20" />
        </div>

        {/* Google Signup */}
        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-2 rounded-md shadow hover:shadow-md transition"
        >
          <FcGoogle className="text-2xl" />
          <span className="font-medium">Sign Up with Google</span>
        </button>

        {/* Already have account */}
        <p className="text-center text-sm text-indigo-100 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-yellow-300 font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </div>

      {/* Toast */}
      <Toast message={toastMessage} show={showToast} />
    </div>
  );
}
