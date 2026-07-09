require('dotenv').config();
const mongoose = require('mongoose');
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const uri = process.env.MONGO_URI || 'mongodb+srv://mathumiththa0924_db_user:mathu0924@cluster0.1ktuhiw.mongodb.net/foodDonationDB?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri).then(async () => {
  const User = mongoose.connection.collection('users');
  
  const result = await User.updateOne({ email: 'na@gmail.com' }, { $set: { role: 'ngo' } });
  console.log("Updated Na's role to NGO:", result.modifiedCount);
  
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
