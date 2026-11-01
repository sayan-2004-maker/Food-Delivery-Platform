import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
    userId:{type:String,required:true},
    items:{type:Array,required:true},
    amount:{type:Number,required:true},
    deliveryFee:{type:Number,default:0},
    restaurantId:{type:mongoose.Schema.Types.ObjectId, ref:"restaurant", default:null},
    address:{type:Object,required:true},
    status:{type:String,default:"Placed"},
    stripeSessionId:{type:String,default:""},
    data:{type:Date,default:Date.now},   // ✅ FIXED (removed ())
    payment:{type:Boolean,default:false}
}, { timestamps: true })

const orderModel = mongoose.models.order || mongoose.model("order",orderSchema);
export default orderModel;