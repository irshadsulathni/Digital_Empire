const isLogin = async (req, res, next) => {
    try {
        if (req.session.admin_id) {
            next(); 
        } else {
            res.redirect('/admin/adminLogin'); 
        }
    } catch (error) {
        console.error(error.message);
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (!req.session.admin_id) {
            next(); 
        } else {
            res.redirect('/admin/adminHome'); 
        }
    } catch (error) {
        console.error(error.message);
    }
};

module.exports = {
    isLogin,
    isLogout
};