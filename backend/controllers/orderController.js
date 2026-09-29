const Order = require('../models/Order');
const Product = require('../models/Product');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key' ? process.env.STRIPE_SECRET_KEY : 'sk_test_dummy');

// POST /api/v1/orders/checkout-session
const createCheckoutSession = async (req, res) => {
  const { items, shippingAddress } = req.body;

  const lineItems = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) {
        const error = new Error(`Product ${item.productId} not found`);
        error.statusCode = 400;
        throw error;
      }
      if (product.stock < item.quantity) {
        const error = new Error(`Insufficient stock for ${product.name}`);
        error.statusCode = 400;
        throw error;
      }
      return {
        price_data: {
          currency: 'inr',
          product_data: { name: product.name, images: product.images.slice(0, 1), description: product.description.slice(0, 100) },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      };
    })
  );

  // Fallback for local development without real Stripe keys
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key' || process.env.STRIPE_SECRET_KEY === 'sk_test_dummy') {
    const orderItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.productId);
        await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
        return { product: product._id, name: product.name, price: product.price, quantity: item.quantity, image: product.images[0] };
      })
    );

    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      buyer: req.user._id,
      items: orderItems,
      totalAmount,
      paymentId: 'dummy_payment_' + Date.now(),
      paymentStatus: 'paid',
      status: 'confirmed',
      shippingAddress,
    });

    return res.json({ 
      success: true, 
      isFallback: true,
      url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/farmer/orders?success=true&order_id=${order._id}` 
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.CLIENT_URL}/farmer/orders?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/farmer/cart?cancelled=true`,
    metadata: { userId: req.user._id.toString(), shippingAddress: JSON.stringify(shippingAddress) },
  });

  res.json({ success: true, sessionId: session.id, url: session.url });
};

// POST /api/v1/orders/webhook (Stripe)
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    const orderItems = await Promise.all(
      lineItems.data.map(async (item) => {
        const product = await Product.findOne({ name: item.description });
        if (product) {
          await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
          return { product: product._id, name: product.name, price: product.price, quantity: item.quantity, image: product.images[0] };
        }
      })
    );

    await Order.create({
      buyer: session.metadata.userId,
      items: orderItems.filter(Boolean),
      totalAmount: session.amount_total / 100,
      paymentId: session.payment_intent,
      paymentStatus: 'paid',
      status: 'confirmed',
      stripeSessionId: session.id,
      shippingAddress: JSON.parse(session.metadata.shippingAddress || '{}'),
    });
  }

  res.json({ received: true });
};

// GET /api/v1/orders — farmer's order history
const getOrders = async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 }).populate('items.product', 'name images');
  res.json({ success: true, orders });
};

// GET /api/v1/orders/:id
const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product', 'name images category');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.buyer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  res.json({ success: true, order });
};

module.exports = { createCheckoutSession, stripeWebhook, getOrders, getOrder };
