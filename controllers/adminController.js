const Order = require("../models/Order");
const Product = require("../models/Product");

// 1. Get Dashboard (Orders + Products)
exports.getDashboard = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user")
      .populate("items.productId")
      .sort({ createdAt: -1 });

    const products = await Product.find().sort({ category: 1 });

    res.render("adminDashboard", {
      orders,
      products,
      user: req.user,
    });
  } catch (err) {
    res.status(500).send("Admin Dashboard Error: " + err.message);
  }
};

// 2. Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await Order.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Add New Product
exports.addProduct = async (req, res) => {
  try {
    const { name, price, category, description, image } = req.body;
    await Product.create({ name, price, category, description, image });
    res.redirect("/admin/dashboard");
  } catch (err) {
    res.status(500).send("Error adding product: " + err.message);
  }
};

// 4. Edit Existing Product
exports.editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, description, image } = req.body;
    await Product.findByIdAndUpdate(id, {
      name,
      price,
      category,
      description,
      image,
    });
    res.redirect("/admin/dashboard");
  } catch (err) {
    res.status(500).send("Error updating product: " + err.message);
  }
};

// 5. Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.redirect("/admin/dashboard");
  } catch (err) {
    res.status(500).send("Error deleting product: " + err.message);
  }
};
