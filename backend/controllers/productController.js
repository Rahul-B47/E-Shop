const { db } = require("../firebase");

// Get all products from Firestore
const getAllProducts = async (req, res) => {
  const snapshot = await db.collection("products").get();
  const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(products);
};
