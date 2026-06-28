import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document{
    sessionId:string,
    hasSubscription:boolean,
    isPro:boolean,
}

const userSchema: Schema<IUser> = new Schema({
    sessionId:{
        type:String,
        required:true,        
        unique:true,
        index:true
    },
    hasSubscription:{
        type:Boolean,
        default:false
    },
    isPro:{
        type:Boolean,
        default:false
    },
},{timestamps:{createdAt:true,updatedAt:true}})

const userModel:Model<IUser> = mongoose.model("user",userSchema);
export default userModel;