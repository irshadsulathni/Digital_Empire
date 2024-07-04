const mongoose = require('mongoose')

const offerSchma = mongoose.Schema({
    name :{
        type:String,
        required:true
    },
    categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category'
    },
    productId:{
        type:mongoose.Types.ObjectId,
        ref:'Product'
    },
    expireDate:{
        type:Date,
        required:true
    },
    timeStamp:{
        type:Date,
        default:Date.now()
    },
    percentage:{
        type:Number,
        required:true
    }
})

module.exports = mongoose.model('Offer', offerSchma)