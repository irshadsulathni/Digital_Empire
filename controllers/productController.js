const mongoose = require('mongoose')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
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
        const productData = await Product.find({})
        res.render('admin/product', { productData, activeProductMessage: 'active' })

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
        // Validate product name
        if (!productName || productName.trim() === '') {
            return res.render('admin/addProduct', {category, productData, message: 'Invalid Name' });
        }

        // Validate product description
        if (!productDiscription || productDiscription.trim() === '') {
            return res.render('admin/addProduct', {category, productData, message: 'Invalid Description' });
        }
        // image adding the product
        const productImage = req.files.map(file => `/publicImages/${file.filename}`);

        if (productImage.length !== 4) {
            return res.render('admin/addProduct', {category, productData, message: 'You must upload exactly 4 images' });
        }

        // const existProductName = await Product.findOne({category, productName: { $regex: new RegExp(`^${productName}$`, 'i') } });

        // if (existProductName) {
        //     res.render('admin/addProduct', {category, productData, message: 'The Product Name is already existed' })
        // }
        else {
            
            const categeryData = await Category.findOne({name:productCategory})
            console.log(categeryData);

            console.log(categeryData._id);
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
        const productId = req.query.productId;

        const {productName, productDiscription, productPrice, productQuantity,productCategory} = req.body;

        if(productName.trim()==''){
            res.render('admin/editCategory',{message:'Invalid Name'})
        }

        res.redirect('admin/product')
    } catch (error) {
        
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

module.exports = {
    loadProduct,
    loadAddProduct,
    addProduct,
    listorUnlistOfProduct,
    loadEditProduct,
    updateProduct

}