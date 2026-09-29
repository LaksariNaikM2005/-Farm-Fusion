require('express-async-errors');
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const errorHandler = require('./middlewares/errorHandler');
const { generalLimiter } = require('./middlewares/rateLimiter');

// Route imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const appointmentRoutes = require('./routes/appointments');
const chatRoutes = require('./routes/chat');
const forumRoutes = require('./routes/forum');
const schemeRoutes = require('./routes/schemes');
const externalRoutes = require('./routes/external');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

// Socket.IO setup
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
});
initSocket(io);

// Inject io into appointment controller for notifications
const appointmentController = require('./controllers/appointmentController');
appointmentController.setIO(io);

// Middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  }, 
  credentials: true 
}));
app.use(morgan('dev'));
app.use(generalLimiter);

// Stripe webhook needs raw body
app.post('/api/v1/orders/webhook', express.raw({ type: 'application/json' }), require('./controllers/orderController').stripeWebhook);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/api/v1/health', (req, res) => res.json({ success: true, message: '🌾 Farm Fusion API is running!', timestamp: new Date().toISOString() }));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/forum', forumRoutes);
app.use('/api/v1/schemes', schemeRoutes);
app.use('/api/v1/external', externalRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/reviews', reviewRoutes);

// 404 handler
app.use('*', (req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// Error handler
app.use(errorHandler);

const startServer = async () => {
  try {
    // Connect DB
    await connectDB();

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Farm Fusion Server running on port ${PORT} in ${process.env.NODE_ENV} mode`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
