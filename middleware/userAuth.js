const User = require('../models/userModel');

const isLogin = async (req, res, next) => {
    try {
        if (!req.session.user_id) {
            return res.render('user/signUp');
        }

        const user = await User.findById(req.session.user_id);
        if (!user) {
            req.session.destroy();
            return res.redirect('/signUp');
        }

        if (user.is_blocked == 1) {
            req.session.destroy();
            return res.redirect('/signUp');
        }

        next();
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            const user = await User.findById(req.session.user_id);
            if (user && user.is_blocked == 1) {
                req.session.destroy();
                return res.status(403).send('Your account is blocked.');
            }
            return res.redirect('/');
        } else {
            next();
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    isLogin,
    isLogout
};
