import z from "zod";
import { ProductCategory } from "../models/items.model.js";

export const addToItemSchema = z.object({
    productName:z.string().min(2,"Product name must be at least two characters long"),
    price:z.number().gte(0,"Price cannot be negative").lt(100000,"price should be less than 100,000"),
    stockLeft:z.number().gte(0,"Stock cannot be negative"),
    category:z.nativeEnum(ProductCategory,{
        message:"Invalid product category selected"
    })
})

export const addBulkToItemSchema = z.array(addToItemSchema)
