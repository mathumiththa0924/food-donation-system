require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const disable2FA = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const result = await User.updateMany({}, { $set: { twoFactorEnabled: false } });
    console.log(`Updated ${result.modifiedCount} users to disable 2FA.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

disable2FA();
