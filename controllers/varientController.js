const mongoose = require('mongoose')
const Varient = require('../models/varientModel');
const Product = require('../models/productModel')

const loadVarient = async (req, res) => {
    try {
        const productId = req.query.productId

        const productData = await Product.findOne({ _id: productId });
        
        console.log(productId);
        res.render('admin/varient',{productId, activeProductMessage: 'active', product:productData})
    } catch (error) {
        console.log(error.message);
    }
}




module.exports = {
    loadVarient
}