const mongoose = require('mongoose')
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Variant = require('../models/varientModel');
const fs = require('fs');
const path = require('path')
const Offer = require('../models/offerModel')
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

        const firstPage = 4;

        const currentPage = parseInt(req.query.page) || 1;

        const startPage = (currentPage - 1) * firstPage;
        const productData = await Product.find({}).skip(startPage).limit(firstPage);
        const variantData = await Variant.find({}).skip(startPage).limit(firstPage);

        const count = await Product.countDocuments({});

        const totalPage = Math.ceil(count / firstPage);
        const offerData = await Offer.find({})

        res.render('admin/product', { variantData, productData, activeProductMessage: 'active', totalPage, currentPage,offerData })

    } catch (error) {
        console.log(error.message);
    }
}
const loadAddProduct = async (req, res) => {
    try {
        const productId = req.body.productId
        const product = await Product.findOne({ _id: productId })
        const category = await Category.find({list:false})
        res.render('admin/addproduct', { category, activeProductMessage: 'active', product })
    } catch (error) {
        console.log(error.message);
    }
}

// adding product


const addProduct = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'fill in the fields' })
        }
        const { productName, productDescription, productCategory, productBrand } = req.body;



        const category = await Category.find({})
        const productData = await Product.find({})

        const categeryData = await Category.findOne({ name: productCategory })
        const productImage = req.files.map(file => `/publicImages/${file.filename}`);
        if (!categeryData) {
            res.render('admin/addProduct', { category, message: 'Category not get' })
        }
        else {
            const product = new Product({
                productName: productName,
                productDescription: productDescription,
                productCategory: categeryData._id,
                productImage: productImage,
                productBrand: productBrand
            });
            const savedProduct = await product.save()
            req.session.productId = savedProduct._id;
            const productId = savedProduct._id;
            return res.status(200).json({ id: productId })

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

        req.session.productId = productId

        const productData = await Product.findOne({ _id: productId });

        if (productData) {
            res.render('admin/editProduct', { categoryData, activeProductMessage: 'active', product: productData })
        }
    } catch (error) {
        console.log(error.message);
    }
}


const removeProductImage = async (req, res) => {
    try {
        const productId = req.session.productId;

        const imageUrl = req.body.imageUrl;

        await Product.updateOne({ _id: productId }, { $pull: { productImage: imageUrl } })

        const imagePath = path.join('/Users/irshadsulthani/Desktop/Digital Empire/public', imageUrl);

        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Error during image removal:', err);
                return res.status(500).json({ success: false, message: 'Failed to remove the image' });
            }
            return res.json({ success: true, message: 'Image removed successfully' });
        });
    } catch (error) {
        console.error('Unexpected error:', error.message);
        return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
    }
};

const updateProduct = async (req, res) => {
    try {   

        // const addressCount = await Address.countDocuments({ userId: userId });
        // if (addressCount >= 5) {
        //     return res.status(400).json({ message: 'Maximum address limit reached' });
        // }

        const productId = req.session.productId;


        const product = await Product.findById({ _id: productId })

        if (!productId) {
            throw new Error('Product ID is required');
        }

        const productData = await Product.findOne({ _id: productId });
        if (!productData) {
            throw new Error('Product not found');
        }
        const { productName, productDescription, productCategory } = req.body;

        let productImages = product.productImage;

            if (req.files && req.files.length > 0) {
                const newImages = req.files.map(file => `/publicImages/${file.filename}`);
                productImages = [...productImages, ...newImages];

                if(!productImages.length == 4){
                    return res.status(400).json({error:'A product can have a maximum of 4 images'})
                }
            }

        const category = await Category.findOne({ name: productCategory });
        if (!category) {
            throw new Error('Category not found');
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { _id: productId }, 
            {
                $set: {
                    productName: productName,
                    productDescription: productDescription,
                    productCategory: category._id,
                    productImage: productImages,
                }
            },
            { new: true }
        );

        if (!updatedProduct) {
            throw new Error('Failed to update product');
        }


        return res.status(200).json({ success: 'success' })

    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    }
};


const deleteProduct = async (req, res) => {
    try {

        const { varientId,productId } = req.query
  
        await Product.findOneAndDelete({ _id: productId });
        await Variant.findOneAndDelete({ _id: varientId });

        res.redirect('/admin/product');
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

const loadProductDeatiles = async (req, res) => {
    try {
        const { productId } = req.query;
        const productData = await Product.findOne({ _id: productId }).populate('productCategory').populate('varientId');

        res.render('user/productPage', { productData });
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
    deleteProduct,
    removeProductImage
};