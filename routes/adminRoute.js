const express = require('express');
const admin_route = express();
const session = require('express-session');
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController')
const auth = require('../middleware/adminAuth');

// Admin Login
admin_route.get('/adminLogin',adminController.loadLogin);
admin_route.get('/adminHome', auth.isLogin, adminController.loadAdminHome);
admin_route.get('/userList',  adminController.loadUserList)
// for catogerie
admin_route.get('/category', categoryController.loadCategories)

admin_route.post('/adminLogin',adminController.verifyLogin);
admin_route.post('/userList', adminController.blockOrUnblockUser)
admin_route.post('/category', categoryController.addCategories)


module.exports = admin_route; 