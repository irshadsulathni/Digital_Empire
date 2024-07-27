const mongoose = require('mongoose')
const Offer = require('../models/offerModel');
const Variant = require("../models/varientModel")
const Product = require('../models/productModel')

const loadOffer = async (req, res)=>{
    try {
        console.log('here  is getting');
        const offerData = await Offer.find({})

        console.log('offerData',offerData,'offerData');

        res.render('admin/offer',{activeOfferPage: "Active",offerData})
    } catch (error) {
        
    }
}

const addOffer = async (req, res) => {
    try {
        const { offerName, percentage, offerExpired,offerType } = req.body;

        console.log('offerType',offerType);

        const existOfferName = await Offer.findOne({name:offerName})

        if(existOfferName){
            return res.status(400).send({error:'The offer name is already used'})
        }

        if (!offerName || !percentage || !offerExpired) {
            return res.status(400).send({ error: 'All fields are required' });
        }

        if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
            return res.status(400).send({ error: 'Percentage must be a number between 1 and 100' });
        }

        const currentDate = new Date().toISOString().split('T')[0];
        if (!offerExpired || new Date(offerExpired) < new Date(currentDate)) {
            return res.status(400).json({ error: 'Offer expiration date should not be in the past.' });
        }

        // creating the offer
        const offer = new Offer({ 
            type:offerType,
            name: offerName, 
            percentage: percentage, 
            expireDate: offerExpired
        });

        await offer.save();

        console.log('offer',offer,'offer');

        res.status(200).send({ message: 'Offer created successfully' });
    } catch (error) {
        console.error(error);  
        res.status(500).send({ error: 'Internal server error' });
    }
};

const deleteOffer = async (req, res)=>{
    try {
        
        const { offerId } = req.query;

        await Offer.findOneAndDelete({_id:offerId})

        return res.redirect('/admin/offer')
    } catch (error) {
        console.log(error.message);
    }
}

// show offer in product listing page 

const getOffer = async (req, res)=>{
    try {
        console.log('here here');
        const offers = await Offer.find({});
        res.json(offers);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const applyOffer = async (req, res) => {
    try {
        const { offerName, productId, categoryId } = req.body;

        console.log('hy hello');

        const offer = await Offer.findOne({ name: offerName });
        if (!offer) {
            return res.status(404).json({ error: 'Offer not found' });
        }

        if (productId) {
            // Apply offer to product variants
            const variants = await Variant.find({ productId });

            for (const variant of variants) {
                if (variant.offerApplied) continue;

                const discountAmount = variant.variantPrice * (offer.percentage / 100);
                const priceAfterOffer = variant.variantPrice - discountAmount;

                variant.offerApplied = true;
                variant.offerDetails = {
                    offerId: offer._id,
                    priceAfterOfferApplied: priceAfterOffer,
                    offerPercentage: offer.percentage
                };

                await variant.save();
            }

            offer.offerUsed.push({ productId });
        } else if (categoryId) {
            console.log('categoryId',categoryId);
            const products = await Product.find({ productCategory: categoryId });
            for (const product of products) {
                const variants = await Variant.find({ productId: product._id });
                for (const variant of variants) {
                    if (variant.offerApplied) continue;

                    const discountAmount = variant.variantPrice * (offer.percentage / 100);
                    const priceAfterOffer = variant.variantPrice - discountAmount;

                    variant.offerApplied = true;
                    variant.offerDetails = {
                        offerId: offer._id,
                        priceAfterOfferApplied: priceAfterOffer,
                        offerPercentage: offer.percentage
                    };

                    await variant.save();
                }
            }
            

            offer.offerUsed.push({ categoryId });
        } else {
            return res.status(400).json({ error: 'Invalid parameters' });
        }

        await offer.save();
        return res.status(200).json({ message: 'Offer Applied Successfully' });
    } catch (error) {
        console.error('Error applying offer:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

const removeOffer = async (req, res) => {
    try {
        const { productId, categoryId } = req.body;

        console.log('here here its here',categoryId);

        // Ensure at least one identifier is provided
        if (!productId && !categoryId) {
            return res.status(400).json({ error: 'Product ID or Category ID must be provided' });
        }

        // Find the offer related to the given productId or categoryId
        const offer = await Offer.findOne({
            'offerUsed.productId': productId,
            'offerUsed.categoryId': categoryId
        });

        if (!offer) {
            return res.status(404).json({ error: 'Offer not found' });
        }

        if (productId) {
            // Remove offer from product variants
            const variants = await Variant.find({ productId });
            for (const variant of variants) {
                if (variant.offerApplied) {
                    variant.offerApplied = false;
                    variant.offerDetails = {};

                    await variant.save();
                }
            }

            offer.offerUsed = offer.offerUsed.filter(used => used.productId.toString() !== productId.toString());
        }

        if (categoryId) {
            // Remove offer from products and their variants
            const products = await Product.find({ productCategory: categoryId });
            for (const product of products) {
                const variants = await Variant.find({ productId: product._id });
                for (const variant of variants) {
                    if (variant.offerApplied) {
                        variant.offerApplied = false;
                        variant.offerDetails = {};

                        await variant.save();
                    }
                }
            }

            offer.offerUsed = offer.offerUsed.filter(used => used.categoryId.toString() !== categoryId.toString());
        }

        // Save the updated offer document
        await offer.save();
        return res.status(200).json({ message: 'Offer Removed Successfully' });

    } catch (error) {
        console.error('Error removing offer:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};


module.exports = {
    loadOffer,
    addOffer,
    deleteOffer,
    getOffer,
    applyOffer,
    removeOffer
}