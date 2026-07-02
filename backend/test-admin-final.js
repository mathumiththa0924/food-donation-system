const axios = require('axios');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const testAdminLogin = async () => {
  console.log('⏳ Waiting for backend to be ready...');
  
  // Wait for backend
  let ready = false;
  for (let i = 0; i < 10; i++) {
    try {
      await axios.get('http://localhost:5000/');
      ready = true;
      break;
    } catch (error) {
      console.log('⏳ Backend not ready yet, waiting...');
      await sleep(1000);
    }
  }

  if (!ready) {
    console.log('❌ Backend is not running');
    return;
  }

  console.log('✅ Backend is ready!\n');

  try {
    console.log('🔍 Testing Admin Login...\n');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@mealbridge.com',
      password: 'Admin@123'
    });

    console.log('✅ LOGIN SUCCESSFUL!');
    console.log('📧 Email:', response.data.data.user.email);
    console.log('👤 Name:', response.data.data.user.name);
    console.log('🔑 Role:', response.data.data.user.role);
    console.log('🎫 Token:', response.data.token.substring(0, 30) + '...');

    const token = response.data.token;

    console.log('\n🔍 Testing Admin API Routes...\n');

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // Test stats
    console.log('📊 Fetching /api/admin/stats...');
    const statsRes = await axios.get('http://localhost:5000/api/admin/stats', config);
    console.log('✅ Stats:', statsRes.data.data);

    // Test users
    console.log('\n👥 Fetching /api/admin/users...');
    const usersRes = await axios.get('http://localhost:5000/api/admin/users', config);
    console.log('✅ Total users:', usersRes.data.count);

    console.log('\n🎉 ALL TESTS PASSED! Admin system is READY!');

  } catch (error) {
    console.log('❌ ERROR!');
    console.log('📧 Message:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔍 Issue: Admin user not found or password incorrect');
      console.log('💡 Try running: node setup-admin.js');
    } else if (error.response?.status === 403) {
      console.log('🔍 Issue: Access denied - admin role required');
    } else if (error.response?.status === 404) {
      console.log('🔍 Issue: Route not found');
    }
  }
};

testAdminLogin();