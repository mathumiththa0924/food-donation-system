require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({
    _id: { $in: [new mongoose.Types.ObjectId('6a2d6301ff43c5da917f5cd0'), new mongoose.Types.ObjectId('69fe04c71d8a19d6a298e5fb')] }
  }).toArray();
  console.log("Users:", users.map(u => ({ id: u._id, name: u.name, role: u.role, email: u.email })));
  
  const donations = await db.collection('moneydonations').find({
    _id: new mongoose.Types.ObjectId('6a2d6301ff43c5da917f5cd0')
  }).toArray();
  console.log("Donations with ID 6a2d...:", donations);
  
  const donations2 = await db.collection('moneydonations').find({
    donorId: new mongoose.Types.ObjectId('6a2d6301ff43c5da917f5cd0')
  }).toArray();
  console.log("Donations with donorId 6a2d...:", donations2);
  
  process.exit(0);
}).catch(console.error);
