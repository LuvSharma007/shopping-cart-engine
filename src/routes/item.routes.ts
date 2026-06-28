import express from "express";
import { addBulkItems, addItem } from "../controllers/item.controller.js";
import { addBulkToItemSchema, addToItemSchema,  } from "../schemas/item.schema.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();    

router.post("/add",validate(addToItemSchema),addItem);
router.post("/addBulk",validate(addBulkToItemSchema),addBulkItems);

export default router