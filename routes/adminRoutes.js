const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAdmin } = require("../middlewares/isAdmin");

// Dashboard & Orders
router.get("/dashboard", isAdmin, adminController.getDashboard);
router.post(
  "/orders/update-status",
  isAdmin,
  adminController.updateOrderStatus
);

// Product Management
router.post("/products/add", isAdmin, adminController.addProduct);
router.post("/products/edit/:id", isAdmin, adminController.editProduct);
router.post("/products/delete/:id", isAdmin, adminController.deleteProduct);

module.exports = router;
