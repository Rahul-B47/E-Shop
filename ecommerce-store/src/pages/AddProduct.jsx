import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import {
  FiUploadCloud, FiTag, FiImage,
  FiDollarSign, FiPercent,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [deal, setDeal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!name || !price || !imageFile) {
      alert("❗ Please fill all required fields and upload an image.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", "add_products");

      const cloudRes = await fetch("https://api.cloudinary.com/v1_1/de59xopak/image/upload", {
        method: "POST",
        body: formData,
      });

      const cloudData = await cloudRes.json();
      const imageUrl = cloudData.secure_url;

      if (!imageUrl) throw new Error("Image upload failed");

      const product = {
        name,
        category,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        description,
        image: imageUrl,
        deal,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "products"), product);

      setToastMessage("✅ Product added successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error("❌ Error:", err);
      alert("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-700 via-purple-700 to-pink-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-6 sm:p-8 md:p-10 text-gray-800 dark:text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8 flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
          <FiUploadCloud /> Add New Product
        </h1>

        <form onSubmit={handleUpload} className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block mb-2 font-semibold">Product Name</label>
            <div className="relative">
              <FiTag className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Bluetooth Speaker"
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block mb-2 font-semibold">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 transition"
            >
              {["Electronics", "Fashion", "Home", "Books", "Accessories", "Beauty", "Mobiles", "Footwear", "Gaming", "Fitness"].map(cat => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Price & Sale Price */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold">Price (₹)</label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g., 1999"
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="block mb-2 font-semibold">Sale Price (₹)</label>
              <input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="e.g., 1499 (optional)"
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 font-semibold">Description</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short product description..."
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block mb-2 font-semibold">Product Image</label>
            <div className="relative">
              <FiImage className="absolute left-3 top-3 text-gray-400" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 transition file:bg-indigo-100 file:text-indigo-600 file:font-medium file:text-sm file:border-0 file:py-1 file:px-3"
              />
            </div>
          </div>

          {/* Mark as Deal */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="deal"
              checked={deal}
              onChange={(e) => setDeal(e.target.checked)}
              className="form-checkbox h-4 w-4 text-indigo-600"
            />
            <label htmlFor="deal" className="text-sm font-medium flex items-center gap-1">
              <FiPercent /> Mark as Deal
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Add Product"}
          </button>
        </form>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in-out">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
