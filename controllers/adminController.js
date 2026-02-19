const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const webpush = require("web-push");

// --- PAGE SHELL RENDERERS ---
exports.getOrdersPage = (req, res) =>
  res.render("adminPages/manageOrders", { user: req.user });
exports.getProductsPage = (req, res) =>
  res.render("adminPages/manageProducts", { user: req.user });
exports.getUsersPage = (req, res) =>
  res.render("adminPages/manageUsers", { user: req.user });

// --- DATA APIs (JSON) ---
exports.getApiOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments();
    const orders = await Order.find()
      .populate("user", "username phone pushSubscription")
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ error: "Kitchen sync failed: " + err.message });
  }
};

exports.getApiProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments();
    const products = await Product.find()
      .sort({ category: 1, name: 1 }) // Sorted by category then name
      .skip(skip)
      .limit(limit);

    res.json({
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      totalCount: totalProducts,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products: " + err.message });
  }
};

exports.getApiUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();
    const users = await User.find()
      .select("username email avatar phone role createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      users,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      totalUsers,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users: " + err.message });
  }
};

// --- ACTIONS ---

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    // 1. Update order and populate user to get their subscription
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate("user");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // 2. Check if the user exists and has an active subscription
    if (order.user && order.user.pushSubscription) {
      // We wrap the URL in a 'data' object so sw.js can read it for 'notificationclick'
      const payload = JSON.stringify({
        title: "Order Update! 🍔",
        body: `Hey ${order.user.username}, your order status is now: ${status}`,
        icon: "/icons/favicon.png",
        data: {
          url: "/orders", // This allows the user to click the notification to see details
        },
      });

      webpush
        .sendNotification(order.user.pushSubscription, payload)
        .catch((err) => {
          console.error("Push Notification Failed:", err);
          // If the endpoint is no longer valid (expired), consider nullifying it
          if (err.statusCode === 410 || err.statusCode === 404) {
            order.user.pushSubscription = null;
            order.user.save();
          }
        });
    }

    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status: " + err.message });
  }
};
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle Product Availability
exports.toggleProductStatus = async (req, res) => {

  try {
    const { id } = req.params;
    const { isActive } = req.body;
    await Product.findByIdAndUpdate(id, { isActive });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add / Edit Product (JSON Response)
exports.apiSaveProduct = async (req, res) => {

  try {
    const { id } = req.params; // For Edit
    const updateData = { ...req.body };
    // If a new file was uploaded, update the image field
    if (req.file) {
      updateData.image = req.file.filename;
    }
    if (id) {
      await Product.findByIdAndUpdate(id, updateData);
    } else {
      await Product.create(updateData);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
