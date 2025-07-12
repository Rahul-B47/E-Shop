import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Toast from "../components/Toast";
import { FcGoogle } from "react-icons/fc";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

export default function Login() {
  const { user, emailLogin, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("success");

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const showToastMessage = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await emailLogin(email, password);
      showToastMessage("✅ Login successful! Redirecting...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      let message = "";
      switch (err.code) {
        case "auth/user-not-found":
          message = "This email is not registered. Please create an account.";
          break;
        case "auth/wrong-password":
          message = "Incorrect password. Try again or reset your password.";
          break;
        case "auth/invalid-email":
          message = "Invalid email format. Please check and try again.";
          break;
        case "auth/too-many-requests":
          message = "Too many failed attempts. Try again later or reset password.";
          break;
        case "auth/network-request-failed":
          message = "Network error. Check your internet and try again.";
          break;
        default:
          message = "Login failed. Please check your credentials.";
      }
      showToastMessage("❌ " + message, "error");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      showToastMessage("✅ Signed in with Google.");
      setTimeout(() => navigate("/"), 2000);
    } catch {
      showToastMessage("❌ Google sign-in failed. Please try again.", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#CADCFC] via-[#7BAAF7] to-[#00246B]">
      <div className="w-full max-w-md bg-white text-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 border border-blue-100 transition-all duration-300 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#00246B]">
          Login to E-Shop
        </h1>

        <form onSubmit={handleEmailLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#00246B] mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 bg-gray-100 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-[#00246B] mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-gray-100 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-xl text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>

          <div className="text-right text-sm">
            <Link
              to="/forgot-password"
              className="text-[#00246B] hover:underline font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-[#00246B] hover:bg-[#001a55] transition text-white py-2 rounded-md shadow hover:shadow-lg font-semibold"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-blue-200" />
          <span className="px-3 text-gray-500 text-sm">or</span>
          <div className="flex-grow border-t border-blue-200" />
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-2 rounded-md shadow-md hover:shadow-lg transition font-medium border border-gray-300"
        >
          <FcGoogle className="text-2xl" />
          Sign in with Google
        </button>

        {/* Signup Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-[#00246B] font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* ✅ Toast */}
      <Toast message={toastMessage} show={showToast} type={toastType} />
    </div>
  );
}
