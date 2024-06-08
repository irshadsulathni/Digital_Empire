const User = require('../models/userModel');
const Otp = require('../controllers/otpController');
const OTP = require('../models/otpModel');
const bcrypt = require('bcrypt');

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error)
        res.render('user/404')
    }
}



const forget = async (req, res) => {
    try {
        res.render('user/forgetPassword')
    } catch (error) {
        console.log(error);
    }
}

const verifyEmail = async (req, res, next) => {
    try {

        if (req.body.mess !== 'email get here') {
            next()
        }
        const email = req.body.email;
        const user = await User.findOne({ email: email });
        await OTP.deleteMany({ email: email })
        if (!user) {
            return res.status(200).json({ fail: 'email is wrong' });
        } else {
            const otp = Otp.sendOtp(req.body.email);
            const one = new OTP({
                email: email,
                otp: otp
            });

            req.session.email = email

            await one.save()

            return res.status(200).json({ success: 'success' });
        }



    } catch (error) {
        console.log(error);
        // return res.status(500).json({ error: 'Internal server error' });
    }
};

const otpVerify = async (req, res) => {
    try {

        const email = req.session.email;
        const otp = req.body.otp;
        const otp1 = await OTP.findOne({ email: email });

        console.log('email otp', otp1.otp);

        console.log('enter Opt', otp);

        if (otp1.otp == otp) {
            return res.status(200).json({ success: 'success' })
        } else {
            return res.status(200).json({ fail: 'failed' })
        }

    } catch (error) {
        console.log(error);
    }
};

const loadpassword = async (req, res) => {
    try {
        res.render('user/password')
    } catch (error) {
        console.log(error);
    }
}

const updatePassword = async (req, res) =>{
    try {

        const spassword = await securePassword(req.body.password);
        const email = req.session.email ;
        const user = await User.findOne({email:email});
        user.password = spassword;

        console.log(user , 'user');

        user.save()
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.redirect('/')

    } catch (error) {
        
    }
}

module.exports = {
    verifyEmail,
    forget,
    otpVerify,
    loadpassword,
    updatePassword
}
