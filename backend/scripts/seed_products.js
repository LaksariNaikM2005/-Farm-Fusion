const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const User = require('../models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedProducts = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri || mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log('🌟 Using MongoDB Memory Server for local product seeding');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const dataPath = path.join(__dirname, '../../ai-service/data/marketplace_products.json');
    if (!fs.existsSync(dataPath)) {
      console.error(`Data file not found at ${dataPath}. Please run the AI service data ingestion script first.`);
      process.exit(1);
    }

    const productsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log(`Read ${productsData.length} products from JSON`);

    // Get an admin user to be the seller
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin user found, creating a dummy admin...');
      admin = await User.create({
        name: 'Marketplace Admin',
        email: 'admin@marketplace.com',
        password: 'password123',
        role: 'admin'
      });
    }

    for (const product of productsData) {
      product.seller = admin._id;
      const existing = await Product.findOne({ name: product.name });
      if (existing) {
        console.log(`Product "${product.name}" already exists, updating...`);
        await Product.updateOne({ name: product.name }, product);
      } else {
        console.log(`Adding new product: ${product.name}`);
        await Product.create(product);
      }
    }

    console.log('Successfully seeded marketplace products!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
