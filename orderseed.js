require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Product = require("./models/Product");
const Order = require("./models/Order");

const seedOrders = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Clear existing orders to start fresh
    await Order.deleteMany();
    console.log("🗑️  Existing orders cleared.");

    // 3. Fetch Users and Products (Required for IDs)
    const users = await User.find();
    const products = await Product.find();

    if (users.length === 0 || products.length === 0) {
      console.log("⚠️  Please seed Users and Products first!");
      process.exit(1);
    }

    const statuses = ["Pending", "Preparing", "Ready", "Delivered"];
    const dummyOrders = [];

    // 4. Create 10 Random Orders
    for (let i = 0; i < 10; i++) {
      // Pick a random user
      const randomUser = users[Math.floor(Math.random() * users.length)];

      // Pick 1-3 random products for this order
      const itemCount = Math.floor(Math.random() * 3) + 1;
      const selectedItems = [];
      let total = 0;

      for (let j = 0; j < itemCount; j++) {
        const prod = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 2) + 1;

        selectedItems.push({
          productId: prod._id,
          quantity: qty,
        });
        total += prod.price * qty;
      }

      dummyOrders.push({
        user: randomUser._id,
        items: selectedItems,
        totalAmount: total,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        // Random date within the last 7 days
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
        ),
      });
    }

    // 5. Insert into Database
    await Order.insertMany(dummyOrders);
    console.log("✅ 10 Orders seeded successfully!");

    // 6. Close Connection
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error seeding orders:", err);
    process.exit(1);
  }
};

seedOrders();
