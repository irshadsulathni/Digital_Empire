const express = require('express');
const admin_route = express();
const session = require('express-session');
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/adminAuth');
const productController = require('../controllers/productController');
const path = require('path')
const multer = require('multer');
const fs = require('fs')
const varientController = require('../controllers/varientController')

const uploadDirectory = path.join(__dirname, '../public/publicImages');
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// for image uploading using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory)
    },
    filename: (req, file, cb) => {

        const ext = path.extname(file.originalname)
        const uniqueFileName = `image_${Date.now() + Math.round( Math.random() * 100)}${ext}`;
        cb(null, uniqueFileName)
    }

})
const upload = multer({
    storage: storage,
    // fileFilter: (req, file, cb) => {
    //     if (!file.mimetype.match(/^image/)) {
    //         return cb(new Error('Only Image file are Allowed'), false);
    //     }
    //     cb(null, true)
    // }
})

admin_route.use('/publicImages', express.static(path.join(__dirname, '../public/publicImages')));


// for session hendling
admin_route.use(session({ secret: process.env.session_secret }));


admin_route.get('/adminLogin', auth.isLogout, adminController.loadLogin);
admin_route.get('/adminHome', auth.isLogin, adminController.loadAdminHome);
admin_route.get('/userList', auth.isLogin, adminController.loadUserList);
admin_route.get('/category', auth.isLogin, categoryController.loadCategories);
admin_route.get('/category/list', categoryController.listOrUnlist);
admin_route.get('/editCategory', auth.isLogin, categoryController.loadEditcategory);
admin_route.get('/category/deleteCategory', auth.isLogin, categoryController.deletCategory);
admin_route.get('/product', auth.isLogin, productController.loadProduct);
admin_route.get('/adminLogout', auth.isLogin, adminController.adminLogout);
admin_route.get('/addProduct', auth.isLogin, productController.loadAddProduct);
admin_route.get('/product/list', auth.isLogin, productController.listorUnlistOfProduct);
admin_route.get('/editProduct', auth.isLogin, productController.loadEditProduct);
admin_route.get('/varient', auth.isLogin , varientController.loadVarient);
admin_route.get('/product/deleteProduct', auth.isLogin , productController.deleteProduct)

admin_route.post('/adminLogin', adminController.verifyLogin);
admin_route.post('/userList', auth.isLogin, adminController.blockOrUnblockUser);
admin_route.post('/category', auth.isLogin, categoryController.addCategories);
admin_route.post('/category/list', auth.isLogin, categoryController.listOrUnlist);
admin_route.post('/editCategory', auth.isLogin, categoryController.updateCategory);
admin_route.post('/addProduct', auth.isLogin, upload.array('croppedImages', 10), productController.addProduct);
admin_route.post('/product/list', auth.isLogin, productController.listorUnlistOfProduct);
admin_route.post('/editProduct', auth.isLogin, upload.array('productImages', 10), productController.updateProduct)
admin_route.post('/varient', auth.isLogin , varientController.addVarient);



module.exports = admin_route; 