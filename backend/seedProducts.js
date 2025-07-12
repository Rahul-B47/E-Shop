// backend/seedProducts.js

const { db } = require("./firebase");
const products = require("./routes/products");

const seedProducts = async () => {
  try {
    const batch = db.batch();

    products.forEach((product) => {
      const docRef = db.collection("products").doc(); // auto-ID
      batch.set(docRef, product);
    });

    await batch.commit();
    console.log("✅ Products seeded successfully to Firestore.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  }
};

seedProducts();
