import React from "react";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";

export default function ProductCard({ product, onRequestAdd }) {
  const navigate = useNavigate();

  const price = product.salePrice || product.price;
  const originalPrice = product.originalPrice;

  const discountPercentage =
    product.salePrice && originalPrice
      ? Math.round(((originalPrice - product.salePrice) / originalPrice) * 100)
      : null;

  return (
    <div className="group relative w-full h-full overflow-hidden rounded-xl transition-all duration-300">
      {/* ✨ Glowing Animated Border */}
      <div className="absolute inset-0 z-0 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur-lg group-hover:opacity-80 transition-opacity duration-700"></div>

      <div className="relative z-10 bg-slate-800 text-white border border-slate-700 rounded-xl shadow-lg flex flex-col overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
        {/* 🖼️ Image */}
        <div
          className="aspect-square w-full overflow-hidden"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          <img
            src={product.image || "/assets/default.jpg"}
            alt={product.name || "Product"}
            className="w-full h-full object-cover hover:brightness-110 transition duration-300"
          />
        </div>

        {/* 📄 Details */}
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <h3
              onClick={() => navigate(`/product/${product.id}`)}
              className="text-base font-semibold text-blue-400 mb-1 group-hover:underline truncate"
            >
              {product.name}
            </h3>
            <p className="text-xs text-slate-400">{product.category}</p>
          </div>

          {/* 💰 Price & Discount */}
          {price ? (
            <div className="mt-2 flex items-center flex-wrap gap-2">
              <span className="text-green-400 font-bold text-sm">
                ₹{price}
              </span>
              {originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{originalPrice}
                </span>
              )}
              {discountPercentage && (
                <span className="text-xs text-red-400 font-medium">
                  {discountPercentage}% OFF
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-red-400 mt-2">Price not available</p>
          )}
        </div>

        {/* 🛒 Add to Cart Icon Button */}
        {price && (
          <button
            onClick={() => onRequestAdd(product)}
            className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md transition"
            title="Add to Cart"
          >
            <FiShoppingCart className="text-base" />
          </button>
        )}
      </div>
    </div>
  );
}
