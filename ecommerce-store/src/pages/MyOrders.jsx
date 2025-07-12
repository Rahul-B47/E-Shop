import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { useCart } from "../context/CartContext";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import {
  FiShoppingBag,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiPhone,
  FiCreditCard,
  FiArrowLeft,
  FiRepeat,
} from "react-icons/fi";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";

export default function MyOrders() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

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
      console.error("❌ Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user, filterDate]);

  const handleReorder = (items) => {
    setSelectedItems(items);
    setShowModal(true);
  };

  const confirmReorder = () => {
    selectedItems.forEach((item) => {
      addToCart({ ...item, qty: item.qty });
    });
    setShowModal(false);
    setToastMessage("🛒 Items reordered and added to your cart!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-indigo-800 to-blue-900 py-10 px-4 sm:px-6 lg:px-8 text-white transition-all duration-300">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow-xl rounded-xl p-6 sm:p-8 space-y-8">

        {/* 🔝 Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <FiShoppingBag className="text-xl" />
            My Orders
          </h1>

          <div className="flex gap-3 text-sm">
            <Link
              to="/cart"
              className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <FiArrowLeft />
              Back to Cart
            </Link>
            <Link
              to="/"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md transition flex items-center gap-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* 📅 Filter by Date */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label htmlFor="date" className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <FiCalendar />
            Filter by date:
          </label>
          <input
            type="date"
            id="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate("")}
              className="text-red-500 hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* 📦 Orders */}
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800 transition-all"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <FiCalendar />
                    {order.createdAt?.toDate().toLocaleString()}
                  </div>
                  <div className="text-green-500 font-semibold">
                    ₹{order.total.toFixed(2)}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="text-sm space-y-1 text-gray-700 dark:text-gray-300 mb-4">
                  <div className="flex items-center gap-2"><FiUser /> {order.name}</div>
                  <div className="flex items-center gap-2"><FiPhone /> {order.phone}</div>
                  <div className="flex items-center gap-2"><FiMapPin /> {order.address}</div>
                  <div className="flex items-center gap-2">
                    <FiCreditCard />
                    {order.paymentMethod === "UPI"
                      ? `UPI - ${order.upiId}`
                      : "Cash on Delivery"}
                  </div>
                </div>

                {/* Items */}
                <ul className="text-sm divide-y divide-gray-300 dark:divide-gray-600">
                  {order.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex justify-between py-2 text-gray-800 dark:text-white"
                    >
                      <span>{item.name} × {item.qty}</span>
                      <span>₹{(item.qty * (item.salePrice || item.price)).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>

                {/* Reorder */}
                <button
                  onClick={() => handleReorder(order.items)}
                  className="mt-4 flex items-center gap-2 text-indigo-600 hover:underline text-sm"
                >
                  <FiRepeat />
                  Reorder
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔁 Modal + ✅ Toast */}
      <ConfirmModal
        show={showModal}
        message="Would you like to reorder these items and add them back to your cart?"
        onCancel={() => setShowModal(false)}
        onConfirm={confirmReorder}
      />

      {showToast && <Toast message={toastMessage} show={showToast} />}
    </div>
  );
}
