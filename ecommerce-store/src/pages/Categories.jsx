import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";
import { MdOutlineCategory } from "react-icons/md";

// 🧠 Category list with icons
const categories = [
  { name: "Electronics", emoji: "💻" },
  { name: "Fashion", emoji: "👗" },
  { name: "Home", emoji: "🏠" },
  { name: "Books", emoji: "📚" },
  { name: "Accessories", emoji: "🎒" },
  { name: "Beauty", emoji: "💄" },
  { name: "Toys", emoji: "🧸" },
  { name: "Fitness", emoji: "🏋️‍♂️" },
  { name: "Groceries", emoji: "🛒" },
  { name: "Mobiles", emoji: "📱" },
  { name: "Gaming", emoji: "🎮" },
  { name: "Footwear", emoji: "👟" },
];

export default function Categories() {
  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-black via-gray-900 to-slate-900 text-white">
      {/* 🔙 Back Button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition hover:scale-105"
        >
          <FiArrowLeft />
          Back to Home
        </Link>
      </div>

      {/* 🔤 Heading */}
      <div className="flex items-center gap-3 mb-4">
        <MdOutlineCategory className="text-3xl text-indigo-400 animate-bounce" />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-400 tracking-wide">
          Browse Categories
        </h1>
      </div>

      {/* ✨ Subheading */}
      <p className="mb-10 text-gray-300 text-sm sm:text-base max-w-3xl">
        Explore curated collections by category – discover trending items, top deals, and essentials tailored just for you.
      </p>

      {/* 🧱 Responsive Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={`/category/${cat.name}`}
            className="bg-slate-800 border border-slate-700 hover:border-indigo-500 hover:bg-indigo-700 text-white rounded-xl p-5 sm:p-6 transition-all duration-300 flex justify-between items-center shadow-md hover:shadow-xl group"
          >
            <span className="text-base sm:text-lg font-semibold flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300">
              <span className="text-xl sm:text-2xl">{cat.emoji}</span>
              {cat.name}
            </span>
            <FiArrowRight className="text-indigo-300 text-lg sm:text-xl transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}
