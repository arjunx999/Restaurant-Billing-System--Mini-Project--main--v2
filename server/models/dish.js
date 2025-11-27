import mongoose from "mongoose";

const dishSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  photo_url: { type: String, default: "" }
});

export const Dish = mongoose.model("Dish", dishSchema);
