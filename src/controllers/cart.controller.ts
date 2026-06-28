import type { Request, Response } from "express";
import userModel from "../models/user.model.js";
import cartModel from "../models/carts.model.js";
import itemModel from "../models/items.model.js";

export const addToCart = async (req:Request,res:Response)=>{
    // check session
    // validate user
    // if user does not exists , create user else continue
    // add the cart.items
    // create cart for the user
    const sessionId = req.session.id;
    const userId = req.session.userId;
    const {productId,quantity} = req.body;
    console.log("SessionId:",sessionId);
    console.log("UserId:",userId);  

    
    try {
        if(!sessionId || !productId){
            return res.status(401).json({
                success:false,
                message:"Missing Credentials"
            })
        }
        let currentUserId = userId;
        if(!currentUserId){
            const userCreated = await userModel.create({
                sessionId,
                hasSubscription:false,
                isPro:false
            })
            if(!userCreated){
                return res.status(400).json({
                    success:false,
                    message:"Error creating user"
                })
            }
            currentUserId = userCreated._id;
            req.session.userId = userCreated._id
        }else{
            const userExists = await userModel.findById(currentUserId)
            if(!userExists){
                return res.status(500).json({
                    success:false,
                    message: "Invalid UserId : user does not exists with this userId"
                })
            }
        }

        // find the item first then insert in cart.item
        const item = await itemModel.findById(productId)
        if(!item){
            return res.status(500).json({
                success:false,
                message: "Failed to find item: please verify productId is correct"
            })
        }
        console.log("item found:",item);
        const {productName,_id,price ,category } = item;

        // validate cart , if not exists , create , else continue
        const cartExists = await cartModel.find({userId:currentUserId})        
        console.log("cartExists:",cartExists);
        
        let cartCreated;
        if(cartExists.length ===0){
            cartCreated = await cartModel.create({
                userId:currentUserId,
                items:[
                    {
                        productId:_id,
                        productName,
                        price,
                        category,
                        quantity
                    }
                ],
                totalPrice:price*quantity
            })
            console.log("Cart created",cartCreated);
            
            if(!cartCreated){
                return res.status(500).json({
                    success:false,
                    message: "Failed to Add item in your cart"
                })
            }
        }else{
            cartCreated = await cartModel.updateOne(
                {userId:currentUserId},
                {
                    $push:{
                        items:{
                            productId:_id,
                            productName,
                            price,
                            quantity
                        }
                    },
                    $inc:{
                        totalPrice:price*quantity
                    }
                }
            )
            console.log("cart updated:",cartCreated);            
        }

        return res.status(200).json({
            success:true,
            message: "Successfully Add item in your cart.",
            data:cartCreated
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message: error instanceof Error ? error.message : "Internal Server Error"
        });
    }    
}


export const addToCartBatch = async(req:Request,res:Response)=>{
    const sessionId = req.session.id;
    const userId = req.session.userId;
    const batchItems = req.body;
    console.log("SessionId:",sessionId);
    console.log("UserId:",userId);  

    
    try {
            if (!sessionId || !batchItems || batchItems.length === 0) {
            return res.status(401).json({
                success:false,
                message:"Missing Credentials"
            })
        }
        let currentUserId = userId;
        if(!currentUserId){
            const userCreated = await userModel.create({
                sessionId,
                hasSubscription:false,
                isPro:false
            })
            if(!userCreated){
                return res.status(400).json({
                    success:false,
                    message:"Error creating user"
                })
            }
            currentUserId = userCreated._id;
            req.session.userId = userCreated._id
        }else{
            const userExists = await userModel.findById(currentUserId)
            if(!userExists){
                return res.status(500).json({
                    success:false,
                    message: "Invalid UserId : user does not exists with this userId"
                })
            }
        }

        // find the item first then insert in cart.item

        const productsIds = batchItems.map((item:{productId:string,quantity:number}) => item.productId);
        console.log("All productsIds:",productsIds);

        const items = await itemModel.find({
            _id: {$in:productsIds}
        })
        if(items.length===0){
            return res.status(400).json({
                success:false,
                message:"No products found"
            })
        }
        console.log("items found",items);

        const cartItems = [];
        let totalPrice = 0;

        for(const product of items){
            const batchItem = batchItems.find(
                (item:any)=>item.productId === product._id.toString()
            )
            if(!batchItem) continue;

            const quantity = batchItem.quantity;
            cartItems.push({
                productId: product._id,
                productName: product.productName,
                price: product.price,
                category:product.category,
                quantity: quantity
            });

            totalPrice += product.price * quantity;
        }

        // validate cart , if not exists , create , else continue
        let cart = await cartModel.findOne({ userId: currentUserId });

        if (cart) {
            for (const newItem of cartItems) {
                const existingIndex = cart.items.findIndex(
                    (item: any) => item.productId.toString() === newItem.productId.toString()
                );

                if (existingIndex >= 0) {
                    cart.items[existingIndex]!.quantity += newItem.quantity;
                } else {
                    cart.items.push(newItem);
                }
            }

            cart.totalPrice = cart.items.reduce((sum: number, item: any) => {
                return sum + (item.price * item.quantity);
            }, 0);

            await cart.save();
        } else {
            cart = await cartModel.create({
                userId: currentUserId,
                items: cartItems,
                totalPrice: totalPrice
            });
        }
        return res.status(200).json({
            success:true,
            message: "Successfully Added items in your cart.",
            data:cart
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message: error instanceof Error ? error.message : "Error inserting Batch Items to the cart"
        });
    }
}

export const deleteCartItem = async (req:Request,res:Response)=>{
    // get session from req.session
    // get the userId from req.session.userId
    // get the productId from req.body
    // findAndUpdate the cart using this productId
    // return the cart

    const sessionId = req.session.id;
    const userId = req.session.userId;
    const {productId} = req.body;
    console.log("SessionId:",sessionId);
    console.log("UserId:",userId);  
    console.log("productId:",productId);
    

    try {
        if (!sessionId || !userId || !productId){
        return res.status(401).json({
            success:false,
            message:"Missing Credentials"
        })
        }
        if(userId){
            const updatedCart =  await cartModel.findOneAndUpdate({userId},{
                $pull:{items:{productId:productId}}
            },{returnDocument: 'after'})

            if(!updatedCart){
                return res.status(400).json({
                    success:false,
                    message:"Error deleting item from cart"
                })
            }
            console.log("userFound:",updatedCart);

            // calculating new price

            updatedCart.totalPrice = updatedCart.items.reduce((sum,item)=>{
                return sum + (item.price * item.quantity)
            },0)

            await updatedCart.save()

            return res.status(200).json({
                success:true,
                message:"successfully deleted item from cart",
            })
        }else{
            return res.status(400).json({
                success:false,
                message:"User not found"
            }) 
        }
    } catch (error) {
        return res.status(500).json({
            success:false,
            message: error instanceof Error ? error.message : "Error deleting item from cart"
        });
    }
}