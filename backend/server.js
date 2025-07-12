// backend/server.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const productRoutes = require("./routes/products"); // ✅ Correct path

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount product API route
app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.send("🌐 API is running...");
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
