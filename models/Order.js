const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      // This name must be used in the controller
      {
        productId: {
          // This name must be used in .populate()
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // Ensure this matches your Product model name
          required: true,
        },
        quantity: { type: Number, default: 1 },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Ready", "Delivered", "Cancelled"],
      default: "Pending",
    },
    reasonForCancellation: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// This creates the 'Order' collection in MongoDB and exports it
module.exports = mongoose.model("Order", orderSchema);
