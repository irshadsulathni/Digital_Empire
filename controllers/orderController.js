const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Variant = require("../models/varientModel");
const Counter = require("../models/counterModel");
const Cart = require('../models/cartModal');
const { model } = require("mongoose");
const { findOne, populate } = require("../models/userModel");

const loadOrder = async (req, res) => {
    try {
        const firstPage = 6;
        let currentPage = parseInt(req.query.page) || 1;
        currentPage = Math.max(1, currentPage); // Ensure currentPage is at least 1
        const startPage = (currentPage - 1) * firstPage;

        const count = await Order.countDocuments({});
        const totalPage = Math.ceil(count / firstPage);

        const orderData = await Order.find({})
            .skip(startPage)
            .limit(firstPage)
            .populate({
                path: 'userId',
                model: 'User'
            })
            .populate({
                path: 'product.productId',
                model: 'Product',
                populate: {
                    path: 'varientId',
                    model: 'Variant'
                }
            });

        res.render('admin/order', { activeOrderMessage: 'active',orderData,totalPage,currentPage });
    } catch (error) {
        console.log(error.message);
    }
}


const adminOrderControl = async (req, res)=>{
    try {
      const { orderId } = req.query;

      const orderData = await Order.findOne({_id:orderId}).populate({
        path:'userId',
        model:'User'
      }).populate('selectedAddress')
      .populate({
        path:'product.productId',
        model:'Product',
        populate:{
            path:'varientId',
            model:'Variant'
        }
        
      })

        res.render('admin/orderDeatail',{orderData:orderData})
    } catch (error) {
        console.log(error.message);
    }
} 













/***********************************************
 *
 *
 *
 *
 *
 *
 *
 *                   User Side
 *
 *
 *
 *
 *
 *
 *
 * ********************************************/

// const orders = async (req, res) => {
//     try {
//         console.log('its coming');
//         const userId = req.session.user_id;

//         const cartData = await Cart.findOne({ userId:userId }).populate({
//             path: "product.productId",
//             populate: {
//                 path: "varientId",
//             },
//         });

//         console.log('cart ',cartData);

//         // const currentStock = cartData.product.productId.varientId.variantQuantity;

//         console.log('stock ',cartData.product._id);

//         if (!cartData) {
//             return res.status(404).send("Cart data not found");
//         }

//         const { selectedAddress, paymentMethod } = req.body;

//         const products = Array.isArray(cartData.product) ? cartData.product : [];

//         let counter = await Counter.findById("orderNumber");
//         if (!counter) {
//             counter = new Counter({
//                 _id: "orderNumber",
//                 seq: 1000,
//             });
//             await counter.save();
//         }

//         counter.seq++;
//         await counter.save();

//         const newOrder = new Order({
//             userId,
//             product: products.map((item) => ({
//                 productId: item.productId,
//                 quantity: item.quantity,
//                 subTotal: item.subTotal,
//             })),
//             orderTotal: cartData.cartTotal,
//             selectedAddress,
//             paymentMethod,
//             orderNumber: counter.seq,
//         });

//         const orderData = await newOrder.save();

//         for (const item of products) {
//             await Variant.updateOne(
//                 { _id: item.productId.varientId },
//                 { $inc: { variantQuantity: -item.quantity } }
//             );
//             // for getting product count
//             await Product.updateOne(
//                 { _id: item.productId },
//                 { $inc: { count: item.quantity } }
//             );
//         }

//         await Cart.deleteOne({ userId });

//         res
//             .status(200)
//             .json({ message: "Order placed successfully", orderId: orderData._id });
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).send("Failed to place order");
//     }
// };

const orders = async (req, res) => {
    try {
        const userId = req.session.user_id;

        const cartData = await Cart.findOne({ userId: userId }).populate({
            path: "product.productId",
            populate: {
                path: "varientId",
            },
        });

        if (!cartData) {
            return res.status(404).send("Cart data not found");
        }

        for (const item of cartData.product) {
            if (item.productId && item.productId.varientId) {
                const currentStock = item.productId.varientId.variantQuantity;
                if (item.quantity > currentStock) {
                    const name = item.productId.name;
                    const stock = currentStock;
                    const qty = item.quantity;
                    return res.status(500).send({
                        message: 'Insufficient stock for product' ,name,stock,qty
                    });
                }
            }
        }

        const { selectedAddress, paymentMethod } = req.body;

        const products = Array.isArray(cartData.product) ? cartData.product : [];

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

        const newOrder = new Order({
            userId,
            product: products.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                subTotal: item.subTotal,
            })),
            orderTotal: cartData.cartTotal,
            selectedAddress,
            paymentMethod,
            orderNumber: counter.seq,
        });

        const orderData = await newOrder.save();

        for (const item of products) {
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

        res.status(200).json({ message: "Order placed successfully", orderId: orderData._id });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Failed to place order");
    }
};



const cancelOreder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({ _id: orderId });

        const statusUpdation = await Order.findOneAndUpdate(
            { _id: orderId },
            { $set: { status: "Canceled" } }
        );

        for (const item of order.product) {
            const variant = await Variant.findOne({ productId: item.productId });
            if (variant) {
                variant.variantQuantity += item.quantity;
                await variant.save();
            }
        }

        res.status(200).json({ success: "success" });
    } catch (error) {
        console.log(error.message);
    }
};

const updateOrderStatus = async (req, res) =>{
    try {
        const { productId, status } = req.body;

        if(status == 'delivered'){
      
        const order = await Order.findOneAndUpdate({_id:productId},{ status }, { new: true });
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json({ message: 'Order status updated successfully', order });
    }
    else {
        const order = await Order.findById(productId).populate('product.productId');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
console.log('order:::',order);
        if (status === 'Canceled') {
            const updatePromises = order.product.map(async (productItem) => {
                const variant = await Variant.findById(productItem.productId.varientId);
                ;console.log('variant:',variant);
                if (variant) {
                    variant.variantQuantity += productItem.quantity;
                    await variant.save();
                }
            });

            await Promise.all(updatePromises);
        }

        order.status = status;
        await order.save();

        res.status(200).json({ message: 'Order status updated successfully', order });
       
    }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

module.exports = {
    loadOrder,
    orders,
    cancelOreder,
    adminOrderControl,
    updateOrderStatus
};
