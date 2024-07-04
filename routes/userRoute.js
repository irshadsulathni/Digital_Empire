const express = require('express');
const user_route = express();
const session = require('express-session');
const userController = require('../controllers/userController');
const auth = require('../middleware/userAuth');
const passport = require('passport');
require('../passport');
const productController =  require('../controllers/productController');
const addressController = require('../controllers/addressController');
const forgetPasswordControll = require('../controllers/forgetPasswordControll');
const cartController = require('../controllers/cartController');
const checkOutController = require('../controllers/checkOutController');
const orderController = require('../controllers/orderController');
const wishlistController = require('../controllers/wishlistController');
const coupenController = require('../controllers/coupenController')

user_route.use(session({secret:process.env.SESSION_SCECRET}));
user_route.use(passport.initialize());
user_route.use(passport.session());


//user signIn & SignUp
user_route.get('/signUp', auth.isLogout, userController.loadSignUp);
user_route.post('/signIn', auth.isLogout, userController.addUser);
user_route.post('/signUp', userController.verifyLogin);


// user home page things
user_route.get('/dashboard' , auth.isLogin,userController.loadDashBoard);
user_route.get('/',userController.loadHome);
user_route.get('/about',auth.isLogin, userController.loadAbout);
user_route.get('/faq',  userController.loadFAQ);
user_route.get('/signIn', auth.isLogout,userController.loadsignIn);;
user_route.get('/shop', userController.loadShop);
user_route.get('/productPage', productController.loadProductDeatiles);
user_route.get('/howShop', userController.loadHowShop);
user_route.get('/address' ,auth.isLogin, addressController.loadaddress );
user_route.delete('/dashboard/deleteAddress', auth.isLogin, addressController.deleteAddress);
user_route.get('/editAddress', auth.isLogin, addressController.loadEditAddress);

// order
user_route.post('/orders', auth.isLogin, orderController.orders);
user_route.get('/orderTracking', auth.isLogin, userController.loadOrderTracking );
user_route.post('/cancelOrder/:orderId', auth.isLogin , orderController.cancelOrder);
user_route.post('/returnOrder', auth.isLogin, orderController.returnOrder);
// invoice Download

user_route.get('/downloadInvoice/:orderId', auth.isLogin , orderController.downloadInvoice)

// wishlist
user_route.get('/wishlist', auth.isLogin ,wishlistController.loadWishlist);
user_route.post('/addTowishlist', auth.isLogin, wishlistController.addTowishlist);
user_route.delete('/wishlist/deleteWishlistItem/:productId', auth.isLogin, wishlistController.removeWishlistItem)



// cart
user_route.get('/cart', auth.isLogin,cartController.loadcart);
user_route.get('/checkOut' , auth.isLogin ,checkOutController.loadCheckOut);
user_route.get('/loadsuccessPage', auth.isLogin, checkOutController.loadsuccessPage);
user_route.post('/cart', auth.isLogin,cartController.addToCart);
user_route.post('/updateCount' , auth.isLogin, cartController.updateqQuantity);
user_route.delete('/cart/deleteCartItem/:productId', auth.isLogin , cartController.deleteCartItem);

// coupen 

user_route.post('/applyCoupon' , auth.isLogin , coupenController.applyCoupen);
// user_route.post('/removeCoupon', auth.isLogin, coupenController.removeCoupon)

//forgot password
user_route.get('/forgetPassword', forgetPasswordControll.forget);
user_route.post('/forgetPassword' , forgetPasswordControll.verifyEmail,forgetPasswordControll.otpVerify );
user_route.get('/password' , forgetPasswordControll.loadpassword);
user_route.post('/password', forgetPasswordControll.updatePassword);

//change password
user_route.post('/dashboard' , auth.isLogin, userController.passwordUpdate);

//user error
user_route.get('/404', userController.load404);

//user Logout
user_route.get('/logout', userController.logout);

//OTP VERIFYER
user_route.post('/otp',userController.otpVerify);
user_route.get('/otp', userController.loadOtpVerify);

// user login with google
user_route.get('/auth/google', passport.authenticate('google',{scope:
    ['email','profile']
}));

user_route.get('/auth/google/callback',
    passport.authenticate('google',{
        successRedirect:'/success',

        failureRedirect:'/failure'
    })
);
//sucess
user_route.get('/success', userController.successGoogleLogin)
// failure 
user_route.get('/failure' , userController.failureGoogleLogin);

user_route.get('/resend-otp', userController.resendOtp);

user_route.post('/shop', userController.filter);
user_route.post('/sort' , userController.sortShop);

// for address managment
user_route.post('/address' , auth.isLogin, addressController.addAddress);
user_route.post('/editAddress', auth.isLogin, addressController.editAddress);

// razorpay order
user_route.post('/createOrder', auth.isLogin, checkOutController.createOrder);
user_route.post('/verifyPayment', auth.isLogin, checkOutController.verifyOrder);
user_route.post('/paymentFailed', auth.isLogin , checkOutController.paymentFailed);
user_route.post('/retryPaymentOrder', auth.isLogin ,checkOutController.retryPaymentOrder)
user_route.post('/createWalletOrder', auth.isLogin, checkOutController.createWalletOrder);


module.exports = user_route;