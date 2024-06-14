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
        if (!cart) {
            return res.render('user/cart',{cartData:'Nothing'})
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

        const userId = req.session.user_id;
        if (!userId) {
            return res.redirect('/signUp');
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
                    subTotal: subtotal,
                });
            }
        }

        const totalCart = cart.product.reduce((total, product) => total + product.subTotal, 0);
        cart.cartTotal = totalCart;

        await cart.save();

        return res.json({ message: 'Item added to cart successfully' });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateqQuantity = async (req, res)=>{
    try {
        const userId = req.session.user_id
        const { productId,count } = req.body;
        let total;
        const cartData = await Cart.findOne({userId:userId}).populate({
            path: 'product.productId',
            populate: {
                path: 'varientId'
            }
        });

        cartData.product.forEach( async(element)=>{
            if(element.productId._id == productId ){                
                element.quantity = count;
                element.subTotal = element.productId.varientId.variantPrice * element.quantity
                total = element.subTotal;
            }
        })

        const cartTotal = cartData.product.reduce((total,product)=> total + product.subTotal ,0 );

        cartData.cartTotal  = cartTotal;

        await cartData.save()

        return res.status(200).json({success:'success',total,cartTotal})

    } catch (error) {
        console.log(error);
    }
}
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

        res.status(200).json({ message: 'Item removed from the cart successfully.' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}



module.exports = {
    loadcart,
    addToCart,
    updateqQuantity,
    deleteCartItem
}