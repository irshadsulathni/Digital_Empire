const Coupen = require('../models/coupenModel');


const loadCoupen = async (req, res) => {
    try {

        const coupenData = await Coupen.find({})

        res.render('admin/coupen', { activeCoupenMessage: 'active',coupen:coupenData})
    } catch (error) {
        console.log(error.message);
    }
}

const checkCouponCode = async (req, res) => {
    try {
        const { coupenCode } = req.body;

        const existingCoupon = await Coupen.findOne({ coupenCode: coupenCode });

        if (existingCoupon) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}


const addCoupen = async (req, res) => {
    try {
        const { coupenName, coupenCode, coupenAmount, coupenExpired, minAmount } = req.body;

        if (!coupenName || typeof coupenName !== 'string' || coupenName.trim() === '') {
            return res.status(400).json({ message: 'Coupon name is required and should be a non-empty string.' })
        }
        if (!coupenCode || !/^[a-zA-Z0-9]+$/.test(coupenCode)) {
            return res.status(400).json({ message: 'Coupon code should be alphanumeric.' });
        }

        const exisitingCoupen = await Coupen.findOne({coupenCode:coupenCode});

        if(exisitingCoupen){
            return res.status(400).json({message:'Coupen code is already in use'})
        }

        if (!coupenAmount || isNaN(coupenAmount) || coupenAmount <= 0) {
            return res.status(400).json({ message: 'Coupon amount should be a positive number.' });
        }
        if (!minAmount || isNaN(minAmount) || minAmount <= 0) {
            return res.status(400).json({ message: 'Coupon amount should be a positive number.' });
        }

        const currentDate = new Date().toISOString().split('T')[0];
        if (!coupenExpired || new Date(coupenExpired) < new Date(currentDate)) {
            return res.status(400).json({ message: 'Coupon expiration date should not be in the past.' });
        }

        const coupen = new Coupen({
            name:coupenName,
            amount:coupenAmount,
            coupenCode:coupenCode,
            expired:coupenExpired,
            minimumAmount:minAmount
        });

        await coupen.save()

        res.status(201).json({ message: 'Coupon created successfully!' });

    } catch (error) {
        console.log(error.message);
    }
}

const deleteCoupen = async (req, res)=>{
    try {
        const { coupenId } = req.query;
        await Coupen.findOneAndDelete({_id:coupenId})

        return res.redirect('/admin/coupen')
    } catch (error) {
        console.log(error.message);
    }
}
/*







          USER SIDE





*/

const applyCoupen = async (req, res) => {
    try {
        const { couponCode,cartTotal } = req.body;

        const coupon = await Coupen.findOne({ coupenCode: couponCode });
        if (!coupon) {
            return res.status(400).json({ success: false, message: 'Invalid coupon code' });
        }

        // Apply coupon logic here (e.g., calculate discount, update order total)

        // Assuming coupon is successfully applied, send a success response
        return res.status(200).json({ success: true, message: 'Coupon applied successfully' });
    } catch (error) {
        // If an error occurs, log it and send an error response
        console.error(error.message);
        return res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
    }
}


module.exports = {
    loadCoupen,
    checkCouponCode,
    addCoupen,
    deleteCoupen,
    applyCoupen
}