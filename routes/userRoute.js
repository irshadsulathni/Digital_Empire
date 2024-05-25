const express = require('express');
const user_route = express();
const session = require('express-session');
const userController = require('../controllers/userController');
const auth = require('../middleware/userAuth');
const passport = require('passport');
require('../passport');

user_route.use(session({secret:process.env.session_secret}));
user_route.use(passport.initialize());
user_route.use(passport.session());


//user signIn & SignUp

user_route.get('/signUp', auth.isLogin, userController.loadSignUp);
user_route.post('/signIn', auth.isLogin, userController.addUser);
user_route.post('/signUp', userController.verifyLogin);

// user home page things
user_route.get('/dashboard' , auth.isLogin,userController.loadDashBoard);
user_route.get('/',userController.loadHome);
user_route.get('/about',auth.isLogin, userController.loadAbout);
user_route.get('/faq', auth.isLogin, userController.loadFAQ);
user_route.get('/signIn', auth.isLogout,userController.loadsignIn);

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

user_route.get('/resend-otp', userController.resendOtp)


module.exports = user_route;