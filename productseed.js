require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Product = require("./models/Product");

const products = [
  {
    name: "Classic Cheeseburger",
    price: 120,
    category: "Fast Food",
    description: "Juicy beef patty with melted cheddar and secret sauce.",
    image: "burger.png",
  },
  {
    name: "Crispy Chicken Wrap",
    price: 150,
    category: "Fast Food",
    description: "Grilled chicken with fresh veggies in a warm tortilla.",
    image: "chicken-wrap.png",
  },
  {
    name: "Peri Peri Fries",
    price: 80,
    category: "Fast Food",
    description: "Golden fries tossed in spicy peri-peri seasoning.",
    image: "fries.png",
  },
  {
    name: "Veggie Pizza Slice",
    price: 99,
    category: "Fast Food",
    description: "Hand-tossed crust with bell peppers and mozzarella.",
    image: "pizza.png",
  },
  {
    name: "Iced Caramel Latte",
    price: 160,
    category: "Drinks",
    description: "Espresso with cold milk and sweet caramel drizzle.",
    image: "caramel-latte.png",
  },
  {
    name: "Classic Cold Coffee",
    price: 120,
    category: "Drinks",
    description: "Creamy blended coffee with a dash of chocolate.",
    image: "cold-coffee.png",
  },
  {
    name: "Fresh Lime Soda",
    price: 50,
    category: "Drinks",
    description: "Refreshing lemon drink with salt or sugar.",
    image: "lime-soda.png",
  },
  {
    name: "Chocolate Lava Cake",
    price: 110,
    category: "Desserts",
    description: "Warm cake with a gooey molten chocolate center.",
    image: "lava-cake.png",
  },
  {
    name: "Blueberry Cheesecake",
    price: 190,
    category: "Desserts",
    description: "Velvety cheesecake topped with blueberry compote.",
    image: "cheesecake.png",
  },
  {
    name: "Red Velvet Pastry",
    price: 120,
    category: "Desserts",
    description: "Soft sponge cake with cream cheese frosting.",
    image: "red-velvet.png",
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing products to avoid duplicates
    await Product.deleteMany();
    console.log("🗑️ Existing products cleared");

    // Insert the new products
    await Product.insertMany(products);
    console.log("✅ 10 Products seeded successfully");

    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
