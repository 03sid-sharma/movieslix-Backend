const mongoose=require('mongoose');
const Joi=require('joi');
const Customer= mongoose.model('Customer',new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minlength:5,
        maxlength:50
    },
    phone:{
        type:Number,
        required:true,
        minlength:10
    },
    isGold:{
        type:Boolean,
        default:false
    }
}));

function validateCustomer(customer){
    const schema={
        name:Joi.string().min(5).max(50).required(),
        phone:Joi.string().min(10).required(),
        isGold:Joi.boolean()
    }
    return Joi.validate(customer,schema);
}
exports.Customer=Customer;
exports.validate=validateCustomer;