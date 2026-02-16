const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  console.log("Checking Token in Middleware:", token); // If this is undefined, cookieParser isn't working
  // 1. Check if token exists
  if (!token) {
    // If it's an API request, return JSON; otherwise redirect to login
    if (req.path.startsWith("/api")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("user: ", decoded);
    next();
  } catch (err) {
    // LOG THE ACTUAL ERROR BEFORE DELETING
    console.error("JWT Verification Failed:", err.message);

    res.clearCookie("token");
    return res.redirect("/login");
  }
};
