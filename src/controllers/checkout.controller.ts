import type { Request, Response } from "express";
import cartModel from "../models/carts.model.js";
import { calculateCheckout } from "../services/pricingEngine.js";

export const checkout = async (req: Request, res: Response) => {
    const userId = req.session.userId
    try {
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "No session found"
            });
        }

        const cart = await cartModel.findOne({ userId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Error getting cart items"
            });
        }

        const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const distinctCategories = new Set(cart.items.map(i => i.category)).size;

        const result = calculateCheckout(subtotal, distinctCategories);
        return res.status(200).json({
            subtotal, ...result
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal Server Error"
        });
    }
};