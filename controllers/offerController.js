const mongoose = require('mongoose')
const Offer = require('../models/offerModel')

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
        // Backend validation
        if (!offerName || !percentage || !offerExpired) {
            return res.status(400).send({ error: 'All fields are required' });
        }

        if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
            return res.status(400).send({ error: 'Percentage must be a number between 1 and 100' });
        }

        // Create the offer if validation passes
        const offer = new Offer({ 
            name: offerName, 
            percentage: percentage, 
            expireDate: offerExpired
        });

        await offer.save();

        res.status(200).send({ message: 'Offer created successfully' });
    } catch (error) {
        console.error(error);  // Add this line
        res.status(500).send({ error: 'Internal server error' });
    }
};




module.exports = {
    loadOffer,
    addOffer
}