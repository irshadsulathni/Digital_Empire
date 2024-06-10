const User = require('../models/userModel');
const Otp = require('../controllers/otpController');
const OTP = require('../models/otpModel');
const Product = require('../models/productModel');
const Variant = require('../models/varientModel');
const Address = require('../models/addressModel')
const bcrypt = require('bcrypt');
const { name } = require('ejs');


// Password Hashing for security & threating from Hackers

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error)
        res.render('user/404')
    }
}

// To load error page 

const load404 = async (req, res) => {
    try {
        res.render('user/404')
    } catch (error) {
        console.log(error)
    }
}

// Load user Home page for a Preview
const loadHome = async (req, res) => {
    try {
        const productData = await Product.findOne({ list: false });

        const variantData = await Variant.find({});
        
        res.render('user/home', { productData, variantData });
    } catch (error) {
        console.log(error.message);
    }
};


// Load Company about page
const loadAbout = async (req, res) => {
    try {
        res.render('user/aboutUs')
    } catch (error) {
        console.log(error)
    }
}

// Load users Faq queations
const loadFAQ = async (req, res) => {
    try {
        res.render('user/faq')
    } catch (error) {
        console.log(error)
    }
}

// Load user registration Deatiles
const loadsignIn = async (req, res) => {
    try {
        res.render('user/signIn')
    } catch (error) {
        console.log(error)
    }
}

// Load signUp after user registration
const loadSignUp = async (req, res) => {
    try {
        res.render('user/signUp')
    } catch (error) {
        console.log(error)
    }
}

// Save User Data after Validation
const addUser = async (req, res) => {
    try {
        const email = req.body.email;
        const existingUser = await User.findOne({ email: email })
        if (existingUser) {
            res.render('user/signIn', { message: 'The Email already existed' })
        } else {
            const spassword = await securePassword(req.body.password);
            if (req.body.name == "") {
                res.render('user/signIn', { message: 'Please Enter a Name' });
            }
            else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(req.body.email)) {
                res.render('user/signIn', { message: 'Invalid Email, Only lowercase letters are allowed' });
            }
            else if (req.body.name.length <= 3) {
                res.render('user/signIn', { message: 'Name want at least 4 Letter' })
            }
            else if (req.body.email == '') {
                res.render('user/signIn', { message: 'Invalid Email, Please give correct email Id' });
            }
            else if (req.body.mobile.trim() == '') {
                res.render('user/signIn', { message: 'Enter a Valid Mobile Number' })
            }
            else if (req.body.mobile.length != 10) {
                res.render('user/signIn', { message: 'Number want 10' });
            }
            else if (req.body.password.length <= 8) {
                res.render('user/signIn', { message: 'Invalid Password, Password Minimum want 8 letters' });
            }
            else if (!/[A-Z]/.test(req.body.password)) {
                res.render('user/signIn', { message: 'Invalid Password, Atleast want one Uppercase' });
            }
            else if (!/[a-z]/.test(req.body.password)) {
                res.render('user/signIn', { message: 'Invalid Password, Atleast want one Lowercase' });
            }
            else if (!/[!@#$%^&*()-_=+{};:,<.>]/.test(req.body.password)) {
                res.render('user/signIn', { message: 'Invalid Password, Atleast want one Special Character' });
            }

            else if (req.body.re_password !== req.body.password) {
                res.render('user/signIn', { message: 'Password is not Match' });
            }
            else if (req.body.mobile == '') {
                res.render('user/signIn', { message: 'Invalid Mobile Number, Please Provide Valid Number' });
            }
            else {
                const user = new User({
                    name: req.body.name,
                    email: req.body.email,
                    mobile: req.body.mobile,
                    password: spassword,
                    is_verified: 0,
                    is_blocked: false
                });

                // After the validation user data storing in session
                req.session.userData = user;
                const otp = Otp.sendOtp(req.body.email)
                const otp1 = new OTP({
                    email: req.session.userData.email,
                    otp: otp
                })
                await otp1.save();
                req.session.otp = otp
                res.render('user/otpVerify')

                // if (req.session.userData) {
                //     // I changed home page in here for rendering the otp page
                //     res.render('user/otpVerify', { message: 'Send Mail in your email id, Please enter the OTP' })
                // }
                // else{
                //     res.render('user/signIn', {message:'Your registration is failed'})
                // }
            }
        }

    } catch (error) {
        console.log(error.message)
    }
}

