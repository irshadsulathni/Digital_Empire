const Wishlist = require('../models/wishlistModal');



const loadWishlist = async (req, res)=>{
    try {

        const userId = req.session.user_id;

        if(!userId){
            return res.redirect('/user/signUp');
        }

        const wishlistData = await Wishlist.findOne({userId}).populate('products.productId').populate('products.varientId')

        res.render('user/wishlist',{wishlistData})
    } catch (error) {
        console.log(error.message);
    }
}


const addTowishlist = async (req, res) => {
    try {
        const { productId, varientId } = req.body;
        const userId = req.session.user_id;

        if (!userId) {
            return res.redirect('/user/signUp');
        }

        let wishlist = await Wishlist.findOne({ userId: userId });

        if (!wishlist) {
            wishlist = new Wishlist({
                userId: userId,
                products: [{
                    productId: productId,
                    varientId: varientId  // Include varientId here
                }]
            });
        } else {
            const productExists = wishlist.products.some(element => element.productId.equals(productId));

            if (productExists) {
                return res.status(400).json({ error: 'Product already in wishlist' });
            } else {
                wishlist.products.push({ productId: productId, varientId: varientId }); // Include varientId here
            }
        }

        await wishlist.save();

        return res.status(200).json({ success: 'success' });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const removeWishlistItem = async (req, res)=>{
    try {
        const userId = req.session.user_id;
        if(!userId){
            return res.status(400).json({message:'User not Found'})
        }
        const { productId } = req.params;

        const wishlist = await Wishlist.findOneAndUpdate({userId},
            {$pull:{products:{productId}}}
        )

        await wishlist.save();

        return res.status(200).json({message:'Item Removed Succesfully'})

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadWishlist,
    addTowishlist,
    removeWishlistItem
}