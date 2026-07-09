const axios = require('axios');
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require('./adminConfig');

const testLogin = async () => {
  try {
    console.log('🔍 Testing admin login via API...');

    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    console.log('✅ Login successful!');
    console.log('📧 Response:', response.data);

  } catch (error) {
    console.log('❌ Login failed!');
    console.log('📧 Error:', error.response?.data || error.message);
  }
};

testLogin();