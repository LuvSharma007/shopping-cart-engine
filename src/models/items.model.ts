import mongoose, { Document, Model, Schema } from "mongoose";


export enum ProductCategory {
    MOBILE = "mobile",
    LAPTOP = "laptop",
    TABLET = "tablet",
    ACCESSORIES = "accessories",
    WEARABLE = "wearable",
    AUDIO = "audio",
    GAMING = "gaming",
    FASHION = "fashion"
}

export interface IItems extends Document{
    productName:string,
    price:number,
    discountAvailable:boolean
    discountAmount:number
    cuponCodeAvailable:boolean,
    inStock:boolean,
    stockLeft:number,
    category:ProductCategory
}

const itemsSchema: Schema<IItems> = new Schema({
    productName:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
        default:0,
        max:[99999.99,"price must be less than 100,000"]
    },
    discountAvailable:{
        type:Boolean,    
        default:false,
        required:false
    },
    cuponCodeAvailable:{
        type:Boolean,
        default:false,
        required:false
    },
    discountAmount:{
        type:Number,
        required:false,
        default:0
    },
    inStock:{
        type:Boolean,
        default:true,
    },
    stockLeft:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        enum:Object.values(ProductCategory),
        required:true
    }

},{timestamps:{createdAt:true,updatedAt:true}})

const itemModel:Model<IItems> = mongoose.model("item",itemsSchema);
export default itemModel;