import React from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiTrash2 } from "react-icons/fi";
import { MdOutlinePayment } from "react-icons/md";

export default function Cart() {
  const {
    cart,
    cartLoading,
    removeFromCart,
    clearCart,
    increaseQty,
    decreaseQty,
  } = useCart();
  const { user, loading: authLoading } = useAuth();

  if (authLoading || cartLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center text-indigo-400 text-lg">
          🛒 Loading your cart...
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center text-gray-300 text-lg">
          Please log in to view your cart.
        </div>
      </>
    );
  }

  const getTotalPrice = () =>
    cart
      .reduce((total, item) => {
        const price = item.salePrice || item.price || 0;
        return total + price * item.qty;
      }, 0)
      .toFixed(2);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0B1120] text-white px-4 py-10 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold">🛒 Your Cart</h1>
            <Link
              to="/"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
            >
              <FiArrowLeft /> Continue Shopping
            </Link>
          </div>

          {cart.length === 0 ? (
            <p className="text-gray-400 text-center text-lg">Your cart is empty.</p>
          ) : (
            <>
              {/* 🧾 Cart Items */}
              <div className="space-y-6">
                {cart.map((item) => {
                  const price = item.salePrice || item.price || 0;
                  const itemTotal = (price * item.qty).toFixed(2);

                  return (
                    <div
                      key={item.id}
                      className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6 shadow-lg transition"
                    >
                      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                        {/* Left: Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full sm:w-28 h-28 object-cover rounded-md border border-slate-600"
                          />
                        </div>

                        {/* Middle: Details */}
                        <div className="flex-1">
                          <h2 className="text-lg sm:text-xl font-semibold text-white">
                            {item.name}
                          </h2>
                          <p className="text-sm text-gray-400">{item.category}</p>
                          <p className="text-green-400 mt-2 font-semibold text-sm">
                            ₹{itemTotal}
                            <span className="text-sm text-gray-400 ml-2">
                              ({item.qty} × ₹{price})
                            </span>
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center mt-3 gap-2">
                            <button
                              onClick={() => decreaseQty(item.id)}
                              className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded"
                            >
                              −
                            </button>
                            <span className="px-2 text-lg">{item.qty}</span>
                            <button
                              onClick={() => increaseQty(item.id)}
                              className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Right: Remove */}
                        <div className="flex justify-between items-start md:items-center md:flex-col gap-2 mt-4 md:mt-0">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm"
                          >
                            <FiTrash2 /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 💳 Summary */}
              <div className="mt-12 bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-2 text-base sm:text-lg text-gray-300">
                  <p>Subtotal: ₹{getTotalPrice()}</p>
                  <p>
                    Shipping: <span className="text-green-500">FREE</span>
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-white">
                    Total: ₹{getTotalPrice()}
                  </p>
                </div>

                {/* 🔘 Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <Link to="/checkout" className="flex-1">
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition flex justify-center items-center gap-2">
                      <MdOutlinePayment /> Proceed to Checkout
                    </button>
                  </Link>
                  <button
                    onClick={clearCart}
                    className="flex-1 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-semibold transition"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
