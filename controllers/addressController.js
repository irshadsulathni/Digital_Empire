const Address = require('../models/addressModel')

const loadaddress = async (req, res) => {
    try {
        res.render('user/address')
    } catch (error) {
        console.log(error.message)
    }
}

const addAddress = async (req, res) => {
    try {
        const userId = req.session.user_id;

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
        if(!country){
            return res.state(400).json({ error: 'Country us required'})
        }
        
        const zipRegex = /^[0-9]{6}$/;
        if (!zipRegex.test(zipCode)) {
            return res.status(400).json({ error: 'Invalid Zip Code, Zip Code 6 Number' });
        }

        const address = new Address  ({
            userId:userId,
            fullName:fullName,
            phoneNumber:phoneNumber,
            email:email,
            addressLine1:addressLine1,
            addressLine2:addressLine2,
            landmark:landmark,
            alternative:alternative,
            city:city,
            state:state,
            country:country,
            postalCode:zipCode
        });

      const check =  await address.save();
        if(check){
            return res.status(200).json({success:'success'})
        }
        
    } catch (error) {
        console.log(error.message);
    }
}





module.exports = {
    loadaddress,
    addAddress
}