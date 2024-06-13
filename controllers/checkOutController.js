const Address = require('../models/addressModel');
const Cart = require('../models/cartModal');
const Order = require('../models/orderModel');
const Variant = require('../models/varientModel');
const User = require('../models/userModel')


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
        const userId = req.session.user_id
        const userData = await User.find({_id:userId})
        res.render('user/successPage',{userData})
    } catch (error) {
        console.log(error);
    }
}


const orders = async (req, res) => {
    try {
        const userId = req.session.user_id;

        const cartData = await Cart.findOne({ userId }).populate({
            path: 'product.productId',
            populate: {
                path: 'varientId'
            }
        });

        if (!cartData) {
            return res.status(404).send('Cart data not found');
        }

        const { selectedAddress, paymentMethod } = req.body;

        const products = Array.isArray(cartData.product) ? cartData.product : [];

        // Create a new order
        const newOrder = new Order({
            userId,
            product: products.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                subTotal: item.subTotal
            })),
            cartTotal: cartData.cartTotal,
            selectedAddress,
            paymentMethod
        });

        await newOrder.save();

        for (const item of products) {
            await Variant.updateOne(
                { _id: item.productId.varientId }, 
                { $inc: { variantQuantity: -item.quantity } }
            );
        }


        // Delete user's cart
        await Cart.deleteOne({ userId });

        res.status(200).send('Order placed successfully');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Failed to place order');
    }
}


module.exports = {
    loadCheckOut,
    loadsuccessPage,
    orders
}