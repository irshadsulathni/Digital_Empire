

const loadCheckOut = async (req, res) => {
    try {
       
        res.render('user/checkout')
    } catch (error) {
        console.log(error);
    }
}

const loadsuccessPage = async (req, res) => {
    try {
        res.render('user/successPage')
    } catch (error) {
        console.log(error);
    }
}
 



module.exports = {
    loadCheckOut,
    loadsuccessPage
}