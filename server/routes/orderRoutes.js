import express from "express";
import { 
    placeOrder, 
    getUserOrders, 
    updateOrderStatus, 
    billOrder 
} from "../controllers/orderController.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Place a new order
router.post("/place", verifyToken, placeOrder);

// Get all orders for logged-in user
router.get("/my-orders", verifyToken, getUserOrders);

// Update order status (Preparing → Ready → Completed)
router.patch("/status/:id", verifyToken, updateOrderStatus);

// Generate bill for a specific order
router.post("/bill-order", verifyToken, billOrder);

export default router;
