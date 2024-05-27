const express = require('express');
const admin_route = express();
const session = require('express-session');
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController')
const auth = require('../middleware/adminAuth');

// for session hendling
admin_route.use(session({secret:process.env.session_secret}));

// Admin Login
admin_route.get('/adminLogin',auth.isLogout,adminController.loadLogin);
admin_route.get('/adminHome', auth.isLogin, adminController.loadAdminHome);
admin_route.get('/userList', auth.isLogin, adminController.loadUserList)

// for catogerie
admin_route.get('/category', auth.isLogin,categoryController.loadCategories)
admin_route.get('/category/list', categoryController.listOrUnlist)
admin_route.get('/editCategory', auth.isLogin,categoryController.loadEditcategory)
admin_route.get('/category/deleteCategory', auth.isLogin, categoryController.deletCategory)
admin_route.get('/product', auth.isLogin, adminController.loadProduct)
admin_route.get('/adminLogout',auth.isLogin, adminController.adminLogout)

admin_route.post('/adminLogin',adminController.verifyLogin);
admin_route.post('/userList', auth.isLogin,adminController.blockOrUnblockUser)
admin_route.post('/category', auth.isLogin,categoryController.addCategories)
admin_route.post('/category/list', auth.isLogin,categoryController.listOrUnlist)
admin_route.post('/editCategory' , auth.isLogin,categoryController.updateCategory)



module.exports = admin_route; 