import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaPhone,
  FaCalendarAlt,
  FaVenusMars,
  FaMapMarkedAlt,
  FaMapPin,
  FaSave,
  FaUpload,
  FaEdit,
} from "react-icons/fa";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    dob: "",
    gender: "",
    pincode: "",
    updatedAt: null,
  });
  const [photo, setPhoto] = useState("/default-avatar.png");
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setForm((prev) => ({
            ...prev,
            ...data,
            updatedAt: data.updatedAt?.toDate?.() || null,
          }));
          setPhoto(data.photo || user?.photoURL || "/default-avatar.png");
        }
      } catch (err) {
        console.error("❌ Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadUserProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "user_profile_upload");
    formData.append("folder", "profile_pics");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/de59xopak/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setPhoto(data.secure_url);
    } catch (err) {
      console.error("❌ Cloudinary upload error:", err);
      showToast("Failed to upload profile picture", "error");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        ...form,
        photo: photo || "/default-avatar.png",
        updatedAt: Timestamp.now(),
      });
      showToast("✅ Profile updated successfully", "success");
      setEditMode(false);
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      showToast("❌ Failed to update profile", "error");
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading your profile...</div>;
  }

  return (
    <div className="min-h-screen flex justify-center items-center px-4 py-10 bg-gradient-to-br from-purple-100 via-indigo-200 to-pink-200">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-6 sm:p-8 relative overflow-hidden">

        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 text-indigo-700 hover:text-indigo-900 flex items-center gap-1 text-sm sm:text-base"
        >
          <FaArrowLeft /> Back
        </button>

        {/* Edit Button */}
        <button
          onClick={() => setEditMode(!editMode)}
          className="absolute top-4 right-4 text-indigo-700 hover:text-indigo-900 flex items-center gap-1 text-sm sm:text-base"
        >
          <FaEdit /> {editMode ? "Cancel" : "Edit"}
        </button>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-indigo-700 mt-8 mb-6">
          👤 My Profile
        </h2>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <label className="cursor-pointer relative group">
            <img
              src={photo || "/default-avatar.png"}
              alt="Profile"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-indigo-500 transition-all group-hover:scale-105"
            />
            {editMode && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="absolute inset-0 opacity-0"
                />
                <span className="absolute bottom-0 w-full text-center bg-black/60 text-xs text-white py-1 hidden group-hover:block rounded-b-md">
                  <FaUpload className="inline mr-1" /> Change
                </span>
              </>
            )}
          </label>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-5 text-sm sm:text-base">
          {[
            { label: "Full Name", icon: <FaUser />, name: "name", type: "text" },
            { label: "Phone Number", icon: <FaPhone />, name: "phone", type: "tel" },
            { label: "Date of Birth", icon: <FaCalendarAlt />, name: "dob", type: "date" },
            {
              label: "Gender",
              icon: <FaVenusMars />,
              name: "gender",
              type: "select",
              options: ["", "Male", "Female", "Other", "Prefer not to say"],
            },
            { label: "Address", icon: <FaMapMarkedAlt />, name: "address", type: "textarea" },
            { label: "PIN Code", icon: <FaMapPin />, name: "pincode", type: "text" },
          ].map((field) => (
            <div key={field.name}>
              <label className="font-medium flex items-center gap-2 mb-1 text-gray-700">
                {field.icon} {field.label}
              </label>
              {field.type === "select" ? (
                <select
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
                >
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt || "Select gender"}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  rows="3"
                  value={form[field.name]}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
                />
              )}
            </div>
          ))}

          {/* Save Button */}
          {editMode && (
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded flex justify-center items-center gap-2 transition mt-4"
            >
              <FaSave /> Save Changes
            </button>
          )}

          {/* Last Updated */}
          {form.updatedAt && (
            <p className="text-center text-xs text-gray-500 mt-4">
              Last updated on{" "}
              <span className="font-semibold text-indigo-600">
                {form.updatedAt.toLocaleDateString()} at {form.updatedAt.toLocaleTimeString()}
              </span>
            </p>
          )}
        </form>

        {/* Toast */}
        {toast.message && (
          <div
            className={`fixed bottom-8 right-4 px-4 py-2 rounded shadow text-white text-sm ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
