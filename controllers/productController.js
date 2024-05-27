const Product = require('../models/productModel')
const Category = require('../models/categoryModel')

const loadProduct = async (req,res) => {
    try {
        res.render('admin/product', {activeProductMessage:'active'})

    } catch (error) {
        console.log(error.message);
    }
}
const loadAddProduct = async (req,res) => {
    try {
        res.render('admin/addproduct',{activeProductMessage:'active'})
    } catch (error) {
        console.log(error.message);
    }
}
const addProduct = async (req,res) => {
    try {
        const {productName,productDiscriprion,productPrice,productCateory,productStock} = req.body;
        if(productName.trim() == ''){
            res.render('admin/addProduct',{message:'Invalid Name'})
        }
        
        res.render('admin/product',{activeProductMessage:'active'})
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadProduct,
    loadAddProduct,
    addProduct
    
}