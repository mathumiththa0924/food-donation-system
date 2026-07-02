const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🔍 Testing admin login via API...');

    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@mealbridge.com',
      password: 'Admin@123'
    });

    console.log('✅ Login successful!');
    console.log('📧 Response:', response.data);

  } catch (error) {
    console.log('❌ Login failed!');
    console.log('📧 Error:', error.response?.data || error.message);
  }
};

testLogin();