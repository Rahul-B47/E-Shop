import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  // Replace this with your actual admin email
  const adminEmail = "rahulrakeshpoojary0@gmail.com";

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return user?.email === adminEmail ? (
    children
  ) : (
    <Navigate to="/" />
  );
}
