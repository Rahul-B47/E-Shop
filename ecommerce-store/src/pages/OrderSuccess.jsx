import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaHome, FaRupeeSign } from "react-icons/fa";

export default function OrderSuccess() {
  const [name, setName] = useState("");
  const [total, setTotal] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("orderUser");
    const storedTotal = localStorage.getItem("orderTotal");

    if (storedName && storedTotal) {
      setName(storedName);
      setTotal(storedTotal);
    } else {
      setName("Customer");
      setTotal("0.00");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4 py-10">
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-xl text-center w-full max-w-lg px-6 sm:px-10 py-8 sm:py-10 animate-fade-in">
        <FaCheckCircle className="text-green-500 text-5xl sm:text-6xl mx-auto mb-4" />

        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Thank You, {name}!
        </h2>

        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
          Your order has been placed successfully.
        </p>

        <div className="mt-6 text-base sm:text-lg text-gray-800 dark:text-white flex justify-center items-center gap-2 font-medium">
          <FaRupeeSign className="text-yellow-400" />
          {parseFloat(total).toFixed(2)}
        </div>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-md shadow-md transition text-sm sm:text-base"
        >
          <FaHome />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
