const mongoose = require('mongoose')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')

const loadProduct = async (req, res) => {
    try {
        const productData = await Product.find({})
        res.render('admin/product', { productData, activeProductMessage: 'active' })

    } catch (error) {
        console.log(error.message);
    }
}
const loadAddProduct = async (req, res) => {
    try {
        const category = await Category.find({})
        res.render('admin/addproduct', {category, activeProductMessage: 'active' })
    } catch (error) {
        console.log(error.message);
    }
}
const addProduct = async (req, res) => {
    try {
        const productData = await Product.find({})
        const { productName, productDiscription, productPrice, productCategory, productStock } = req.body;
console.log(req.body);
        // Validate product name
        if (!productName || productName.trim() === '') {
            return res.render('admin/addProduct', { productData, message: 'Invalid Name' });
        }

        // Validate product description
        if (!productDiscription || productDiscription.trim() === '') {
            return res.render('admin/addProduct', { productData, message: 'Invalid Description' });
        }

        // Validate product price
        if (!productPrice || isNaN(productPrice) || productPrice <= 0) {
            return res.render('admin/addProduct', { productData, message: 'Invalid Price' });
        }

        // Validate product stock
        if (!productStock || isNaN(productStock) || productStock < 0) {
            return res.render('admin/addProduct', { productData, message: 'Invalid Stock' });
        }

        const existProductName = await Product.findOne({ productName: { $regex: new RegExp(`^${productName}$`, 'i') } });

        if (existProductName) {
            res.render('admin/addProduct', { productData, message: 'The Product Name is already existed' })
        }
        else {
            const product = new Product({
                productName: productName,
                productDiscription: productDiscription,
                productPrice: productPrice,
                productQuantity: productStock,
                productCategory:productCategory
            })
            console.log(productCategory);

            await product.save()

            const updateProductData = await Product.find({})

            
            res.render('admin/product', { productData: updateProductData });
        }


    } catch (error) {
        console.log(error.message);
    }
}

const listorUnlistOfProduct = async (req, res) => {
    try {
        const productId = req.body.productId;
        let pro;
        const product = await Product.findById(productId)
       
        if (product){
            pro = await Product.findOneAndUpdate({_id:productId},{ $set: { list: !product.list } })
        }
        res.status(200).json({ success: true })
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadProduct,
    loadAddProduct,
    addProduct,
    listorUnlistOfProduct

}