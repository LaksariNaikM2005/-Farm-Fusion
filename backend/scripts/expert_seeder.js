const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load models
const User = require('../models/User');
const Forum = require('../models/Forum');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedExpertAdvice = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const csvPath = path.join(__dirname, '../../ai-service/data/expert_advice_train.csv');
    if (!fs.existsSync(csvPath)) {
      console.error(`CSV file not found: ${csvPath}`);
      process.exit(1);
    }

    // Get an expert user to act as author for comments
    let expert = await User.findOne({ role: 'expert' });
    if (!expert) {
      console.log('No expert found, creating a default AI expert...');
      expert = await User.create({
        name: 'AI Agri Expert',
        email: 'ai.expert@farmfusion.com',
        password: 'password123',
        role: 'expert',
        specialization: 'General Agriculture',
        isVerified: true
      });
    }

    // Get a farmer user to act as author for posts
    let farmer = await User.findOne({ role: 'farmer' });
    if (!farmer) {
      farmer = await User.create({
        name: 'Farmer Demo',
        email: 'farmer.demo@farmfusion.com',
        password: 'password123',
        role: 'farmer'
      });
    }

    const results = [];
    let count = 0;
    const limit = 20; // Limit for demonstration

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        if (count < limit) {
          // Based on AgThoughts dataset structure
          // Column names might vary, usually they are like 'question' and 'answer'
          // Let's assume the first column is question and second is answer
          const keys = Object.keys(data);
          const question = data[keys[0]];
          const answer = data[keys[1]];

          if (question && answer) {
            results.push({
              title: question.substring(0, 100) + (question.length > 100 ? '...' : ''),
              content: question,
              author: farmer._id,
              category: 'general',
              comments: [
                {
                  author: expert._id,
                  content: answer
                }
              ]
            });
            count++;
          }
        }
      })
      .on('end', async () => {
        if (results.length > 0) {
          await Forum.insertMany(results);
          console.log(`Successfully seeded ${results.length} expert advice entries into Forum!`);
        } else {
          console.log('No valid entries found to seed.');
        }
        mongoose.connection.close();
        process.exit(0);
      });

  } catch (error) {
    console.error('Error seeding expert advice:', error);
    process.exit(1);
  }
};

seedExpertAdvice();
