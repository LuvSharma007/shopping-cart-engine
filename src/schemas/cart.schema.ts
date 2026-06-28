import mongoose from "mongoose"
import z from "zod"

export const addToCartSchema = z.object({
    productId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val),{message: "Invalid MongoDB ObjectId",}),
    quantity:z.number().gte(0)
})

export const batchAddToCartSchema = z.array(addToCartSchema);

export const deleteFromCart = z.object({
    productId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val),{message: "Invalid MongoDB ObjectId",}),
})
