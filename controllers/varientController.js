const mongoose = require('mongoose')
const Varient = require('../models/varientModel');
const Product = require('../models/productModel');


const loadVarient = async (req, res) => {
    try {
        const productId = req.session.productId;

        const productData = await Product.findOne({ _id: productId });

        res.render('admin/varient', { productId, activeProductMessage: 'active', product: productData })
    } catch (error) {
        console.log(error.message);
    }
}
const addVarient = async (req, res) => {
    try {
        const productId = req.session.productId;

        const { variantPrice, variantQuantity, variantProcessor, variantRAM, variantGPU, variantColor } = req.body;

        if (!variantPrice || isNaN(variantPrice) || variantPrice <= 0) {
            return res.render('admin/varient', { message: 'Price must be a positive number' });
        }
        if (!variantQuantity || isNaN(variantQuantity) || variantQuantity <= 0 || !Number.isInteger(Number(variantQuantity))) {
            return res.render('admin/varient', { message: 'Quantity must be a positive whole number' });
        }
        if (!variantProcessor || variantProcessor.trim() === '') {
            return res.render('admin/varient', { message: 'Processor is required' });
        }
        if (!variantRAM || variantRAM.trim() === '') {
            return res.render('admin/varient', { message: 'RAM is required' });
        }
        if (!variantGPU || variantGPU.trim() === '') {
            return res.render('admin/varient', { message: 'GPU is required' });
        }
        if (!variantColor || variantColor.trim() === '') {
            return res.render('admin/varient', { message: 'Color is required' });
        }

        const variant = new Varient({
            productId,
            variantPrice,
            variantQuantity,
            variantProcessor,
            variantRAM,
            variantGPU,
            variantColor
        });

        await variant.save();
        return res.redirect('/admin/product');
    }
    catch (error) {
        console.error('Error saving variant:', error.message);
        return res.render('admin/varient', { message: 'An error occurred while saving the variant. Please try again.' });
    }
};






module.exports = {
    loadVarient,
    addVarient
}