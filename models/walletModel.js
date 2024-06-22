const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    balance:{
        type:Number,
        default: 0 // Set a default value for balance
    },
    history: [{
        type: { type: String, required: true }, 
        amount: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now }, 
        description: { type: String } 
    }]
});

module.exports = mongoose.model('Wallet', walletSchema);
