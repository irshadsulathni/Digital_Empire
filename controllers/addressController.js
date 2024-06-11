const { query } = require('express');
const Address = require('../models/addressModel');
const User = require('../models/userModel')

const loadaddress = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const userData = await User.findOne({ _id: userId })
        res.render('user/address', { userData })
    } catch (error) {
        console.log(error.message)
    }
}

const addAddress = async (req, res) => {
    try {
        const userId = req.session.user_id;

        const addressCount = await Address.countDocuments({ userId: userId });
        if (addressCount >= 5) {
            return res.status(400).json({ error: 'Maximum address limit reached' });
        }

        const { fullName, phoneNumber, email, addressLine1, addressLine2, landmark, alternative, city, country, state, zipCode } = req.body;

        if (!fullName || fullName.length < 4 || fullName.trim() == '') {
            return res.status(400).json({ error: 'Invalid Name' });
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ error: 'Invalid Phone Number' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid Email' });
        }

        if (!addressLine1) {
            return res.status(400).json({ error: 'Address Line 1 is required' });
        }

        if (!city) {
            return res.status(400).json({ error: 'City is required' });
        }

        if (!state) {
            return res.status(400).json({ error: 'State is required' });
        }
        if (!country) {
            return res.state(400).json({ error: 'Country us required' })
        }

        const zipRegex = /^[0-9]{6}$/;
        if (!zipRegex.test(zipCode)) {
            return res.status(400).json({ error: 'Invalid Zip Code, Zip Code 6 Number' });
        }

        const address = new Address({
            userId: userId,
            fullName: fullName,
            phoneNumber: phoneNumber,
            email: email,
            addressLine1: addressLine1,
            addressLine2: addressLine2,
            landmark: landmark,
            alternative: alternative,
            city: city,
            state: state,
            country: country,
            postalCode: zipCode
        });

        const check = await address.save();
        if (check) {
            return res.status(200).json({ success: 'success' })
        }

    } catch (error) {
        console.log(error.message);
    }
}

const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.query;
        const addressData = await Address.findOneAndDelete({ _id: addressId });

        if (!addressData) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.status(200).json({ message: 'Address Deleted' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'An error occurred while deleting the address' });
    }
};

const loadEditAddress = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { addressId } = req.query;

        req.session.addressId = addressId

        const userData = await User.findOne({ _id: userId });
        const addressData = await Address.findOne({ _id: addressId });


        res.render('user/editAddress', { userData, addressData })
    } catch (error) {
        console.log(error.message);
    }
}

const editAddress = async (req, res) => {
    try {

        const addressId = req.session.addressId;

        const { fullName, phoneNumber, email, addressLine1, addressLine2, landmark, alternative, city, country, state, zipCode } = req.body;

        if (!fullName || fullName.length < 4 || fullName.trim() == '') {
            return res.status(400).json({ error: 'Invalid Name' });
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ error: 'Invalid Phone Number' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid Email' });
        }

        if (!addressLine1) {
            return res.status(400).json({ error: 'Address Line 1 is required' });
        }

        if (!city) {
            return res.status(400).json({ error: 'City is required' });
        }

        if (!state) {
            return res.status(400).json({ error: 'State is required' });
        }

        if (!country) {
            return res.status(400).json({ error: 'Country is required' });
        }

        const zipRegex = /^[0-9]{6}$/;
        if (!zipRegex.test(zipCode)) {
            return res.status(400).json({ error: 'Invalid Zip Code, Zip Code must be 6 digits' });
        }

        const updateAddress = await Address.findOneAndUpdate({ _id: addressId }, {
            $set: {
                fullName: fullName,
                phoneNumber: phoneNumber,
                addressLine1: addressLine1,
                addressLine2: addressLine2,
                landmark: landmark,
                alternative: alternative,
                city: city,
                state: state,
                country: country,
                postalCode: zipCode
            }
        });

        if (!updateAddress) {
            return res.status(404).json({ error: 'Address not found' });
        }

        return res.status(200).json({ success: 'success' });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};






module.exports = {
    loadaddress,
    addAddress,
    deleteAddress,
    loadEditAddress,
    editAddress
}