// src/context/CartContext.js

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  const { user, loading: authLoading } = useAuth();
  const hasFetched = useRef(false); // ✅ Prevent save before fetch

  // 🔁 Load cart from Firestore
  useEffect(() => {
    const fetchCart = async () => {
      if (!user || authLoading) return;

      setCartLoading(true);
      try {
        const cartRef = doc(db, "carts", user.uid);
        const docSnap = await getDoc(cartRef);

        if (docSnap.exists()) {
          setCart(docSnap.data().items || []);
        } else {
          setCart([]);
        }

        hasFetched.current = true; // ✅ Mark as fetched
      } catch (err) {
        console.error("❌ Error fetching cart:", err);
        setCart([]);
      } finally {
        setCartLoading(false);
      }
    };

    fetchCart();
  }, [user, authLoading]);

  // 💾 Save cart to Firestore (after fetched)
  useEffect(() => {
    const saveCart = async () => {
      if (!user || !hasFetched.current) return;

      try {
        const cartRef = doc(db, "carts", user.uid);
        await setDoc(cartRef, { items: cart });
      } catch (err) {
        console.error("❌ Error saving cart:", err);
      }
    };

    saveCart();
  }, [cart, user]);

  // 🔁 Clear cart on logout / user switch
  useEffect(() => {
    if (!user && !authLoading) {
      setCart([]);
      hasFetched.current = false;
    }
  }, [user, authLoading]);

  // ✅ Cart Actions
  const addToCart = (product) => {
    if (!user) {
      alert("Please log in to add items.");
      return;
    }

    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCart((prev) => [...prev, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartLoading,
        addToCart,
        removeFromCart,
        clearCart,
        increaseQty,
        decreaseQty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook
export function useCart() {
  return useContext(CartContext);
}
