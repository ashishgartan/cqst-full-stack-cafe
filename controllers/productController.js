const Product = require("../models/Product");

// Render the main page
exports.getProductsPage = (req, res) => {
  console.log("user in controller:", req.user);
  res.render("products", {user: req.user||null});
};

// API for filtering and pagination
exports.getApiProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    let query = {};
    if (category && category !== "all") query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.searchProducts = async (req, res) => {
  try {
    const query = req.query.q; // Get the search term from the URL

    if (!query) {
      return res.redirect("/products");
    }

    // Use $or to search across multiple fields
    // 'i' makes it case-insensitive
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });

    res.render("products", {
      products,
      searchQuery: query,
      user: req.user,
    });
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).send("Error performing search");
  }
};
