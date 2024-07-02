const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Variant = require("../models/varientModel");
const Counter = require("../models/counterModel");
const Cart = require('../models/cartModal');
const { model } = require("mongoose");
const { findOne, populate } = require("../models/userModel");
const Return = require('../models/returnOrder');
const Wallet = require('../models/walletModel');
const Coupen = require('../models/counterModel');
const PDFDocument = require('pdfkit');
const fs = require('fs')
const path = require('path');
const pdfMake = require('pdfmake')


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
            }).sort({_id:-1});

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

const loadReturnOrder = async (req, res)=>{
    try {
        const returnData = await Return.find({})
        .populate({
            path:'from',
            model:'User'
        }).populate('orderId');
        res.render('admin/returnDeatiles',{returnData})
    } catch (error) {
        console.log(error.message);
    }
}

const acceptReturn = async (req, res)=>{
    try {   
        const {  orderId } = req.body

        if(!orderId){
            return res.status(400).json({error:'Order ID is required'})
        }

        const updateOrderStatus = await Order.findOneAndUpdate({_id:orderId},
            {$set:{status:"Refund Accepted"}}
        );


        if(!updateOrderStatus){
            return res.status(404).json({error:'Order not found'})
        }

        res.status(200).json({success:'success'})
        
    } catch (error) {   
        console.log(error.message);
    }
}

