require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Food = require('../models/Food');
const Notification = require('../models/Notification');

(async () => {
  try {
    await connectDB();

    // create a test donor
    const email = `test-donor-${Date.now()}@example.com`;
    const donor = await User.create({ name: 'Test Donor', email, password: 'testpass', role: 'donor' });
    console.log('Created donor:', donor._id.toString());

    // create a food donation with expiryTime in the past
    const past = new Date(Date.now() - 1000 * 60 * 10); // 10 minutes ago
    const food = await Food.create({
      donor: donor._id,
      foodName: 'Test Sandwiches',
      description: 'Test expiry flow',
      foodType: 'veg',
      quantity: 10,
      originalQuantity: 10,
      unit: 'pack',
      location: { address: '123 Test St' },
      expiryTime: past
    });
    console.log('Inserted food:', food._id.toString(), 'expiryTime:', food.expiryTime);

    // Run expiry logic (same as server job) to mark expired immediately
    const now = new Date();
    const expired = await Food.find({ status: 'pending', expiryTime: { $lt: now } });
    console.log('Found pending expired items:', expired.length);
    for (const f of expired) {
      f.status = 'expired';
      f.statusHistory = [
        ...f.statusHistory,
        { status: 'expired', note: 'Automatically expired (test run)', changedBy: null, changedAt: new Date() }
      ];
      await f.save();

      const notif = await Notification.create({
        recipientId: f.donor,
        message: `Your donation '${f.foodName}' has expired and is now hidden from NGOs.`,
        type: 'donation_expired',
        relatedId: f._id
      });
      console.log('Created notification for donor:', notif._id.toString());
    }

    // confirm update
    const updated = await Food.findById(food._id);
    console.log('Updated food status:', updated.status);

    const notes = await Notification.find({ recipientId: donor._id });
    console.log('Notifications for donor count:', notes.length);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
