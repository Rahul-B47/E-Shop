import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  FaShippingFast,
  FaUser,
  FaMapMarkedAlt,
  FaPhoneAlt,
  FaRupeeSign,
} from "react-icons/fa";
import { FiShoppingCart, FiArrowLeft } from "react-icons/fi";
import { MdOutlinePayment } from "react-icons/md";
import { SiGooglepay } from "react-icons/si";

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.displayName || "");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => {
    const price = item.salePrice || item.price || 0;
    return sum + price * item.qty;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !address || !phone || (paymentMethod === "UPI" && !upiId)) {
      alert("❗ Please fill out all required fields.");
      return;
    }

    setLoading(true);
    try {
      const userOrderRef = collection(db, "users", user.uid, "orders");

      await addDoc(userOrderRef, {
        name,
        address,
        phone,
        items: cart,
        total,
        paymentMethod,
        upiId: paymentMethod === "UPI" ? upiId : null,
        createdAt: Timestamp.now(),
      });

      localStorage.setItem("orderUser", name);
      localStorage.setItem("orderTotal", total.toString());

      clearCart();
      navigate("/order-success");
    } catch (err) {
      console.error("❌ Order error:", err.message);
      alert("Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-10 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-700 hover:scale-105 transition"
        >
          <FiArrowLeft className="text-base" />
          <span>Back to Previous</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-xl rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">

          {/* 🚚 Shipping Form */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
              <FaShippingFast className="text-indigo-500" />
              Shipping Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute top-3 left-3 text-gray-500 dark:text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                <div className="relative">
                  <FaMapMarkedAlt className="absolute top-3 left-3 text-gray-500 dark:text-gray-400" />
                  <textarea
                    rows="3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition"
                    placeholder="Street, City, State - ZIP"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <div className="relative">
                  <FaPhoneAlt className="absolute top-3 left-3 text-gray-500 dark:text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="accent-indigo-600"
                    />
                    <MdOutlinePayment className="text-lg text-green-500" />
                    Cash on Delivery
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="UPI"
                      checked={paymentMethod === "UPI"}
                      onChange={() => setPaymentMethod("UPI")}
                      className="accent-indigo-600"
                    />
                    <SiGooglepay className="text-lg text-pink-500" />
                    UPI
                  </label>
                </div>
              </div>

              {/* UPI Field */}
              {paymentMethod === "UPI" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition"
                    placeholder="yourname@upi"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded shadow-md hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </form>
          </div>

          {/* 🧾 Order Summary */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
              <FiShoppingCart className="text-green-500" />
              Order Summary
            </h2>

            {cart.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">Your cart is empty.</p>
            ) : (
              <ul className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center border-b pb-2 dark:border-gray-600"
                  >
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.qty} × ₹{item.salePrice || item.price}
                      </p>
                    </div>
                    <p className="text-right font-semibold text-gray-700 dark:text-gray-200">
                      ₹{(item.qty * (item.salePrice || item.price)).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 pt-4 border-t dark:border-gray-600">
              <div className="flex justify-between text-lg font-semibold text-gray-800 dark:text-white">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex items-center mt-4 text-gray-500 dark:text-gray-400 text-sm gap-2">
                <FaRupeeSign className="text-lg text-yellow-400" />
                Payment: {paymentMethod === "COD" ? "Cash on Delivery" : "UPI"}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
