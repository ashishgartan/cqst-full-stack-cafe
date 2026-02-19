const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const isAuthenticated = require("../middlewares/isAuthenticated");

// The API endpoint your fetch calls
router.post("/api/orders", isAuthenticated, orderController.createOrder);
router.post("/api/orders/cancel/:id", orderController.userCancelOrder);
// The history pages we did earlier
router.get("/orders", orderController.getOrderHistoryPage);
router.get("/api/orders", orderController.getApiOrders);

module.exports = router;
