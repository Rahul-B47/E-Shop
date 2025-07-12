import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import CategoryFilter from "../components/CategoryFilter";
import ProductList from "../components/ProductList";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import { db } from "../firebase";
import { useCart } from "../context/CartContext";
import { FaBoxOpen } from "react-icons/fa";
import { FiShoppingBag } from "react-icons/fi";
import { MdOutlineCategory } from "react-icons/md";
import Chatbot from "../components/Chatbot";

export default function Home() {
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState("/default-avatar.png");
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const productList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("❌ Failed to load products. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchUserPhoto = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setProfileImage(data.photo || "/default-avatar.png");
        }
      } catch (err) {
        console.error("❌ Failed to fetch profile photo:", err);
      }
    };

    fetchUserPhoto();
  }, [user]);

  useEffect(() => {
    const result = products.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(search.toLowerCase());
      const categoryMatch = category === "All" || product.category === category;
      return nameMatch && categoryMatch;
    });
    setFiltered(result);
  }, [search, category, products]);

  const handleAddToCart = (product) => {
    addToCart(product);
    setToastMessage(`✅ "${product.name}" added to cart`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const confirmAdd = (product) => {
    addToCart(product);
    setToastMessage(`✅ "${product.name}" added to cart`);
    setShowToast(true);
    setShowModal(false);
    setTimeout(() => setShowToast(false), 3000);
  };

  const cancelAdd = () => {
    setSelectedProduct(null);
    setShowModal(false);
  };

  const rawCategories = products.map((p) => p.category?.trim());
  const uniqueCategories = Array.from(
    new Set(rawCategories.filter((cat) => cat && cat !== "All"))
  );
  const categories = ["All", ...uniqueCategories];

  return (
    <>
      <Header />

      {/* 🎯 Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 sm:py-16 text-center shadow-md transition-all duration-300 px-4 sm:px-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 flex justify-center items-center gap-3 flex-wrap">
          <FiShoppingBag className="inline-block animate-bounce" />
          <span className="tracking-wide">E-Shop</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/90 font-light max-w-xl mx-auto">
          Shop smart. Shop fast. Shop with confidence.
        </p>
      </section>

      {/* 📦 Main Content */}
      <main className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-12">
          {/* 🔍 Filters */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex justify-center items-center gap-2 flex-wrap">
              <MdOutlineCategory className="text-indigo-600 dark:text-indigo-400" />
              Browse Our Collection
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
              Filter products or use the search to explore amazing deals.
            </p>
          </div>

          <div className="bg-white dark:bg-white/5 border dark:border-white/10 shadow rounded-xl p-4 sm:p-6 mb-10">
            <SearchBar search={search} setSearch={setSearch} />
            <CategoryFilter
              categories={categories}
              selected={category}
              setSelected={setCategory}
            />
          </div>

          {/* 🔄 State Display */}
          {loading ? (
            <div className="text-center text-indigo-600 dark:text-indigo-400 mt-10 animate-pulse flex flex-col items-center gap-2">
              <FaBoxOpen className="text-3xl" />
              <span className="text-base">Loading products...</span>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 mt-10">{error}</div>
          ) : (
            <ProductList products={filtered} onAddToCart={handleAddToCart} />
          )}
        </div>
      </main>

      {/* 💬 Toast + Modal */}
      <Toast message={toastMessage} show={showToast} />
      <ConfirmModal
        show={showModal}
        product={selectedProduct}
        onConfirm={confirmAdd}
        onCancel={cancelAdd}
      />

      {/* ✅ Floating Chatbot */}
      <Chatbot />
    </>
  );
}
