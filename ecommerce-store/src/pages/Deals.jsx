import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Header from "../components/Header";
import { FiShoppingCart, FiArrowLeft } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import { useNavigate, Link } from "react-router-dom";

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const allProducts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const onlyDeals = allProducts.filter((item) => item.deal === true);
        setDeals(onlyDeals);
      } catch (error) {
        console.error("❌ Failed to load deals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const confirmAdd = () => {
    if (selectedProduct) {
      addToCart(selectedProduct);
      setToastMessage(`🛒 "${selectedProduct.name}" added to cart`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
    setShowModal(false);
  };

  return (
    <>
      <Header />

      {/* 🔥 Hero Section */}
      <section className="bg-gradient-to-r from-[#FF512F] via-[#DD2476] to-[#1E3C72] text-white py-14 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 animate-bounce">
          ⚡ Hot Deals Just for You!
        </h1>
        <p className="text-lg sm:text-xl text-pink-100">
          Save more, shop smarter — grab your favorite items now before they’re gone!
        </p>
      </section>

      {/* 🛍 Deals Section */}
      <main className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        {/* 🔙 Back Link */}
        <div className="mb-6">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition hover:scale-105"
          >
            <FiArrowLeft />
            Back to Shop
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-indigo-300 text-lg animate-pulse">
            🔄 Loading the hottest deals...
          </p>
        ) : deals.length === 0 ? (
          <p className="text-center text-gray-400 text-lg">
            ❌ No deals available at the moment. Check back soon!
          </p>
        ) : (
          <>
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-indigo-500 text-center">
              🤑 Today's Top Offers
            </h2>

            {/* ✅ Grid - 2 Items Min on Mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {deals.map((product) => {
                const hasDiscount =
                  !!product.salePrice && product.salePrice < product.price;
                const discountPercent = hasDiscount
                  ? Math.round(100 - (product.salePrice / product.price) * 100)
                  : 0;

                return (
                  <div
                    key={product.id}
                    className="relative bg-gradient-to-tr from-[#1E293B] via-[#0F172A] to-[#1E293B] text-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                  >
                    {/* 🖼️ Image */}
                    <div
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="cursor-pointer"
                    >
                      <img
                        src={product.image || "/assets/default.jpg"}
                        alt={product.name}
                        className="w-full h-40 sm:h-44 object-cover rounded-t-xl"
                      />
                    </div>

                    {/* 📦 Product Info */}
                    <div className="p-4 flex flex-col justify-between h-[12rem]">
                      <h3
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="font-semibold text-base sm:text-lg mb-1 hover:text-yellow-400 cursor-pointer transition line-clamp-1"
                      >
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-yellow-400 font-bold text-lg">
                          ₹{product.salePrice || product.price}
                        </span>
                        {hasDiscount && (
                          <>
                            <span className="line-through text-gray-400 text-sm">
                              ₹{product.price}
                            </span>
                            <span className="text-green-500 font-medium text-xs">
                              {discountPercent}% OFF
                            </span>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className="mt-auto w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-semibold flex items-center justify-center gap-2 transition"
                      >
                        <FiShoppingCart />
                        Add to Cart
                      </button>
                    </div>

                    {/* 🔴 Deal Badge */}
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs rounded-full font-bold shadow">
                        DEAL
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* ✅ Modals */}
      <ConfirmModal
        show={showModal}
        product={selectedProduct}
        onConfirm={confirmAdd}
        onCancel={() => setShowModal(false)}
      />
      <Toast show={showToast} message={toastMessage} />
    </>
  );
}
