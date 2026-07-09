const mongoose = require('mongoose');
const MoneyDonation = require('./models/MoneyDonation');

mongoose.connect('mongodb://127.0.0.1:27017/food_donation').then(async () => {
  console.log('Deleting donations with LKR 2000 and 5000...');
  const res = await MoneyDonation.deleteMany({ amount: { $in: [2000, 5000] } });
  console.log('Deleted count:', res.deletedCount);
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
