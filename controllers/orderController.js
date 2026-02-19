const Order = require("../models/Order");
const Product = require("../models/Product");
const webpush = require("web-push");
const User = require("../models/User"); // Ensure User model is imported

exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Your bag is empty" });
    }

    let calculatedTotal = 0;
    const formattedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.id);
      if (!product) return res.status(404).json({ error: `Dish not found` });

      calculatedTotal += product.price * item.quantity;
      formattedItems.push({ productId: item.id, quantity: item.quantity });
    }

    const finalTotal = calculatedTotal + 5;

    const newOrder = new Order({
      user: req.user.id,
      items: formattedItems,
      totalAmount: finalTotal,
      status: "Pending",
    });

    await newOrder.save();

    // --- PUSH NOTIFICATION LOGIC ---
    // 1. Find all admins who have a push subscription
    const admins = await User.find({
      role: "admin",
      pushSubscription: { $ne: null },
    });

    // 2. Define the notification payload
    const payload = JSON.stringify({
      title: "New Order Received! 🍔",
      body: `Order #${newOrder._id.toString().slice(-6)} for ₹${finalTotal}`,
      icon: "/icons/favicon.png",
      data: { url: "/admin/orders" },
    });

    // 3. Send notifications to all active admins
    admins.forEach((admin) => {
      webpush
        .sendNotification(admin.pushSubscription, payload)
        .catch((err) => console.error("Push Error for Admin:", admin._id, err));
    });

    res.status(201).json({
      message: "Order placed successfully! Chef is on it.",
      order: newOrder,
    });
  } catch (err) {
    console.error("Order Error:", err);
    res.status(500).json({ error: "Server error during checkout" });
  }
};
exports.userCancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    // Find order and verify it belongs to this user
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Security: Only allow cancellation if order is still 'Pending'
    if (order.status !== "Pending") {
      return res
        .status(400)
        .json({ error: "Chef is already cooking! Cannot cancel now." });
    }

    // Update status and save the reason
    order.status = "Cancelled";
    order.reasonForCancellation = reason || "User cancelled";
    await order.save();

    // OPTIONAL: Notify the Admin via Push
    // 2. Define the notification payload
    const payload = JSON.stringify({
      title: "User Cancelled the  Order ! 🍔",
      body: `Order #${order._id.toString().slice(-6)}`,
      icon: "/icons/favicon.png",
      data: { url: "/admin/orders" },
    });

    // 3. Send notifications to all active admins
    admins.forEach((admin) => {
      webpush
        .sendNotification(admin.pushSubscription, payload)
        .catch((err) => console.error("Push Error for Admin:", admin._id, err));
    });

    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// 1. RENDER THE PAGE SHELL
exports.getOrderHistoryPage = (req, res) => {
  res.render("userPages/userOrders", { user: req.user || null });
};
// 2. DATA API FOR FETCH
exports.getApiOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Use req.user.id (from your JWT/extractUser middleware)
    const totalOrders = await Order.countDocuments({ user: req.user.id });
    const orders = await Order.find({ user: req.user.id })
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Format the data for clean frontend consumption
    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      displayDate: new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      totalAmount: order.totalAmount,
      status: order.status || "Pending",
      // Helper for status classes
      statusClass: getStatusClass(order.status),
      items: order.items.map((item) => ({
        quantity: item.quantity,
        name: item.productId ? item.productId.name : "Deleted Product",
      })),
    }));

    res.json({
      orders: formattedOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper for dynamic status colors
function getStatusClass(status) {
  const s = status?.toLowerCase();
  if (s === "delivered")
    return "bg-green-100 text-green-700 border border-green-200";
  if (s === "cancelled") return "bg-red-100 text-red-700 border border-red-200";
  return "bg-orange-100 text-orange-700 border border-orange-200";
}
