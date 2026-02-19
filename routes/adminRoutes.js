const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAdmin } = require("../middlewares/isAdmin");
const multer = require("multer");

// --- Better Multer Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    // Saves file as: 1740000000000-burger.png
    cb(null, Date.now() + "-" + file.originalname);
  },
});
// Configure Multer for image uploads
const upload = multer({ storage: storage });

// --- Page Routes (EJS Shells) ---
router.get("/admin/orders", isAdmin, adminController.getOrdersPage);
router.get("/admin/products", isAdmin, adminController.getProductsPage);
router.get("/admin/users", isAdmin, adminController.getUsersPage);

// --- API Data Routes (JSON) ---
router.get("/api/admin/orders", isAdmin, adminController.getApiOrders);
router.get("/api/admin/products", isAdmin, adminController.getApiProducts);
router.get("/api/admin/users", isAdmin, adminController.getApiUsers);

// --- Action Routes ---

// 1. Order Management
router.post(
  "/api/admin/orders/update-status",
  isAdmin,
  adminController.updateOrderStatus
);

// 2. Product Management (Add & Edit)
// Note: We use the same controller function for both as it checks for ID
router.post(
  "/api/admin/products/add",
  isAdmin,
  upload.single("image"),
  adminController.apiSaveProduct
);
router.post(
  "/api/admin/products/edit/:id",
  isAdmin,
  upload.single("image"),
  adminController.apiSaveProduct
);

// 3. Availability Management (Replaces hard delete)
router.post(
  "/api/admin/products/toggle-status/:id",
  isAdmin,
  adminController.toggleProductStatus
);

module.exports = router;
