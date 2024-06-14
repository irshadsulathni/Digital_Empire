const Address = require('../models/addressModel');
const Cart = require('../models/cartModal');
const Order = require('../models/orderModel');
const Variant = require('../models/varientModel');
const User = require('../models/userModel');
const Counter = require('../models/counterModel');
const Product = require('../models/productModel')


const loadCheckOut = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const cartData = await Cart.findOne({ userId: userId })
            .populate({
                path: 'product.productId',
                populate: {
                    path: 'varientId'
                }
            });
        const addressData = await Address.find({ userId: userId });
        res.render('user/checkout', { addressData, cartData })
    } catch (error) {
        console.log(error);
    }
}

const loadsuccessPage = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const {orderId} = req.query;
        const userData = await User.findOne({_id:userId})
        const orderData = await Order.findOne({_id:orderId})

        res.render('user/successPage',{userData:userData,orderData:orderData})
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    loadCheckOut,
    loadsuccessPage,

}