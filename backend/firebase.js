import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ✅ Firebase config for frontend
const firebaseConfig = {
  apiKey: "AIzaSyA1vZAJhiB3TqRre0QkGiZs1uty4enD1KM",
  authDomain: "ecommerce-store-ae600.firebaseapp.com",
  projectId: "ecommerce-store-ae600",
  storageBucket: "ecommerce-store-ae600.firebasestorage.app",
  messagingSenderId: "192975873595",
  appId: "1:192975873595:web:e937d1d10a934decc1de1e"
};

// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🧾 Get Firestore DB
const db = getFirestore(app);

export { db };
