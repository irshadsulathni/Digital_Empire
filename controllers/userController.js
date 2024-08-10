const User = require('../models/userModel');
const Otp = require('../controllers/otpController');
const OTP = require('../models/otpModel');
const Product = require('../models/productModel');
const Variant = require('../models/varientModel');
const Address = require('../models/addressModel')
const bcrypt = require('bcrypt');
const { name } = require('ejs');
const Category = require('../models/categoryModel');
const Cart = require('../models/cartModal');
const Order = require('../models/orderModel');
const Coupen  = require ('../models/coupenModel');
const Wallet = require('../models/walletModel');
const Offer = require('../models/offerModel')
const Wishlist = require('../models/wishlistModal')


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
// const loadHome = async (req, res) => {
//     try {
//         const userId = req.session.user_id;
//         const userData = await User.findOne({ _id: userId });
//         console.log('userData',userId,'userData');
//         const productData = await Product.findOne({ list: false });
//         const categeryData = await Category.findOne({ list: false })
//         const variantData = await Variant.find({});
//         const cartData = await Cart.findOne({ userId: userId })
//             .populate({
//                 path: 'product.productId',
//                 populate: {
//                     path: 'varientId'
//                 }
//             });
//         res.render('user/home', { productData, variantData, categeryData, userData:userData });
//     } catch (error) {
//         console.log(error.message);
//     }
// };

const loadHome = async (req, res) => {
    try {
        const userId = req.session.user_id; 
        const userData = await User.findOne({ _id: userId }); 
        
        const productData = await Product.findOne({ list: false });

        const productData1 = await Product.find({ list: false }).populate('productCategory').limit(4);

        const offerAppliedProducts = await Variant.find({ offerApplied: true })
            .populate({
                path: 'productId',
                populate: {
                    path: 'productCategory'
                }
            });

        const topSellingProduct = await Product.findOne({ list: false }).sort({ count: -1 })    

        const categoryData = await Category.findOne({ list: false }); 
        const variantData = await Variant.find({}); 

        const cartData = await Cart.findOne({ userId: userId })
            .populate({
                path: 'product.productId',
                populate: {
                    path: 'varientId'
                }
            });
        let cartCount = cartData ? cartData.product.length : 0;

        const wishlistData = await Wishlist.findOne({ userId: userId })
            .populate({
                path: 'products.productId'
            });
        let wishlistCount = wishlistData ? wishlistData.products.length : 0;

        res.render('user/home', {
            userData: userData || null,
            productData: productData,
            productData1: productData1,
            offerAppliedProducts: offerAppliedProducts,
            topSellingProduct:topSellingProduct,
            categoryData: categoryData,
            variantData: variantData,
            cartData: cartData || null,
            cartCount: cartCount,
            wishlistCount: wishlistCount
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading home page');
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
const generateReferralCode = () => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
};


const addUser = async (req, res) => {
    try {
        const email = req.body.email;
        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            res.render('user/signIn', { message: 'The Email already existed' });
        } else {
            const spassword = await securePassword(req.body.password);

            if (!req.body.name) {
                res.render('user/signIn', { message: 'Please Enter a Name' });
            } else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(req.body.email)) {
                res.render('user/signIn', { message: 'Invalid Email, Only lowercase letters are allowed' });
            } else if (req.body.name.length <= 3) {
                res.render('user/signIn', { message: 'Name must be at least 4 letters' });
            } else if (req.body.email === '') {
                res.render('user/signIn', { message: 'Invalid Email, Please provide a correct email ID' });
            } else if (req.body.mobile.trim() === '' || req.body.mobile.length !== 10) {
                res.render('user/signIn', { message: 'Enter a valid Mobile Number with 10 digits' });
            } else if (req.body.password.length <= 8) {
                res.render('user/signIn', { message: 'Invalid Password, Password must be at least 8 letters' });
            } else if (!/[A-Z]/.test(req.body.password) || !/[a-z]/.test(req.body.password) || !/[!@#$%^&*()-_=+{};:,<.>]/.test(req.body.password)) {
                res.render('user/signIn', { message: 'Invalid Password, It must include at least one uppercase letter, one lowercase letter, and one special character' });
            } else if (req.body.re_password !== req.body.password) {
                res.render('user/signIn', { message: 'Passwords do not match' });
            } else {
                const referralCode = generateReferralCode();
                console.log('referralCode referralCode', referralCode);
                const user = new User({
                    name: req.body.name,
                    email: req.body.email,
                    mobile: req.body.mobile,
                    password: spassword,
                    is_verified: 0,
                    is_blocked: 0,
                    referralCode,
                });

                if (req.body.referralCode) {
                    const referralBonus = req.body.referralCode === 'SPECIALCODE' ? 5000 : 3000;
                    console.log('referralBonus', referralBonus);
                    const referringUser = await User.findOne({ referralCode: req.body.referralCode });
                    console.log('referringUser', referringUser);

                    if (referringUser) {
                        const walletReferringUser = await Wallet.findOne({ userId: referringUser._id });
                        if (walletReferringUser) {
                            walletReferringUser.balance += referralBonus;
                            walletReferringUser.history.push({
                                type: 'Bonus',
                                amount: referralBonus,
                                description: 'Referral bonus from referring user',
                            });
                            await walletReferringUser.save();
                        } else {
                            const newWalletReferringUser = new Wallet({
                                userId: referringUser._id,
                                balance: referralBonus,
                                history: [{
                                    type: 'Bonus',
                                    amount: referralBonus,
                                    description: 'Referral bonus from referring user',
                                }],
                            });
                            await newWalletReferringUser.save();
                        }
                    }

                    // Add bonus to the new user
                    const walletNewUser = await Wallet.findOne({ userId: user._id });
                    console.log('walletNewUser', walletNewUser);
                    if (walletNewUser) {
                        walletNewUser.balance += referralBonus;
                        walletNewUser.history.push({
                            type: 'Bonus',
                            amount: referralBonus,
                            description: 'Referral bonus for new user',
                        });
                        await walletNewUser.save();
                    } else {
                        const newWalletNewUser = new Wallet({
                            userId: user._id,
                            balance: referralBonus,
                            history: [{
                                type: 'Bonus',
                                amount: referralBonus,
                                description: 'Referral bonus for new user',
                            }],
                        });
                        await newWalletNewUser.save();
                    }
                }

                req.session.userData = user;
                const otp = Otp.sendOtp(req.body.email);
                const otp1 = new OTP({
                    email: req.session.userData.email,
                    otp: otp,
                });
                await otp1.save();
                req.session.otp = otp;
                res.render('user/otpVerify');
            }
        }
    } catch (error) {
        console.log(error.message);
    }
};



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
        res.redirect('/'); 
    });
}


