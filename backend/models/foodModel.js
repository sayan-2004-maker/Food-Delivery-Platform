import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: {type:String,required: true},
    description: {type: String,required: true},
    price:{type:Number, required:true},
    image:{type:String, required:true},
    category:{type:String, required:true},
    restaurantId:{type:mongoose.Schema.Types.ObjectId, ref:"restaurant", default:null, index:true},
    isAvailable:{type:Boolean, default:true},
    vegetarian:{type:Boolean, default:null}
})

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

export default foodModel;