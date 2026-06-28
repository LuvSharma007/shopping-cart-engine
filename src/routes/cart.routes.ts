import express from "express";
import { validate } from "../middleware/validate.middleware.js";
import { addToCart, addToCartBatch, deleteCartItem } from "../controllers/cart.controller.js";
import { addToCartSchema, batchAddToCartSchema, deleteFromCart } from "../schemas/cart.schema.js";

const router = express.Router();

router.post("/add",validate(addToCartSchema),addToCart);
router.post("/addBatch",validate(batchAddToCartSchema),addToCartBatch);
router.delete("/deleteItem",validate(deleteFromCart),deleteCartItem);

export default router