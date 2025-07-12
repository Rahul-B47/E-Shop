// src/context/AuthContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { auth, provider } from "../firebase";
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

// 1. Create context
const AuthContext = createContext();

// 2. useAuth hook for components
export const useAuth = () => useContext(AuthContext);

// 3. AuthProvider for global context
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // wait for auth to load

  // ✅ Google login
  const googleLogin = () => signInWithPopup(auth, provider);

  // ✅ Email/password login
  const emailLogin = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  // ✅ Email/password signup
  const emailSignup = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  // ✅ Logout
  const logout = () => signOut(auth);

  // ✅ On Auth Change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // ✅ Firebase done loading
    });

    return () => unsubscribe(); // Cleanup
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        googleLogin,
        emailLogin,
        emailSignup,
        logout,
      }}
    >
      {/* ✅ Wait until Firebase auth is initialized before showing app */}
      {!loading && children}
    </AuthContext.Provider>
  );
}