// Loading dashboard
// const loadDashBoard = async (req, res) => {
//     try {
//         const userId = req.session.user_id;
//         const orderData = await Order.find({ userId: userId }).populate({
//             path: 'product.productId',
//             populate: {
//                 path: 'varientId'
//             }
//         }).sort({_id:-1});
//         const coupenData = await Coupen.find({})
//         const userData = await User.findOne({ _id: userId });
//         const addressData = await Address.find({ userId: userId });
//         const walletData = await Wallet.findOne({ userId: userId }).lean();
//         if (walletData && walletData.history) {
//             walletData.history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
//         }

//         res.render('user/dashboard', { userData: userData, addressData: addressData, orderData: orderData,coupons:coupenData ,walletData});
//     } catch (error) {
//         console.error('Error loading dashboard:', error);
//         res.render('user/404');
//     }
// };

const loadDashBoard = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 8;
        const skip = (page - 1) * pageSize;

        const orderData = await Order.find({ userId }).populate({
            path: 'product.productId',
            populate: {
                path: 'varientId'
            }
        }).sort({ _id: -1 });

        const couponData = await Coupen.find({}).lean();
        couponData.forEach(coupon => {
            if (!Array.isArray(coupon.usersList)) {
                coupon.usersList = [];
            }
            coupon.usersList.forEach(userCoupon => {
                if (!userCoupon.userId) {
                    userCoupon.userId = null;
                }
            });
        });

        const userData = await User.findOne({ _id: userId });
        const addressData = await Address.find({ userId });
        const walletData = await Wallet.findOne({ userId }).lean();

        if (walletData && walletData.history) {
            const totalTransactions = walletData.history.length;
            walletData.history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            walletData.history = walletData.history.slice(skip, skip + pageSize);
            walletData.totalTransactions = totalTransactions;
        }

        const baseUrl = req.protocol + '://' + req.get('host');

        res.render('user/dashboard', { 
            userData, 
            addressData, 
            orderData, 
            coupons: couponData, 
            walletData,
            page,
            pageSize,
            isGoogleUser: userData && userData.googleId ? true : false,
            referralCode: userData.referralCode,
            baseUrl
        });
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


