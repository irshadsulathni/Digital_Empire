const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
const { options } = require('../routes/userRoute');


const loadCategories = async (req, res) => {
    try {
        const categoryData = await Category.find({})
        res.render('admin/category', { categoryData, activeCategeryMessage: 'active' })
    } catch (error) {

    }
}
// for adding categery
const addCategories = async (req, res) => {
    try {
        const name = req.body.categoryName;
        const existCategory = await Category.find({ name: { $regex: '.*' + name + '.*', $options: 'i' } })
        const categoryData = await Category.find({})
        if (existCategory.length !== 0) {
            res.render('admin/category', { categoryData, message: 'Category is already existed' })
        }
        else {
            const category = new Category({
                name: req.body.categoryName,
                discription: req.body.categoryDescription
            })
            await category.save()

            res.redirect('/admin/category')
        }
    } catch (error) {

    }
}
// for list and unlisting the category like soft delete
const listOrUnlist = async (req, res) => {
    try {
        const categoryId = req.body.categoryId;
        let cat;
        const categery = await Category.findById(categoryId);
        if (categery) {
            cat = await Category.updateOne({ _id: categoryId }, { $set: { list: !categery.list } })
        }
        res.status(200).json({ success:true });
    } catch (error) {
        console.log(error);
    }
}

const loadEditcategory = async(req,res)=>{
    try {
        
        res.render('admin/editCategory')
    } catch (error) {
        console.log(error);
    }
}

const updateCategory = async (req,res)=>{
    try {
        
        const categeryId = req.body._id
    } catch (error) {
        
    }
}
module.exports = {
    loadCategories,
    addCategories,
    listOrUnlist,
    loadEditcategory,
    updateCategory
}