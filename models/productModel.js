const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({

    productName: {
        type: String,
        required: true
    },
    productDiscription:{
        type: String,
        required: true
    },
    productCategory:{
        type: String,
        required: true
    },
    productPrice:{
        type:Number,
        required:true
    },
    productImage:{
        type:Array,
        required:true
    },
    productQuantity:{
        type:Number,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }

})

module.exports = mongoose.model('Product', productSchema)