const loadAuth = (req, res) => {
    try {
        const data = req.session.userData
        res.render('auth')
    } catch (error) {
        console.log(error.message);
    }

}

const successGoogleLogin = async (req, res) => {
    try {
        if (!req.body) {
            return res.render('user/404');
        }

        const { given_name, email, googleId } = req.user || {}; // Safeguard if req.user is undefined

        if (!email) {
            return res.render('user/404'); // Handle case where email is not provided
        }

        let userData;
        let userId;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            userData = existingUser;
            userId = existingUser._id;
            req.session.user_id = userId;
        } else {
            const newUser = new User({
                name: given_name,
                email,
                googleId: true, 
                is_verified: 1 
            });
            await newUser.save();
            userData = newUser;
            userId = newUser._id;
            req.session.user_id = userId;
            console.log('req.session.user_id',req.session.user_id);
        }

        // Fetching all the necessary data
        const productData = await Product.findOne({ list: false });
        const productData1 = await Product.find({ list: false }).populate('productCategory').limit(4);
        const offerAppliedProducts = await Variant.find({ offerApplied: true })
            .populate({
                path: 'productId',
                populate: {
                    path: 'productCategory'
                }
            });
        const topSellingProduct = await Product.findOne({ list: false }).sort({ count: -1 });
        const categoryData = await Category.findOne({ list: false });
        const variantData = await Variant.find({});
        const cartData = await Cart.findOne({ userId })
            .populate({
                path: 'product.productId',
                populate: {
                    path: 'varientId'
                }
            });
        const wishlistData = await Wishlist.findOne({ userId })
            .populate({
                path: 'products.productId'
            });

        let cartCount = cartData ? cartData.product.length : 0;
        let wishlistCount = wishlistData ? wishlistData.products.length : 0;

        // Rendering the home page with all data
        res.render('user/home', {
            userData: userData || null,
            productData: productData,
            productData1: productData1,
            offerAppliedProducts: offerAppliedProducts,
            topSellingProduct: topSellingProduct,
            categoryData: categoryData,
            variantData: variantData,
            cartData: cartData || null,
            cartCount: cartCount,
            wishlistCount: wishlistCount,
            isGoogleUser: !!googleId
        });

    } catch (error) {
        console.error('Error handling Google login:', error);
        res.render('user/404');
    }
};







const failureGoogleLogin = (req, res) => {
    res.send("error")
}

const loadShop = async (req, res) => {
    try {
        const search = req.query.q;
        const page = parseInt(req.query.page) || 1; 
        const limit = 8;
        let productData; 

        let query = { list: false }; 

        if (search) {
            query.$or = [{ productName: { $regex: '.*' + search + '.*', $options: 'i' } }];
        }

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);
        const offset = (page - 1) * limit;

        if (search) {
            productData = await Product.find(query)
                .populate('productCategory')
                .populate('varientId')
                .limit(limit)
                .skip(offset);
        } else {
            productData = await Product.find(query)
                .populate('productCategory')
                .populate('varientId')
                .limit(limit)
                .skip(offset);
        }

        const userId = req.session.user_id;
        const userData = await User.find({ _id: userId });
        const varientData = await Variant.find({});
        const brand = await Product.distinct("productBrand");
        const processor = await Variant.distinct("variantProcessor");
        const ram = await Variant.distinct("variantRAM");
        const gpu = await Variant.distinct("variantGPU");
        const color = await Variant.distinct('variantColor');
        const categoryData = await Category.find({ list: false });
        const offerData = await Offer.find({})
        res.render('user/shop', {
            productData,
            varientData,
            categoryData,
            userData,
            brand,
            processor,
            ram,
            gpu,
            color,
            totalPages,
            currentPage: page,
            search,offerData
        });
    } catch (error) {
        console.log(error.message);
    }
};




// load How to shop page for user guidence

