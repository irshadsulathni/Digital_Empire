const Admin = require('../models/adminModel')
const  mongo  = require('mongoose')
const User = require('../models/userModel')
const bcrypt = require('bcrypt')

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
        const { email, password } = req.body;
        
        // Find admin data by email
        const adminData = await Admin.findOne({ email: email });

        if (adminData) {
            // Compare passwords securely using bcrypt
            const passwordMatch = bcrypt.compare(password, adminData.password);

            if (passwordMatch) {
                // Set session admin_id if password matches
                req.session.admin_id = adminData._id;
                res.redirect('/admin/adminHome');
            } else {
                // Render login page with error message if password is incorrect
                res.render('admin/adminLogin', { message: 'Email and Password is incorrect' });
            }
        } else {
            // Render login page with error message if no admin data found
            res.render('admin/adminLogin', { message: 'Email and Password is incorrect' });
        }

    } catch (error) {
        // Log the error and render the login page with a generic error message
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



module.exports = {
    loadAdminHome,
    loadLogin,
    verifyLogin,
    loadUserList,
    blockOrUnblockUser,
    adminLogout
}
