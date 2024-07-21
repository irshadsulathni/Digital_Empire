const mongoose = require('mongoose')
const Coupen = require('../models/coupenModel');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModal');


const loadCoupen = async (req, res) => {
    try {

        const coupenData = await Coupen.find({})

        res.render('admin/coupen', { activeCoupenMessage: 'active', coupen: coupenData })
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

        const exisitingCoupen = await Coupen.findOne({ coupenCode: coupenCode });

        if (exisitingCoupen) {
            return res.status(400).json({ message: 'Coupen code is already in use' })
        }

        if (!coupenAmount || isNaN(coupenAmount) || coupenAmount <= 0) {
            return res.status(400).json({ message: 'Coupon amount should be a positive number.' });
        }
        if (!minAmount || isNaN(minAmount) || minAmount <= 0) {
            return res.status(400).json({ message: 'Coupon amount should be a positive number.' });
        }
        
        if(minAmount <= coupenAmount){
            return res.status(400).json({ message:'the min amount and coupen amount same please select large amout' })
        }

        const currentDate = new Date().toISOString().split('T')[0];
        if (!coupenExpired || new Date(coupenExpired) < new Date(currentDate)) {
            return res.status(400).json({ message: 'Coupon expiration date should not be in the past.' });
        }

        const coupen = new Coupen({
            name: coupenName,
            amount: coupenAmount,
            coupenCode: coupenCode,
            expired: coupenExpired,
            minimumAmount: minAmount
        });

        await coupen.save()

        res.status(201).json({ message: 'Coupon created successfully!' });

    } catch (error) {
        console.log(error.message);
    }
}

const deleteCoupen = async (req, res) => {
    try {
        const { coupenId } = req.query;
        await Coupen.findOneAndDelete({ _id: coupenId })

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
        const userId = req.session.user_id;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID not found in session' });
        }

        const { couponCode, cartTotal } = req.body;

        const coupon = await Coupen.findOne({ coupenCode: couponCode });

        if (!coupon) {
            return res.status(400).json({ success: false, message: 'Invalid coupon code' });
        }

        const currentDate = new Date();
        if (currentDate > coupon.expired) {
            return res.status(400).json({ success: false, message: 'Coupon has expired' });
        }

        if (cartTotal < coupon.minimumAmount) {
            return res.status(400).json({ success: false, message: `Minimum cart total of ₹${coupon.minimumAmount} required to apply this coupon` });
        }

        const userCouponIndex = coupon.usersList.findIndex(userCoupon => userCoupon.userId && userCoupon.userId.equals(userId));
        if (userCouponIndex !== -1) {
            return res.status(400).json({ success: false, message: 'Coupon already used' });
        }

        const discount = coupon.amount;
        const newCartTotal = cartTotal - discount;

        // Update cart with new total and discount
        await Cart.updateOne({ userId: userId }, { $set: { cartTotal: newCartTotal, discount: discount } });

        // Store discount in session
        req.session.discount = discount;

        return res.status(200).json({
            success: true,
            message: 'Coupon applied successfully!',
            cartTotal: newCartTotal,
            total: newCartTotal,
            discount: discount
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
    }
};






// const removeCoupon = async (req, res) => {
//     try {
//         const userId = req.session.user_id;
//         const { cartTotal } = req.body;

//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//             return res.status(400).json({ success: false, message: 'Invalid user ID' });
//         }

//         const coupon = await Coupen.findOne({ 'usersList.userId': userId });

//         if (!coupon) {
//             return res.status(400).json({ success: false, message: 'Coupon not found for this user' });
//         }

//         const userCouponIndex = coupon.usersList.findIndex(userCoupon => userCoupon.userId.equals(userId));
//         if (userCouponIndex === -1) {
//             return res.status(400).json({ success: false, message: 'Coupon not found for this user' });
//         }

//         const discount = coupon.amount;

//         // Remove the user from the usersList
//         coupon.usersList.splice(userCouponIndex, 1);

//         await coupon.save();

//         const newCartTotal = cartTotal + discount;
//         const total = newCartTotal;

//         return res.status(200).json({
//             success: true,
//             message: 'Coupon removed successfully!',
//             cartTotal: newCartTotal,
//             total: total,
//             discount: discount
//         });
//     } catch (error) {
//         console.error('Error removing coupon:', error.message);
//         return res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
//     }
// }




module.exports = {
    loadCoupen,
    checkCouponCode,
    addCoupen,
    deleteCoupen,
    applyCoupen,
    // removeCoupon
}