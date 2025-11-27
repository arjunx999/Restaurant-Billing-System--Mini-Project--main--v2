import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dishes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
      required: true,
    },
  ],
  total_amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Preparing", "Ready", "Completed"],
    default: "Preparing",
  },
  placed_at: {
    type: Date,
    default: Date.now,
  },
});

export const Order = mongoose.model("Order", OrderSchema);
