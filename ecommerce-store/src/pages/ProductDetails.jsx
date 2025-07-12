import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import { useCart } from "../context/CartContext";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { MdCategory, MdArrowBack } from "react-icons/md";
import { FiShoppingCart } from "react-icons/fi";
import { BsCurrencyRupee } from "react-icons/bs";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleRequestAdd = () => {
    setShowModal(true);
  };

  const confirmAdd = () => {
    addToCart(product);
    setToastMessage(`✅ "${product.name}" added to cart`);
    setShowToast(true);
    setShowModal(false);
    setTimeout(() => setShowToast(false), 3000);
  };

  const cancelAdd = () => {
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-indigo-600 animate-pulse text-xl">
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-10 text-center text-xl text-red-600">
        {error || "Product not found"}
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-10 transition-all">

            {/* 🖼️ Product Image */}
            <div className="w-full aspect-square overflow-hidden rounded-2xl shadow-xl">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 hover:brightness-110 transition-transform duration-300 rounded-2xl"
              />
            </div>

            {/* 📄 Product Info */}
            <div className="flex flex-col justify-between h-full">
              <div className="space-y-5">
                <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                  {product.name}
                </h1>

                <p className="flex items-center text-indigo-300 gap-2 text-base sm:text-lg">
                  <MdCategory className="text-xl" />
                  <span className="font-medium">Category:</span>
                  <span>{product.category}</span>
                </p>

                {/* 💰 Price Display */}
                <p className="text-2xl sm:text-3xl font-semibold text-green-400 flex items-center gap-3">
                  {product.salePrice ? (
                    <>
                      <span className="line-through text-red-400 flex items-center gap-1">
                        <BsCurrencyRupee /> {product.originalPrice}
                      </span>
                      <span className="flex items-center gap-1">
                        <BsCurrencyRupee /> {product.salePrice}
                      </span>
                    </>
                  ) : (
                    <>
                      <BsCurrencyRupee />
                      {product.price}
                    </>
                  )}
                </p>

                {/* 📝 Description */}
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {product.description || "No description provided."}
                </p>
              </div>

              {/* 🛒 Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleRequestAdd}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  <FiShoppingCart className="text-lg" />
                  Add to Cart
                </button>

                <Link
                  to="/"
                  className="w-full sm:w-auto text-indigo-300 hover:text-indigo-100 transition flex items-center justify-center gap-2 text-sm"
                >
                  <MdArrowBack />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ✅ Toast & Modal */}
      <Toast message={toastMessage} show={showToast} />
      <ConfirmModal
        show={showModal}
        product={product}
        onConfirm={confirmAdd}
        onCancel={cancelAdd}
      />
    </>
  );
}
