require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Food = require('./models/Food');
const MoneyRequest = require('./models/MoneyRequest');
const MoneyDonation = require('./models/MoneyDonation');

async function fixData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find the admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log("No admin user found. Exiting.");
      process.exit(0);
    }

    // Find a real donor
    const donor = await User.findOne({ role: 'donor' });
    // Find a real NGO
    const ngo = await User.findOne({ role: 'ngo' });

    if (!donor) console.log("No donor found to reassign food posts to!");
    if (!ngo) console.log("No NGO found to reassign fund posts to!");

    if (donor) {
      const foodResult = await Food.updateMany(
        { donor: adminUser._id },
        { $set: { donor: donor._id } }
      );
      console.log(`Updated ${foodResult.modifiedCount} food posts from Admin to Donor (${donor.name})`);

      const moneyDonationResult = await MoneyDonation.updateMany(
        { donorId: adminUser._id },
        { $set: { donorId: donor._id } }
      );
      console.log(`Updated ${moneyDonationResult.modifiedCount} money donations from Admin to Donor (${donor.name})`);
    }

    if (ngo) {
      const fundResult = await MoneyRequest.updateMany(
        { ngoId: adminUser._id },
        { $set: { ngoId: ngo._id } }
      );
      console.log(`Updated ${fundResult.modifiedCount} fund posts from Admin to NGO (${ngo.name})`);
    }

    console.log("Data fix complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error fixing data:", error);
    process.exit(1);
  }
}

fixData();
