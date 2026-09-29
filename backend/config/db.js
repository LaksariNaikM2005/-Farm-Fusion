const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // Use memory server for local dev if uri includes localhost/127.0.0.1
    // to avoid needing a real mongo instance.
    if (!uri || uri.includes('127.0.0.1') || uri.includes('localhost')) {
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log('🌟 Using MongoDB Memory Server for local development');
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Auto-seed for local dev
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('127.0.0.1') || process.env.MONGO_URI.includes('localhost')) {
      const { importData } = require('../seeder');
      await importData();
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
