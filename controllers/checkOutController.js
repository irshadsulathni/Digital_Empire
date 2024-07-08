const Address = require('../models/addressModel');
const Cart = require('../models/cartModal');
const Order = require('../models/orderModel');
const Variant = require('../models/varientModel');
const User = require('../models/userModel');
const Counter = require('../models/counterModel');
const Product = require('../models/productModel');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Wallet = require('../models/walletModel');
const { error } = require('console');
const { note } = require('pdfkit');
const Coupen = require('../models/coupenModel')

var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
  });


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

        const couponData = await Coupen.find({}).lean(); // Use lean() for better performance
        const userData = await User.findOne({ _id: userId });

        couponData.forEach(coupon => {
            if (!Array.isArray(coupon.usersList)) {
                coupon.usersList = [];
            }
            coupon.usersList.forEach(userCoupon => {
                if (!userCoupon.userId) {
                    userCoupon.userId = null;
                }
            });
        });

        const addressData = await Address.find({ userId: userId });
        res.render('user/checkout', { addressData, cartData, coupons: couponData, userData });
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


// this controller for razorpay

const createOrder = async (req, res) => {
    try {
        function generateReceiptId() {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);
            return `order_rcptid_${timestamp}_${random}`;
        }

        const userId = req.session.user_id;
        const address = req.body.orderData.selectedAddress;
        const productData = await Cart.findOne({ userId });
        if (!productData) {
            return res.status(404).json({ error: "Cart not found" });
        }

        const discount = productData.discount || req.session.discount || 0;
        const amount = productData.cartTotal;
        const currency = 'INR';
        const receipt = generateReceiptId();
        const notes = {
            orderDetails: "T-shirt, Jeans, Shoes",
            customerInfo: "VIP customer, Preferred delivery time: 10 AM - 2 PM",
            transactionContext: "Subscription renewal for Gold plan",
            internalReference: "Order #123456",
            specialInstructions: "Please gift wrap the items"
        };

        const razorpayOrder = await instance.orders.create({
            amount: amount * 100,
            currency: currency,
            receipt: receipt,
            notes: notes
        });

        const cartData = await Cart.findOne({ userId }).populate({
            path: "product.productId",
            populate: { path: "varientId" }
        });

        if (!cartData || cartData.product.length === 0) {
            return res.status(400).json({ error: "Cart is Empty" });
        }

        for (const item of cartData.product) {
            if (item.productId && item.productId.varientId) {
                const currentStock = item.productId.varientId.variantQuantity;
                if (item.quantity > currentStock) {
                    const name = item.productId.name;
                    const stock = currentStock;
                    const qty = item.quantity;
                    return res.status(500).send({ message: 'Insufficient stock for product', name, stock, qty });
                }
            }
        }

        const { selectedAddress, paymentMethod, couponCode } = req.body.orderData;
        const products = Array.isArray(cartData.product) ? cartData.product : [];

        const coupon = await Coupen.findOne({ coupenCode: couponCode });

        if (coupon) {
            coupon.usersList.push({ userId: userId, coupenUsed: true });
            await coupon.save();
        }

        let counter = await Counter.findById("orderNumber");
        if (!counter) {
            counter = new Counter({ _id: "orderNumber", seq: 1000 });
            await counter.save();
        }

        counter.seq++;
        await counter.save();

        const newOrder = new Order({
            userId,
            product: products.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                subTotal: item.subTotal,
                _id: item._id
            })),
            orderTotal: amount,
            discount: discount,
            selectedAddress,
            paymentMethod,
            orderNumber: counter.seq,
            status: 'Confirmed',
            paymentStatus: false,
            timeStamp: new Date(),
            razorpayOrderId: razorpayOrder.id
        });

        const orderData = await newOrder.save();

        res.status(200).json({ orderData, razorpayOrder });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong on our end. Please try again later.' });
    }
};


const paymentFailed = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findOne({ razorpayOrderId: orderId });
        if (order) {
            order.status = 'Payment Pending';
            order.paymentStatus = false;
            await order.save();


            await Cart.deleteOne({ userId: order.userId });

            res.status(200).send('Order status updated to Payment Pending and cart cleared');
        } else {
            res.status(404).send('Order not found');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).send('Internal Server Error');
    }
};

const retryPaymentOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const existingOrder = await Order.findOne({ _id: orderId });

        if (!existingOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const razorpayOrder = await instance.orders.create({
            amount: existingOrder.orderTotal * 100, // Amount in paise
            currency: 'INR',
            receipt: existingOrder.receipt,
            notes: existingOrder.notes
        });

        existingOrder.razorpayOrderId = razorpayOrder.id;
        existingOrder.status = 'Confirmed';
        await existingOrder.save();

        res.status(200).json({ razorpayOrder });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};


const verifyOrder = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const hmac = crypto.createHmac('sha256', process.env.KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature === razorpay_signature) {
            // Update the payment status to true
            const updateOrder = await Order.updateOne(
                { razorpayOrderId: razorpay_order_id },
                { $set: { paymentStatus: true } }
            );
            const orderId = await Order.findOne({razorpayOrderId:razorpay_order_id})

            await Cart.deleteOne({ userId: req.session.user_id });

            res.status(200).json({ message: "Payment verified successfully" ,orderId:orderId._id});
        } else {
            res.status(400).json({ message: "Payment verification failed" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createWalletOrder = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { selectedAddress, paymentMethod, couponCode } = req.body;

        // Fetch user's wallet
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        const cartData = await Cart.findOne({ userId }).populate({
            path: "product.productId",
            populate: { path: "varientId" }
        });
        if (!cartData || cartData.product.length === 0) {
            return res.status(404).json({ error: 'Cart is empty' });
        }

        // Retrieve discount from session
        let discount = req.session.discount || 0;
        let orderTotal = cartData.cartTotal;

        if (wallet.balance < orderTotal) {
            return res.status(400).json({ error: 'Insufficient wallet balance' });
        }

        // Deduct order amount from wallet balance
        wallet.balance -= orderTotal;
        wallet.history.push({ type: 'debit', amount: orderTotal, description: 'Order Payment' });
        await wallet.save();

        const coupon = await Coupen.findOne({ coupenCode: couponCode });

        if (coupon) {
            coupon.usersList.push({ userId: userId, coupenUsed: true });
            await coupon.save();
        }

        // Increment order number from the counter
        let counter = await Counter.findById("orderNumber");
        if (!counter) {
            counter = new Counter({
                _id: "orderNumber",
                seq: 1000,
            });
            await counter.save();
        }

        counter.seq++;
        await counter.save();

        // Create the order with the incremented order number
        const newOrder = new Order({
            userId,
            product: cartData.product.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                subTotal: item.subTotal,
                _id: item._id 
            })),
            orderTotal: orderTotal,
            discount: discount,
            status :'Confirmed',
            selectedAddress,
            paymentMethod,
            orderNumber: counter.seq,
            paymentStatus:true
        });
        const orderData = await newOrder.save();


        // Update product and variant quantities, delete cart items
        for (const item of cartData.product) {
            await Variant.updateOne(
                { _id: item.productId.varientId },
                { $inc: { variantQuantity: -item.quantity } }
            );
            await Product.updateOne(
                { _id: item.productId._id },
                { $inc: { count: item.quantity } }
            );
        }
        await Cart.deleteOne({ userId });

        delete req.session.discount;

        res.status(201).json({ message: 'Order placed successfully', orderId: newOrder._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    loadCheckOut,
    loadsuccessPage,
    createOrder,
    verifyOrder,
    createWalletOrder,
    paymentFailed,
    retryPaymentOrder
}