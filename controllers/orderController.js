const Order = require("../models/Order");
const Product = require("../models/Product");

exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    let calculatedTotal = 0;
    const formattedItems = [];

    // 1. Loop through items and fetch "Truth" from Database
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res
          .status(404)
          .json({ error: `Product ${item.productId} not found` });
      }

      // 2. Add to total using the DB price, NOT the frontend price
      calculatedTotal += product.price * item.quantity;

      formattedItems.push({
        productId: product._id,
        quantity: item.quantity,
      });
    }

    // 3. Create the order with the verified total
    const newOrder = new Order({
      user: req.user.id,
      items: formattedItems,
      totalAmount: calculatedTotal,
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (err) {
    console.error("Order Error:", err);
    res.status(500).json({ error: "Server error while processing order" });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const rawOrders = await Order.find({ user: req.user.id })
      .populate("items.productId") // Correct path
      .sort({ createdAt: -1 });

    const orders = rawOrders.map((order) => {
      // Logic for status colors
      const statusMap = {
        Ready: "bg-green-100 text-green-700 border border-green-200",
        Preparing: "bg-blue-100 text-blue-700 border border-blue-200",
        Pending: "bg-orange-100 text-orange-700 border border-orange-200",
        Cancelled: "bg-red-100 text-red-700 border border-red-200",
      };

      return {
        ...order._doc,
        statusClass: statusMap[order.status] || "bg-gray-100 text-gray-600",
        displayDate: new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };
    });

    res.render("userOrders", { orders, user: req.user });
  } catch (err) {
    console.error("Fetch Orders Error:", err);
    res.status(500).render("error", { message: "Could not load your orders." });
  }
};
