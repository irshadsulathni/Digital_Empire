const Admin = require('../models/adminModel')
const  mongo  = require('mongoose')
const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const Return = require('../models/returnOrder');
const Order = require('../models/orderModel')

// Admin Home page load
const loadAdminHome = async (req, res) => {
    try {
        const returnData = await Return.find({})
        .populate({
            path:'from',
            model:'User'
        }).populate('orderId');

        res.render('admin/adminHome' , {activeDashboardMessage: 'active',returnData});
    } catch (error) {
        console.log(error)
    }
}


// Admin Login page load
const loadLogin = async (req, res) => {
    try {
        res.render('admin/adminLogin')
    } catch (error) {
        console.log(error)
    }
}

// Admin Login Deatiles Verifying
const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        

        const adminData = await Admin.findOne({ email: email });

        if (adminData) {
            const passwordMatch = bcrypt.compare(password, adminData.password);

            if (passwordMatch) {
                req.session.admin_id = adminData._id;
                res.redirect('/admin/adminHome');
            } else {
                res.render('admin/adminLogin', { message: 'Email and Password is incorrect' });
            }
        } else {
            res.render('admin/adminLogin', { message: 'Email and Password is incorrect' });
        }

    } catch (error) {
        console.error(error);
        res.render('admin/adminLogin', { message: 'An error occurred. Please try again.' });
    }
};

const adminLogout = async (req, res) => {
    req.session.destroy(error => {
        if (error) {
            console.error('Error destroying session:', error);
            return res.status(500).send('Internal Server Error');
        }
        res.status(200).json({ message: 'Logout successful' });
    });
}


// for load user list in admin side

const loadUserList = async (req,res)=>{
    try {
        const firstPage = 8;
        const currentPage = parseInt(req.query.page) || 1;
        const startPage = (currentPage - 1) * firstPage;
        const count = await User.countDocuments({}).skip(startPage).limit(firstPage)
        const totalPage = Math.ceil(count / firstPage)

        const users = await User.find({});
        res.render('admin/userList',{users, activeUserListMessage:'active', totalPage , currentPage})
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching users' }); // Handle errors with JSON response
      }
}
// Controller function to block or unblock user
const blockOrUnblockUser = async (req, res) => {
    try {
        const userId = req.body.userId;
        

        // Validate and convert userId to ObjectId if necessary
        if (!mongo.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        const userIdObject = new mongo.Types.ObjectId(userId);

        // Find the user to check the current status
        const user = await User.findById(userIdObject);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Toggle the blocked status
        user.is_blocked = !user.is_blocked;
        await user.save();

        res.status(200).json({ message: `User successfully ${user.is_blocked ? 'blocked' : 'unblocked'}`, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};


const salesReport = async (req, res) => {
    try {
        const orderData = await Order.find().populate('userId').populate('selectedAddress');

        const deliveredOrders = await Order.find({ status: 'Delivered' }).populate('userId').populate('selectedAddress');

        let totalOrderAmount = 0;
        let totalDiscount = 0;

        deliveredOrders.forEach(order => {
            totalOrderAmount += order.orderTotal;
            totalDiscount += order.discount;
        });
        
        res.render('admin/salesReport', { activeStaticsMessage:'active', orderData, deliveredOrders, totalOrderAmount, totalDiscount });
    } catch (error) {
        console.error('Error fetching sales report data:', error);
        res.status(500).send('Internal Server Error');
    }
}

const salesReportFilter = async (req, res) => {
    try {
        let query = {};
        const { reportType, startDate, endDate } = req.body;

        if (reportType === "custom" && startDate && endDate) {
            query.timeStamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (reportType === "today") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            query.timeStamp = {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            };
        } else if (reportType === "last7days") {
            const last7days = new Date();
            last7days.setDate(last7days.getDate() - 7);
            query.timeStamp = {
                $gte: last7days
            };
        } else if (reportType === "last30days") {
            const last30days = new Date();
            last30days.setDate(last30days.getDate() - 30);
            query.timeStamp = {
                $gte: last30days
            };
        }

        const orderData = await Order.find(query).populate('userId');

        res.status(200).json({ orderData });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};



const adminLoad404 = async (req, res) =>{
    try {
        res.render('admin/admin404')
    } catch (error) {
        console.log(error.message);
    }
}




module.exports = {
    loadAdminHome,
    loadLogin,
    verifyLogin,
    loadUserList,
    blockOrUnblockUser,
    adminLogout,
    adminLoad404,
    salesReport,
    salesReportFilter
}
