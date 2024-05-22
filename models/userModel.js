
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    mobile:{
        type:Number,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    is_verified:{
        type:Number,
        require:true
    },
    registerDate:{
        type:Date,
        default:Date.now()
    },
    is_blocked:{
        type:Number,
        require:true
    }
}) 

module.exports = mongoose.model('User',userSchema)