const loadHowShop = async (req, res) => {
    try {
        res.render('user/howShop')
    } catch (error) {
        console.log(error.message)
    }
}
const passwordUpdate = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.session.user_id;
        const userData = await User.findById({ _id: userId });

        const passwordMatch = await bcrypt.compare(currentPassword, userData.password);
        if (!passwordMatch) {
            return res.status(200).json({ message: 'Current password is incorrect' });
        }

        // Validation for new password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(200).json({
                message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
            });
        }

        // checking the new pass and confirm pass
        if (newPassword !== confirmPassword) {
            return res.status(200).json({ message: 'Passwords do not match' });
        }

        const spassword = await bcrypt.hash(newPassword, 10);

        const passwordUpdate = await User.findOneAndUpdate({ _id: userId }, { password: spassword })

        return res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }

};

const filter = async (req, res) => {
    try {
        let requestBody = {};
        req.body.forEach(obj => {
            Object.assign(requestBody, obj);
        });

        const { category, ram, processor, gpu, color, brand, priceRange } = requestBody;

        const productData = await Product.find({ list: false })
            .populate('productCategory')
            .populate('varientId');

        let filteredData = productData;

        // Filter by category
        if (category && Array.isArray(category) && category.length > 0) {
            filteredData = filteredData.filter(product => category.includes(product.productCategory.name));
        }

        // Filter by RAM
        if (ram && Array.isArray(ram) && ram.length > 0) {
            filteredData = filteredData.filter(product => ram.includes(product.varientId.variantRAM));
        }

        // Filter by processor
        if (processor && Array.isArray(processor) && processor.length > 0) {
            filteredData = filteredData.filter(product => processor.includes(product.varientId.variantProcessor));
        }

        // Filter by GPU
        if (gpu && Array.isArray(gpu) && gpu.length > 0) {
            filteredData = filteredData.filter(product => gpu.includes(product.varientId.variantGPU));
        }

        // Filter by color
        if (color && Array.isArray(color) && color.length > 0) {
            filteredData = filteredData.filter(product => color.includes(product.varientId.variantColor));
        }

        // Filter by brand
        if (brand && Array.isArray(brand) && brand.length > 0) {
            filteredData = filteredData.filter(product => brand.includes(product.productBrand));
        }

        // Filter by price range
        if (priceRange && typeof priceRange === 'string') {
            const [minStr, maxStr] = priceRange.replace(/₹/g, '').split(' - ').map(s => s.trim());
            const minPrice = parseInt(minStr, 10);
            const maxPrice = parseInt(maxStr, 10);

            if (!isNaN(minPrice) && !isNaN(maxPrice)) {
                filteredData = filteredData.filter(product => {
                    const price = product.varientId.variantPrice;
                    return price >= minPrice && price <= maxPrice;
                });
               // console.log('After price range filter:');
            } else {
                console.log('Invalid price range:');
            }
        }
        res.status(200).json({ message: 'completed', filteredData: filteredData });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error filtering products', error });
    }
};


const loadOrderTracking = async (req, res) => {
    try {
        const { orderId } = req.query;
        const orderData = await Order.find({ _id: orderId }).populate({
            path: 'product.productId',
            populate: {
                path: 'varientId'
            }
        }).populate('selectedAddress');

        res.render('user/orderTracking', { orderData: orderData });
    } catch (error) {
        console.log(error.message);
    }
}

const sortShop = async (req, res) => {
    try {
        const { sortby } = req.body;

        let products;

        // Fetch all products that match the criteria first
        products = await Product.find({ list: false }).populate({
            path: 'varientId',
            model: 'Variant',
            select: 'variantPrice',
        });

        // Perform sorting based on the sortby value
        let sortedData;

        if (sortby === 'popularity') {
            sortedData = products.sort((a, b) => b.count - a.count);
        } else if (sortby === 'newArrival') {
            sortedData = products.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortby === 'lowToHigh') {
            sortedData = products.sort((a, b) => a.varientId.variantPrice - b.varientId.variantPrice);
        } else if (sortby === 'HighToLow') {
            sortedData = products.sort((a, b) => b.varientId.variantPrice - a.varientId.variantPrice);
        } else if (sortby === 'AtoZ') {
            sortedData = products.sort((a, b) => a.productName.localeCompare(b.productName));
        } else if (sortby === 'ZtoA') {
            sortedData = products.sort((a, b) => b.productName.localeCompare(a.productName));
        } else if (sortby === 'date') {
            sortedData = products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            return res.status(400).json({ success: false, message: 'Invalid sort parameter' });
        }

        res.status(200).json({ success: true, sortedData: sortedData });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, 'Server Error': error });
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
    passwordUpdate,
    filter,
    loadOrderTracking,
    sortShop,
}