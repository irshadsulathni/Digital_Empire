const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    discription:{
        type:String,
        require:true
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    list:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model('Category',categorySchema)