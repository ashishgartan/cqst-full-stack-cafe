require("dotenv").config(); // MUST be the first line
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db"); // Import the DB function
const webpush = require("web-push");
// Import Routes
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cartRoutes = require("./routes/cartRoutes");
const extractUser = require("./middlewares/extractUser");
const User = require("./models/User");
const app = express();

// 1. Connect to Database
connectDB();

// 2. Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));
app.set("view engine", "ejs");

webpush.setVapidDetails(
  "mailto:admin@fullstackcafe.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

app.use(extractUser);
app.use("/", authRoutes);
app.use("/", productRoutes);
app.use("/", orderRoutes);
app.use("/", adminRoutes);
app.use("/", cartRoutes);
app.post("/api/subscribe", async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("❌ No user found in request. Is extractUser working?");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const subscription = req.body;
    console.log("Saving subscription for user:", req.user.id);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { pushSubscription: subscription },
      { new: true } // Returns the updated document
    );

    if (updatedUser) {
      console.log("✅ Subscription saved successfully");
      res.status(201).json({ success: true });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error("❌ Subscription Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/", (req, res) => res.redirect("/products"));
app.get("/support", (req, res) => res.render("support"));

// THE 404 CATCH-ALL (Must be last)
app.use((req, res, next) => {
  res.status(404).render("404", {
    title: "Page Not Found - QuickBite",
  });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server flying on port ${PORT}`));
