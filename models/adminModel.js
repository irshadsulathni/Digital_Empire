const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    createdAt:{
        type:Date,
        default: Date.now()
    }
}) 

module.exports = mongoose.model('Admin',adminSchema)