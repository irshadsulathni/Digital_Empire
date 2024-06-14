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

        const productData = await Product.findOne({_id: productId});

        const { variantPrice, variantQuantity, variantProcessor, variantRAM, variantGPU, variantColor } = req.body;

        if (!variantPrice || isNaN(variantPrice) || variantPrice <= 0) {
            return res.status(400).json({ error: 'Price must be a positive number' });
        }
        if (!variantQuantity || isNaN(variantQuantity) || variantQuantity <= 0 || !Number.isInteger(Number(variantQuantity))) {
            return res.status(400).json({ error: 'Quantity must be a positive whole number' });
        }
        if (!variantProcessor || variantProcessor.trim() === '') {
            return res.status(400).json({ error: 'Processor is required' });
        }
        if (!variantRAM || variantRAM.trim() === '') {
            return res.status(400).json({ error: 'RAM is required' });
        }
        if (!variantGPU || variantGPU.trim() === '') {
            return res.status(400).json({ error: 'GPU is required' });
        }
        if (!variantColor || variantColor.trim() === '') {
            return res.status(400).json({ error: 'Color is required' });
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

        const savedVarient = await variant.save();

        productData.varientId = savedVarient._id;

        await productData.save();

        return res.status(200).json({ success: 'success' });
    } catch (error) {
        console.error('Error saving variant:', error.message);
        return res.status(500).json({  message: 'An error occurred while saving the variant. Please try again.' });
    }
};



const loadEditVarient = async (req, res) =>{
    try {
        
        const varientId = req.query.varientId;

        const varientData = await Varient.findById(varientId);

        res.render('admin/editVarient',{varientData})

    } catch (error) {
        console.log(error);
    }
}

const updateVarient = async (req, res) => {
    try {
        const varientId = req.query.varientId.trim();

        const {
            variantPrice,
            variantQuantity,
            variantProcessor,
            variantRAM,
            variantGPU,
            variantColor
        } = req.body;

        if (!variantProcessor || variantProcessor.trim() === '') {
            return res.status(400).json({fail:"Processor information is required and must be a non-empty string."})
        }

        if (!variantRAM ||  variantRAM.trim() === '') {
            return res.status(200).json({fail:"RAM information is required and must be a non-empty string."})
        }

        if (!variantGPU ||  variantGPU.trim() === '') {
            return res.status(200).json({fail:"GPU information is required and must be a non-empty string."})
        }

        if (!variantColor || variantColor.trim() === '') {
            return res.status(200).json({fail:"Color information is required and must be a non-empty string."})
        }
        if (variantPrice === undefined  || variantPrice <= 0) {
            return res.status(200).json({fail:"Price must be a positive number."});
        }

        if (variantQuantity === undefined  || variantQuantity < 0) {
            return res.status(200).json({fail:"Quantity must be a non-negative number."})
        }

        const saveVarient = await Varient.findOneAndUpdate({_id:varientId},{
            variantColor:variantColor,
            variantPrice:variantPrice,
            variantGPU:variantGPU,
            variantProcessor:variantProcessor,
            variantRAM:variantRAM,
            variantQuantity:variantQuantity
        })

       return res.status(200).json({success:'success'})
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while updating the variant." });
    }
}



module.exports = {
    loadVarient,
    addVarient,
    loadEditVarient,
    updateVarient
}