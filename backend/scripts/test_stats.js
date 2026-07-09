const mongoose = require('mongoose');
const User = require('./models/User');
const Food = require('./models/Food');
const Request = require('./models/Request');
const Feedback = require('./models/Feedback');
const MoneyDonation = require('./models/MoneyDonation');

mongoose.connect('mongodb+srv://mathumiththa0924_db_user:mathu0924@cluster0.1ktuhiw.mongodb.net/foodDonationDB?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
    try {
        const totalUsers = await User.countDocuments();
        const totalDonations = await Food.countDocuments();
        const totalRequests = await Request.countDocuments();
        const totalFeedbacks = await Feedback.countDocuments();
        const donors = await User.countDocuments({ role: 'donor' });
        const ngos = await User.countDocuments({ role: 'ngo' });
        const admins = await User.countDocuments({ role: 'admin' });

        const donations = await Food.find();
        const totalFoodSaved = donations.reduce((sum, donation) => {
          const qty = parseFloat(donation.quantity) || 0;
          return sum + qty;
        }, 0);

        const moneyDonations = await MoneyDonation.find({ paymentStatus: 'success' });
        const totalFundsDonated = moneyDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const weeklyDonationsCount = await Food.countDocuments({ createdAt: { $gte: oneWeekAgo } });
        const monthlyDonationsCount = await Food.countDocuments({ createdAt: { $gte: oneMonthAgo } });

        const weeklyMoneyDonations = await MoneyDonation.find({ createdAt: { $gte: oneWeekAgo }, paymentStatus: 'success' });
        const weeklyFunds = weeklyMoneyDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

        const monthlyMoneyDonations = await MoneyDonation.find({ createdAt: { $gte: oneMonthAgo }, paymentStatus: 'success' });
        const monthlyFunds = monthlyMoneyDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const allDonationsThisYear = await Food.find({ createdAt: { $gte: startOfYear } }, 'createdAt');
        const monthlyDistribution = new Array(12).fill(0);
        allDonationsThisYear.forEach(d => {
           const month = new Date(d.createdAt).getMonth();
           if (!isNaN(month)) monthlyDistribution[month]++;
        });

        const allMoneyDonationsThisYear = await MoneyDonation.find({ createdAt: { $gte: startOfYear }, paymentStatus: 'success' }, 'amount createdAt');
        const monthlyFundsDistribution = new Array(12).fill(0);
        allMoneyDonationsThisYear.forEach(d => {
           const month = new Date(d.createdAt).getMonth();
           if (!isNaN(month)) monthlyFundsDistribution[month] += (d.amount || 0);
        });

        console.log('SUCCESS');
    } catch (e) {
        console.error('ERROR OCCURRED:', e);
    }
    mongoose.connection.close();
});
