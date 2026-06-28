import type { Request, Response } from "express";
import itemModel from "../models/items.model.js";

// insert item one by one
export const addItem = async (req:Request , res:Response)=>{
    const { productName, price, stockLeft, category } = req.body;

    const itemCreated = await itemModel.create({
        productName,
        price,
        stockLeft,
        category
    })
    if(!itemCreated){
        return res.status(400).json({
            success:false,
            message:"Failed to add item",
        })
    }

    return res.status(200).json({
        success:true,
        message:"Successfully added item to the Database",
        data:itemCreated
    })
}

// upload in bulk

export const addBulkItems = async (req: Request, res: Response) => {
    const items  = req.body;

    try {
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid input. Please provide a non-empty array of items under the 'items' key."
            });
        }

        const itemsCreated = await itemModel.insertMany(items);
        if(!itemsCreated){
            return res.status(400).json({
                success: false,
                message: "Error dring Bulk Add"
            });
        }

        return res.status(201).json({
            success: true,
            message: `Successfully added ${itemsCreated.length} items to the Database`,
            data: itemsCreated
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal Server Error during bulk upload"
        });
    }
};


