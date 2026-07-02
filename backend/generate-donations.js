require('dotenv').config();
const mongoose = require('mongoose');
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const uri = process.env.MONGO_URI || 'mongodb+srv://mathumiththa0924_db_user:mathu0924@cluster0.1ktuhiw.mongodb.net/foodDonationDB?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri).then(async () => {
  const User = mongoose.connection.collection('users');
  const MoneyRequest = mongoose.connection.collection('moneyrequests');
  const MoneyDonation = mongoose.connection.collection('moneydonations');
  
  // Find "Na" ngo
  const naNgo = await User.findOne({ email: 'na@gmail.com' });
  if (!naNgo) {
    console.log("Na NGO not found");
    return process.exit(1);
  }

  // Find Na's money request
  const request = await MoneyRequest.findOne({ ngoId: naNgo._id });
  if (!request) {
    console.log("No money request found for Na");
    return process.exit(1);
  }

  // Find some donors
  const donors = await User.find({ role: 'donor' }).limit(3).toArray();
  if (donors.length === 0) {
    console.log("No donors found to generate donations");
    return process.exit(1);
  }

  console.log("Found request:", request.purpose);

  const newDonations = [
    {
      donorId: donors[0]._id,
      moneyRequestId: request._id,
      amount: 15000,
      donationMethod: 'online',
      paymentStatus: 'success',
      donorNote: 'Happy to help with education!',
      handoverNote: '',
      receiptImage: '',
      isRecurring: false,
      recurringInterval: '',
      confirmedAt: new Date(),
      feedback: { rating: 5, comment: "Excellent initiative!" },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      donorId: donors[1 % donors.length]._id,
      moneyRequestId: request._id,
      amount: 5000,
      donationMethod: 'bank_transfer',
      paymentStatus: 'success',
      donorNote: '',
      handoverNote: '',
      receiptImage: '',
      isRecurring: false,
      recurringInterval: '',
      confirmedAt: new Date(),
      feedback: { rating: 4, comment: "Good luck with the studies." },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await MoneyDonation.insertMany(newDonations);
  console.log("Inserted fake donations!");

  // Update request amount raised and status
  await MoneyRequest.updateOne(
    { _id: request._id },
    { $inc: { amountRaised: 20000 }, $set: { status: 'approved' } }
  );
  
  console.log("Updated money request amountRaised to 20000 and status to approved.");
  
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
