require('dotenv').config();
const mongoose = require('mongoose');
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const uri = process.env.MONGO_URI || 'mongodb+srv://mathumiththa0924_db_user:mathu0924@cluster0.1ktuhiw.mongodb.net/foodDonationDB?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri).then(async () => {
  const User = mongoose.connection.collection('users');
  const MoneyRequest = mongoose.connection.collection('moneyrequests');
  
  const allRequests = await MoneyRequest.find({}).toArray();
  const allUsers = await User.find({}).toArray();
  
  console.log("ALL REQUESTS:");
  console.log(allRequests.map(r => ({ _id: r._id, purpose: r.purpose, ngoId: r.ngoId })));
  
  console.log("\nALL USERS:");
  console.log(allUsers.map(u => ({ _id: u._id, name: u.name, role: u.role, email: u.email })));
  
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
