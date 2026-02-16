const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Render Signup Page
exports.getSignupPage = (req, res) => {
  res.render("signup", { message: null });
};

// Handle Signup Logic
exports.postSignup = async (req, res) => {
  try {
    // 1. Capture 'phone' from req.body
    const { username, password, email, phone } = req.body;

    // 2. Check if user already exists (by username, email, OR phone)
    const existingUser = await User.findOne({
      $or: [{ username }, { email }, { phone }],
    });

    if (existingUser) {
      return res.render("signup", {
        message: "User, Email, or Phone already in use.",
      });
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Handle Avatar Path
    const avatarPath = req.file
      ? `/${req.file.filename}`
      : "default-avatar.png";

    // 5. Create new user with phone number
    const newUser = new User({
      username,
      email,
      phone, // Added phone
      password: hashedPassword,
      avatar: avatarPath,
      role: "user", // Explicitly setting default role
    });

    await newUser.save();
    res.redirect("/login");
  } catch (err) {
    res.status(500).send("Error during signup: " + err.message);
  }
};

// Render Login Page
exports.getLoginPage = (req, res) => {
  res.render("login");
};

// Handle Login Logic
exports.postLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send("Invalid credentials");
    }

    // 6. Security Improvement: Sign specific payload fields, NOT the whole user object
    const payload = {
      id: user._id,
      name: user.username,
      role: user.role,
      avatar: user.avatar,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Set token in Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Better security for live sites
    });
    if (payload.role == "admin") {
      res.redirect("/dashboard");
    } else if (payload.role == "user") {
      res.redirect("/products");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Login error");
  }
};

// Handle Logout
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
};
