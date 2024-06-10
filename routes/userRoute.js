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

user_route.use(session({secret:process.env.session_secret}));
user_route.use(passport.initialize());
user_route.use(passport.session());


//user signIn & SignUp

user_route.get('/signUp', auth.isLogout, userController.loadSignUp);
user_route.post('/signIn', auth.isLogout, userController.addUser);
user_route.post('/signUp', userController.verifyLogin);


// user home page things
user_route.get('/dashboard' , userController.loadDashBoard);
user_route.get('/',userController.loadHome);
user_route.get('/about',auth.isLogin, userController.loadAbout);
user_route.get('/faq',  userController.loadFAQ);
user_route.get('/signIn', auth.isLogout,userController.loadsignIn);;
user_route.get('/shop', userController.loadShop);
user_route.get('/productPage', productController.loadProductDeatiles);
user_route.get('/howShop', userController.loadHowShop);
user_route.get('/address' ,auth.isLogin, addressController.loadaddress );

// cart

user_route.get('/cart', auth.isLogin,cartController.loadcart);
user_route.get('/checkOut' , auth.isLogin ,checkOutController.loadCheckOut);
user_route.get('/loadsuccessPage', auth.isLogin, checkOutController.loadsuccessPage);
user_route.post('/cart', auth.isLogin,cartController.addToCart);





//forgot password
user_route.get('/forgetPassword', forgetPasswordControll.forget);
user_route.post('/forgetPassword' , forgetPasswordControll.verifyEmail,forgetPasswordControll.otpVerify );
user_route.get('/password' , forgetPasswordControll.loadpassword);
user_route.post('/password', forgetPasswordControll.updatePassword)

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


// for address managment

user_route.post('/address' , auth.isLogin, addressController.addAddress)


module.exports = user_route;