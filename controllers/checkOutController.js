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

        let counter = await Counter.findById('orderNumber');
        if (!counter) {
            counter = new Counter({
                _id: 'orderNumber',
                seq: 1000 
            });
            await counter.save();
        }

        counter.seq++;
        await counter.save();

        const newOrder = new Order({
            userId,
            product: products.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                subTotal: item.subTotal
            })),
            orderTotal: cartData.cartTotal,
            selectedAddress,
            paymentMethod,
            orderNumber: counter.seq  
        });


        const orderData = await newOrder.save();

        for (const item of products) {
            await Variant.updateOne(
                { _id: item.productId.varientId }, 
                { $inc: { variantQuantity: -item.quantity  } }
            );
            await Product.updateOne(
                {_id:item.productId},
                { $inc: { count: item.quantity }}
            )
        }

        await Cart.deleteOne({ userId });

        res.status(200).json({message:'Order placed successfully',orderId:orderData._id});
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Failed to place order');
    }
};

const cancelOreder = async (req, res) =>{
    try {
        console.log('ht');
        console.log(req.params);
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadCheckOut,
    loadsuccessPage,
    orders,
    cancelOreder
}