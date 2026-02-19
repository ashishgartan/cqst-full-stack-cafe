const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const multer = require("multer");

// --- Better Multer Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/avatars/"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    // Saves file as: 1740000000000-burger.png
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/signup", authController.getSignupPage);
router.post("/signup", upload.single("avatar"), authController.postSignup);

router.get("/login", authController.getLoginPage);
router.post("/login", authController.postLogin);

router.get("/logout", authController.logout);

module.exports = router;
