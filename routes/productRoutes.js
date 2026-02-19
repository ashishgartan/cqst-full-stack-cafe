const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/products", productController.getProductsPage);
router.get("/api/products", productController.getApiProducts);

module.exports = router;
