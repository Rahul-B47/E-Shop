// backend/routes/products.js

const express = require("express");
const router = express.Router();
const products = require("../products"); // ✅ Import product array

// GET /api/products
router.get("/", (req, res) => {
  res.json(products);
});

module.exports = router;
