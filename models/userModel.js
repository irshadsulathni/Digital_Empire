
// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     name:{
//         type:String,
//         require:true
//     },
//     email:{
//         type:String,
//         require:true
//     },
//     mobile:{
//         type:Number,
//         require:true
//     },
//     password:{
//         type:String,
//         require:true
//     },
//     is_verified:{
//         type:Number,
//         require:true
//     },
//     registerDate:{
//         type:Date,
//         default:Date.now()
//     },
//     is_blocked:{
//         type:Number,
//         require:true
//     }
// });

// module.exports = mongoose.model('User',userSchema);


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        default: null // Default to null for users signing in via Google
    },
    password: {
        type: String,
        default: '' // Default empty string or null for users signing in via Google
    },
    is_verified: {
        type: Number,
        required: true,
        default: 0 // Default to 0 for not verified, adjust as needed
    },
    registerDate: {
        type: Date,
        default: Date.now()
    },
    is_blocked: {
        type: Number,
        required: true,
        default: 0 // Default to 0 for not blocked, adjust as needed
    },
    googleId: {
        type: Boolean,
        default: false // Store Google ID if user signs in via Google
    }
});

module.exports = mongoose.model('User', userSchema);
