const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    orderId:{
        type:String
    },
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
    cartTotal:{
        type:Number
    },
    selectedAddress:{
        type:String
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
    }
})

module.exports = mongoose.model('Orders',orderSchema)