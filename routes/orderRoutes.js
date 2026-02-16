const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const isAuth = require("../middlewares/auth");

// POST request to place an order
router.post("/api/orders", isAuth, orderController.createOrder);

// GET request to see order history
router.get("/orders", isAuth, orderController.getUserOrders);

module.exports = router;
