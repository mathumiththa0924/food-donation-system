const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/food_donation').then(async () => {
  const MoneyDonation = require('./models/MoneyDonation');
  const pending = await MoneyDonation.find({ paymentStatus: 'success' }).limit(5);
  console.log(JSON.stringify(pending.map(p => ({ id: p._id, donorId: p.donorId, reqId: p.moneyRequestId })), null, 2));
  process.exit(0);
});
