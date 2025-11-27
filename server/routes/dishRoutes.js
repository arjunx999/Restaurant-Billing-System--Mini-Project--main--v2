import express from "express";
import { addDish, deleteDish, getDishes } from "../controllers/dishController.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();


// Add and delete require authentication
router.post("/add", verifyToken, addDish);
router.delete("/delete/:id", verifyToken, deleteDish);

// Get all dishes is public (for menu display)
router.get("/get-all", getDishes);

export default router;
