import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FiTrash2, FiArrowLeft, FiEdit3 } from "react-icons/fi";
import clsx from "clsx";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

export default function DeleteProduct() {
  const [products, setProducts] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const adminEmail = "rahulrakeshpoojary0@gmail.com";

  // 🔐 Admin Access Check
  useEffect(() => {
    if (!user || user.email !== adminEmail) {
      alert("Access denied ❌ - Admins only.");
      navigate("/");
    }
  }, [user, navigate]);

  // 📦 Fetch All Products
  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    const productList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(productList);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ⚠️ Confirm Delete Handler
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setModalVisible(true);
  };

  // 🗑️ Perform Final Deletion
  const performDelete = async () => {
    if (!productToDelete) return;

    const { id } = productToDelete;

    try {
      setDeletingId(id);
      await new Promise((r) => setTimeout(r, 300));
      await deleteDoc(doc(db, "products", id));
      setProducts((prev) => prev.filter((p) => p.id !== id));

      setToastMessage("🗑️ Product deleted successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("❌ Error deleting product:", err);
      alert("Something went wrong");
    } finally {
      setModalVisible(false);
      setDeletingId(null);
      setProductToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-6 py-10">
      {/* 🔙 Back to Home */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline hover:scale-105 transition"
        >
          <FiArrowLeft /> Back to Home
        </Link>
      </div>

      {/* 🔧 Page Title */}
      <h1 className="text-3xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">
        Admin: Manage Products
      </h1>

      {/* 📦 Product Grid */}
      {products.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className={clsx(
                "bg-white dark:bg-gray-800 p-4 rounded shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300",
                deletingId === product.id && "opacity-0 scale-90"
              )}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-cover rounded mb-3"
              />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {product.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
              <p className="text-indigo-600 font-bold mt-2 dark:text-indigo-400">
                ₹{product.price}
              </p>

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => confirmDelete(product)}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition"
                >
                  <FiTrash2 />
                  Delete Product
                </button>

               <Link
  to={`/edit-product/${product.id}`}
  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white py-2 rounded shadow hover:shadow-lg transform hover:scale-[1.03] transition-all"
>
  <FiEdit3 className="text-lg" />
  Edit Product
</Link>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg animate-fade-in-out z-50">
          {toastMessage}
        </div>
      )}

      {/* ⚠️ Delete Confirm Modal */}
      <DeleteConfirmModal
        show={modalVisible}
        productName={productToDelete?.name}
        onCancel={() => setModalVisible(false)}
        onConfirm={performDelete}
      />
    </div>
  );
}
