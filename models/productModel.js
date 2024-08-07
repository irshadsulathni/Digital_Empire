const mongoose = require('mongoose')
const Category = require('../models/categoryModel')
const productSchema = new mongoose.Schema({

    productName: {
        type: String,
        required: true
    },
    varientId :{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Variant'
    },
    productDescription:{
        type: String,
        required: true
    },
    productCategory:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required: true
    },
    productImage:{
        type:Array,
        required:true
    },
    productBrand:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    list:{
        type:Boolean,
        default:false
    },
    count:{
        type:Number,
        default:0
    }

})

module.exports = mongoose.model('Product', productSchema)