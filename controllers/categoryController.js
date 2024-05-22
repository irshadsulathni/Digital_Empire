const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
const { options } = require('../routes/userRoute');


const loadCategories = async(req,res)=>{
    try {
        const categoryData = await Category.find({})
        res.render('admin/category',{categoryData,activeCategeryMessage:'active'})
    } catch (error) {
        
    }
}
// for adding categery
const addCategories = async(req,res)=>{
    try {
        const name = req.body.categoryName;
        const existCategory = await Category.find({name: { $regex : '.*' + name + '.*', $options:'i'}})
        const categoryData = await Category.find({})
        if(existCategory.length !==0){
            res.render('admin/category', {categoryData,message:'Category is already existed'})
        }
        else{
            const category = new Category({
                name:req.body.categoryName,
                discription:req.body.categoryDescription
            })
            await category.save()
    
            res.render('admin/category',{categoryData} )
        }
    } catch (error) {
        
    }
}
module.exports = {
    loadCategories,
    addCategories
}