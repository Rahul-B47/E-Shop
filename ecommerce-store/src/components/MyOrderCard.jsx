// src/pages/MyOrders.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import MyOrderCard from "../components/MyOrderCard";
import { FiShoppingBag, FiArrowLeft, FiCalendar } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const ordersRef = collection(db, "users", user.uid, "orders");
      let q = query(ordersRef, orderBy("createdAt", "desc"));

      if (filterDate) {
        const start = new Date(`${filterDate}T00:00:00`);
        const end = new Date(`${filterDate}T23:59:59`);
        q = query(
          ordersRef,
          where("createdAt", ">=", start),
          where("createdAt", "<=", end),
          orderBy("createdAt", "desc")
        );
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user, filterDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-800 via-blue-900 to-black py-12 px-4 text-white transition-all duration-300">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-10 text-gray-800 dark:text-white space-y-6">
        {/* 🔝 Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FiShoppingBag className="text-indigo-500" />
            My Orders
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/cart"
              className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <FiArrowLeft />
              Back to Cart
            </Link>
            <Link
              to="/"
              className="bg-indigo-600 text-white px-4 py-1.5 rounded hover:bg-indigo-700 text-sm transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* 📅 Date Filter */}
        <div className="flex items-center gap-3 text-sm mt-1">
          <label htmlFor="date" className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <FiCalendar />
            Filter by date:
          </label>
          <input
            type="date"
            id="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white px-3 py-1 rounded-md"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate("")}
              className="text-sm text-red-500 hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* 🧾 Order List */}
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-4">Loading your orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-4">No orders found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {orders.map((order) => (
              <MyOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
