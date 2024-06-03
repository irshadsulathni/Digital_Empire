const mongoose = require('mongoose')
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Variant = require('../models/varientModel');
const fs = require('fs');
const path = require ('path')
/*********************************************
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 *             its all things in Admin side
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * ***********************************************/



const loadProduct = async (req, res) => {
    try {
        const productData = await Product.find({});
        
        const variantData = await Variant.find({});
       
        res.render('admin/product', {variantData, productData, activeProductMessage: 'active' })

    } catch (error) {
        console.log(error.message);
    }
}
const loadAddProduct = async (req, res) => {
    try {
        const productId = req.body.productId
        const product = await Product.findOne({_id:productId})
        const category = await Category.find({})
        res.render('admin/addproduct', { category, activeProductMessage: 'active' ,product})
    } catch (error) {
        console.log(error.message);
    }
}
const addProduct = async (req, res) => {
    try {
        const category = await Category.find({})
        const productData = await Product.find({})
        const { productName, productDiscription, productCategory,productBrand } = req.body;
        if (!productName || productName.trim() === '') {
            return res.render('admin/addProduct', {category, productData, message: 'Invalid Name' });
        }
        if (!productDiscription || productDiscription.trim() === '') {
            return res.render('admin/addProduct', {category, productData, message: 'Invalid Description' });
        }
        const productImage = req.files.map(file => `/publicImages/${file.filename}`);

        if (productImage.length !== 4) {
            return res.render('admin/addProduct', {category, productData, message: 'You must upload exactly 4 images' });
        }
        if (!productBrand || productBrand.trim() === '') {
            return res.render('admin/addProduct', {category, productData, message: 'Invalid Brand' });
        }

        // const existProductName = await Product.findOne({category, productName: { $regex: new RegExp(`^${productName}$`, 'i') } });

        // if (existProductName) {
        //     res.render('admin/addProduct', {category, productData, message: 'The Product Name is already existed' })
        // }
        else {
            
            const categeryData = await Category.findOne({name:productCategory})

            const category = await Category.find({})
            if(!categeryData){
                res.render('admin/addProduct',{ category, message:'Category not get'})
            }
            else{
                const product = new Product({
                    productName: productName,
                    productDiscription: productDiscription,
                    productCategory: categeryData._id,
                    productImage: productImage,
                    productBrand:productBrand
                });
              const savedProduct =  await product.save()
                req.session.productId = savedProduct._id
              const productId = savedProduct._id;
    
                res.redirect(`/admin/varient?productId=${productId}`);
            }
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

        if (product) {
            pro = await Product.findOneAndUpdate({ _id: productId }, { $set: { list: !product.list } })
        }
        res.status(200).json({ success: true })
    } catch (error) {
        console.log(error.message);
    }
}

const loadEditProduct = async (req, res) => {
    try {
        const categoryData = await Category.find({})

        const productId = req.query.productId;
        
        const productData = await Product.findOne({ _id: productId });

        if(productData){
            res.render('admin/editProduct', {categoryData, activeProductMessage:'active', product:productData})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const updateProduct = async (req, res) => {
    try {
        const categeryData = await Category.find({});
        const productId = req.query.productId;
        const productData = await Product.findOne({ _id: productId });
        const { productName, productDescription, productCategory } = req.body;
        console.log(req.body);

        if (!productName || productName.trim() === '') {
            return res.render('admin/editProduct', { categeryData, message: 'Invalid Name', product: productData });
        }
        if (!productDescription || productDescription.trim() === '') {
            console.log("productDiscription  " + productDescription);
            return res.render('admin/editProduct', { categeryData, message: 'Invalid Description', product: productData });
        }

        // const productImage = req.files.map(file => `/publicImages/${file.filename}`);
        // console.log(productImage);

        console.log(req.files);

        if (productImage.length !== 4) {
            return res.render('admin/editProduct', { categeryData, message: 'You must upload exactly 4 images', product: productData });
        }

        const category = await Category.findOne({name:productCategory})
        console.log('hsdgkhgf jhsdjhfkjhs jkhsdfjhjlsdfhadfsk  jhsjdla')
        console.log(category);
        if (!category) {
            return res.render('admin/editProduct', { categeryData, message: 'Category not found', product: productData });
        }

        // Update the product
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: productId }, // Query
            {
                $set: {
                    productName: productName,
                    productDiscription: productDescription,
                    productCategory: category._id,
                    productImage: productImage,
                }
            },
            { new: true } 
        );

        if (!updatedProduct) {
            return res.render('admin/editProduct', { categeryData, message: 'Failed to update product', product: productData });
        }

        res.redirect('/admin/product');
    } catch (error) {
        console.log(error.message);
    }
};
const deleteProduct = async (req,res) => {
    try {
        const varientId = req.query.varientId;
       
        const productId = req.query.productId;
       
       
        await Product.findOneAndDelete({_id:productId});
        await Variant.findOneAndDelete({_id:varientId});

        res.redirect('/admin/product')
    } catch (error) {
        console.log(error.message)
    }
}


/*********************************************
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 *             its all things in User side
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * ***********************************************/

const loadProductDeatiles = async (req,res) =>{
    try {
        const categoryData = await Category.findOne({});
        const { productId } = req.query;    
        const productData = await Product.findOne({_id:productId});
        const varientData = await Variant.findOne({productId:productId});
        res.render('user/productPage',{productData,varientData,categoryData});
    } catch (error) {
        console.log(error.message);
    }
};




module.exports = {
    loadProduct,
    loadAddProduct,
    addProduct,
    listorUnlistOfProduct,
    loadEditProduct,
    updateProduct,
    loadProductDeatiles,
    deleteProduct
};