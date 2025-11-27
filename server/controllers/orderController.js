import { Order } from "../models/order.js";
import { Dish } from "../models/dish.js";
import { jsPDF } from "jspdf";

// PLACE ORDER 
export const placeOrder = async (req, res) => {
  try {
    const { dishes } = req.body;

    if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
      return res.status(400).json({ msg: "No dishes provided" });
    }

    const dishDetails = await Dish.find({ _id: { $in: dishes } });

    let totalAmount = 0;
    dishDetails.forEach((d) => (totalAmount += d.price));

    const order = new Order({
      user: req.user.id,
      dishes,
      total_amount: totalAmount,
    });

    await order.save();

    res.status(201).json({
      msg: "Order placed successfully",
      order,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

//  GET USER ORDERS 
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("dishes");

    return res.status(200).json({
      count: orders.length,
      orders,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

//  UPDATE ORDER STATUS 
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Preparing", "Ready", "Completed"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ msg: "Order not found" });

    res.json({ msg: "Order updated", order });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

//  BILL ORDER
export const billOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate("dishes");
    if (!order) return res.status(404).json({ msg: "Order not found" });

    const pdf = new jsPDF();
    pdf.text("Order Invoice", 20, 20);
    pdf.text(`Order ID: ${order._id}`, 20, 30);
    pdf.text(`Date: ${order.placed_at}`, 20, 40);
    pdf.text(`Total: $${order.total_amount}`, 20, 50);

    let y = 65;
    order.dishes.forEach((d) => {
      pdf.text(`- ${d.name}: $${d.price}`, 20, y);
      y += 10;
    });

    const pdfBuffer = pdf.output("nodebuffer");
    res.type("pdf").send(pdfBuffer);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};
