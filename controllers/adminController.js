const Admin = require('../models/adminModel')
const  mongo  = require('mongoose')
const User = require('../models/userModel')

// Admin Home page load
const loadAdminHome = async (req, res) => {
    try {
        res.render('admin/adminHome' , {activeDashboardMessage: 'active'});
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
        const email = req.body.email;
        const password = req.body.password;

        const adminData = await Admin.findOne({ email: email })

        if (adminData) {
            if (password == adminData.password) {

                req.session.admin_id = adminData._id;
                res.redirect('/admin/adminHome')
            } else {
                res.render('admin/adminLogin', { message: 'Email and Password is incorrect' })
            }
        } else {
            res.render('admin/adminLogin', { message: 'Email and Password is incorrect' })
        }

    } catch (error) {
        console.log(error)
    }
}

const adminLogout = async (req, res) => {
    console.log('a');
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            // Optionally, handle the error (e.g., send an error response)
            return res.status(500).send('Internal Server Error');
        }
        res.status(200).json({ message: 'Logout successful' });
    });
}


// for load user list in admin side

const loadUserList = async (req,res)=>{
    try {
        const users = await User.find({});
        res.render('admin/userList',{users, activeUserListMessage:'active'})
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

const loadProduct = async (req,res) => {
    try {
        res.render('admin/product')
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
    loadProduct,
    adminLogout
}
