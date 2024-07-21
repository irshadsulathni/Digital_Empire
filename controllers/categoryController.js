const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
const { options } = require('../routes/userRoute');
const Variant = require('../models/varientModel')
const Product = require('../models/productModel')


const loadCategories = async (req, res) => {
    try {
        // Step 1: Fetch categories
        const categories = await Category.find({});

        // Step 2: Fetch products for these categories
        const categoryIds = categories.map(category => category._id);
        const products = await Product.find({ productCategory: { $in: categoryIds } }).select('_id productCategory');

        // Step 3: Fetch variants for these products
        const productIds = products.map(product => product._id);
        const variants = await Variant.find({ productId: { $in: productIds } }).select('productId offerApplied');

        // Step 4: Determine offer status for each category
        const offerStatusMap = {};
        categories.forEach(category => {
            offerStatusMap[category._id] = false; // Default to false
        });

        variants.forEach(variant => {
            if (variant.offerApplied) {
                const product = products.find(product => product._id.equals(variant.productId));
                if (product) {
                    offerStatusMap[product.productCategory] = true;
                }
            }
        });

        // Step 5: Combine category data with offerApplied status
        const categoryData = categories.map(category => ({
            ...category.toObject(),
            offerApplied: offerStatusMap[category._id] || false
        }));

        // Render the view with combined data
        res.render('admin/category', {
            categoryData,
            activeCategeryMessage: 'active'
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};
// for adding categery

const addCategories = async (req, res) => {
    try {
        const name = req.body.categoryName.trim();
        const discription = req.body.categoryDescription.trim();

        const categoryData = await Category.find({});
        console.log('here is getting');

        if (!name) {
            return res.render('admin/category', { categoryData, message: 'Invalid Name' });
        } else if (name.length <= 4) {
            return res.render('admin/category', { categoryData, message: 'Name must be at least 4 letters' });
        } else if (!discription) {
            return res.render('admin/category', { categoryData, message: 'Enter Description' });
        } else {

            const existCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
            if (existCategory) {
                return res.render('admin/category', { categoryData, message: 'Category already exists' });
            } else {

                const category = new Category({
                    name,
                    discription
                });

                await category.save();

                const updatedCategoryData = await Category.find({});

                return res.render('admin/category', { categoryData: updatedCategoryData });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

// for list and unlisting the category like soft delete
const listOrUnlist = async (req, res) => {
    try {
        const categoryId = req.body.categoryId;
        let cat;
        const categery = await Category.findById(categoryId);
        if (categery) {
            cat = await Category.updateOne({ _id: categoryId }, { $set: { list: !categery.list } });
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
    }
}
// here the editCategory load with name & discription
const loadEditcategory = async (req, res) => {
    try {
        const categoryId = req.query.categoryId;
        const categoryDatas = await Category.findOne({ _id: categoryId });

        if (categoryDatas) {
            res.render('admin/editCategory', { activeCategeryMessage: 'active', category: categoryDatas });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const updateCategory = async (req, res) => {
    try {
        const categoryId = req.query.categoryId;

        const name = req.body.categoryName
        const discription = req.body.categoryDescription
        const categoryData = await Category.find({});

        const categoryDatas = await Category.findOne({ _id: categoryId });
        if (name.trim() == '') {
            res.render('admin/editCategory', { categoryData, message: 'invalid Name', category: categoryDatas });
        }
        else if (discription.trim() == '') {
            res.render('admin/editCategory', { categoryData, message: 'Enter Discription', category: categoryDatas });
        }
        else if (name[0] == '') {
            res.render('admin/editCategory', { categoryData, message: 'Name is invalid', category: categoryDatas });
        }
        else {
            const categoryDatas = await Category.findOneAndUpdate({ _id: categoryId }, {
                $set: {
                    name: name,
                    discription: discription
                }
            });

            res.redirect('/admin/category');
        }

    } catch (error) {
        console.log(error.message);
    }
};

const deletCategory = async (req, res) => {
    try {
        const categoryId = req.query.categoryId;
        await Category.deleteOne({ _id: categoryId });
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    loadCategories,
    addCategories,
    listOrUnlist,
    loadEditcategory,
    updateCategory,
    deletCategory
};