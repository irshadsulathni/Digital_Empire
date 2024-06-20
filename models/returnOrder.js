const { default: mongoose } = require("mongoose");

const returnOreder = new mongoose.Schema({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    orderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Orders',
        required:true
    },
    reason:{
        type:String,
        required:true
    },
    timeStamp:{
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model('Return',returnOreder)