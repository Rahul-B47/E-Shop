import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = new URLSearchParams(location.search).get("email");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const handleReset = async (e) => {
    e.preventDefault();

    if (!password || password !== confirm) {
      setToastMessage("❗ Passwords don't match");
      setShowToast(true);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setToastMessage(data.message || "✅ Password reset!");

      if (data.success) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setToastMessage("❌ Something went wrong");
    } finally {
      setShowToast(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-[#CADCFC] via-[#7BAAF7] to-[#00246B]">
      <div className="w-full max-w-md bg-white/10 border border-white/30 text-white backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white drop-shadow-md">
          Reset Your Password
        </h2>

        <form onSubmit={handleReset} className="space-y-5">
          <input
            type="password"
            placeholder="New Password"
            required
            className="w-full px-4 py-3 bg-white/20 border border-white/30 text-white placeholder-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            required
            className="w-full px-4 py-3 bg-white/20 border border-white/30 text-white placeholder-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold rounded-md shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="text-xs sm:text-sm text-gray-200 text-center italic break-words">
          Resetting for: {email}
        </p>
      </div>

      <Toast show={showToast} message={toastMessage} />
    </div>
  );
}
