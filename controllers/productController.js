const Product = require("../models/Product");

// 1. Serves the EJS Page Shell
exports.getProductsPage = (req, res) => {
  // Keeps your user context for the header
  res.render("products", { user: req.user || null });
};

// 2. Serves the actual data (Search, Filter, Pagination)
exports.getApiProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    let query = { isActive: true };

    // Feature: Category Filtering
    if (category && category !== "all") query.category = category;

    // Feature: Search (Name or Description)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

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
    res.status(500).json({ success: false, message: err.message });
  }
};
