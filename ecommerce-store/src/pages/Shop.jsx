// src/pages/Shop.jsx
import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import ProductCard from "../components/ProductCard";
import { FiShoppingBag, FiArrowLeft, FiList, FiGrid } from "react-icons/fi";

export default function Shop() {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [view, setView] = useState("grid");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const productList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProducts(productList);
      } catch (err) {
        console.error("❌ Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((product) =>
    filter === "All" ? true : product.category === filter
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sort) {
      case "priceLowHigh":
        return (a.salePrice || a.price) - (b.salePrice || b.price);
      case "priceHighLow":
        return (b.salePrice || b.price) - (a.salePrice || a.price);
      default:
        return 0;
    }
  });

  const requestAddToCart = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const confirmAdd = () => {
    if (selectedProduct) {
      addToCart(selectedProduct);
      setToastMessage(`"${selectedProduct.name}" added to cart!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setShowModal(false);
    }
  };

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "priceLowHigh", label: "Price: Low to High" },
    { value: "priceHighLow", label: "Price: High to Low" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0B1120] text-white px-4 py-10 sm:px-6 lg:px-8 transition-all duration-300">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-4 sm:mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition">
            <FiArrowLeft /> Back to Home
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-2 text-indigo-400">
            <FiShoppingBag /> Shop
          </h1>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded bg-slate-800 text-white border border-slate-600 text-sm"
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded bg-slate-800 text-white border border-slate-600 text-sm"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setView("grid")}
                className={`flex items-center gap-1 px-3 py-2 rounded text-sm border ${
                  view === "grid"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-slate-800 border-slate-600 text-white"
                }`}
              >
                <FiGrid /> Grid
              </button>
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-1 px-3 py-2 rounded text-sm border ${
                  view === "list"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-slate-800 border-slate-600 text-white"
                }`}
              >
                <FiList /> List
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-blue-300 text-lg animate-pulse">Loading products...</p>
        ) : sortedProducts.length === 0 ? (
          <p className="text-center text-red-500 text-lg">No products available.</p>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onRequestAdd={requestAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col sm:flex-row gap-4 border border-slate-700 rounded-xl p-4 bg-slate-800 shadow-md hover:shadow-lg transition"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full sm:w-32 h-48 sm:h-32 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3
                    className="text-xl font-semibold text-blue-400 cursor-pointer hover:underline"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-sm text-slate-400">{product.category}</p>
                  <p className="mt-1 text-lg font-bold text-green-400">
                    ₹{product.salePrice || product.price}
                  </p>
                  <p className="text-sm mt-2 text-slate-300 line-clamp-2">
                    {product.description}
                  </p>
                  <button
                    onClick={() => requestAddToCart(product)}
                    className="mt-3 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm transition"
                  >
                    <FiShoppingBag /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        show={showModal}
        product={selectedProduct}
        onConfirm={confirmAdd}
        onCancel={() => setShowModal(false)}
      />

      <Toast show={showToast} message={toastMessage} />
    </div>
  );
}