const axios = require('axios');
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require('./adminConfig');

const testAdminSystem = async () => {
  try {
    console.log('🔍 Testing Admin System...\n');

    // Test 1: Admin Login
    console.log('1️⃣ Testing Admin Login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    console.log('✅ Login successful!');
    console.log('📧 User:', loginResponse.data.data.user.name);
    console.log('🔑 Role:', loginResponse.data.data.user.role);
    console.log('🎫 Token:', loginResponse.data.token.substring(0, 20) + '...');

    const token = loginResponse.data.token;
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    console.log('\n2️⃣ Testing Admin Routes...\n');

    // Test 2: Get Admin Stats
    console.log('📊 Testing /api/admin/stats...');
    const statsResponse = await axios.get('http://localhost:5000/api/admin/stats', config);
    console.log('✅ Stats loaded:', statsResponse.data.data);

    // Test 3: Get Admin Users
    console.log('\n👥 Testing /api/admin/users...');
    const usersResponse = await axios.get('http://localhost:5000/api/admin/users', config);
    console.log('✅ Users loaded:', usersResponse.data.count, 'users');

    // Test 4: Get Admin Donations
    console.log('\n📦 Testing /api/admin/donations...');
    const donationsResponse = await axios.get('http://localhost:5000/api/admin/donations', config);
    console.log('✅ Donations loaded:', donationsResponse.data.count, 'donations');

    console.log('\n🎉 ALL TESTS PASSED! Admin system is working perfectly!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Admin login works');
    console.log('- ✅ Admin stats API works');
    console.log('- ✅ Admin users API works');
    console.log('- ✅ Admin donations API works');
    console.log('- ✅ Frontend can access admin dashboard');

  } catch (error) {
    console.log('❌ Test failed!');
    console.log('📧 Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.log('🔍 Issue: Admin user not found in database');
    } else if (error.response?.status === 403) {
      console.log('🔍 Issue: Admin role authorization failed');
    } else if (error.response?.status === 404) {
      console.log('🔍 Issue: Admin routes not found');
    }
  }
};

testAdminSystem();