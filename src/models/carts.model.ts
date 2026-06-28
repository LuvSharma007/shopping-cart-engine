import mongoose, { Document, Model, Schema } from "mongoose";
import type { ProductCategory } from "./items.model.js";

interface ICartItem {
    productId: mongoose.Types.ObjectId,
    productName:string,
    price:number,
    quantity:number,
    category:ProductCategory
}

export interface ICart extends Document{
    userId:mongoose.Types.ObjectId;
    items:ICartItem[],
    totalPrice:number,
}

const cartSchema: Schema<ICart> = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true,
        unique:true
    },
    items:[
        {
            productId:{
                type:Schema.Types.ObjectId,
                ref:"item",
                required:true
            },
            productName:{
                type:String,
                required:true
            },
            price:{
                type:Number,
                required:true                
            },
            quantity:{
                type:Number,
                required:true,
                min:[1,"Quantity cannot be less than 1"],
                default:1
            },
            category:{
                type:String,
                required:true,
            }
        }
    ],
    totalPrice:{
        type:Number,
        required:true,
        default:0
    },
    
},{timestamps:{createdAt:true,updatedAt:true}})

const cartModel:Model<ICart> = mongoose.model("cart",cartSchema);
export default cartModel;