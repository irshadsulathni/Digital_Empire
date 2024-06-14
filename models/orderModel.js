const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    orderNumber:{
        type:Number
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        subTotal: {
            type: Number
        }
    }],
    selectedAddress:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Address',
        required:true
    },
    paymentMethod:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:'pending'
    },
    timeStamp: {
        type: Date, 
        default: Date.now 
    },
    orderTotal:{
        type:Number,
        required:true
    }
})

module.exports = mongoose.model('Orders',orderSchema)