const denyReturn = async (req, res)=>{
    try {
        
        const { orderId } = req.body

        if(!orderId){
            return res.status(400).json({error:'Order is not found'})
        }

        const updateDenyStatus = await Order.findOneAndUpdate({_id:orderId},
            {$set: {status:"Denied"}}
        )

        return res.status(200).json({success:'success'})
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



const orders = async (req, res) => {
    try {
        const userId = req.session.user_id;

        const cartData = await Cart.findOne({ userId: userId }).populate({
            path: "product.productId",
            populate: {
                path: "varientId",
            },
        });

        if(cartData.cartTotal > 50000){
            return res.status(500).send({message : "Amount to want use razorpay or Wallet"})
        }

        if (cartData.product.length === 0) {
            return res.status(404).send("Cart data not found");
        }

        // Check for stock availability
        for (const item of cartData.product) {
            if (item.productId && item.productId.varientId) {
                const currentStock = item.productId.varientId.variantQuantity;
                if (item.quantity > currentStock) {
                    const name = item.productId.name;
                    const stock = currentStock;
                    const qty = item.quantity;
                    return res.status(500).send({
                        message: 'Insufficient stock for product', name, stock, qty
                    });
                }
            }
        }

        const { selectedAddress, paymentMethod } = req.body;
        const products = Array.isArray(cartData.product) ? cartData.product : [];

        // Retrieve the discount from the session if applied
        let orderTotal = cartData.cartTotal;
        let discount = req.session.discount || 0;

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
            orderTotal,
            discount,
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


const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.session.user_id;

        const order = await Order.findOne({ _id: orderId });

        // Update order status to "Canceled"
        await Order.findOneAndUpdate(
            { _id: orderId },
            { $set: { status: "Canceled" } }
        );

        // Return the stock to the inventory
        for (const item of order.product) {
            const variant = await Variant.findOne({ productId: item.productId });
            if (variant) {
                variant.variantQuantity += item.quantity;
                await variant.save();
            }
        }

        // Get the payment method from the order
        const paymentMethod = order.paymentMethod;

        if (paymentMethod === 'Razorpay') {
            const total = order.orderTotal;

            let userWallet = await Wallet.findOne({ userId: userId });

            if (!userWallet) {
                userWallet = new Wallet({ userId: userId, balance: 0 });
                console.log('Created new wallet for user:', userWallet);
            } else if (isNaN(userWallet.balance)) {
                userWallet.balance = 0;
                console.log('Invalid balance found. Resetting to 0.');
            }

            userWallet.balance += total;

            userWallet.history.push({
                type: 'Credit',
                amount: total, 
                description: 'Order cancellation refund'
            });

            await userWallet.save();
        } else if(paymentMethod === 'Wallet'){
            let userWallet = await Wallet.findOne({ userId: userId });

            if (!userWallet) {
                userWallet = new Wallet({ userId: userId });
            }

            const totalRefundAmount = order.orderTotal;

            userWallet.balance += totalRefundAmount;

            userWallet.history.push({
                type: "Cancellation",
                amount: totalRefundAmount,
                description: "Order cancellation refund",
            });
            await userWallet.save();
        }
        
        res.status(200).json({ success: "Order canceled successfully" });
    } catch (error) {
        console.error('Error canceling order:', error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};




const updateOrderStatus = async (req, res) =>{
    try {
        const { productId, status } = req.body;

        if(status == 'Delivered'){
      
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
        if (status === 'Canceled') {
            const updatePromises = order.product.map(async (productItem) => {
                const variant = await Variant.findById(productItem.productId.varientId);
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

const returnOrder = async (req, res) =>{
    try {

        const userId = req.session.user_id;
        const { orderId, reason} = req.body;

        await Order.findOneAndUpdate({ _id: orderId }, { status: 'Return Processing' });

        const  returnInstance = new Return ({
            from:userId,
            orderId:orderId,
            reason:reason
        });

        await returnInstance.save()

        return res.status(200).json({message:'Order return requested submitted'})
    } catch (error) {
        console.log(error.message);
    }
}





const fonts = {
    DejaVuSans: {
        normal: path.join(__dirname, '../public/fonts/DejaVuSans.ttf'),
        bold: path.join(__dirname, '../public/fonts/DejaVuSans-Bold.ttf'),
        italics: path.join(__dirname, '../public/fonts/DejaVuSans-Oblique.ttf'),
        bolditalics: path.join(__dirname, '../public/fonts/DejaVuSans-BoldOblique.ttf')
    }
};

const printer = new pdfMake(fonts);

const downloadInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.session.user_id;

        if (!userId) {
            return res.status(400).json({ message: "User Not Found" });
        }

        const order = await Order.findById(orderId)
            .populate('userId')
            .populate({
                path: 'product.productId',
                populate: {
                    path: 'varientId',
                    model: 'Variant'
                }
            })
            .populate('selectedAddress');

        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Helper function to format date
        const formatDate = (date) => {
            const d = new Date(date);
            const day = d.getDate().toString().padStart(2, '0');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const totalPrice = order.product.reduce((sum, product) => sum + product.quantity * product.productId.varientId.variantPrice, 0);
        const discount = order.discount || 0;
        const finalTotal = totalPrice - discount;

        const docDefinition = {
            content: [
                {
                    image: path.join(__dirname, '../public/userAssets/images/icons/new-icon.png'),
                    width: 60,
                },
                {
                    text: 'Digital Empire',
                    style: 'header'
                },
                {
                    text: '\ndigitalempire@gmail.com',
                    style: 'subheader',
                    alignment: 'right'
                },
                {
                    text: `Invoice #${order.orderNumber}`,
                    style: 'invoiceTitle',
                    alignment: 'right'
                },
                {
                    text: `Date: ${formatDate(order.timeStamp)}`,
                    alignment: 'right'
                },
                {
                    text: `Bill To:\n${order.selectedAddress.fullName}\n${order.selectedAddress.addressLine1}\n${order.selectedAddress.city}, ${order.selectedAddress.state}, ${order.selectedAddress.country}`,
                    style: 'customerDetails'
                },
                {
                    text: `Payment Method: ${order.paymentMethod}`,
                    alignment: 'right',
                    margin: [0, 0, 0, 50]
                },
                {
                    style: 'tableExample',
                    table: {
                        body: [
                            ['Product Name', 'Quantity', 'Price (₹)', 'Subtotal (₹)'],
                            ...order.product.map(product => {
                                const productPrice = product.productId.varientId.variantPrice;
                                const subtotal = product.quantity * productPrice;
                                return [
                                    product.productId.productName,
                                    product.quantity,
                                    `₹${productPrice.toFixed(2)}`,
                                    `₹${subtotal.toFixed(2)}`
                                ];
                            }),
                            [{ text: 'Total', colSpan: 3, alignment: 'right' }, {}, {}, `₹${totalPrice.toFixed(2)}`],
                            [{ text: 'Discount', colSpan: 3, alignment: 'right' }, {}, {}, `₹${discount.toFixed(2)}`],
                            [{ text: 'Final Total', colSpan: 3, alignment: 'right' }, {}, {}, `₹${finalTotal.toFixed(2)}`]
                        ]
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 2 : 1;
                        },
                        vLineWidth: function (i, node) {
                            return 0;
                        },
                        paddingBottom: function (i, node) {
                            return 10;
                        }
                    }
                },
                {
                    text: 'Thank you for your business!',
                    style: 'footer'
                },
                {
                    text: 'Payment is due within 30 days. Please make checks payable to Digital Empire.',
                    style: 'footer'
                }
            ],
            defaultStyle: {
                font: 'DejaVuSans'
            },
            styles: {
                header: {
                    fontSize: 20,
                    bold: true
                },
                subheader: {
                    fontSize: 12,
                    margin: [0, 10, 0, 0]
                },
                invoiceTitle: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 20, 0, 0]
                },
                customerDetails: {
                    margin: [0, 20, 0, 20]
                },
                tableExample: {
                    margin: [0, 5, 0, 15]
                },
                total: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 10, 0, 10]
                },
                footer: {
                    margin: [0, 10, 0, 0],
                    fontSize: 10
                }
            }
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const filePath = path.join(__dirname, `../public/userInvoices/invoice-${order.orderNumber}.pdf`);
        
        const writeStream = fs.createWriteStream(filePath);
        pdfDoc.pipe(writeStream);

        pdfDoc.end();

        writeStream.on('finish', () => {
            res.download(filePath, `Digi-invoice-${order.orderNumber}.pdf`, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error downloading the invoice');
                }
                fs.unlinkSync(filePath); // Remove the file after download
            });
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    loadOrder,
    orders,
    cancelOrder,
    adminOrderControl,
    updateOrderStatus,
    returnOrder,
    loadReturnOrder,
    acceptReturn,
    denyReturn,
    downloadInvoice
};
