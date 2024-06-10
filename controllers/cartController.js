const Cart = require('../models/cartModal');
const Product = require('../models/productModel')

const loadcart = async (req, res) => {
    try {
        const userId = req.session.user_id;
        if (!userId) {
            return res.status(401).send('Unauthorized: No user session found');
        }

        console.log('User ID:', userId);

        const cart = await Cart.findOne({ userId: userId })
            .populate({
                path: 'product.productId',
                populate: {
                    path: 'varientId'
                }
            });


        if (!cart) {
            console.log('No cart found for user:', userId);
            return res.render('user/cart' ,{cartData:cart} )
        }
        res.render('user/cart', { cartData:cart });
    } catch (error) {
        console.error('Error loading cart:', error);
        res.status(500).send('Internal Server Error');
    }
};


const addToCart = async (req, res) => {
    try {
        const { productId, quantity, subtotal } = req.body;

        console.log('body', req.body);

        const userId = req.session.user_id;
        if (!userId) {
            return res.redirect('/signUp');
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let cart = await Cart.findOne({ userId: userId });

        if (!cart) {
            cart = new Cart({
                userId: userId,
                product: [{
                    productId: productId,
                    quantity: quantity,
                    subTotal: subtotal
                }]
            });
        } else {
            const productIndex = cart.product.findIndex(item => item.productId.toString() === productId);
            if (productIndex !== -1) {
                cart.product[productIndex].quantity += quantity;
                cart.product[productIndex].subTotal += subtotal;
            } else {
                cart.product.push({
                    productId: productId,
                    quantity: quantity,
                    subTotal: subtotal
                });
            }
        }

        await cart.save();

        return res.json({ message: 'Item added to cart successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports = {
    loadcart,
    addToCart
}