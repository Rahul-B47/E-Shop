import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ✅ Added for image uploads

const firebaseConfig = {
  apiKey: "AIzaSyA1vZAJhiB3TqRre0QkGiZs1uty4enD1KM",
  authDomain: "ecommerce-store-ae600.firebaseapp.com",
  projectId: "ecommerce-store-ae600",
  storageBucket: "ecommerce-store-ae600.appspot.com",
  messagingSenderId: "192975873595",
  appId: "1:192975873595:web:e937d1d10a934decc1de1e"
};

// ✅ Initialize Firebase app
const app = initializeApp(firebaseConfig);

// ✅ Firebase services
const auth = getAuth(app);                     // 🔐 Authentication
const provider = new GoogleAuthProvider();     // 🔑 Google Auth
const db = getFirestore(app);                  // 📦 Firestore
const storage = getStorage(app);               // 🖼️ Storage (for images)

// ✅ Export for use in your app
export { auth, provider, db, storage };