//its for Sign Up for user. Thos who completed the registration
const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });
        if (userData && userData.is_blocked > 0) {
            return res.status(403).json({ blocked: true, message: "The user ID is blocked" });
        }

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                req.session.user_id = userData._id;
                return res.status(200).json({ success: true });
            } else {
                return res.status(401).json({ message: 'Incorrect password. Please try again.' });
            }
        } else {
            return res.status(404).json({ message: 'No account found with that email. Please create an account.' });
        }
    } catch (error) {
        console.error('Error during login verification:', error);
        return res.status(500).json({ message: 'Internal Server Error. Please try again later.' });
    }
};


// User logout its will destroy the entire session
const logout = async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.redirect('/SignIn'); // Adjust the redirect as needed
    });
}


// Loading dashboard
const loadDashBoard = async (req, res) => {
    try {
        const userData = await User.findOne({});
        const addressData = await Address.find({}); // Fetching multiple addresses as an array
        res.render('user/dashBoard', { userData: userData, addressData: addressData });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        res.render('user/404');
    }
};


// Load otp page
const loadOtpVerify = async (req, res) => {
    try {
        res.render('user/otpVerify')
    } catch (error) {
        console.log(error)
        res.render('user/404')
    }
}

// This for checking the otp we sent and user enter otp
const otpVerify = async (req, res) => {
    try {
        const otpString = Object.values(req.body).join('');
        if (req.session.otp == otpString) {
            req.session.userData.is_verified = 1
            const userData = req.session.userData;
            const user = new User(userData);
            await user.save();
            const data = await User.findOne({ email: user.email });
            req.session.user_id = data._id;
            req.session.userData = null;
            res.json({ success: 'yeah' });

        } else {
            res.json({ message: 'otp is incorrect' });
        }
    } catch (error) {
        console.log(error.message);
    }
};
// Resent Otp

const resendOtp = async (req, res) => {
    try {
        if (req.session && req.session.userData.email) {
            const email = req.session.userData.email;
            const newOtp = Otp.resendOtp(email);
            const otpdata = await OTP.findOne({ email: email })
            req.session.otp = newOtp
            otpdata.otp = newOtp
            await otpdata.save();
            res.render('user/otpVerify');
        } else {

            console.error('Error: No email found in session');

            res.redirect('/signUp');
        }

    } catch (error) {
        console.log(error)
    }
}

// for google login

const loadAuth = (req, res) => {
    const data = req.session.userData
    res.render('auth')
}
const successGoogleLogin = async (req, res) => {
    try {
        if (!req.body) {
            return res.render('user/404');
        }

        const { given_name, email } = req.user;

        // Check if the user with the provided email already exists
        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            req.session.user_id = email; // Store user's email in session
            return res.render('user/home'); // Render home page
        }

        // Create a new user document with the provided data
        const newUser = new User({
            name: given_name,
            email: email,
            is_verifed: 1 // Assuming user is verified after successful Google login
        });

        // Save the new user document to the database
        await newUser.save();

        // Store user's email in session
        req.session.user_id = email;

        // Render home page
        res.render('user/home');

    } catch (error) {
        console.error('Error saving user:', error);
        res.render('user/404');
    }
};


const failureGoogleLogin = (req, res) => {
    res.send("error")
}

const loadShop = async (req, res) => {
    try {
        const varientData = await Variant.find({})
        const productData = await Product.find({ list: false })

        res.render('user/shop', { productData, varientData })
    } catch (error) {
        console.log(error.message)
    }
}
// load How to shop page for user guidence

const loadHowShop = async (req, res) => {
    try {
        res.render('user/howShop')
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    load404,
    loadHome,
    loadAbout,
    loadFAQ,
    loadsignIn,
    loadSignUp,
    addUser,
    verifyLogin,
    logout,
    loadDashBoard,
    loadOtpVerify,
    otpVerify,
    loadAuth,
    successGoogleLogin,
    resendOtp,
    failureGoogleLogin,
    loadShop,
    loadHowShop,

}