import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

// Icons
import {
  FiSun, FiMoon, FiHome, FiBox, FiTag, FiUser,
  FiShoppingCart, FiLogIn, FiLogOut, FiPlus, FiTrash2,
  FiMenu, FiX,
} from "react-icons/fi";
import { MdOutlineCategory } from "react-icons/md";

export default function Header() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [profileImage, setProfileImage] = useState("/default-avatar.png");
  const [userName, setUserName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isAdmin = user?.email === "rahulrakeshpoojary0@gmail.com";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setProfileImage(data.photo || "/default-avatar.png");
        setUserName(data.name || user.email);
      }
    };
    fetchProfile();
  }, [user]);

  const navLink = (to, icon, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className="flex items-center gap-2 hover:text-indigo-500 transition"
    >
      {icon} {label}
    </Link>
  );

  return (
    <header className="bg-white dark:bg-gray-950 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left: Logo + Admin */}
        <div className="flex items-center gap-4">
          {user && (
            <button
              className="md:hidden p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          )}

          <Link
            to="/"
            className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform"
          >
            🛍️ E-Shop
          </Link>

          {isAdmin && (
            <div className="hidden sm:flex gap-2 text-sm ml-4">
              <Link
                to="/add-product"
                className="flex items-center gap-1 px-2 py-1 rounded text-green-600 hover:bg-green-100 dark:hover:bg-green-900"
              >
                <FiPlus /> Add
              </Link>
              <Link
                to="/delete-product"
                className="flex items-center gap-1 px-2 py-1 rounded text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900"
              >
                <FiTrash2 /> Manage
              </Link>
            </div>
          )}
        </div>

        {/* Center: Desktop Nav */}
        {user && (
          <nav className="hidden md:flex gap-6 text-sm absolute left-1/2 transform -translate-x-1/2 text-gray-700 dark:text-gray-300">
            {navLink("/", <FiHome />, "Home")}
            {navLink("/shop", <FiBox />, "Shop")}
            {navLink("/categories", <MdOutlineCategory />, "Categories")}
            {navLink("/deals", <FiTag />, "Deals")}
            {navLink("/my-orders", <FiUser />, "My Orders")}
            {navLink("/cart", <FiShoppingCart />, "Cart")}
          </nav>
        )}

        {/* Right: Theme + Profile + Auth */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isDark ? <FiSun className="text-yellow-400" /> : <FiMoon />}
          </button>

          {user ? (
            <>
              <div
                onClick={() => navigate("/profile")}
                className="hidden sm:flex items-center gap-2 cursor-pointer group hover:scale-105 transition-transform"
              >
                <img
                  src={profileImage}
                  alt="profile"
                  className="w-9 h-9 rounded-full border-2 border-indigo-500 group-hover:ring-2 ring-indigo-400"
                />
                <span className="hidden md:inline text-sm font-medium dark:text-white group-hover:underline">
                  {userName.length > 14 ? userName.slice(0, 14) + "…" : userName}
                </span>
              </div>

              <button
                onClick={logout}
                className="hidden sm:flex items-center gap-1 text-red-600 border px-3 py-1 rounded-md hover:bg-red-100 dark:hover:bg-red-800 text-sm"
              >
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1 text-indigo-600 border px-3 py-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900 text-sm"
            >
              <FiLogIn /> Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && user && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3 text-sm bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-700">
          {navLink("/", <FiHome />, "Home")}
          {navLink("/shop", <FiBox />, "Shop")}
          {navLink("/categories", <MdOutlineCategory />, "Categories")}
          {navLink("/deals", <FiTag />, "Deals")}
          {navLink("/my-orders", <FiUser />, "My Orders")}
          {navLink("/cart", <FiShoppingCart />, "Cart")}

          {/* Admin */}
          {isAdmin && (
            <>
              {navLink("/add-product", <FiPlus />, "Add Product")}
              {navLink("/delete-product", <FiTrash2 />, "Manage Products")}
            </>
          )}

          {/* Profile & Logout */}
          <div
            onClick={() => {
              navigate("/profile");
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 cursor-pointer hover:text-indigo-500"
          >
            <img src={profileImage} alt="Profile" className="w-6 h-6 rounded-full border border-indigo-400" />
            <span>{userName.length > 20 ? userName.slice(0, 20) + "…" : userName}</span>
          </div>
          <button
            onClick={() => {
              logout();
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 text-red-600 hover:text-red-800"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      )}
    </header>
  );
}
