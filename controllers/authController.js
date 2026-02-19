const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Render Signup Page
exports.getSignupPage = (req, res) => {
  res.render("signup", { message: null });
};

// Handle Signup Logic (Refactored for Fetch + JSON)
exports.postSignup = async (req, res) => {
  try {
    const { username, password, email, phone } = req.body;

    const existingUser = await User.findOne({
      $or: [{ username }, { email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username, Email, or Phone already in use.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarPath = req.file
      ? `/${req.file.filename}`
      : "default-avatar.png";

    const newUser = new User({
      username,
      email,
      phone,
      password: hashedPassword,
      avatar: avatarPath,
      role: "user",
    });

    await newUser.save();

    // Return JSON instead of redirect
    res.status(201).json({
      success: true,
      message: "Account created successfully! Redirecting to login...",
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Signup error: " + err.message });
  }
};

// Render Login Page
exports.getLoginPage = (req, res) => {
  res.render("login");
};

// Handle Login Logic (Refactored for Fetch + JWT + JSON)
exports.postLogin = async (req, res) => {
  try {
    const { username, password, subscription } = req.body;

    // 1. Find user first
    const user = await User.findOne({ username });

    // 2. Validate user existence AND password before doing anything else
    // We use a single check to prevent "Username Enumeration" (letting attackers know which users exist)
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // 3. Logic for Push Subscription (Now safe because user definitely exists)
    if (subscription) {
      user.pushSubscription = subscription;
      await user.save();
    }

    // 4. Create JWT Payload
    const payload = {
      id: user._id,
      name: user.username,
      role: user.role,
      avatar: user.avatar,
    };

    // 5. Sign Token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // 6. Set Cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevents XSS attacks
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in prod
      sameSite: "lax", // Protects against CSRF
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // 7. Determine Redirect URL based on role
    const redirectUrl = user.role === "admin" ? "/admin/orders" : "/products";

    // 8. Final Response
    return res.json({
      success: true,
      message: "Login successful",
      redirectUrl,
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};
// Handle Logout
exports.logout = async (req, res) => {
  try {
    // 1. If user is logged in, nullify the push subscription
    if (req.user && req.user._id) {
      const User = require("../models/User");
      await User.findByIdAndUpdate(req.user._id, {
        $set: { pushSubscription: null }, // Explicitly setting to null
      });
    }

    // 2. Clear the authentication cookie
    res.clearCookie("token");

    // 3. Handle response (JSON for Fetch or Redirect for standard links)
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({ success: true, redirectUrl: "/login" });
    }

    res.redirect("/login");
  } catch (err) {
    console.error("Logout Error:", err);
    res.redirect("/login");
  }
};
