const Cart = require('../models/cartModal');
const Product = require('../models/productModel')

const loadcart = async (req, res) => {
    try {
        const userId = req.session.user_id;

        if (!userId) {
            return res.status(401).send('Unauthorized: No user session found');
        }

        const cart = await Cart.findOne({ userId: userId })
            .populate({
                path: 'product.productId',
                populate: {
                    path: 'varientId'
                }
            });

        let cartCount = 0;
        if (cart && cart.product) {
            cartCount = cart.product.length;
        }

        if (!cart) {
            return res.render('user/cart', { cartData: 'Nothing', cartCount });
        }
        res.render('user/cart', { cartData: cart, cartCount: cartCount });
    } catch (error) {
        console.error('Error loading cart:', error);
        res.status(500).send('Internal Server Error');
    }
};


const addToCart = async (req, res) => {
    try {
        const { productId, quantity, subtotal } = req.body;
        const userId = req.session.user_id;

        if (!userId) {
            return res.redirect('/user/signUp');
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
            const productExists = cart.product.some(item => item.productId.toString() === productId);

            if (productExists) {
                return res.json({ message: 'Item already in cart', alreadyInCart: true });
            } else {
                cart.product.push({
                    productId: productId,
                    quantity: quantity,
                    subTotal: subtotal,
                });
            }
        }

        const totalCart = cart.product.reduce((total, product) => total + product.subTotal, 0);
        cart.cartTotal = totalCart;

        await cart.save();

        return res.json({ message: 'Item added to cart successfully', alreadyInCart: false });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateqQuantity = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { productId, count } = req.body;
        let total;
        
        const cartData = await Cart.findOne({ userId: userId }).populate({
            path: 'product.productId',
            populate: {
                path: 'varientId'
            }
        });

        cartData.product.forEach(async (element) => {
            if (element.productId._id.toString() === productId) {
                element.quantity = count;
                
                const variant = element.productId.varientId;
                const price = variant.offerDetails && variant.offerDetails.priceAfterOfferApplied 
                    ? variant.offerDetails.priceAfterOfferApplied 
                    : variant.variantPrice;
                
                element.subTotal = price * element.quantity;
                total = element.subTotal;
            }
        });

        const cartTotal = cartData.product.reduce((total, product) => total + product.subTotal, 0);

        cartData.cartTotal = cartTotal;

        await cartData.save();

        return res.status(200).json({ success: 'success', total, cartTotal });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'An error occurred' });
    }
};


const deleteCartItem = async (req, res) => {
    try {
        const userId = req.session.user_id;

        if (!userId) {
            return res.status(400).json({ message: 'User not authenticated.' });
        }

        const { productId } = req.params;

        const cart = await Cart.findOneAndUpdate(
            { userId },
            { $pull: { product: { productId } } },
            { new: true }
        );

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        // Recalculate the cart total
        cart.cartTotal = cart.product.reduce((total, item) => total + item.subTotal, 0);

        // Save the updated cart total
        await cart.save();

        res.status(200).json({ message: 'Item removed from the cart successfully.', cartTotal: cart.cartTotal });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};




module.exports = {
    loadcart,
    addToCart,
    updateqQuantity,
    deleteCartItem
}