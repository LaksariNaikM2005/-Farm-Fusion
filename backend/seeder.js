const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const Product = require('./models/Product');
const Scheme = require('./models/Scheme');
const Forum = require('./models/Forum');

// Connect to DB if run directly
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI);
}

const importData = async () => {
  try {
    // Only seed if empty
    const count = await User.countDocuments();
    if (count > 0) {
      console.log('Database already seeded, skipping auto-seed.');
      return;
    }

    await User.deleteMany();
    await Product.deleteMany();
    await Scheme.deleteMany();
    await Forum.deleteMany();

    // Create Admin
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'password123',
      role: 'admin',
    });

    // Create Farmers
    const farmerUser = await User.create({
      name: 'Farmer John',
      email: 'farmer@demo.com',
      password: 'password123',
      role: 'farmer',
      location: 'Delhi',
      phone: '1234567890'
    });

    const farmerUser2 = await User.create({
      name: 'Farmer Ramesh',
      email: 'ramesh@demo.com',
      password: 'password123',
      role: 'farmer',
      location: 'Punjab',
      phone: '9876543210'
    });

    // Create Experts
    const expertUser = await User.create({
      name: 'Dr. Expert Smith',
      email: 'expert@demo.com',
      password: 'password123',
      role: 'expert',
      specialization: 'Crop Disease',
      experience: 10,
      phone: '0987654321'
    });

    const expertUser2 = await User.create({
      name: 'Dr. Agronomy Jane',
      email: 'jane@demo.com',
      password: 'password123',
      role: 'expert',
      specialization: 'Soil Health',
      experience: 8,
      phone: '1122334455'
    });

    // Create Products
    let productsToInsert = [
      {
        name: 'Organic Fertilizer NPK',
        description: 'High quality organic fertilizer for all types of crops. Promotes healthy growth.',
        price: 25.5,
        category: 'fertilizers',
        stock: 100,
        seller: adminUser._id,
        images: ['https://via.placeholder.com/400x300?text=Organic+Fertilizer']
      },
      {
        name: 'Heavy Duty Tractor Part XYZ',
        description: 'Durable replacement part for major tractor brands. Built to last.',
        price: 150.0,
        category: 'machinery',
        stock: 50,
        seller: adminUser._id,
        images: ['https://via.placeholder.com/400x300?text=Tractor+Part']
      },
      {
        name: 'Premium Wheat Seeds',
        description: 'High-yield, disease-resistant wheat seeds suitable for northern climates.',
        price: 15.0,
        category: 'seeds',
        stock: 200,
        seller: adminUser._id,
        images: ['https://via.placeholder.com/400x300?text=Wheat+Seeds']
      },
      {
        name: 'Eco-Friendly Pesticide',
        description: 'Safe and effective pesticide derived from natural neem extracts.',
        price: 12.5,
        category: 'pesticides',
        stock: 150,
        seller: adminUser._id,
        images: ['https://via.placeholder.com/400x300?text=Neem+Pesticide']
      },
      {
        name: 'Drip Irrigation Kit',
        description: 'Complete kit for setting up a water-efficient drip irrigation system.',
        price: 85.0,
        category: 'tools',
        stock: 30,
        seller: adminUser._id,
        images: ['https://via.placeholder.com/400x300?text=Drip+Irrigation']
      }
    ];

    try {
      const productDataPath = path.join(__dirname, '../ai-service/data/marketplace_products.json');
      if (fs.existsSync(productDataPath)) {
        const rawProducts = JSON.parse(fs.readFileSync(productDataPath, 'utf-8'));
        productsToInsert = rawProducts.map(p => ({
          ...p,
          seller: adminUser._id
        }));
        console.log('✅ Loaded marketplace products from imported dataset');
      }
    } catch (err) {
      console.warn('⚠️ Could not load products from JSON, using defaults');
    }

    await Product.insertMany(productsToInsert);

    // Create Schemes
    let schemesToInsert = [
      {
        title: 'PM-Kisan',
        description: 'Pradhan Mantri Kisan Samman Nidhi. Under the scheme an income support of 6,000/- per year in three equal installments will be provided to all land holding farmer families.',
        eligibility: 'All small and marginal farmers.',
        link: 'https://pmkisan.gov.in/',
        category: 'subsidy',
        state: 'All'
      },
      {
        title: 'Crop Insurance (PMFBY)',
        description: 'Pradhan Mantri Fasal Bima Yojana provides insurance coverage and financial support to the farmers in the event of failure of any of the notified crop as a result of natural calamities, pests & diseases.',
        eligibility: 'Any farmer growing notified crops.',
        link: 'https://pmfby.gov.in/',
        category: 'insurance',
        state: 'All'
      }
    ];

    try {
      const fs = require('fs');
      const path = require('path');
      const dataPath = path.join(__dirname, '../ai-service/data/government_schemes.json');
      if (fs.existsSync(dataPath)) {
        schemesToInsert = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        console.log('✅ Loaded government schemes from imported dataset');
      }
    } catch (err) {
      console.warn('⚠️ Could not load schemes from JSON, using defaults');
    }

    await Scheme.insertMany(schemesToInsert);

    // Create Forum Posts
    await Forum.create({
      title: 'How to deal with late blight in tomatoes?',
      content: 'I have noticed dark, water-soaked spots on my tomato leaves and stems. The weather has been quite humid lately. What organic treatments would you recommend?',
      author: farmerUser._id,
      category: 'crop_disease',
      tags: ['tomato', 'blight', 'organic'],
      comments: [
        {
          author: expertUser._id,
          content: 'Late blight thrives in high humidity. Ensure good air circulation by pruning lower leaves. You can apply a copper-based fungicide as a preventive measure, or use a baking soda spray (1 tbsp baking soda, 1 tsp oil, 1 gallon water) for organic control.',
        }
      ]
    });

    await Forum.create({
      title: 'Current market rates for Basmati Rice?',
      content: 'Can anyone share the current mandi rates for premium Basmati rice in Punjab region?',
      author: farmerUser2._id,
      category: 'market_prices',
      tags: ['basmati', 'rice', 'punjab', 'mandi'],
      comments: []
    });

    // Seed from Expert Advice CSV
    try {
      const csvPath = path.join(__dirname, '../ai-service/data/expert_advice_train.csv');
      if (fs.existsSync(csvPath)) {
        console.log('📖 Seeding expert advice from CSV...');
        const expertResults = [];
        let expertCount = 0;
        const expertLimit = 30;

        await new Promise((resolve, reject) => {
          fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (data) => {
              if (expertCount < expertLimit) {
                const keys = Object.keys(data);
                const question = data[keys[0]];
                const answer = data[keys[1]];

                if (question && answer) {
                  expertResults.push({
                    title: question.substring(0, 100) + (question.length > 100 ? '...' : ''),
                    content: question,
                    author: farmerUser._id,
                    category: 'general',
                    comments: [
                      {
                        author: expertUser._id,
                        content: answer
                      }
                    ]
                  });
                  expertCount++;
                }
              }
            })
            .on('end', async () => {
              if (expertResults.length > 0) {
                await Forum.insertMany(expertResults);
                console.log(`✅ Seeded ${expertResults.length} expert advice entries`);
              }
              resolve();
            })
            .on('error', reject);
        });
      }
    } catch (err) {
      console.warn('⚠️ Could not seed from CSV:', err.message);
    }

    console.log('🌱 Rich Dummy Data Imported Automatically!');
  } catch (error) {
    console.error(`Error seeding data:`, error);
  }
};

const deleteData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();
    await Scheme.deleteMany();
    await Forum.deleteMany();
    console.log('🗑️ Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error deleting data: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  if (process.argv[2] === '-d') {
    deleteData();
  } else {
    importData().then(() => process.exit());
  }
}

module.exports = { importData };
