const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Scheme = require('../models/Scheme');

const { MongoMemoryServer } = require('mongodb-memory-server');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedSchemes = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri || mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log('🌟 Using MongoDB Memory Server for local seeding');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const dataPath = path.join(__dirname, '../../ai-service/data/government_schemes.json');
    if (!fs.existsSync(dataPath)) {
      console.error(`Data file not found at ${dataPath}. Please run the AI service data ingestion script first.`);
      process.exit(1);
    }

    const schemesData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log(`Read ${schemesData.length} schemes from JSON`);

    // Optionally clear existing schemes or just add new ones
    // await Scheme.deleteMany({ isActive: true }); // Careful with this

    for (const scheme of schemesData) {
      const existing = await Scheme.findOne({ title: scheme.title });
      if (existing) {
        console.log(`Scheme "${scheme.title}" already exists, updating...`);
        await Scheme.updateOne({ title: scheme.title }, scheme);
      } else {
        console.log(`Adding new scheme: ${scheme.title}`);
        await Scheme.create(scheme);
      }
    }

    console.log('Successfully seeded government schemes!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding schemes:', error);
    process.exit(1);
  }
};

seedSchemes();
