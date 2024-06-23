    const mongoose = require('mongoose');

    const coupenSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        coupenCode: {
            type: String,
            required: true
        },
        minimumAmount:{
            type:Number,
            required:true
        },
        expired: {
            type: Date,
            required: true
        },
        usersList:[{
            userId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User'
            },
            coupenUsed:{
                type:Boolean,
                default:false
            }
        }]
    }, {
        timestamps: { createdAt: 'createdAt' }
    });

    module.exports = mongoose.model('Coupen', coupenSchema);
