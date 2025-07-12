import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "../components/ProductCard";
import { FiArrowLeft, FiShoppingCart } from "react-icons/fi";
import { MdOutlineCategory } from "react-icons/md";

export default function CategoryProducts() {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryItems = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const allProducts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const filtered = allProducts.filter(
          (p) => p.category?.toLowerCase() === categoryName.toLowerCase()
        );
        setProducts(filtered);
      } catch (err) {
        console.error("❌ Error fetching category items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryItems();
  }, [categoryName]);

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0b1120] text-white">
      <div className="max-w-7xl mx-auto">
        {/* 🔙 Navigation Controls */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 px-4 py-2 rounded border border-blue-600 text-blue-400 hover:text-white hover:bg-blue-700 transition text-sm"
          >
            <FiArrowLeft /> Back to Categories
          </Link>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-4 py-2 rounded border border-green-500 text-green-400 hover:text-white hover:bg-green-600 transition text-sm"
          >
            <FiShoppingCart /> Continue Shopping
          </Link>
        </div>

        {/* 🏷️ Category Heading */}
        <div className="mb-8 flex items-center gap-3">
          <MdOutlineCategory className="text-3xl text-indigo-400" />
          <h1 className="text-3xl font-bold text-indigo-400 capitalize">
            {categoryName} Products
          </h1>
          <span className="text-sm text-gray-300 ml-2">
            ({products.length} item{products.length !== 1 && "s"})
          </span>
        </div>

        {/* 🛍️ Product Listing */}
        {loading ? (
          <p className="text-center text-indigo-300 animate-pulse text-lg">
            Loading products...
          </p>
        ) : products.length === 0 ? (
          <p className="text-center text-red-400 text-lg">
            No products found in <strong>{categoryName}</strong>.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="aspect-[1/1]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
