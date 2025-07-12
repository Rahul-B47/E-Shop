// src/pages/EditProduct.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiEdit3,
  FiArrowLeft,
  FiImage,
  FiTag,
  FiDollarSign,
  FiPercent,
  FiBookOpen,
  FiAlignLeft,
  FiUpload,
} from "react-icons/fi";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      const ref = doc(db, "products", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setProduct(data);
        setPreviewUrl(data.image);
      } else {
        alert("❌ Product not found!");
        navigate("/");
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewImage(file);
    if (file) {
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let updatedImageUrl = product.image;

      // ✅ Upload to Cloudinary
      if (newImage) {
        const formData = new FormData();
        formData.append("file", newImage);
        formData.append("upload_preset", "add_products"); // 🔁 Your Cloudinary preset

        const res = await fetch("https://api.cloudinary.com/v1_1/de59xopak/image/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        console.log("📸 Cloudinary response:", data);

        if (data.secure_url) {
          updatedImageUrl = data.secure_url;
        } else {
          throw new Error("Image upload failed: " + data.error?.message || "No URL");
        }
      }

      await updateDoc(doc(db, "products", id), {
        ...product,
        image: updatedImageUrl,
        updatedAt: Timestamp.now(),
      });

      setToast("✅ Product updated successfully!");
      setTimeout(() => {
        setToast("");
        navigate("/delete-product");
      }, 2000);
    } catch (err) {
      console.error("❌ Error updating product:", err);
      alert("Something went wrong. See console.");
    } finally {
      setLoading(false);
    }
  };

  if (!product)
    return <div className="text-center text-gray-500 mt-10">Loading product...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-10">
      <div className="mb-4">
        <Link to="/" className="flex items-center gap-2 text-indigo-600 hover:underline">
          <FiArrowLeft /> Back to Home
        </Link>
      </div>

      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <FiEdit3 /> Edit Product
        </h2>

        {/* Image Preview */}
        <div className="mb-4">
          <img
            src={previewUrl || "/placeholder.jpg"}
            alt="Product"
            className="w-full h-60 object-cover rounded shadow"
          />
        </div>

        <form onSubmit={handleUpdate} className="space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block mb-1 font-medium flex items-center gap-2">
              <FiImage /> Upload New Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full file:bg-indigo-100 file:text-indigo-700 file:px-4 file:py-2 file:rounded-full file:border-0 cursor-pointer border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Product Name */}
          <div>
            <label className="block mb-1 font-medium flex items-center gap-2">
              <FiTag /> Product Name
            </label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              placeholder="Product Name"
              className="w-full px-4 py-2 border rounded dark:bg-gray-700"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block mb-1 font-medium flex items-center gap-2">
              <FiDollarSign /> Price ₹
            </label>
            <input
              type="number"
              value={product.price}
              onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
              className="w-full px-4 py-2 border rounded dark:bg-gray-700"
            />
          </div>

          {/* Sale Price */}
          <div>
            <label className="block mb-1 font-medium flex items-center gap-2">
              <FiPercent /> Sale Price ₹ (optional)
            </label>
            <input
              type="number"
              value={product.salePrice || ""}
              onChange={(e) =>
                setProduct({
                  ...product,
                  salePrice: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full px-4 py-2 border rounded dark:bg-gray-700"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block mb-1 font-medium flex items-center gap-2">
              <FiBookOpen /> Category
            </label>
            <select
              value={product.category}
              onChange={(e) => setProduct({ ...product, category: e.target.value })}
              className="w-full px-4 py-2 border rounded dark:bg-gray-700"
            >
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Home</option>
              <option>Books</option>
              <option>Accessories</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 font-medium flex items-center gap-2">
              <FiAlignLeft /> Description
            </label>
            <textarea
              rows="4"
              value={product.description}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
              placeholder="Description"
              className="w-full px-4 py-2 border rounded dark:bg-gray-700"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2 rounded font-semibold transition"
          >
            {loading ? "Updating..." : "Update Product"}
          </button>
        </form>
      </div>

      {/* ✅ Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in-out">
          {toast}
        </div>
      )}
    </div>
  );
}
