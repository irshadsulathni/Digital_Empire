const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
const { options } = require('../routes/userRoute');


const loadCategories = async (req, res) => {
    try {
        const categoryData = await Category.find({});
        
        res.render('admin/category', { categoryData, activeCategeryMessage: 'active' })
    } catch (error) {
        console.log(error.message);
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