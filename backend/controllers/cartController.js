import userModel from "../models/userModel.js"
import foodModel from "../models/foodModel.js"

// add items to user cart 
const addToCart = async (req,res) => {
    try {
        const { itemId } = req.body;
        const food = await foodModel.findById(itemId);
        if (!food || !food.restaurantId || food.isAvailable === false) {
            return res.status(404).json({ success: false, message: "This menu item is unavailable" });
        }
        const userData = await userModel.findById(req.body.userId);
        if (!userData) return res.status(404).json({ success: false, message: "User not found" });
        const cartData = { ...userData.cartData };
        const currentIds = Object.keys(cartData).filter((id) => cartData[id] > 0);
        if (currentIds.length) {
            const existingFoods = await foodModel.find({ _id: { $in: currentIds } }).select("restaurantId").lean();
            if (existingFoods.some((item) => String(item.restaurantId) !== String(food.restaurantId))) {
                return res.status(409).json({ success: false, switchRequired: true, message: "Your cart contains food from another restaurant" });
            }
        }

        if(!cartData[itemId]) {
            cartData[itemId] = 1
        }
        else{
            cartData[itemId] += 1;
        }

        await userModel.findByIdAndUpdate(req.body.userId,{cartData});
        return res.json({success:true,message:"Added To Cart"});
    } catch (error) {
        console.error("ADD CART ERROR:", error.message);
        return res.status(500).json({success:false,message:"Unable to update cart"});
    }
}


// remove items from user cart 
const removeFromCart = async (req,res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        if (!userData) return res.status(404).json({ success: false, message: "User not found" });
        let cartData = { ...userData.cartData };

        if (!cartData[req.body.itemId]) {
            return res.json({success:true,message:"Item not in cart"});
        }

        if (cartData[req.body.itemId] > 0) {
            cartData[req.body.itemId] -= 1;
        }

        if (cartData[req.body.itemId] === 0) {
            delete cartData[req.body.itemId];
        }

        await userModel.findByIdAndUpdate(req.body.userId,{cartData});
        return res.json({success:true,message:"Removed From Cart"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}


// fetch user cart data
const getCart = async (req,res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        if (!userData) return res.status(404).json({ success: false, message: "User not found" });
        let cartData = userData.cartData;
        res.json({success:true,cartData})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

const clearCart = async (req, res) => {
    try {
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
        return res.json({ success: true, message: "Cart cleared" });
    } catch (error) {
        console.error("CLEAR CART ERROR:", error.message);
        return res.status(500).json({ success: false, message: "Unable to clear cart" });
    }
};

export {addToCart,removeFromCart,getCart,clearCart}