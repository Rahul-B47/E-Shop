// src/components/ProductList.jsx
import { Link } from "react-router-dom";
import { MdOutlineLocalOffer, MdCategory } from "react-icons/md";
import { BsCurrencyRupee } from "react-icons/bs";
import { FiShoppingCart } from "react-icons/fi";

export default function ProductList({ products, onAddToCart }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 px-4 sm:px-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:shadow-xl transition-transform duration-300 hover:scale-[1.03] group relative flex flex-col"
          style={{ minHeight: "360px", maxHeight: "400px" }}
        >
          {/* 🔴 Sale Badge */}
          {product.isOnSale && (
            <span className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white text-[10px] sm:text-xs font-semibold px-2 py-1 rounded shadow z-10">
              <MdOutlineLocalOffer className="text-sm" />
              SALE
            </span>
          )}

          {/* 📸 Product Image */}
          <Link to={`/product/${product.id}`}>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[160px] object-cover rounded-t-xl transition duration-300 group-hover:opacity-90"
            />
          </Link>

          {/* 📦 Product Info */}
          <div className="p-3 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white truncate">
                {product.name}
              </h3>

              {/* 🏷️ Category */}
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                <MdCategory className="text-gray-400 text-sm" />
                {product.category}
              </p>

              {/* 💰 Prices */}
              <div className="mt-2">
                {product.isOnSale ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                      <BsCurrencyRupee />
                      {product.salePrice}
                    </span>
                    <span className="text-xs text-gray-500 line-through flex items-center gap-1">
                      <BsCurrencyRupee />
                      {product.originalPrice}
                    </span>
                  </div>
                ) : (
                  <span className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-1">
                    <BsCurrencyRupee />
                    {product.price}
                  </span>
                )}
              </div>
            </div>

            {/* 🛒 Add to Cart Button */}
            <button
              onClick={() => onAddToCart(product)}
              className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-md text-sm font-medium transition duration-300 flex justify-center items-center gap-2"
            >
              <FiShoppingCart />
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
