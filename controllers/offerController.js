const mongoose = require('mongoose')
const Offer = require('../models/offerModel');
const Variant = require("../models/varientModel")

const loadOffer = async (req, res)=>{
    try {
        const offerData = await Offer.find({})

        res.render('admin/offer',{activeOfferPage: "Active",offerData})
    } catch (error) {
        
    }
}

const addOffer = async (req, res) => {
    try {
        const { offerName, percentage, offerExpired } = req.body;

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
            name: offerName, 
            percentage: percentage, 
            expireDate: offerExpired
        });

        await offer.save();

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
        const { offerName, productId } = req.body;

        console.log(req.body);

        const offer = await Offer.findOne({ name: offerName });
        if (!offer) {
            return res.status(404).json({ error: 'Offer not found' });
        }

        const variants = await Variant.find({ productId });

        for (const variant of variants) {
            if (variant.offerApplied) {
                continue;
            }

            const discountAmount = variant.variantPrice * (offer.percentage / 100);
            const priceAfterOffer = variant.variantPrice - discountAmount;

            variant.offerApplied = true;
            variant.offerDetails = {
                priceAfterOfferApplied: priceAfterOffer,
                offerPercentage: offer.percentage
            };

            console.log('variant.offerDetails',variant.offerDetails,'variant.offerDetails');

            await variant.save();
        }

        offer.offerUsed.push({ productId });
        await offer.save();

        return res.status(200).json({ message: 'Offer Applied' });
    } catch (error) {
        console.error('Error applying offer:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

const removeOffer = async (req, res) => {
    try {
        const { productId } = req.body;

        console.log(req.body);

        const variants = await Variant.find({ productId, offerApplied: true });

        for (const variant of variants) {
            variant.offerApplied = false;
            variant.offerDetails = {
                priceAfterOfferApplied: 0,
                offerPercentage: 0
            };
            await variant.save();
        }

        await Offer.updateMany({ 'offerUsed.productId': productId }, {
            $pull: { offerUsed: { productId: productId } }
        });

        res.status(200).json({ message: 'Offer removed successfully' });
    } catch (error) {
        console.error('Error removing offer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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