const mongoose = require('mongoose');

// Define the variant schema
const variantSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    variantPrice: {
        type: Number,
        required: true
    },
    variantQuantity: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    variantProcessor: {
        type: String,
        required: true
    },
    variantRAM: {
        type: String,
        required: true
    },
    variantGPU: {
        type: String,
        required: true
    },
    variantColor: {
        type: String,
        required: true
    },
    offerApplied: {
        type: Boolean,
        default: false 
    },
    offerDetails: {
        priceAfterOfferApplied: {
            type: Number,
            default: 0
        },
        offerPercentage: {
            type: Number,
            default: 0
        }
    }
});

module.exports = mongoose.model('Variant', variantSchema);
