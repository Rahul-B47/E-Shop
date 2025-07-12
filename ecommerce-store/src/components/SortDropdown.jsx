import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "../components/ProductCard";
import { FiShoppingBag, FiFilter, FiGrid } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProducts(items);
      } catch (err) {
        console.error("❌ Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div
      className={`min-h-screen py-12 px-4 transition-all duration-300 ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white"
          : "bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 text-gray-800"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <FiShoppingBag className="text-indigo-500" />
            Shop
          </h1>

          {/* Placeholder for Filters */}
          <div className="flex items-center gap-4">
            <button className="text-sm flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded shadow hover:shadow-md">
              <FiFilter />
              Filters
            </button>
            <button className="text-sm flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded shadow hover:shadow-md">
              <FiGrid />
              Grid View
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <p className="text-center text-indigo-600 dark:text-indigo-400 text-lg animate-pulse">
            Loading products...
          </p>
        ) : products.length === 0 ? (
          <p className="text-center text-red-500 text-lg">No products available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
